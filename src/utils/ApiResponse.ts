import { Response } from "express";

export class ApiResponse {
  static success<T>(res: Response, data: T, message = "Success", statusCode = 200): void {
    res.status(statusCode).json({ statusCode, status: "success", message, data });
  }
}
