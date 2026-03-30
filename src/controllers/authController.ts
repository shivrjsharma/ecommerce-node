import { Request, Response, NextFunction } from "express";
import { IAuthService } from "../interfaces/IAuthService";
import { AuthRequest } from "../middleware/auth";
import { ApiResponse } from "../utils/ApiResponse";
import { MSG } from "../constants/messages";

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, await this.authService.login(req.body.email, req.body.password), MSG.AUTH.LOGIN_SUCCESS);
    } catch (err) {
       next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, await this.authService.refresh(req.body.refreshToken), MSG.AUTH.TOKEN_REFRESHED);
    } catch (err) {
       next(err);
    }
  };

  logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authService.logout(req.userId!);
      ApiResponse.success(res, null, MSG.AUTH.LOGOUT_SUCCESS);
    } catch (err) {
       next(err);
    }
  };
}
