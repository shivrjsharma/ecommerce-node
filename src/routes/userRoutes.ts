import { Router } from "express";
import { UserController } from "../controllers/userController";
import { UserService } from "../services/userService";
import { AuthMiddleware } from "../middleware/auth";
import { ValidationMiddleware } from "../middleware/validate";
import { UserValidator } from "../validators/userValidator";
import { uploadAvatar } from "../middleware/upload";

const router = Router();
const ctrl = new UserController(new UserService());
const auth = new AuthMiddleware();
const v = new ValidationMiddleware();
const schema = new UserValidator();

router.post("/register", v.validate(schema.register), ctrl.register);
router.get("/profile", auth.authenticate, ctrl.getProfile);
router.put("/update", auth.authenticate, v.validate(schema.update), ctrl.update);
router.put("/change-password", auth.authenticate, v.validate(schema.changePassword), ctrl.changePassword);
router.post("/avatar", auth.authenticate, uploadAvatar, ctrl.uploadAvatar);
router.delete("/avatar", auth.authenticate, ctrl.removeAvatar);

export default router;
