import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * Boots the Fastify app in isolation and dumps the OpenAPI document produced
 * by @fastify/swagger from the Zod route schemas into `openapi.json`.
 *
 * No database connection is opened: the `pg` pool is lazy and we only call
 * `app.ready()` to let the plugins register the routes. Placeholder secrets and
 * database vars are injected so `config/env` and the pool config validation pass
 * without a real `.env` — none of them are ever used to connect.
 */
async function generateOpenApiSpec(): Promise<void> {
  process.env.JWT_SECRET ??= 'openapi-spec-generation-placeholder-secret-key';
  process.env.DB_HOST ??= 'localhost';
  process.env.DB_NAME ??= 'slotwise';
  process.env.DB_USER ??= 'postgres';
  process.env.DB_PASSWORD ??= 'postgres';

  // Imported dynamically so the env defaults above are set before `config/env` runs.
  const { buildApp } = await import('../src/app');

  const app = buildApp();
  await app.ready();

  const spec = app.swagger();
  const outPath = resolve(process.cwd(), 'openapi.json');
  await writeFile(outPath, `${JSON.stringify(spec, null, 2)}\n`, 'utf8');

  await app.close();

  console.log(`[openapi] spec written to ${outPath}`);
}

generateOpenApiSpec().catch((err) => {
  console.error('[openapi] failed:', err);
  process.exit(1);
});
