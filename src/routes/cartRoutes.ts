import { Router } from "express";
import { CartController } from "../controllers/cartController";
import { CartService } from "../services/cartService";
import { ProductService } from "../services/productService";
import { AuthMiddleware } from "../middleware/auth";
import { ValidationMiddleware } from "../middleware/validate";
import { CartValidator } from "../validators/cartValidator";

const router = Router();

// DIP: CartService receives IProductService abstraction
const ctrl = new CartController(new CartService(new ProductService()));
const auth = new AuthMiddleware();
const validation = new ValidationMiddleware();
const schema = new CartValidator();

router.get("/", auth.authenticate, ctrl.getCart);
router.post("/add", auth.authenticate, validation.validate(schema.add), ctrl.add);
router.delete("/clear", auth.authenticate, ctrl.clear);
router.put("/update/:itemId", auth.authenticate, validation.validate(schema.itemIdParam, "params"), validation.validate(schema.updateItem), ctrl.updateItem);
router.delete("/remove/:itemId", auth.authenticate, validation.validate(schema.itemIdParam, "params"), ctrl.removeItem);

export default router;
