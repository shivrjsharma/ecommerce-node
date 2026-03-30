import { CartItem } from "../entity/CartItem";

export interface ICartService {
  add(userId: number, productId: number, quantity: number): Promise<CartItem>;
  getByUser(userId: number): Promise<CartItem[]>;
  updateItem(userId: number, itemId: number, quantity: number): Promise<CartItem | null>;
  removeItem(userId: number, itemId: number): Promise<void>;
  clear(userId: number): Promise<void>;
}
