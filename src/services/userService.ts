import bcrypt from "bcryptjs";
import { Repository } from "typeorm";
import { getRepository } from "../db";
import { User, UserRole } from "../entity/User";
import { IUserService } from "../interfaces/IUserService";
import { AppError } from "../utils/AppError";
import { MSG } from "../constants/messages";
import logger, { sanitizeLog } from "../utils/logger";
import cache from "../utils/cache";

export class UserService implements IUserService {
  private get repo(): Repository<User> {
    return getRepository(User);
  }

  async register(name: string, email: string, password: string, role = "user") {
    logger.debug(`[UserService] register → email=${sanitizeLog(email)}`);
    try {
      if (await this.repo.findOneBy({ email }))
        throw new AppError(MSG.USER.EMAIL_TAKEN, 409);

      const hashed = await bcrypt.hash(password, 10);
      const saved = await this.repo.save(this.repo.create({ name, email, password: hashed, role: role as UserRole }));
      const { password: _p, refreshToken: _r, ...profile } = saved;
      return profile;
    } catch (err) {
      throw err instanceof AppError ? err : new AppError(MSG.USER.REGISTER_FAILED, 500);
    }
  }

  async getProfile(id: number) {
    const key = `user:${id}`;
    logger.debug(`[UserService] getProfile → id=${sanitizeLog(id)}`);
    try {
      const cached = cache.get(key);
      if (cached) return cached as Awaited<ReturnType<IUserService["getProfile"]>>;
      const user = await this.repo.findOneBy({ id });
      if (!user) throw new AppError(MSG.USER.NOT_FOUND, 404);
      const { password: _p, refreshToken: _r, ...profile } = user;
      cache.set(key, profile);
      return profile;
    } catch (err) {
      logger.error(`[UserService] getProfile failed → id=${sanitizeLog(id)}`, { err });
      throw err instanceof AppError ? err : new AppError(MSG.USER.PROFILE_FETCH_FAILED, 500);
    }
  }

  async update(id: number, data: Partial<Pick<User, "name" | "email">>) {
    logger.debug(`[UserService] update → id=${sanitizeLog(id)}`);
    try {
      await this.repo.update(id, data);
      cache.del(`user:${id}`);
      logger.info(`[UserService] updated user id=${sanitizeLog(id)}`);
      return this.getProfile(id);
    } catch (err) {
      logger.error(`[UserService] update failed → id=${sanitizeLog(id)}`, { err });
      throw err instanceof AppError ? err : new AppError(MSG.USER.UPDATE_FAILED, 500);
    }
  }

  async uploadAvatar(id: number, filePath: string | null) {
    logger.debug(`[UserService] uploadAvatar → id=${sanitizeLog(id)}`);
    try {
      await this.repo.update(id, { avatar: filePath });
      cache.del(`user:${id}`);
      return this.getProfile(id);
    } catch (err) {
      logger.error(`[UserService] uploadAvatar failed → id=${sanitizeLog(id)}`, { err });
      throw err instanceof AppError ? err : new AppError(MSG.USER.UPDATE_FAILED, 500);
    }
  }

  async changePassword(id: number, oldPassword: string, newPassword: string) {
    logger.debug(`[UserService] changePassword → id=${sanitizeLog(id)}`);
    try {
      const user = await this.repo.findOneBy({ id });
      if (!user) throw new AppError(MSG.USER.NOT_FOUND, 404);
      if (!(await bcrypt.compare(oldPassword, user.password))) {
        logger.warn(`[UserService] changePassword failed → incorrect current password id=${sanitizeLog(id)}`);
        throw new AppError(MSG.USER.INCORRECT_PASSWORD, 400);
      }
      user.password = await bcrypt.hash(newPassword, 10);
      await this.repo.save(user);
      cache.del(`user:${id}`);
      logger.info(`[UserService] password changed id=${sanitizeLog(id)}`);
    } catch (err) {
      logger.error(`[UserService] changePassword failed → id=${sanitizeLog(id)}`, { err });
      throw err instanceof AppError ? err : new AppError(MSG.USER.PASSWORD_CHANGE_FAILED, 500);
    }
  }
}
