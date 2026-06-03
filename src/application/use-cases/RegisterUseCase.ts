import * as crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import { User, UserRole } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { UserAlreadyExistsError } from '../errors/UserAlreadyExistsError';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterOutput {
  user: User;
}

export class RegisterUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new UserAlreadyExistsError(input.email);
    }

    const passwordHash = await bcryptjs.hash(input.password, 10);
    const id = crypto.randomUUID();

    const user = User.create({
      id,
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    });

    await this.userRepository.save(user);

    return { user };
  }
}
