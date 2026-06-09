import { env } from '../../config/env';
import { pool } from '../../infrastructure/database/pool';
import { PgUserRepository } from '../../infrastructure/repositories/PgUserRepository';
import { PgProviderRepository } from '../../infrastructure/repositories/PgProviderRepository';
import { PgServiceRepository } from '../../infrastructure/repositories/PgServiceRepository';
import { PgAvailabilityRepository } from '../../infrastructure/repositories/PgAvailabilityRepository';
import { PgAppointmentRepository } from '../../infrastructure/repositories/PgAppointmentRepository';
import { JwtTokenService } from '../../infrastructure/auth/JwtTokenService';
import { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';
import { RegisterProviderUseCase } from '../../application/use-cases/provider/RegisterProviderUseCase';
import { UpdateProviderProfileUseCase } from '../../application/use-cases/provider/UpdateProviderProfileUseCase';
import { ListProvidersUseCase } from '../../application/use-cases/provider/ListProvidersUseCase';
import { ListProviderServicesUseCase } from '../../application/use-cases/service/ListProviderServicesUseCase';
import { CreateProviderServiceUseCase } from '../../application/use-cases/service/CreateProviderServiceUseCase';
import { UpdateProviderServiceUseCase } from '../../application/use-cases/service/UpdateProviderServiceUseCase';
import { DeleteProviderServiceUseCase } from '../../application/use-cases/service/DeleteProviderServiceUseCase';
import { ConfigureProviderAvailabilityUseCase } from '../../application/use-cases/availability/ConfigureProviderAvailabilityUseCase';
import { ListAvailableSlotsUseCase } from '../../application/use-cases/appointment/ListAvailableSlotsUseCase';
import { ListClientAppointmentsUseCase } from '../../application/use-cases/appointment/ListClientAppointmentsUseCase';
import { ListProviderAppointmentsUseCase } from '../../application/use-cases/appointment/ListProviderAppointmentsUseCase';
import { CreateAppointmentUseCase } from '../../application/use-cases/appointment/CreateAppointmentUseCase';
import { CancelAppointmentUseCase } from '../../application/use-cases/appointment/CancelAppointmentUseCase';
import { ConfirmAppointmentUseCase } from '../../application/use-cases/appointment/ConfirmAppointmentUseCase';
import { RejectAppointmentUseCase } from '../../application/use-cases/appointment/RejectAppointmentUseCase';
import { CompleteAppointmentUseCase } from '../../application/use-cases/appointment/CompleteAppointmentUseCase';
import { FreeCancellationStrategy } from '../../domain/strategies/FreeCancellationStrategy';
import { ITokenService } from '../../domain/interfaces/ITokenService';
import { IProviderRepository } from '../../domain/interfaces/IProviderRepository';
import { IServiceRepository } from '../../domain/interfaces/IServiceRepository';
import { IAvailabilityRepository } from '../../domain/interfaces/IAvailabilityRepository';
import { IAppointmentReader } from '../../domain/interfaces/IAppointmentRepository';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { ReviewSubmissionUnavailableError } from '../../application/errors/ReviewSubmissionUnavailableError';

export interface AuthDependencies {
  registerUseCase: RegisterUseCase;
  loginUseCase: LoginUseCase;
  refreshTokenUseCase: RefreshTokenUseCase;
  tokenService: ITokenService;
}

export interface ProviderDependencies {
  registerProviderUseCase: RegisterProviderUseCase;
  listProvidersUseCase: ListProvidersUseCase;
  listProviderServicesUseCase: ListProviderServicesUseCase;
  createProviderServiceUseCase: CreateProviderServiceUseCase;
  updateProviderProfileUseCase: UpdateProviderProfileUseCase;
  updateProviderServiceUseCase: UpdateProviderServiceUseCase;
  deleteProviderServiceUseCase: DeleteProviderServiceUseCase;
  configureProviderAvailabilityUseCase: ConfigureProviderAvailabilityUseCase;
  listAvailableSlotsUseCase: ListAvailableSlotsUseCase;
  listProviderAppointmentsUseCase: ListProviderAppointmentsUseCase;
  providerRepository: IProviderRepository;
  serviceRepository: IServiceRepository;
  availabilityRepository: IAvailabilityRepository;
  appointmentReader: IAppointmentReader;
  userRepository: IUserRepository;
}

export interface AppointmentDependencies {
  listClientAppointmentsUseCase: ListClientAppointmentsUseCase;
  confirmAppointmentUseCase: ConfirmAppointmentUseCase;
  rejectAppointmentUseCase: RejectAppointmentUseCase;
  completeAppointmentUseCase: CompleteAppointmentUseCase;
  createAppointmentUseCase: CreateAppointmentUseCase;
  cancelAppointmentUseCase: CancelAppointmentUseCase;
  appointmentReader: IAppointmentReader;
  serviceRepository: IServiceRepository;
  providerRepository: IProviderRepository;
}

export type SubmitReviewInput = {
  appointmentId: string;
  clientId: string;
  rating: number;
  comment?: string;
};

export type ReviewView = {
  id: string;
  appointmentId: string;
  providerId: string;
  clientId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
};

export interface SubmitReviewUseCasePort {
  execute(input: SubmitReviewInput): Promise<{ review: ReviewView }>;
}

export interface ReviewDependencies {
  submitReviewUseCase: SubmitReviewUseCasePort;
}

// Composition root: concrete implementations are wired here, at the
// outermost layer, so use cases keep depending only on domain interfaces (DIP).
export function buildAuthDependencies(): AuthDependencies {
  const userRepository = new PgUserRepository(pool);

  const tokenService = new JwtTokenService({
    secret: env.JWT_SECRET,
    accessTokenExpiresIn: env.JWT_EXPIRES_IN,
    refreshTokenExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

  return {
    registerUseCase: new RegisterUseCase(userRepository),
    loginUseCase: new LoginUseCase(userRepository),
    refreshTokenUseCase: new RefreshTokenUseCase(tokenService),
    tokenService,
  };
}

export function buildProviderDependencies(): ProviderDependencies {
  const providerRepository = new PgProviderRepository(pool);
  const serviceRepository = new PgServiceRepository(pool);
  const availabilityRepository = new PgAvailabilityRepository(pool);
  const appointmentRepository = new PgAppointmentRepository(pool);

  return {
    registerProviderUseCase: new RegisterProviderUseCase(providerRepository),
    listProvidersUseCase: new ListProvidersUseCase(providerRepository),
    listProviderServicesUseCase: new ListProviderServicesUseCase(
      providerRepository,
      serviceRepository,
    ),
    createProviderServiceUseCase: new CreateProviderServiceUseCase(
      providerRepository,
      serviceRepository,
    ),
    updateProviderProfileUseCase: new UpdateProviderProfileUseCase(providerRepository),
    updateProviderServiceUseCase: new UpdateProviderServiceUseCase(
      providerRepository,
      serviceRepository,
    ),
    deleteProviderServiceUseCase: new DeleteProviderServiceUseCase(
      providerRepository,
      serviceRepository,
    ),
    configureProviderAvailabilityUseCase: new ConfigureProviderAvailabilityUseCase(
      availabilityRepository,
    ),
    listAvailableSlotsUseCase: new ListAvailableSlotsUseCase(
      availabilityRepository,
      appointmentRepository,
    ),
    listProviderAppointmentsUseCase: new ListProviderAppointmentsUseCase(appointmentRepository),
    providerRepository,
    serviceRepository,
    availabilityRepository,
    appointmentReader: appointmentRepository,
    userRepository: new PgUserRepository(pool),
  };
}

export function buildAppointmentDependencies(): AppointmentDependencies {
  const appointmentRepository = new PgAppointmentRepository(pool);
  const serviceRepository = new PgServiceRepository(pool);
  const providerRepository = new PgProviderRepository(pool);

  return {
    listClientAppointmentsUseCase: new ListClientAppointmentsUseCase(appointmentRepository),
    confirmAppointmentUseCase: new ConfirmAppointmentUseCase(
      appointmentRepository,
      appointmentRepository,
    ),
    rejectAppointmentUseCase: new RejectAppointmentUseCase(
      appointmentRepository,
      appointmentRepository,
    ),
    completeAppointmentUseCase: new CompleteAppointmentUseCase(
      appointmentRepository,
      appointmentRepository,
    ),
    createAppointmentUseCase: new CreateAppointmentUseCase(
      appointmentRepository,
      appointmentRepository,
    ),
    cancelAppointmentUseCase: new CancelAppointmentUseCase(
      appointmentRepository,
      appointmentRepository,
      new FreeCancellationStrategy(),
    ),
    appointmentReader: appointmentRepository,
    serviceRepository,
    providerRepository,
  };
}

export function buildReviewDependencies(): ReviewDependencies {
  return {
    submitReviewUseCase: new UnavailableSubmitReviewUseCase(),
  };
}

class UnavailableSubmitReviewUseCase implements SubmitReviewUseCasePort {
  async execute(_input: SubmitReviewInput): Promise<{ review: ReviewView }> {
    throw new ReviewSubmissionUnavailableError();
  }
}
