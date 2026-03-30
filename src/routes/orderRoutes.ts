import { Router } from "express";
import { OrderController } from "../controllers/orderController";
import { OrderService } from "../services/orderService";
import { CartService } from "../services/cartService";
import { ProductService } from "../services/productService";
import { AuthMiddleware } from "../middleware/auth";
import { ValidationMiddleware } from "../middleware/validate";
import { OrderValidator } from "../validators/orderValidator";

const router = Router();

// DIP: OrderService → ICartService → IProductService (full chain)
const ctrl = new OrderController(
  new OrderService(new CartService(new ProductService()))
);
const auth = new AuthMiddleware();
const validation = new ValidationMiddleware();
const schema = new OrderValidator();

router.post("/", auth.authenticate, ctrl.create);
router.get("/", auth.authenticate, ctrl.getAll);
router.get("/:id", auth.authenticate, validation.validate(schema.idParam, "params"), ctrl.getById);
router.put("/:id/status", auth.authenticate, validation.validate(schema.idParam, "params"), validation.validate(schema.updateStatus), ctrl.updateStatus);
router.delete("/:id/cancel", auth.authenticate, validation.validate(schema.idParam, "params"), ctrl.cancel);

export default router;
