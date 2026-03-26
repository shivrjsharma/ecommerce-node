import { Request, Response, NextFunction } from "express";
import Joi from "joi";

type Source = "body" | "query" | "params";

export class ValidationMiddleware {
  validate(schema: Joi.ObjectSchema, source: Source = "body") {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { error, value } = schema.validate(req[source], {
        abortEarly: false,  // collect all errors at once
        stripUnknown: true, // remove unknown fields
      });

      if (error) {
        res.status(400).json({
          message: "Validation failed",
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      if (source === "query") {
        Object.defineProperty(req, "query", { value, writable: true, configurable: true });
      } else {
        req[source] = value;
      }
      next();
    };
  }
}
