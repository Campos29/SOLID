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
});
