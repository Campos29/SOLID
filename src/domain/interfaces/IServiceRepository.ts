import { Service } from '../entities/Service';

export interface IServiceRepository {
  findById(id: string): Promise<Service | null>;
  findByProviderId(providerId: string): Promise<Service[]>;
  save(service: Service): Promise<Service>;
  delete(id: string): Promise<void>;
}
