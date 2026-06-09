import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { UserAlreadyExistsError } from '../../application/errors/UserAlreadyExistsError';
import { InvalidCredentialsError } from '../../application/errors/InvalidCredentialsError';
import { InvalidRefreshTokenError } from '../../application/errors/InvalidRefreshTokenError';
import { ProviderAlreadyExistsError } from '../../application/errors/ProviderAlreadyExistsError';
import { ProviderNotFoundError } from '../../application/errors/ProviderNotFoundError';
import { ServiceNotFoundError } from '../../application/errors/ServiceNotFoundError';
import { AppointmentNotFoundError } from '../../application/errors/AppointmentNotFoundError';
import { SlotAlreadyBookedError } from '../../application/errors/SlotAlreadyBookedError';
import { ForbiddenResourceError } from '../../application/errors/ForbiddenResourceError';
import { ReviewSubmissionUnavailableError } from '../../application/errors/ReviewSubmissionUnavailableError';
import { InvalidAppointmentStatusError } from '../../application/errors/InvalidAppointmentStatusError';

const statusByErrorName: Record<string, number> = {
  [UserAlreadyExistsError.name]: 409,
  [InvalidCredentialsError.name]: 401,
  [InvalidRefreshTokenError.name]: 401,
  [ProviderAlreadyExistsError.name]: 409,
  [ProviderNotFoundError.name]: 404,
  [ServiceNotFoundError.name]: 404,
  [AppointmentNotFoundError.name]: 404,
  [SlotAlreadyBookedError.name]: 409,
  [ForbiddenResourceError.name]: 403,
  [ReviewSubmissionUnavailableError.name]: 501,
  [InvalidAppointmentStatusError.name]: 409,
};

const reasonByStatus: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error',
  501: 'Not Implemented',
};

export function registerErrorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
): FastifyReply {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send(buildError(400, error.validation[0]?.message ?? 'Invalid request'));
  }

  const mappedStatus = statusByErrorName[error.name];
  if (mappedStatus) {
    return reply.status(mappedStatus).send(buildError(mappedStatus, error.message));
  }

  request.log.error(error);
  return reply.status(500).send(buildError(500, 'Internal server error'));
}

function buildError(statusCode: number, message: string) {
  return {
    statusCode,
    error: reasonByStatus[statusCode] ?? 'Error',
    message,
  };
}
