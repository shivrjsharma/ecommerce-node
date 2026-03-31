import "reflect-metadata";
import "dotenv/config";
import express, { Router } from "express";
import cors from "cors";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { LoggerMiddleware } from "./middleware/logger";
import { ErrorMiddleware } from "./middleware/error";
import { AppDataSource } from "./config/database";
import { swaggerSpec } from "./config/swagger";
import logger from "./utils/logger";
import { generalLimiter } from "./middleware/rateLimit";
import healthRouter from "./routes/health";
import authRouter from "./routes/authRoutes";
import userRouter from "./routes/userRoutes";
import productRouter from "./routes/productRoutes";
import cartRouter from "./routes/cartRoutes";
import orderRouter from "./routes/orderRoutes";
import { orderEmitter, ORDER_EVENTS, type OrderCreatedPayload } from "./events/orderEvents";
import { sendOrderConfirmationMail } from "./utils/mailer";

const app = express();
const loggerMiddleware = new LoggerMiddleware();
const errorMiddleware = new ErrorMiddleware();

// amazonq-ignore-next-line
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware.requestLogger);
// app.use(generalLimiter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customCssUrl: undefined }));
app.use("/api-docs", express.static(path.join(process.cwd(), "node_modules", "swagger-ui-dist")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// OCP: add new routes here without modifying anything else
const routes: [string, Router][] = [
  ["/health", healthRouter],
  ["/auth", authRouter],
  ["/users", userRouter],
  ["/products", productRouter],
  ["/cart", cartRouter],
  ["/orders", orderRouter],
];
routes.forEach(([path, route]) => app.use(path, route));

app.use(errorMiddleware.notFound);
app.use(errorMiddleware.handle);

process.on("uncaughtException", (err: Error) => {
  logger.error("[uncaughtException] Unhandled exception", { message: err.message, stack: err.stack });
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  const stack = reason instanceof Error ? reason.stack : undefined;
  logger.error("[unhandledRejection] Unhandled promise rejection", { message, stack });
  process.exit(1);
});

async function start(): Promise<void> {
  orderEmitter.on(ORDER_EVENTS.CREATED, (payload: OrderCreatedPayload) => {
    logger.info(`[Event:order.created] orderId=${payload.id} userId=${payload.userId} total=${payload.total} status=${payload.status}`);
    sendOrderConfirmationMail(payload.userEmail, payload.userName, payload.id, payload.total)
      .then(() => logger.info(`[Mailer] confirmation sent to ${payload.userEmail} for orderId=${payload.id}`))
      .catch((err: Error) => logger.error(`[Mailer] failed to send to ${payload.userEmail} → ${err.message}`, { err }));
  });

  await AppDataSource.initialize();
  logger.info("Database connected (SQLite)");
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Swagger docs at http://localhost:${PORT}/api-docs`);
  });
}

start().catch((err: Error) => {
  logger.error("[Startup] Failed to start server", { message: err.message, stack: err.stack });
  process.exit(1);
});
