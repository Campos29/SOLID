import { Availability } from '../entities/Availability';

export interface IAvailabilityRepository {
  save(availability: Availability): Promise<Availability>;
}
