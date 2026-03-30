import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "../utils/AppError";
import { MSG } from "../constants/messages";
import logger from "../utils/logger";

export class ErrorMiddleware {
  // Handles unknown routes — must be registered after all routes
  notFound = (req: Request, res: Response): void => {
    logger.warn(`[404] ${req.method} ${req.originalUrl}`);
    res.status(404).json({ statusCode: 404, status: "error", message: MSG.GENERAL.ROUTE_NOT_FOUND(req.originalUrl), data: null });
  };

  // Global error handler — must have exactly 4 args so Express detects it
  handle: ErrorRequestHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    // Known operational error — safe to expose message to client
    if (err instanceof AppError) {
      logger.warn(`[AppError] ${req.method} ${req.originalUrl} → ${err.statusCode} "${err.message}"`);
      res.status(err.statusCode).json({ statusCode: err.statusCode, status: "error", message: err.message, data: null });
      return;
    }

    // Unknown/unexpected error — log full stack, hide details from client
    logger.error(`[UnhandledError] ${req.method} ${req.originalUrl} → ${err.message}`, {
      stack: err.stack,
    });
    res.status(500).json({ statusCode: 500, status: "error", message: MSG.GENERAL.INTERNAL_ERROR, data: null });
  };
}
