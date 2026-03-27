import { getRepository } from "../db";
import { User } from "../entity/User";
import { ITokenStore } from "../interfaces/ITokenStore";

export class DbTokenStore implements ITokenStore {
  private get repo() {
    return getRepository(User);
  }

  async set(userId: number, token: string, _ttlSeconds: number): Promise<void> {
    await this.repo.update(userId, { refreshToken: token });
  }

  async get(userId: number): Promise<string | null> {
    const user = await this.repo.findOne({ where: { id: userId }, select: ["refreshToken"] });
    return user?.refreshToken ?? null;
  }

  async delete(userId: number): Promise<void> {
    await this.repo.update(userId, { refreshToken: null });
  }
}
