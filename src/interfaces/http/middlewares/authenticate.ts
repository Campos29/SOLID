import { preHandlerHookHandler } from 'fastify';
import { UserRole } from '../../../domain/entities/User';



declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string; role: UserRole };
    user: { userId: string; role: UserRole };
  }
}



export const authenticate: preHandlerHookHandler = async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch {
    await reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Missing or invalid access token',
    });
  }
};
