export const USER_ROLES = ['Admin', 'Provider', 'Client'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type UserProps = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
};

export type CreateUserInput = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt?: Date;
};

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(input: CreateUserInput): User {
    ensureFilled(input.id, 'User id');
    ensureFilled(input.name, 'User name');
    ensureFilled(input.email, 'User email');
    ensureFilled(input.passwordHash, 'User password hash');

    return new User({
      ...input,
      email: input.email.toLowerCase(),
      createdAt: input.createdAt ?? new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get role(): UserRole {
    return this.props.role;
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
