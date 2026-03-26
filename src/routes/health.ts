import { Router, Request, Response } from "express";
import Joi from "joi";
import { ValidationMiddleware } from "../middleware/validate";

const router = Router();
const v = new ValidationMiddleware();

const echoSchema = Joi.object({
  message: Joi.string().min(1).max(100).required(),
});

// GET /health
router.get("/", (_req: Request, res: Response) => {
  res.json({ status: "OK" });
});

// POST /health/echo  →  demonstrates body validation
router.post("/echo", v.validate(echoSchema), (req: Request, res: Response) => {
  res.json({ echo: req.body.message });
});

export default router;
