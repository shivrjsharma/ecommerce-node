import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { AuthService } from "../services/authService";
import { DbTokenStore } from "../utils/DbTokenStore";
import { AuthMiddleware } from "../middleware/auth";
import { ValidationMiddleware } from "../middleware/validate";
import { AuthValidator } from "../validators/authValidator";

const router = Router();
const ctrl = new AuthController(new AuthService(new DbTokenStore()));
const validation = new ValidationMiddleware();
const schema = new AuthValidator();

router.post("/login", validation.validate(schema.login), ctrl.login);
router.post("/refresh", validation.validate(schema.refresh), ctrl.refresh);
router.post("/logout", ctrl.logout);

export default router;
