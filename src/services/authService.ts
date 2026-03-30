import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Repository } from "typeorm";
import { getRepository } from "../db";
import { User } from "../entity/User";
import { IAuthService } from "../interfaces/IAuthService";
import { ITokenStore } from "../interfaces/ITokenStore";
import { AppError } from "../utils/AppError";
import { MSG } from "../constants/messages";
import logger from "../utils/logger";

// 7 days in seconds
const REFRESH_TTL = 7 * 24 * 60 * 60;

export class AuthService implements IAuthService {
  // DIP: depends on ITokenStore abstraction, not RedisTokenStore directly
  constructor(private readonly tokenStore: ITokenStore) {}

  private get repo(): Repository<User> {
    return getRepository(User); 
  }

  private signAccessToken(userId: number): string {
    const expiresIn = (process.env.JWT_EXPIRES_IN || "15m") as `${number}${"s" | "m" | "h" | "d"}`;
    return jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn });
  }

  private signRefreshToken(userId: number): string {
    const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as `${number}${"s" | "m" | "h" | "d"}`;
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn });
  }

  async login(email: string, password: string) {
    logger.debug(`[AuthService] login → email=${email}`);

    const user = await this.repo.findOneBy({ email });
    if (!user) {
      logger.warn(`[AuthService] login failed → no account for email=${email}`);
      throw new AppError(MSG.AUTH.NO_ACCOUNT, 401);
    }
    if (!(await bcrypt.compare(password, user.password))) {
      logger.warn(`[AuthService] login failed → incorrect password for email=${email}`);
      throw new AppError(MSG.AUTH.INCORRECT_PASSWORD, 401);
    }

    const accessToken = this.signAccessToken(user.id);
    const refreshToken = this.signRefreshToken(user.id);

    // store hashed refresh token in DB
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.tokenStore.set(user.id, hashed, REFRESH_TTL);

    logger.info(`[AuthService] login success → id=${user.id}`);
    const {  ...profile } = user;
    return { accessToken, refreshToken, user: profile };
  }

  async refresh(refreshToken: string) {
    logger.debug("[AuthService] refresh token request");

    let payload: { id: number };
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id: number };
    } catch {
      throw new AppError(MSG.AUTH.INVALID_REFRESH_TOKEN, 401);
    }

    const stored = await this.tokenStore.get(payload.id);
    if (!stored) throw new AppError(MSG.AUTH.REFRESH_TOKEN_REVOKED, 401);

    const isValid = await bcrypt.compare(refreshToken, stored);
    if (!isValid) throw new AppError(MSG.AUTH.REFRESH_TOKEN_MISMATCH, 401);

    // rotate: issue new access token
    const accessToken = this.signAccessToken(payload.id);
    logger.info(`[AuthService] access token refreshed → id=${payload.id}`);
    return { accessToken };
  }

  async logout(userId: number) {
    logger.debug(`[AuthService] logout → userId=${userId}`);
    await this.tokenStore.delete(userId);
    logger.info(`[AuthService] logged out userId=${userId}`);
  }
}
