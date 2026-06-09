import { Service } from '@domain/entities/Service';
import { IProviderRepository } from '@domain/interfaces/IProviderRepository';
import { IServiceRepository } from '@domain/interfaces/IServiceRepository';
import { ProviderNotFoundError } from '../../errors/ProviderNotFoundError';
import { ServiceNotFoundError } from '../../errors/ServiceNotFoundError';

export interface UpdateProviderServiceInput {
  providerId: string;
  serviceId: string;
  name: string;
  durationInMinutes: number;
  priceInCents: number;
}

export interface UpdateProviderServiceOutput {
  service: Service;
}

export class UpdateProviderServiceUseCase {
  constructor(
    private readonly providerRepository: IProviderRepository,
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(input: UpdateProviderServiceInput): Promise<UpdateProviderServiceOutput> {
    const provider = await this.providerRepository.findById(input.providerId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }

    const existing = await this.serviceRepository.findById(input.serviceId);
    if (!existing || existing.providerId !== input.providerId) {
      throw new ServiceNotFoundError();
    }

    const service = Service.create({
      id: existing.id,
      providerId: existing.providerId,
      name: input.name,
      durationInMinutes: input.durationInMinutes,
      priceInCents: input.priceInCents,
      createdAt: existing.createdAt,
    });

    const saved = await this.serviceRepository.save(service);
    return { service: saved };
  }
}
