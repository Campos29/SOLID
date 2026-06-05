import { Provider } from '../../../domain/entities/Provider';
import { IProviderRepository } from '../../../domain/interfaces/IProviderRepository';

export interface ListProvidersInput {
  category?: string;
}

export interface ListProvidersOutput {
  providers: Provider[];
}

export class ListProvidersUseCase {
  constructor(private readonly providerRepository: IProviderRepository) {}

  async execute(input: ListProvidersInput = {}): Promise<ListProvidersOutput> {
    const filters = input.category ? { category: input.category } : {};
    const providers = await this.providerRepository.findAll(filters);

    return { providers };
  }
}
