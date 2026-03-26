import Joi from "joi";
import { OrderStatus } from "../entity/Order";

export class OrderValidator {
  readonly idParam = Joi.object({
    id: Joi.number().integer().positive().required(),
  });

  readonly updateStatus = Joi.object({
    status: Joi.string()
      .valid(...Object.values(OrderStatus))
      .required(),
  });
}
