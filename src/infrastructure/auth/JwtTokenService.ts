import jwt, { JwtPayload } from 'jsonwebtoken';
import { ITokenService, TokenPayload } from '@domain/interfaces/ITokenService';

interface JwtTokenServiceOptions {
  secret: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
}

export class JwtTokenService implements ITokenService {
  private readonly secret: string;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenExpiresIn: string;

  constructor({ secret, accessTokenExpiresIn, refreshTokenExpiresIn }: JwtTokenServiceOptions) {
    this.secret = secret;
    this.accessTokenExpiresIn = accessTokenExpiresIn;
    this.refreshTokenExpiresIn = refreshTokenExpiresIn;
  }

  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.accessTokenExpiresIn } as jwt.SignOptions);
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.refreshTokenExpiresIn } as jwt.SignOptions);
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload;
      return {
        userId: decoded['userId'] as string,
        role: decoded['role'] as string,
      };
    } catch (error) {
      throw new Error(`Invalid or expired refresh token: ${(error as Error).message}`);
    }
  }
}
