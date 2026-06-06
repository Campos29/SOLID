import { FastifyReply, FastifyRequest } from 'fastify';
import { User } from '../../../domain/entities/User';
import { ITokenService } from '../../../domain/interfaces/ITokenService';
import { RegisterUseCase } from '../../../application/use-cases/RegisterUseCase';
import { LoginUseCase } from '../../../application/use-cases/LoginUseCase';
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/RefreshTokenUseCase';
import { RegisterBody, LoginBody, RefreshBody } from '../../schemas/authSchemas';
import { AuthDependencies } from '../container';

export class AuthController {
  private readonly registerUseCase: RegisterUseCase;
  private readonly loginUseCase: LoginUseCase;
  private readonly refreshTokenUseCase: RefreshTokenUseCase;
  private readonly tokenService: ITokenService;

  constructor(dependencies: AuthDependencies) {
    this.registerUseCase = dependencies.registerUseCase;
    this.loginUseCase = dependencies.loginUseCase;
    this.refreshTokenUseCase = dependencies.refreshTokenUseCase;
    this.tokenService = dependencies.tokenService;
  }

  register = async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
    const { user } = await this.registerUseCase.execute(request.body);
    return reply.status(201).send(this.buildAuthResponse(user));
  };

  login = async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
    const { user } = await this.loginUseCase.execute(request.body);
    return reply.status(200).send(this.buildAuthResponse(user));
  };

  refresh = async (request: FastifyRequest<{ Body: RefreshBody }>, reply: FastifyReply) => {
    const result = this.refreshTokenUseCase.execute(request.body);
    return reply.status(200).send(result);
  };

  private buildAuthResponse(user: User) {
    const payload = { userId: user.id, role: user.role };
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
      accessToken: this.tokenService.generateAccessToken(payload),
      refreshToken: this.tokenService.generateRefreshToken(payload),
    };
  }
}
