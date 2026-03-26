import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Order, OrderStatus } from "../entity/Order";
import { OrderItem } from "../entity/OrderItem";
import { IOrderService } from "../interfaces/IOrderService";
import { ICartService } from "../interfaces/ICartService";
import { AppError } from "../utils/AppError";
import { MSG } from "../constants/messages";
import logger from "../utils/logger";

export class OrderService implements IOrderService {
  // DIP: depends on ICartService abstraction, not CartService directly
  constructor(private readonly cartService: ICartService) {}

  private get repo(): Repository<Order> {
    return AppDataSource.getRepository(Order);
  }

  async create(userId: number) {
    logger.debug(`[OrderService] create → userId=${userId}`);
    try {
      const cartItems = await this.cartService.getByUser(userId);
      if (!cartItems.length) throw new AppError(MSG.ORDER.EMPTY_CART, 400);

      const total = cartItems.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
      const items = cartItems.map((i) => {
        const item = new OrderItem();
        item.product = i.product;
        item.quantity = i.quantity;
        item.price = i.product.price;
        return item;
      });

      const order = this.repo.create({ user: { id: userId } as Pick<Order["user"], "id">, items, total });
      const saved = await this.repo.save(order);
      await this.cartService.clear(userId);
      logger.info(`[OrderService] order created id=${saved.id} userId=${userId} total=${total}`);
      return saved;
    } catch (err) {
      logger.error(`[OrderService] create failed → userId=${userId}`, { err });
      throw err instanceof AppError ? err : new AppError(MSG.ORDER.CREATE_FAILED, 500);
    }
  }

  async getByUser(userId: number) {
    logger.debug(`[OrderService] getByUser → userId=${userId}`);
    try {
      return await this.repo.find({
        where: { user: { id: userId } },
        order: { createdAt: "DESC" },
      });
    } catch (err) {
      logger.error(`[OrderService] getByUser failed → userId=${userId}`, { err });
      throw err instanceof AppError ? err : new AppError(MSG.ORDER.FETCH_ALL_FAILED, 500);
    }
  }

  async getById(id: number, userId: number) {
    logger.debug(`[OrderService] getById → id=${id} userId=${userId}`);
    try {
      const order = await this.repo.findOne({ where: { id, user: { id: userId } } });
      if (!order) throw new AppError(MSG.ORDER.NOT_FOUND, 404);
      return order;
    } catch (err) {
      logger.error(`[OrderService] getById failed → id=${id}`, { err });
      throw err instanceof AppError ? err : new AppError(MSG.ORDER.FETCH_FAILED, 500);
    }
  }

  async updateStatus(id: number, status: OrderStatus) {
    logger.debug(`[OrderService] updateStatus → id=${id} status=${status}`);
    try {
      const order = await this.repo.findOneBy({ id });
      if (!order) throw new AppError(MSG.ORDER.NOT_FOUND, 404);
      order.status = status;
      const saved = await this.repo.save(order);
      logger.info(`[OrderService] order id=${id} status updated to ${status}`);
      return saved;
    } catch (err) {
      logger.error(`[OrderService] updateStatus failed → id=${id}`, { err });
      throw err instanceof AppError ? err : new AppError(MSG.ORDER.STATUS_UPDATE_FAILED, 500);
    }
  }

  async cancel(id: number, userId: number) {
    logger.debug(`[OrderService] cancel → id=${id} userId=${userId}`);
    try {
      const order = await this.getById(id, userId);
      if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED)
        throw new AppError(MSG.ORDER.CANCEL_DENIED, 400);
      order.status = OrderStatus.CANCELLED;
      const saved = await this.repo.save(order);
      logger.info(`[OrderService] order id=${id} cancelled by userId=${userId}`);
      return saved;
    } catch (err) {
      logger.error(`[OrderService] cancel failed → id=${id}`, { err });
      throw err instanceof AppError ? err : new AppError(MSG.ORDER.CANCEL_FAILED, 500);
    }
  }
}
