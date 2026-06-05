import { preHandlerHookHandler } from 'fastify';

// Aligns the decoded JWT shape with the payload issued by JwtTokenService,
// so request.user is strongly typed across the HTTP layer.
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string; role: string };
    user: { userId: string; role: string };
  }
}

// Typed as a generic preHandler hook so it does not pin a route's
// type-provider generics, keeping Zod body/query inference intact.
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
