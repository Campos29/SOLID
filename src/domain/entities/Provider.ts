export type ProviderProps = {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  createdAt: Date;
  averageRating: number;
  reviewCount: number;
};

export type CreateProviderInput = {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  createdAt?: Date;
  averageRating?: number;
  reviewCount?: number;
};

export class Provider {
  private constructor(private readonly props: ProviderProps) {}

  static create(input: CreateProviderInput): Provider {
    ensureFilled(input.id, 'Provider id');
    ensureFilled(input.userId, 'Provider user id');
    ensureFilled(input.name, 'Provider name');
    ensureFilled(input.category, 'Provider category');

    return new Provider({
      ...input,
      category: input.category.toLowerCase(),
      createdAt: input.createdAt ?? new Date(),
      averageRating: input.averageRating ?? 0,
      reviewCount: input.reviewCount ?? 0,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get category(): string {
    return this.props.category;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get averageRating(): number {
    return this.props.averageRating;
  }

  get reviewCount(): number {
    return this.props.reviewCount;
  }
}

function ensureFilled(value: string, fieldName: string): void {
  if (!value.trim()) {
    throw new Error(`${fieldName} is required`);
  }
}
