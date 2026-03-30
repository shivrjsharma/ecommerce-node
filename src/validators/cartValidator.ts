import Joi from "joi";

export class CartValidator {
  readonly add = Joi.object({
    productId: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().min(1).default(1),
  });

  readonly updateItem = Joi.object({
    quantity: Joi.number().integer().min(0).required(),
  });

  readonly itemIdParam = Joi.object({
    itemId: Joi.number().integer().positive().required(),
  });
}
