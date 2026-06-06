import { ITokenService } from '../../../domain/interfaces/ITokenService';
import { InvalidRefreshTokenError } from '../../errors/InvalidRefreshTokenError';

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenOutput {
  accessToken: string;
}

export class RefreshTokenUseCase {
  constructor(private readonly tokenService: ITokenService) {}

  execute(input: RefreshTokenInput): RefreshTokenOutput {
    try {
      const payload = this.tokenService.verifyRefreshToken(input.refreshToken);
      const accessToken = this.tokenService.generateAccessToken(payload);
      return { accessToken };
    } catch {
      throw new InvalidRefreshTokenError();
    }
  }
}
