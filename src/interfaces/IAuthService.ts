export interface TokenPair {
  accessToken: string;
  refreshToken?: string; 
}

export interface IAuthService {
  login(email: string, password: string): Promise<TokenPair & { user: object }>;
  refresh(refreshToken: string): Promise<Pick<TokenPair, "accessToken">>;
  logout(userId: number): Promise<void>;
}
