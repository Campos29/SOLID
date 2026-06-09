import { Service } from '../../../domain/entities/Service';
import { ProviderNotFoundError } from '../../errors/ProviderNotFoundError';
import { IProviderRepository } from '../../../domain/interfaces/IProviderRepository';
import { IServiceRepository } from '../../../domain/interfaces/IServiceRepository';

export interface ListProviderServicesInput {
  providerId: string;
}

export interface ListProviderServicesOutput {
  services: Service[];
}

export class ListProviderServicesUseCase {
  constructor(
    private readonly providerRepository: IProviderRepository,
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(input: ListProviderServicesInput): Promise<ListProviderServicesOutput> {
    const provider = await this.providerRepository.findById(input.providerId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }

    const services = await this.serviceRepository.findByProviderId(input.providerId);
    return { services };
  }
}
