import { randomUUID } from 'node:crypto';
import { Availability, BlockedDate, WeeklyAvailabilitySlot } from '@domain/entities/Availability';
import { IAvailabilityRepository } from '@domain/interfaces/IAvailabilityRepository';

export interface ConfigureProviderAvailabilityInput {
  providerId: string;
  weeklySlots: WeeklyAvailabilitySlot[];
  blockedDates?: BlockedDate[];
}

export interface ConfigureProviderAvailabilityOutput {
  availability: Availability;
}

export class ConfigureProviderAvailabilityUseCase {
  constructor(private readonly availabilityRepository: IAvailabilityRepository) {}

  async execute(input: ConfigureProviderAvailabilityInput): Promise<ConfigureProviderAvailabilityOutput> {
    const availability = Availability.create({
      id: randomUUID(),
      providerId: input.providerId,
      weeklySlots: input.weeklySlots,
      blockedDates: input.blockedDates,
    });

    const saved = await this.availabilityRepository.save(availability);
    return { availability: saved };
  }
}
