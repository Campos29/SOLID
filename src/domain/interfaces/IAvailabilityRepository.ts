import { Availability } from '../entities/Availability';

export interface IAvailabilityRepository {
  save(availability: Availability): Promise<Availability>;
  findByProviderId(providerId: string): Promise<Availability | null>;
}
