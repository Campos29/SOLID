import { FastifyReply, FastifyRequest } from 'fastify';
import { Provider } from '../../../domain/entities/Provider';
import { RegisterProviderUseCase } from '../../../application/use-cases/provider/RegisterProviderUseCase';
import { ListProvidersUseCase } from '../../../application/use-cases/provider/ListProvidersUseCase';
import { CreateProviderBody, ListProvidersQuery } from '../../schemas/providerSchemas';
import { ProviderDependencies } from '../container';

export class ProviderController {
  private readonly registerProviderUseCase: RegisterProviderUseCase;
  private readonly listProvidersUseCase: ListProvidersUseCase;

  constructor(dependencies: ProviderDependencies) {
    this.registerProviderUseCase = dependencies.registerProviderUseCase;
    this.listProvidersUseCase = dependencies.listProvidersUseCase;
  }

  create = async (request: FastifyRequest<{ Body: CreateProviderBody }>, reply: FastifyReply) => {
    const { provider } = await this.registerProviderUseCase.execute({
      userId: request.user.userId,
      name: request.body.name,
      description: request.body.description ?? '',
      category: request.body.category,
    });
    return reply.status(201).send(this.toResponse(provider));
  };

  list = async (request: FastifyRequest<{ Querystring: ListProvidersQuery }>, reply: FastifyReply) => {
    const { providers } = await this.listProvidersUseCase.execute({
      category: request.query.category,
    });
    return reply.status(200).send({ providers: providers.map((provider) => this.toResponse(provider)) });
  };

  private toResponse(provider: Provider) {
    return {
      id: provider.id,
      userId: provider.userId,
      name: provider.name,
      description: provider.description,
      category: provider.category,
      createdAt: provider.createdAt.toISOString(),
    };
  }
}
