import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup/setup.ts'],
    css: true,
    // The generated Dataverse services import @microsoft/power-apps/data, whose
    // dist uses extensionless ESM re-exports (e.g. './multiSelectPicklistUtils').
    // Inline the package so Vite resolves those specifiers instead of Node's
    // strict ESM loader, which errors with "Cannot find module".
    server: {
      deps: {
        inline: [/@microsoft\/power-apps/],
      },
    },
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/generated/**', 'src/mockData/**', 'src/**/*.test.*'],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  },
});
