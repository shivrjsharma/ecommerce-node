import { Request, Response, NextFunction } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { AppError } from "../utils/AppError";

export interface AuthRequest extends Request {
  userId?: number;
}

export class AuthMiddleware {
  authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next(new AppError("No token provided", 401));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
      req.userId = decoded.id;
      next();
    } catch (err) {
      if (err instanceof TokenExpiredError)
        return next(new AppError("Token has expired", 401));
      if (err instanceof JsonWebTokenError)
        return next(new AppError("Invalid token", 401));
      next(err);
    }
  };
}
