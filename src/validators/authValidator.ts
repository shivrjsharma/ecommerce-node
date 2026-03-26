import Joi from "joi";

export class AuthValidator {
  readonly login = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  readonly refresh = Joi.object({
    refreshToken: Joi.string().required(),
  });
}
