import multer from "multer";
import path from "path";
import { AppError } from "../utils/AppError";

const storage = multer.diskStorage({
  destination: "uploads/avatars",
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/"))
      return cb(new AppError("Only image files are allowed", 400));
    cb(null, true);
  },
}).single("avatar");
