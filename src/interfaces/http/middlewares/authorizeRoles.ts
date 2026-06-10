import { preHandlerHookHandler } from 'fastify';
import { UserRole } from '../../../domain/entities/User';


export function authorizeRoles(...allowedRoles: UserRole[]): preHandlerHookHandler {
  return async function (request, reply) {
    if (!allowedRoles.includes(request.user.role)) {
      await reply.status(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'You do not have permission to access this resource',
      });
    }
  };
}
