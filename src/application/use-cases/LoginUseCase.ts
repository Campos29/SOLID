import bcryptjs from 'bcryptjs';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { InvalidCredentialsError } from '../errors/InvalidCredentialsError';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  user: User;
}

export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await bcryptjs.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    return { user };
  }
}
