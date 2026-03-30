import { Repository } from "typeorm";
import { getRepository } from "../db";
import { CartItem } from "../entity/CartItem";
import { ICartService } from "../interfaces/ICartService";
import { IProductService } from "../interfaces/IProductService";
import { AppError } from "../utils/AppError";
import { MSG } from "../constants/messages";
import logger from "../utils/logger";

export class CartService implements ICartService {
  // DIP: depends on IProductService abstraction, not ProductService directly
  constructor(private readonly productService: IProductService) {}

  private get repo(): Repository<CartItem> {
    return getRepository(CartItem);
  }

  async add(userId: number, productId: number, quantity: number) {
    logger.debug(`[CartService] add → userId=${userId} productId=${productId} qty=${quantity}`);
    try {
      await this.productService.getById(productId);

      let item = await this.repo.findOne({
        where: { user: { id: userId }, product: { id: productId } },
      });

      if (item) {
        item.quantity += quantity;
        logger.debug(`[CartService] updating existing cart item id=${item.id}`);
      } else {
        item = this.repo.create({
          user: { id: userId } as Pick<CartItem["user"], "id">,
          product: { id: productId } as Pick<CartItem["product"], "id">,
          quantity,
        });
      }

      const saved = await this.repo.save(item);
      logger.info(`[CartService] cart item saved id=${saved.id} userId=${userId}`);
      return saved;
    } catch (err) {
      logger.error(`[CartService] add failed → userId=${userId} productId=${productId}`, { err });
      throw err instanceof AppError ? err : new AppError(MSG.CART.ADD_FAILED, 500);
    }
  }

  async getByUser(userId: number) {
    logger.debug(`[CartService] getByUser → userId=${userId}`);
    try {
      return await this.repo.find({
        where: { user: { id: userId } },
        relations: ["product"],
      });
    } catch (err) {
      logger.error(`[CartService] getByUser failed → userId=${userId}`, { err });
      throw err instanceof AppError ? err : new AppError(MSG.CART.FETCH_FAILED, 500);
    }
  }

  async updateItem(userId: number, itemId: number, quantity: number) {
    logger.debug(`[CartService] updateItem → itemId=${itemId} qty=${quantity}`);
    try {
      const item = await this.repo.findOne({ where: { id: itemId, user: { id: userId } } });
      if (!item) throw new AppError(MSG.CART.ITEM_NOT_FOUND, 404);

      if (quantity <= 0) {
        await this.repo.delete(itemId);
        logger.info(`[CartService] removed cart item id=${itemId} (qty<=0)`);
        return null;
      }

      item.quantity = quantity;
      const saved = await this.repo.save(item);
      logger.info(`[CartService] updated cart item id=${itemId} qty=${quantity}`);
      return saved;
    } catch (err) {
      logger.error(`[CartService] updateItem failed → itemId=${itemId}`, { err });
      throw err instanceof AppError ? err : new AppError(MSG.CART.UPDATE_FAILED, 500);
    }
  }

  async removeItem(userId: number, itemId: number) {
    logger.debug(`[CartService] removeItem → itemId=${itemId}`);
    try {
      const item = await this.repo.findOne({ where: { id: itemId, user: { id: userId } } });
      if (!item) throw new AppError(MSG.CART.ITEM_NOT_FOUND, 404);
      await this.repo.delete(itemId);
      logger.info(`[CartService] removed cart item id=${itemId}`);
    } catch (err) {
      logger.error(`[CartService] removeItem failed → itemId=${itemId}`, { err });
      throw err instanceof AppError ? err : new AppError(MSG.CART.REMOVE_FAILED, 500);
    }
  }

  async clear(userId: number) {
    logger.debug(`[CartService] clear → userId=${userId}`);
    try {
      await this.repo.delete({ user: { id: userId } });
      logger.info(`[CartService] cleared cart for userId=${userId}`);
    } catch (err) {
      logger.error(`[CartService] clear failed → userId=${userId}`, { err });
      throw err instanceof AppError ? err : new AppError(MSG.CART.CLEAR_FAILED, 500);
    }
  }
}
