import { FastifyReply, FastifyRequest } from 'fastify';
import { Availability, WeekDay } from '../../../domain/entities/Availability';
import { Provider } from '../../../domain/entities/Provider';
import { Service } from '../../../domain/entities/Service';
import { ConfigureProviderAvailabilityUseCase } from '../../../application/use-cases/availability/ConfigureProviderAvailabilityUseCase';
import { ListAvailableSlotsUseCase } from '../../../application/use-cases/appointment/ListAvailableSlotsUseCase';
import { ListProviderAppointmentsUseCase } from '../../../application/use-cases/appointment/ListProviderAppointmentsUseCase';
import { Appointment } from '../../../domain/entities/Appointment';
import { RegisterProviderUseCase } from '../../../application/use-cases/provider/RegisterProviderUseCase';
import { UpdateProviderProfileUseCase } from '../../../application/use-cases/provider/UpdateProviderProfileUseCase';
import { ListProvidersUseCase } from '../../../application/use-cases/provider/ListProvidersUseCase';
import { CreateProviderServiceUseCase } from '../../../application/use-cases/service/CreateProviderServiceUseCase';
import { UpdateProviderServiceUseCase } from '../../../application/use-cases/service/UpdateProviderServiceUseCase';
import { DeleteProviderServiceUseCase } from '../../../application/use-cases/service/DeleteProviderServiceUseCase';
import { ListProviderServicesUseCase } from '../../../application/use-cases/service/ListProviderServicesUseCase';
import { ServiceNotFoundError } from '../../../application/errors/ServiceNotFoundError';
import { IAppointmentReader } from '../../../domain/interfaces/IAppointmentRepository';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { IAvailabilityRepository } from '../../../domain/interfaces/IAvailabilityRepository';
import { IProviderRepository } from '../../../domain/interfaces/IProviderRepository';
import { IServiceRepository } from '../../../domain/interfaces/IServiceRepository';
import {
  ConfigureAvailabilityBody,
  ListSlotsQuery,
} from '../../schemas/availabilitySchemas';
import { CreateProviderBody, ListProvidersQuery, UpdateProviderBody } from '../../schemas/providerSchemas';
import {
  CreateServiceBody,
  ProviderIdParams,
  ServiceParams,
  UpdateServiceBody,
} from '../../schemas/serviceSchemas';
import { ListProviderAppointmentsQuery } from '../../schemas/appointmentSchemas';
import { assertProviderOwnership } from '../helpers/providerOwnership';
import { filterSlotsForServiceDuration } from '../helpers/slotFilters';
import { ProviderDependencies } from '../container';

export class ProviderController {
  private readonly registerProviderUseCase: RegisterProviderUseCase;
  private readonly listProvidersUseCase: ListProvidersUseCase;
  private readonly listProviderServicesUseCase: ListProviderServicesUseCase;
  private readonly createProviderServiceUseCase: CreateProviderServiceUseCase;
  private readonly updateProviderProfileUseCase: UpdateProviderProfileUseCase;
  private readonly updateProviderServiceUseCase: UpdateProviderServiceUseCase;
  private readonly deleteProviderServiceUseCase: DeleteProviderServiceUseCase;
  private readonly configureProviderAvailabilityUseCase: ConfigureProviderAvailabilityUseCase;
  private readonly listAvailableSlotsUseCase: ListAvailableSlotsUseCase;
  private readonly listProviderAppointmentsUseCase: ListProviderAppointmentsUseCase;
  private readonly providerRepository: IProviderRepository;
  private readonly serviceRepository: IServiceRepository;
  private readonly availabilityRepository: IAvailabilityRepository;
  private readonly appointmentReader: IAppointmentReader;
  private readonly userRepository: IUserRepository;

  constructor(dependencies: ProviderDependencies) {
    this.registerProviderUseCase = dependencies.registerProviderUseCase;
    this.listProvidersUseCase = dependencies.listProvidersUseCase;
    this.listProviderServicesUseCase = dependencies.listProviderServicesUseCase;
    this.createProviderServiceUseCase = dependencies.createProviderServiceUseCase;
    this.updateProviderProfileUseCase = dependencies.updateProviderProfileUseCase;
    this.updateProviderServiceUseCase = dependencies.updateProviderServiceUseCase;
    this.deleteProviderServiceUseCase = dependencies.deleteProviderServiceUseCase;
    this.configureProviderAvailabilityUseCase = dependencies.configureProviderAvailabilityUseCase;
    this.listAvailableSlotsUseCase = dependencies.listAvailableSlotsUseCase;
    this.listProviderAppointmentsUseCase = dependencies.listProviderAppointmentsUseCase;
    this.providerRepository = dependencies.providerRepository;
    this.serviceRepository = dependencies.serviceRepository;
    this.availabilityRepository = dependencies.availabilityRepository;
    this.appointmentReader = dependencies.appointmentReader;
    this.userRepository = dependencies.userRepository;
  }

  create = async (request: FastifyRequest<{ Body: CreateProviderBody }>, reply: FastifyReply) => {
    const { provider } = await this.registerProviderUseCase.execute({
      userId: request.user.userId,
      name: request.body.name,
      description: request.body.description ?? '',
      category: request.body.category,
    });
    return reply.status(201).send(this.toResponse(provider));
  };

  list = async (request: FastifyRequest<{ Querystring: ListProvidersQuery }>, reply: FastifyReply) => {
    const { providers } = await this.listProvidersUseCase.execute({
      category: request.query.category,
    });
    return reply.status(200).send({ providers: providers.map((provider) => this.toResponse(provider)) });
  };

  listServices = async (
    request: FastifyRequest<{ Params: ProviderIdParams }>,
    reply: FastifyReply,
  ) => {
    const { services } = await this.listProviderServicesUseCase.execute({
      providerId: request.params.providerId,
    });
    return reply.status(200).send({
      services: services.map((service) => this.toServiceResponse(service)),
    });
  };

  updateProfile = async (
    request: FastifyRequest<{ Params: ProviderIdParams; Body: UpdateProviderBody }>,
    reply: FastifyReply,
  ) => {
    const { provider } = await this.updateProviderProfileUseCase.execute({
      providerId: request.params.providerId,
      userId: request.user.userId,
      name: request.body.name,
      description: request.body.description ?? '',
      category: request.body.category,
    });

    return reply.status(200).send(this.toResponse(provider));
  };

  createService = async (
    request: FastifyRequest<{ Params: ProviderIdParams; Body: CreateServiceBody }>,
    reply: FastifyReply,
  ) => {
    await assertProviderOwnership(
      this.providerRepository,
      request.params.providerId,
      request.user.userId,
    );

    const { service } = await this.createProviderServiceUseCase.execute({
      providerId: request.params.providerId,
      name: request.body.name,
      durationInMinutes: request.body.durationInMinutes,
      priceInCents: request.body.priceInCents,
    });

    return reply.status(201).send(this.toServiceResponse(service));
  };

  updateService = async (
    request: FastifyRequest<{ Params: ServiceParams; Body: UpdateServiceBody }>,
    reply: FastifyReply,
  ) => {
    await assertProviderOwnership(
      this.providerRepository,
      request.params.providerId,
      request.user.userId,
    );

    const { service } = await this.updateProviderServiceUseCase.execute({
      providerId: request.params.providerId,
      serviceId: request.params.serviceId,
      name: request.body.name,
      durationInMinutes: request.body.durationInMinutes,
      priceInCents: request.body.priceInCents,
    });

    return reply.status(200).send(this.toServiceResponse(service));
  };

  deleteService = async (
    request: FastifyRequest<{ Params: ServiceParams }>,
    reply: FastifyReply,
  ) => {
    await assertProviderOwnership(
      this.providerRepository,
      request.params.providerId,
      request.user.userId,
    );

    await this.deleteProviderServiceUseCase.execute({
      providerId: request.params.providerId,
      serviceId: request.params.serviceId,
    });

    return reply.status(204).send();
  };

  configureAvailability = async (
    request: FastifyRequest<{ Params: ProviderIdParams; Body: ConfigureAvailabilityBody }>,
    reply: FastifyReply,
  ) => {
    await assertProviderOwnership(
      this.providerRepository,
      request.params.providerId,
      request.user.userId,
    );

    const { availability } = await this.configureProviderAvailabilityUseCase.execute({
      providerId: request.params.providerId,
      weeklySlots: request.body.weeklySlots.map((slot) => ({
        ...slot,
        dayOfWeek: slot.dayOfWeek as WeekDay,
      })),
      blockedDates: request.body.blockedDates.map((blocked) => ({
        date: new Date(`${blocked.date}T12:00:00`),
        reason: blocked.reason,
      })),
    });

    return reply.status(200).send(this.toAvailabilityResponse(availability));
  };

  listSlots = async (
    request: FastifyRequest<{ Params: ProviderIdParams; Querystring: ListSlotsQuery }>,
    reply: FastifyReply,
  ) => {
    const service = await this.serviceRepository.findById(request.query.serviceId);
    if (!service || service.providerId !== request.params.providerId) {
      throw new ServiceNotFoundError();
    }

    const date = parseCalendarDate(request.query.date);
    const { slots } = await this.listAvailableSlotsUseCase.execute({
      providerId: request.params.providerId,
      date,
    });

    const availability = await this.availabilityRepository.findByProviderId(request.params.providerId);
    const daySlot = availability?.weeklySlots.find((slot) => slot.dayOfWeek === date.getDay());
    if (!daySlot) {
      return reply.status(200).send({ slots: [] });
    }

    const durationFiltered = filterSlotsForServiceDuration(
      slots,
      service.durationInMinutes,
      daySlot,
      date,
    );

    const available = [];
    for (const slot of durationFiltered) {
      const serviceEnd = new Date(slot.startsAt.getTime() + service.durationInMinutes * 60_000);
      const overlaps = await this.appointmentReader.findOverlappingActiveByProvider(
        request.params.providerId,
        slot.startsAt,
        serviceEnd,
      );
      if (overlaps.length === 0) {
        available.push({
          startsAt: slot.startsAt.toISOString(),
          endsAt: serviceEnd.toISOString(),
        });
      }
    }

    return reply.status(200).send({ slots: available });
  };

  listAppointments = async (
    request: FastifyRequest<{ Params: ProviderIdParams; Querystring: ListProviderAppointmentsQuery }>,
    reply: FastifyReply,
  ) => {
    await assertProviderOwnership(
      this.providerRepository,
      request.params.providerId,
      request.user.userId,
    );

    const { appointments } = await this.listProviderAppointmentsUseCase.execute({
      providerId: request.params.providerId,
      statuses: request.query.status ? [request.query.status] : undefined,
    });

    const enriched = await Promise.all(
      appointments.map(async (appointment) => {
        const [service, client] = await Promise.all([
          this.serviceRepository.findById(appointment.serviceId),
          this.userRepository.findById(appointment.clientId),
        ]);

        return {
          ...this.toAppointmentResponse(appointment),
          serviceName: service?.name ?? 'Serviço',
          clientName: client?.name ?? 'Cliente',
        };
      }),
    );

    return reply.status(200).send({ appointments: enriched });
  };

  private toAppointmentResponse(appointment: Appointment) {
    return {
      id: appointment.id,
      providerId: appointment.providerId,
      serviceId: appointment.serviceId,
      clientId: appointment.clientId,
      startsAt: appointment.startsAt.toISOString(),
      endsAt: appointment.endsAt.toISOString(),
      status: appointment.status,
      createdAt: appointment.createdAt.toISOString(),
    };
  }

  private toResponse(provider: Provider) {
    return {
      id: provider.id,
      userId: provider.userId,
      name: provider.name,
      description: provider.description,
      category: provider.category,
      createdAt: provider.createdAt.toISOString(),
    };
  }

  private toServiceResponse(service: Service) {
    return {
      id: service.id,
      providerId: service.providerId,
      name: service.name,
      durationInMinutes: service.durationInMinutes,
      priceInCents: service.priceInCents,
    };
  }

  private toAvailabilityResponse(availability: Availability) {
    return {
      id: availability.id,
      providerId: availability.providerId,
      weeklySlots: availability.weeklySlots,
      blockedDates: availability.blockedDates.map((blocked) => ({
        date: blocked.date.toISOString().slice(0, 10),
        reason: blocked.reason,
      })),
      createdAt: availability.createdAt.toISOString(),
    };
  }
}

function parseCalendarDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}
