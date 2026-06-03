import { describe, it, expect, beforeEach } from 'vitest';
import { RegisterUseCase } from '../../../src/application/use-cases/RegisterUseCase';
import { User } from '../../../src/domain/entities/User';
import { IUserRepository } from '../../../src/domain/interfaces/IUserRepository';
import { UserAlreadyExistsError } from '../../../src/application/errors/UserAlreadyExistsError';

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

describe('RegisterUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let registerUseCase: RegisterUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    registerUseCase = new RegisterUseCase(userRepository);
  });

  it('should successfully register a new user', async () => {
    const output = await registerUseCase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'Client',
    });

    expect(output.user).toBeInstanceOf(User);
    expect(output.user.name).toBe('John Doe');
    expect(output.user.email).toBe('john@example.com');
    expect(output.user.role).toBe('Client');
    expect(output.user.passwordHash).not.toBe('password123'); // Hashed
    expect(userRepository.users).toHaveLength(1);
  });

  it('should throw an error if the email is already registered', async () => {
    await registerUseCase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'Client',
    });

    await expect(
      registerUseCase.execute({
        name: 'Jane Doe',
        email: 'john@example.com',
        password: 'password456',
        role: 'Provider',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });
});
