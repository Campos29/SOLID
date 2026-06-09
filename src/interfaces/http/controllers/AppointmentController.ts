import { FastifyReply, FastifyRequest } from 'fastify';
import { Appointment } from '../../../domain/entities/Appointment';
import { CancelAppointmentUseCase } from '../../../application/use-cases/appointment/CancelAppointmentUseCase';
import { ConfirmAppointmentUseCase } from '../../../application/use-cases/appointment/ConfirmAppointmentUseCase';
import { RejectAppointmentUseCase } from '../../../application/use-cases/appointment/RejectAppointmentUseCase';
import { CompleteAppointmentUseCase } from '../../../application/use-cases/appointment/CompleteAppointmentUseCase';
import { CreateAppointmentUseCase } from '../../../application/use-cases/appointment/CreateAppointmentUseCase';
import { ListClientAppointmentsUseCase } from '../../../application/use-cases/appointment/ListClientAppointmentsUseCase';
import { AppointmentNotFoundError } from '../../../application/errors/AppointmentNotFoundError';
import { ForbiddenResourceError } from '../../../application/errors/ForbiddenResourceError';
import { ServiceNotFoundError } from '../../../application/errors/ServiceNotFoundError';
import { IAppointmentReader } from '../../../domain/interfaces/IAppointmentRepository';
import { IProviderRepository } from '../../../domain/interfaces/IProviderRepository';
import { IServiceRepository } from '../../../domain/interfaces/IServiceRepository';
import {
  CancelAppointmentParams,
  ConfirmAppointmentParams,
  CreateAppointmentBody,
  ListMyAppointmentsQuery,
  ProviderAppointmentActionParams,
} from '../../schemas/appointmentSchemas';
import { assertProviderOwnership } from '../helpers/providerOwnership';
import { AppointmentDependencies } from '../container';

export class AppointmentController {
  private readonly listClientAppointmentsUseCase: ListClientAppointmentsUseCase;
  private readonly confirmAppointmentUseCase: ConfirmAppointmentUseCase;
  private readonly rejectAppointmentUseCase: RejectAppointmentUseCase;
  private readonly completeAppointmentUseCase: CompleteAppointmentUseCase;
  private readonly createAppointmentUseCase: CreateAppointmentUseCase;
  private readonly cancelAppointmentUseCase: CancelAppointmentUseCase;
  private readonly appointmentReader: IAppointmentReader;
  private readonly serviceRepository: IServiceRepository;
  private readonly providerRepository: IProviderRepository;

  constructor(dependencies: AppointmentDependencies) {
    this.listClientAppointmentsUseCase = dependencies.listClientAppointmentsUseCase;
    this.confirmAppointmentUseCase = dependencies.confirmAppointmentUseCase;
    this.rejectAppointmentUseCase = dependencies.rejectAppointmentUseCase;
    this.completeAppointmentUseCase = dependencies.completeAppointmentUseCase;
    this.createAppointmentUseCase = dependencies.createAppointmentUseCase;
    this.cancelAppointmentUseCase = dependencies.cancelAppointmentUseCase;
    this.appointmentReader = dependencies.appointmentReader;
    this.serviceRepository = dependencies.serviceRepository;
    this.providerRepository = dependencies.providerRepository;
  }

  listMine = async (
    request: FastifyRequest<{ Querystring: ListMyAppointmentsQuery }>,
    reply: FastifyReply,
  ) => {
    const { appointments } = await this.listClientAppointmentsUseCase.execute({
      clientId: request.user.userId,
      statuses: request.query.status ? [request.query.status] : undefined,
    });

    return reply.status(200).send({
      appointments: appointments.map((appointment) => this.toResponse(appointment)),
    });
  };

  create = async (
    request: FastifyRequest<{ Body: CreateAppointmentBody }>,
    reply: FastifyReply,
  ) => {
    const service = await this.serviceRepository.findById(request.body.serviceId);
    if (!service || service.providerId !== request.body.providerId) {
      throw new ServiceNotFoundError();
    }

    const startsAt = new Date(request.body.startsAt);
    const endsAt = new Date(startsAt.getTime() + service.durationInMinutes * 60_000);

    const { appointment } = await this.createAppointmentUseCase.execute({
      providerId: request.body.providerId,
      clientId: request.user.userId,
      serviceId: request.body.serviceId,
      startsAt,
      endsAt,
    });

    return reply.status(201).send(this.toResponse(appointment));
  };

  cancel = async (
    request: FastifyRequest<{ Params: CancelAppointmentParams }>,
    reply: FastifyReply,
  ) => {
    const found = await this.appointmentReader.findById(request.params.appointmentId);
    if (!found) {
      throw new AppointmentNotFoundError();
    }
    if (found.clientId !== request.user.userId) {
      throw new ForbiddenResourceError();
    }

    const service = await this.serviceRepository.findById(found.serviceId);
    if (!service) {
      throw new ServiceNotFoundError();
    }

    const { appointment } = await this.cancelAppointmentUseCase.execute({
      appointmentId: request.params.appointmentId,
      requestedAt: new Date(),
      servicePriceInCents: service.priceInCents,
    });

    return reply.status(200).send(this.toResponse(appointment));
  };

  confirm = async (
    request: FastifyRequest<{ Params: ConfirmAppointmentParams }>,
    reply: FastifyReply,
  ) => {
    await this.assertProviderOwnsAppointment(request.params.appointmentId, request.user.userId);

    const { appointment } = await this.confirmAppointmentUseCase.execute({
      appointmentId: request.params.appointmentId,
      confirmedAt: new Date(),
    });

    return reply.status(200).send(this.toResponse(appointment));
  };

  reject = async (
    request: FastifyRequest<{ Params: ProviderAppointmentActionParams }>,
    reply: FastifyReply,
  ) => {
    await this.assertProviderOwnsAppointment(request.params.appointmentId, request.user.userId);

    const { appointment } = await this.rejectAppointmentUseCase.execute({
      appointmentId: request.params.appointmentId,
      rejectedAt: new Date(),
    });

    return reply.status(200).send(this.toResponse(appointment));
  };

  complete = async (
    request: FastifyRequest<{ Params: ProviderAppointmentActionParams }>,
    reply: FastifyReply,
  ) => {
    await this.assertProviderOwnsAppointment(request.params.appointmentId, request.user.userId);

    const { appointment } = await this.completeAppointmentUseCase.execute({
      appointmentId: request.params.appointmentId,
      completedAt: new Date(),
    });

    return reply.status(200).send(this.toResponse(appointment));
  };

  private async assertProviderOwnsAppointment(
    appointmentId: string,
    userId: string,
  ): Promise<void> {
    const found = await this.appointmentReader.findById(appointmentId);
    if (!found) {
      throw new AppointmentNotFoundError();
    }

    await assertProviderOwnership(this.providerRepository, found.providerId, userId);
  }

  private toResponse(appointment: Appointment) {
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
}
