import { IProviderRepository } from '@domain/interfaces/IProviderRepository';
import { IServiceRepository } from '@domain/interfaces/IServiceRepository';
import { ProviderNotFoundError } from '../../errors/ProviderNotFoundError';
import { ServiceNotFoundError } from '../../errors/ServiceNotFoundError';

export interface DeleteProviderServiceInput {
  providerId: string;
  serviceId: string;
}

export class DeleteProviderServiceUseCase {
  constructor(
    private readonly providerRepository: IProviderRepository,
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(input: DeleteProviderServiceInput): Promise<void> {
    const provider = await this.providerRepository.findById(input.providerId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }

    const existing = await this.serviceRepository.findById(input.serviceId);
    if (!existing || existing.providerId !== input.providerId) {
      throw new ServiceNotFoundError();
    }

    await this.serviceRepository.delete(input.serviceId);
  }
}
