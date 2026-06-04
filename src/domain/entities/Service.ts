export type ServiceProps = {
  id: string;
  providerId: string;
  name: string;
  durationInMinutes: number;
  priceInCents: number;
  createdAt: Date;
};

export type CreateServiceInput = {
  id: string;
  providerId: string;
  name: string;
  durationInMinutes: number;
  priceInCents: number;
  createdAt?: Date;
};

export class Service {
  private constructor(private readonly props: ServiceProps) {}

  static create(input: CreateServiceInput): Service {
    ensureFilled(input.id, 'Service id');
    ensureFilled(input.providerId, 'Service provider id');
    ensureFilled(input.name, 'Service name');
    ensurePositiveInteger(input.durationInMinutes, 'Service duration');
    ensurePositiveInteger(input.priceInCents, 'Service price');

    return new Service({
      ...input,
      name: input.name.trim(),
      createdAt: input.createdAt ?? new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get providerId(): string {
    return this.props.providerId;
  }

  get name(): string {
    return this.props.name;
  }

  get durationInMinutes(): number {
    return this.props.durationInMinutes;
  }

  get priceInCents(): number {
    return this.props.priceInCents;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}

function ensureFilled(value: string, fieldName: string): void {
  if (!value.trim()) {
    throw new Error(`${fieldName} is required`);
  }
}

function ensurePositiveInteger(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
}
