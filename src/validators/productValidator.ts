import Joi from "joi";

export class ProductValidator {
  readonly create = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    category: Joi.string().max(50),
    price: Joi.number().positive().precision(2).required(),
    stock: Joi.number().integer().min(0).default(0),
    description: Joi.string().max(500),
  });

  readonly update = Joi.object({
    name: Joi.string().min(2).max(100),
    category: Joi.string().max(50),
    price: Joi.number().positive().precision(2),
    stock: Joi.number().integer().min(0),
    description: Joi.string().max(500),
  }).min(1);

  readonly pagination = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  });

  readonly search = Joi.object({
    query: Joi.string().min(1).required(),
  });

  readonly idParam = Joi.object({
    id: Joi.number().integer().positive().required(),
  });
}
