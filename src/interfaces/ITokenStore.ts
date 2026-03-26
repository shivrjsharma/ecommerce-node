export interface ITokenStore {
  set(userId: number, token: string, ttlSeconds: number): Promise<void>;
  get(userId: number): Promise<string | null>;
  delete(userId: number): Promise<void>;
}
