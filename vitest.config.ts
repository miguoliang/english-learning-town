import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['packages/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        '**/build/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@english-learning-town/types': resolve(__dirname, 'packages/types/src'),
      '@english-learning-town/core': resolve(__dirname, 'packages/core/src'),
      '@english-learning-town/logger': resolve(
        __dirname,
        'packages/logger/src'
      ),
      '@english-learning-town/store': resolve(__dirname, 'packages/store/src'),
      '@english-learning-town/speech': resolve(
        __dirname,
        'packages/speech/src'
      ),
    },
  },
});
