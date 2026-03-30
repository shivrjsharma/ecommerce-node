import { Request, Response, NextFunction } from "express";
import { IUserService } from "../interfaces/IUserService";
import { AuthRequest } from "../middleware/auth";
import { ApiResponse } from "../utils/ApiResponse";
import { MSG } from "../constants/messages";

export class UserController {
  constructor(private readonly userService: IUserService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, await this.userService.register(req.body.name, req.body.email, req.body.password, req.body.role), MSG.USER.REGISTERED, 201);
    } catch (err) {
      next(err);
    }
  };

  getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, await this.userService.getProfile(req.userId!), MSG.USER.PROFILE_FETCHED);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, await this.userService.update(req.userId!, req.body), MSG.USER.PROFILE_UPDATED);
    } catch (err) {
      next(err);
    }
  };

  changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.userService.changePassword(req.userId!, req.body.oldPassword, req.body.newPassword);
      ApiResponse.success(res, null, MSG.USER.PASSWORD_CHANGED);
    } catch (err) {
      next(err);
    }
  };

  uploadAvatar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) throw new Error("No file uploaded");
      const filePath = `/uploads/avatars/${req.file.filename}`;
      ApiResponse.success(res, await this.userService.uploadAvatar(req.userId!, filePath), MSG.USER.PROFILE_UPDATED);
    } catch (err) {
      next(err);
    }
  };

  removeAvatar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, await this.userService.uploadAvatar(req.userId!, null as unknown as string), MSG.USER.PROFILE_UPDATED);
    } catch (err) {
      next(err);
    }
  };
}
