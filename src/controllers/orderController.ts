import { Response, NextFunction } from "express";
import { IOrderService } from "../interfaces/IOrderService";
import { AuthRequest } from "../middleware/auth";
import { ApiResponse } from "../utils/ApiResponse";
import { MSG } from "../constants/messages";
import EventEmitter from 'node:events'
export class OrderController {
  constructor(private readonly orderService: IOrderService) {}
  event = new EventEmitter();

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, await this.orderService.create(req.userId!), MSG.ORDER.CREATED, 201);
      this.event.emit("orderCreated", req.body);
    } catch (err) {
      next(err);
    }
  };

  getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, await this.orderService.getByUser(req.userId!), MSG.ORDER.ALL_FETCHED);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, await this.orderService.getById(Number(req.params.id), req.userId!), MSG.ORDER.FETCHED);
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, await this.orderService.updateStatus(Number(req.params.id), req.body.status), MSG.ORDER.STATUS_UPDATED);
    } catch (err) {
      next(err);
    }
  };

  cancel = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, await this.orderService.cancel(Number(req.params.id), req.userId!), MSG.ORDER.CANCELLED);
    } catch (err) {
      next(err);
    }
  };
}
