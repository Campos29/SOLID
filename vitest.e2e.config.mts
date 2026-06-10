import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@application': resolve(import.meta.dirname, 'src/application'),
      '@domain': resolve(import.meta.dirname, 'src/domain'),
      '@infrastructure': resolve(import.meta.dirname, 'src/infrastructure'),
      '@interfaces': resolve(import.meta.dirname, 'src/interfaces'),
    },
  },
  test: {
    include: ['tests/e2e/**/*.test.ts'],
    globalSetup: ['./tests/e2e/globalSetup.ts'],
    testTimeout: 30_000,
    env: {
      NODE_ENV: 'test',
      PORT: '3001',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USER: 'postgres',
      DB_PASSWORD: 'postgres',
      DB_NAME: 'slotwise_test',
      JWT_SECRET: 'test-secret-for-e2e-tests-minimum-32-chars!',
      JWT_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
    },
  },
});
