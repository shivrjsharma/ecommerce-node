import Joi from "joi";

export class UserValidator {
  readonly register = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("user", "admin").default("user"),
    zipcode: Joi.string().max(10).optional(),
    phoneNumber: Joi.string().max(20).optional(),
  });

  readonly login = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  readonly update = Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    zipcode: Joi.string().max(10),
    phoneNumber: Joi.string().max(20),
  }).min(1);

  readonly changePassword = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).disallow(Joi.ref("oldPassword")).required()
      .messages({ "any.invalid": "New password must differ from old password" }),
  });
}
