import * as crypto from 'crypto';
import { Provider } from '../../../domain/entities/Provider';
import { IProviderRepository } from '../../../domain/interfaces/IProviderRepository';
import { ProviderAlreadyExistsError } from '../../errors/ProviderAlreadyExistsError';

export interface RegisterProviderInput {
  userId: string;
  name: string;
  description: string;
  category: string;
}

export interface RegisterProviderOutput {
  provider: Provider;
}

export class RegisterProviderUseCase {
  constructor(private readonly providerRepository: IProviderRepository) {}

  async execute(input: RegisterProviderInput): Promise<RegisterProviderOutput> {
    const existingProvider = await this.providerRepository.findByUserId(input.userId);
    if (existingProvider) {
      throw new ProviderAlreadyExistsError(input.userId);
    }

    const provider = Provider.create({
      id: crypto.randomUUID(),
      userId: input.userId,
      name: input.name,
      description: input.description,
      category: input.category,
    });

    await this.providerRepository.save(provider);

    return { provider };
  }
}
