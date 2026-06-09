import { env } from '../../config/env';
import { pool } from '../../infrastructure/database/pool';
import { PgUserRepository } from '../../infrastructure/repositories/PgUserRepository';
import { PgProviderRepository } from '../../infrastructure/repositories/PgProviderRepository';
import { JwtTokenService } from '../../infrastructure/auth/JwtTokenService';
import { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';
import { RegisterProviderUseCase } from '../../application/use-cases/provider/RegisterProviderUseCase';
import { ListProvidersUseCase } from '../../application/use-cases/provider/ListProvidersUseCase';
import { ITokenService } from '../../domain/interfaces/ITokenService';
import { ReviewSubmissionUnavailableError } from '../../application/errors/ReviewSubmissionUnavailableError';

export interface AuthDependencies {
  registerUseCase: RegisterUseCase;
  loginUseCase: LoginUseCase;
  refreshTokenUseCase: RefreshTokenUseCase;
  tokenService: ITokenService;
}

export interface ProviderDependencies {
  registerProviderUseCase: RegisterProviderUseCase;
  listProvidersUseCase: ListProvidersUseCase;
}

export type SubmitReviewInput = {
  appointmentId: string;
  clientId: string;
  rating: number;
  comment?: string;
};

export type ReviewView = {
  id: string;
  appointmentId: string;
  providerId: string;
  clientId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
};

export interface SubmitReviewUseCasePort {
  execute(input: SubmitReviewInput): Promise<{ review: ReviewView }>;
}

export interface ReviewDependencies {
  submitReviewUseCase: SubmitReviewUseCasePort;
}

// Composition root: concrete implementations are wired here, at the
// outermost layer, so use cases keep depending only on domain interfaces (DIP).
export function buildAuthDependencies(): AuthDependencies {
  const userRepository = new PgUserRepository(pool);

  const tokenService = new JwtTokenService({
    secret: env.JWT_SECRET,
    accessTokenExpiresIn: env.JWT_EXPIRES_IN,
    refreshTokenExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

  return {
    registerUseCase: new RegisterUseCase(userRepository),
    loginUseCase: new LoginUseCase(userRepository),
    refreshTokenUseCase: new RefreshTokenUseCase(tokenService),
    tokenService,
  };
}

export function buildProviderDependencies(): ProviderDependencies {
  const providerRepository = new PgProviderRepository(pool);

  return {
    registerProviderUseCase: new RegisterProviderUseCase(providerRepository),
    listProvidersUseCase: new ListProvidersUseCase(providerRepository),
  };
}

export function buildReviewDependencies(): ReviewDependencies {
  return {
    submitReviewUseCase: new UnavailableSubmitReviewUseCase(),
  };
}

class UnavailableSubmitReviewUseCase implements SubmitReviewUseCasePort {
  async execute(_input: SubmitReviewInput): Promise<{ review: ReviewView }> {
    throw new ReviewSubmissionUnavailableError();
  }
}
