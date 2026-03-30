import { EventEmitter } from "events";
import { Order } from "../entity/Order";

class OrderEventEmitter extends EventEmitter {}

export const orderEmitter = new OrderEventEmitter();

export const ORDER_EVENTS = {
  CREATED: "order.created",
} as const;

export type OrderCreatedPayload = Pick<Order, "id" | "total" | "status"> & { userId: number; userEmail: string; userName: string };
