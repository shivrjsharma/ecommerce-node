import { Response, NextFunction } from "express";
import { ICartService } from "../interfaces/ICartService";
import { AuthRequest } from "../middleware/auth";
import { ApiResponse } from "../utils/ApiResponse";
import { MSG } from "../constants/messages";

export class CartController {
  constructor(private readonly cartService: ICartService) {}

  add = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, await this.cartService.add(req.userId!, req.body.productId, req.body.quantity || 1), MSG.CART.ITEM_ADDED, 201);
    } catch (err) {
      next(err);
    }
  };

  getCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items = await this.cartService.getByUser(req.userId!);
      const total = Number(items.reduce((sum, i) => sum + i.product.price * i.quantity, 0).toFixed(2));
      ApiResponse.success(res, { items, total }, MSG.CART.FETCHED);
    } catch (err) {
      next(err);
    }
  };

  updateItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.cartService.updateItem(req.userId!, Number(req.params.itemId), req.body.quantity);
      ApiResponse.success(res, result, result ? MSG.CART.ITEM_UPDATED : MSG.CART.ITEM_REMOVED);
    } catch (err) {
      next(err);
    }
  };

  removeItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.cartService.removeItem(req.userId!, Number(req.params.itemId));
      ApiResponse.success(res, null, MSG.CART.ITEM_REMOVED);
    } catch (err) {
      next(err);
    }
  };

  clear = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.cartService.clear(req.userId!);
      ApiResponse.success(res, null, MSG.CART.CLEARED);
    } catch (err) {
      next(err);
    }
  };
}
