import { randomUUID } from 'node:crypto';
import { Service } from '@domain/entities/Service';
import { IProviderRepository } from '@domain/interfaces/IProviderRepository';
import { IServiceRepository } from '@domain/interfaces/IServiceRepository';
import { ProviderNotFoundError } from '../../errors/ProviderNotFoundError';

export interface CreateProviderServiceInput {
  providerId: string;
  name: string;
  durationInMinutes: number;
  priceInCents: number;
}

export interface CreateProviderServiceOutput {
  service: Service;
}

export class CreateProviderServiceUseCase {
  constructor(
    private readonly providerRepository: IProviderRepository,
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(input: CreateProviderServiceInput): Promise<CreateProviderServiceOutput> {
    const provider = await this.providerRepository.findById(input.providerId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }

    const service = Service.create({
      id: randomUUID(),
      providerId: input.providerId,
      name: input.name,
      durationInMinutes: input.durationInMinutes,
      priceInCents: input.priceInCents,
    });

    const saved = await this.serviceRepository.save(service);
    return { service: saved };
  }
}
