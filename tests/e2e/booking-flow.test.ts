import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';
import { pool } from '../../src/infrastructure/database/pool';

// July 6 2026 is a Monday (dayOfWeek = 1), safely in the future.
const MONDAY = '2026-07-06';
const SLOT_10H = `${MONDAY}T10:00:00.000Z`;
const SLOT_12H = `${MONDAY}T12:00:00.000Z`;

// Truncate all tables in reverse FK dependency order before each test so
// every case starts from a clean database state.
const TRUNCATE_ALL = `
  TRUNCATE reviews, appointments, services, provider_availability, providers, users
  RESTART IDENTITY CASCADE
`;

// ── helpers ──────────────────────────────────────────────────────────────────

type InjectResult = Awaited<ReturnType<FastifyInstance['inject']>>;

function auth(token: string) {
  return { headers: { authorization: `Bearer ${token}` } };
}

async function post(
  app: FastifyInstance,
  url: string,
  payload: object,
  token?: string,
): Promise<InjectResult> {
  return app.inject({
    method: 'POST',
    url,
    payload,
    ...(token ? auth(token) : {}),
  });
}

async function patch(
  app: FastifyInstance,
  url: string,
  token: string,
  payload?: object,
): Promise<InjectResult> {
  return app.inject({
    method: 'PATCH',
    url,
    payload: payload ?? {},
    ...auth(token),
  });
}

// ── shared setup ─────────────────────────────────────────────────────────────

interface ProviderSetup {
  providerToken: string;
  providerId: string;
  serviceId: string;
}

/** Registers a provider user, creates a profile + service + Monday availability. */
async function setupProvider(app: FastifyInstance, suffix = ''): Promise<ProviderSetup> {
  const registerRes = await post(app, '/api/v1/auth/register', {
    name: `Ana Provider${suffix}`,
    email: `ana${suffix}@example.com`,
    password: 'senha@12345',
    role: 'Provider',
  });
  expect(registerRes.statusCode).toBe(201);
  const { accessToken: providerToken } = registerRes.json<{
    accessToken: string;
  }>();

  const profileRes = await post(
    app,
    '/api/v1/providers',
    { name: 'Ana Beauty', description: 'Esteticista', category: 'beleza' },
    providerToken,
  );
  expect(profileRes.statusCode).toBe(201);
  const { id: providerId } = profileRes.json<{ id: string }>();

  const serviceRes = await post(
    app,
    `/api/v1/providers/${providerId}/services`,
    { name: 'Corte', durationInMinutes: 60, priceInCents: 5000 },
    providerToken,
  );
  expect(serviceRes.statusCode).toBe(201);
  const { id: serviceId } = serviceRes.json<{ id: string }>();

  const availRes = await app.inject({
    method: 'PUT',
    url: `/api/v1/providers/${providerId}/availability`,
    payload: {
      weeklySlots: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '18:00', slotIntervalInMinutes: 60 },
      ],
      blockedDates: [],
    },
    ...auth(providerToken),
  });
  expect(availRes.statusCode).toBe(200);

  return { providerToken, providerId, serviceId };
}

/** Registers a client user and returns their access token. */
async function setupClient(app: FastifyInstance, suffix = ''): Promise<string> {
  const res = await post(app, '/api/v1/auth/register', {
    name: `Bruno Client${suffix}`,
    email: `bruno${suffix}@example.com`,
    password: 'senha@12345',
    role: 'Client',
  });
  expect(res.statusCode).toBe(201);
  return res.json<{ accessToken: string }>().accessToken;
}

// ── test suite ───────────────────────────────────────────────────────────────

describe('E2E: booking flow', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query(TRUNCATE_ALL);
  });

  // ── auth ──────────────────────────────────────────────────────────────────

  describe('auth', () => {
    it('registers a new user and returns JWT tokens', async () => {
      const res = await post(app, '/api/v1/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'senha@12345',
        role: 'Client',
      });

      expect(res.statusCode).toBe(201);
      const body = res.json<{ user: { role: string }; accessToken: string; refreshToken: string }>();
      expect(body.user.role).toBe('Client');
      expect(typeof body.accessToken).toBe('string');
      expect(typeof body.refreshToken).toBe('string');
    });

    it('returns 409 when registering a duplicate email', async () => {
      const payload = {
        name: 'Ana',
        email: 'dup@example.com',
        password: 'senha@12345',
        role: 'Client',
      };
      await post(app, '/api/v1/auth/register', payload);
      const res = await post(app, '/api/v1/auth/register', payload);

      expect(res.statusCode).toBe(409);
    });

    it('logs in with valid credentials', async () => {
      await post(app, '/api/v1/auth/register', {
        name: 'Login User',
        email: 'login@example.com',
        password: 'senha@12345',
        role: 'Client',
      });

      const res = await post(app, '/api/v1/auth/login', {
        email: 'login@example.com',
        password: 'senha@12345',
      });

      expect(res.statusCode).toBe(200);
      expect(typeof res.json<{ accessToken: string }>().accessToken).toBe('string');
    });

    it('returns 401 for wrong password', async () => {
      await post(app, '/api/v1/auth/register', {
        name: 'Login User',
        email: 'wrongpw@example.com',
        password: 'senha@12345',
        role: 'Client',
      });

      const res = await post(app, '/api/v1/auth/login', {
        email: 'wrongpw@example.com',
        password: 'wrongpassword',
      });

      expect(res.statusCode).toBe(401);
    });
  });

  // ── happy path ────────────────────────────────────────────────────────────

  describe('happy path: register → book → confirm → complete → review', () => {
    it('runs the full booking lifecycle end-to-end', async () => {
      const { providerToken, providerId, serviceId } = await setupProvider(app);
      const clientToken = await setupClient(app);

      // Book appointment
      const bookRes = await post(
        app,
        '/api/v1/appointments',
        { providerId, serviceId, startsAt: SLOT_10H },
        clientToken,
      );
      expect(bookRes.statusCode).toBe(201);
      const { id: appointmentId, status: bookedStatus } = bookRes.json<{
        id: string;
        status: string;
      }>();
      expect(bookedStatus).toBe('pending');

      // Provider confirms
      const confirmRes = await patch(
        app,
        `/api/v1/appointments/${appointmentId}/confirm`,
        providerToken,
      );
      expect(confirmRes.statusCode).toBe(200);
      expect(confirmRes.json<{ status: string }>().status).toBe('confirmed');

      // Provider completes
      const completeRes = await patch(
        app,
        `/api/v1/appointments/${appointmentId}/complete`,
        providerToken,
      );
      expect(completeRes.statusCode).toBe(200);
      expect(completeRes.json<{ status: string }>().status).toBe('completed');

      // Client submits review
      const reviewRes = await post(
        app,
        `/api/v1/appointments/${appointmentId}/reviews`,
        { rating: 5, comment: 'Excelente serviço!' },
        clientToken,
      );
      expect(reviewRes.statusCode).toBe(201);
      const { review } = reviewRes.json<{ review: { rating: number; comment: string } }>();
      expect(review.rating).toBe(5);
      expect(review.comment).toBe('Excelente serviço!');
    });
  });

  // ── conflict: double-booking ───────────────────────────────────────────────

  describe('conflict: double-booking prevention', () => {
    it('returns 409 when a second client books the same provider slot', async () => {
      const { providerId, serviceId } = await setupProvider(app);
      const clientA = await setupClient(app, '_a');
      const clientB = await setupClient(app, '_b');

      const firstRes = await post(
        app,
        '/api/v1/appointments',
        { providerId, serviceId, startsAt: SLOT_10H },
        clientA,
      );
      expect(firstRes.statusCode).toBe(201);

      // Same slot, different client → must be rejected
      const secondRes = await post(
        app,
        '/api/v1/appointments',
        { providerId, serviceId, startsAt: SLOT_10H },
        clientB,
      );
      expect(secondRes.statusCode).toBe(409);
    });

    it('allows booking a non-overlapping slot for the same provider', async () => {
      const { providerId, serviceId } = await setupProvider(app);
      const clientA = await setupClient(app, '_a');
      const clientB = await setupClient(app, '_b');

      const firstRes = await post(
        app,
        '/api/v1/appointments',
        { providerId, serviceId, startsAt: SLOT_10H },
        clientA,
      );
      expect(firstRes.statusCode).toBe(201);

      // 12:00 does not overlap with the 10:00–11:00 slot
      const secondRes = await post(
        app,
        '/api/v1/appointments',
        { providerId, serviceId, startsAt: SLOT_12H },
        clientB,
      );
      expect(secondRes.statusCode).toBe(201);
    });
  });

  // ── cancellation ──────────────────────────────────────────────────────────

  describe('cancellation', () => {
    it('client can cancel their own pending appointment', async () => {
      const { providerId, serviceId } = await setupProvider(app);
      const clientToken = await setupClient(app);

      const bookRes = await post(
        app,
        '/api/v1/appointments',
        { providerId, serviceId, startsAt: SLOT_10H },
        clientToken,
      );
      const { id: appointmentId } = bookRes.json<{ id: string }>();

      const cancelRes = await patch(
        app,
        `/api/v1/appointments/${appointmentId}/cancel`,
        clientToken,
      );
      expect(cancelRes.statusCode).toBe(200);
      expect(cancelRes.json<{ status: string }>().status).toBe('cancelled');
    });

    it('frees the slot after cancellation so another client can book it', async () => {
      const { providerId, serviceId } = await setupProvider(app);
      const clientA = await setupClient(app, '_a');
      const clientB = await setupClient(app, '_b');

      const bookRes = await post(
        app,
        '/api/v1/appointments',
        { providerId, serviceId, startsAt: SLOT_10H },
        clientA,
      );
      const { id: appointmentId } = bookRes.json<{ id: string }>();

      await patch(app, `/api/v1/appointments/${appointmentId}/cancel`, clientA);

      // The slot must now be available again
      const rebookRes = await post(
        app,
        '/api/v1/appointments',
        { providerId, serviceId, startsAt: SLOT_10H },
        clientB,
      );
      expect(rebookRes.statusCode).toBe(201);
    });

    it('returns 403 when a client tries to cancel another client appointment', async () => {
      const { providerId, serviceId } = await setupProvider(app);
      const clientA = await setupClient(app, '_a');
      const clientB = await setupClient(app, '_b');

      const bookRes = await post(
        app,
        '/api/v1/appointments',
        { providerId, serviceId, startsAt: SLOT_10H },
        clientA,
      );
      const { id: appointmentId } = bookRes.json<{ id: string }>();

      const cancelRes = await patch(
        app,
        `/api/v1/appointments/${appointmentId}/cancel`,
        clientB,
      );
      expect(cancelRes.statusCode).toBe(403);
    });
  });

  // ── provider actions ──────────────────────────────────────────────────────

  describe('provider actions', () => {
    it('provider can reject a pending appointment', async () => {
      const { providerToken, providerId, serviceId } = await setupProvider(app);
      const clientToken = await setupClient(app);

      const bookRes = await post(
        app,
        '/api/v1/appointments',
        { providerId, serviceId, startsAt: SLOT_10H },
        clientToken,
      );
      const { id: appointmentId } = bookRes.json<{ id: string }>();

      const rejectRes = await patch(
        app,
        `/api/v1/appointments/${appointmentId}/reject`,
        providerToken,
      );
      expect(rejectRes.statusCode).toBe(200);
      expect(rejectRes.json<{ status: string }>().status).toBe('cancelled');
    });

    it('returns 409 when completing an already-cancelled appointment', async () => {
      const { providerToken, providerId, serviceId } = await setupProvider(app);
      const clientToken = await setupClient(app);

      const bookRes = await post(
        app,
        '/api/v1/appointments',
        { providerId, serviceId, startsAt: SLOT_10H },
        clientToken,
      );
      const { id: appointmentId } = bookRes.json<{ id: string }>();

      await patch(app, `/api/v1/appointments/${appointmentId}/cancel`, clientToken);

      const completeRes = await patch(
        app,
        `/api/v1/appointments/${appointmentId}/complete`,
        providerToken,
      );
      expect(completeRes.statusCode).toBe(409);
    });
  });

  // ── reviews ───────────────────────────────────────────────────────────────

  describe('reviews', () => {
    it('returns 409 when submitting a second review for the same appointment', async () => {
      const { providerToken, providerId, serviceId } = await setupProvider(app);
      const clientToken = await setupClient(app);

      const bookRes = await post(
        app,
        '/api/v1/appointments',
        { providerId, serviceId, startsAt: SLOT_10H },
        clientToken,
      );
      const { id: appointmentId } = bookRes.json<{ id: string }>();

      await patch(app, `/api/v1/appointments/${appointmentId}/confirm`, providerToken);
      await patch(app, `/api/v1/appointments/${appointmentId}/complete`, providerToken);

      await post(
        app,
        `/api/v1/appointments/${appointmentId}/reviews`,
        { rating: 4 },
        clientToken,
      );

      const secondReview = await post(
        app,
        `/api/v1/appointments/${appointmentId}/reviews`,
        { rating: 3, comment: 'Mudei de ideia' },
        clientToken,
      );
      expect(secondReview.statusCode).toBe(409);
    });
  });

  // ── protected routes ──────────────────────────────────────────────────────

  describe('authentication guard', () => {
    it('returns 401 for requests without a token', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/v1/appointments/me' });
      expect(res.statusCode).toBe(401);
    });

    it('returns 403 when a Client tries to create a provider profile', async () => {
      const clientToken = await setupClient(app);
      const res = await post(
        app,
        '/api/v1/providers',
        { name: 'Hacker', category: 'fake' },
        clientToken,
      );
      expect(res.statusCode).toBe(403);
    });
  });
});
