import { Router } from "express";
import { ProductController } from "../controllers/productController";
import { ProductService } from "../services/productService";
import { AuthMiddleware } from "../middleware/auth";
import { ValidationMiddleware } from "../middleware/validate";
import { ProductValidator } from "../validators/productValidator";

const router = Router();
const ctrl = new ProductController(new ProductService());
const auth = new AuthMiddleware();
const validation = new ValidationMiddleware();
const schema = new ProductValidator();

router.get("/search", validation.validate(schema.search, "query"), ctrl.search);
router.get("/export/:format", ctrl.export);
router.get("/", validation.validate(schema.pagination, "query"), ctrl.getAll);
router.post("/", auth.authenticate, validation.validate(schema.create), ctrl.create);
router.get("/:id", validation.validate(schema.idParam, "params"), ctrl.getById);
router.put("/:id", auth.authenticate, validation.validate(schema.idParam, "params"), validation.validate(schema.update), ctrl.update);
router.delete("/:id", auth.authenticate, validation.validate(schema.idParam, "params"), ctrl.delete);

export default router;
