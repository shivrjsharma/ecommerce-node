import { Order, OrderStatus } from "../entity/Order";

export interface IOrderService {
  create(userId: number): Promise<Order>;
  getByUser(userId: number): Promise<Order[]>;
  getById(id: number, userId: number): Promise<Order>;
  updateStatus(id: number, status: OrderStatus): Promise<Order>;
  cancel(id: number, userId: number): Promise<Order>;
}
