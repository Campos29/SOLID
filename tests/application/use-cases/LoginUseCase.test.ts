import { describe, it, expect, beforeEach } from 'vitest';
import bcryptjs from 'bcryptjs';
import { LoginUseCase } from '../../../src/application/use-cases/LoginUseCase';
import { User } from '../../../src/domain/entities/User';
import { IUserRepository } from '../../../src/domain/interfaces/IUserRepository';
import { InvalidCredentialsError } from '../../../src/application/errors/InvalidCredentialsError';

class InMemoryUserRepository implements IUserRepository {
  public users: User[] = [];

  async save(user: User): Promise<void> {
    this.users.push(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email.toLowerCase()) || null;
  }
}

describe('LoginUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let loginUseCase: LoginUseCase;
  let existingUser: User;

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    loginUseCase = new LoginUseCase(userRepository);

    const passwordHash = await bcryptjs.hash('password123', 10);
    existingUser = User.create({
      id: 'existing-id',
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash,
      role: 'Client',
    });
    await userRepository.save(existingUser);
  });

  it('should successfully log in with correct credentials', async () => {
    const output = await loginUseCase.execute({
      email: 'john@example.com',
      password: 'password123',
    });

    expect(output.user).toBeInstanceOf(User);
    expect(output.user.id).toBe('existing-id');
  });

  it('should throw an error if the user is not found', async () => {
    await expect(
      loginUseCase.execute({
        email: 'wrong@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('should throw an error if the password is incorrect', async () => {
    await expect(
      loginUseCase.execute({
        email: 'john@example.com',
        password: 'wrongpassword',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
