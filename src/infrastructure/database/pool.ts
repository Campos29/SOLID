import { Pool, PoolConfig } from 'pg';

function buildPoolConfig(): PoolConfig {
  const host = process.env['DB_HOST'];
  const port = process.env['DB_PORT'];
  const database = process.env['DB_NAME'];
  const user = process.env['DB_USER'];
  const password = process.env['DB_PASSWORD'];

  if (!host || !database || !user || !password) {
    throw new Error(
      'Missing required database env vars: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD',
    );
  }

  return {
    host,
    port: port !== undefined ? parseInt(port, 10) : 5432,
    database,
    user,
    password,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  };
}

export const pool = new Pool(buildPoolConfig());


pool.on('error', (err: Error) => {
  console.error('[database] unexpected idle client error:', err.message);
  process.exit(1);
});

export async function connectDatabase(): Promise<void> {
  const client = await pool.connect();
  client.release();
}
