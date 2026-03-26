import { User } from "../entity/User";

export type UserProfile = Omit<User, "password">;
export interface IUserService {
  register(name: string, email: string, password: string, role?: string): Promise<UserProfile>;
  getProfile(id: number): Promise<UserProfile>;
  update(id: number, data: Partial<Pick<User, "name" | "email">>): Promise<UserProfile>;
  changePassword(id: number, oldPassword: string, newPassword: string): Promise<void>;
}
