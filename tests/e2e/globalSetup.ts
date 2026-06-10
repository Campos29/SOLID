import { Pool } from 'pg';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const TEST_DB = 'slotwise_test';

// globalSetup runs in the main vitest process (not workers), so env vars from
// vitest.e2e.config.mts `env` section are NOT available here. We read from the
// shell environment with the same defaults used in the config.
const adminConfig = {
  host: process.env['DB_HOST'] ?? 'localhost',
  port: Number(process.env['DB_PORT'] ?? 5432),
  user: process.env['DB_USER'] ?? 'postgres',
  password: process.env['DB_PASSWORD'] ?? 'postgres',
  database: 'postgres',
};

export async function setup(): Promise<void> {
  const admin = new Pool(adminConfig);

  // Terminate leftover connections from a previous failed run
  await admin.query(
    `SELECT pg_terminate_backend(pid)
     FROM pg_stat_activity
     WHERE datname = $1 AND pid <> pg_backend_pid()`,
    [TEST_DB],
  );

  await admin.query(`DROP DATABASE IF EXISTS "${TEST_DB}"`);
  await admin.query(`CREATE DATABASE "${TEST_DB}"`);
  await admin.end();

  const testDb = new Pool({ ...adminConfig, database: TEST_DB });

  const migrationsDir = join(process.cwd(), 'migrations');
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    await testDb.query(sql);
  }

  await testDb.end();
  console.log(`\n[e2e] "${TEST_DB}" ready — ${files.length} migrations applied`);
}

export async function teardown(): Promise<void> {
  const admin = new Pool(adminConfig);

  await admin.query(
    `SELECT pg_terminate_backend(pid)
     FROM pg_stat_activity
     WHERE datname = $1 AND pid <> pg_backend_pid()`,
    [TEST_DB],
  );

  await admin.query(`DROP DATABASE IF EXISTS "${TEST_DB}"`);
  await admin.end();
  console.log(`[e2e] "${TEST_DB}" dropped`);
}
