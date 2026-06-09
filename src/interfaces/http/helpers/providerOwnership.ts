import { IProviderRepository } from '../../../domain/interfaces/IProviderRepository';
import { ForbiddenResourceError } from '../../../application/errors/ForbiddenResourceError';
import { ProviderNotFoundError } from '../../../application/errors/ProviderNotFoundError';

export async function assertProviderOwnership(
  providerRepository: IProviderRepository,
  providerId: string,
  userId: string,
): Promise<void> {
  const provider = await providerRepository.findById(providerId);
  if (!provider) {
    throw new ProviderNotFoundError();
  }
  if (provider.userId !== userId) {
    throw new ForbiddenResourceError();
  }
}
