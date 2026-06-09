import { Provider } from '@domain/entities/Provider';
import { IProviderRepository } from '@domain/interfaces/IProviderRepository';
import { ProviderNotFoundError } from '../../errors/ProviderNotFoundError';

export interface UpdateProviderProfileInput {
  providerId: string;
  userId: string;
  name: string;
  description: string;
  category: string;
}

export interface UpdateProviderProfileOutput {
  provider: Provider;
}

export class UpdateProviderProfileUseCase {
  constructor(private readonly providerRepository: IProviderRepository) {}

  async execute(input: UpdateProviderProfileInput): Promise<UpdateProviderProfileOutput> {
    const existing = await this.providerRepository.findById(input.providerId);
    if (!existing || existing.userId !== input.userId) {
      throw new ProviderNotFoundError();
    }

    const provider = Provider.create({
      id: existing.id,
      userId: existing.userId,
      name: input.name,
      description: input.description,
      category: input.category,
      createdAt: existing.createdAt,
    });

    await this.providerRepository.save(provider);
    return { provider };
  }
}
