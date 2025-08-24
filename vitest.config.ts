import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
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
        '**/build/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@english-learning-town/types': resolve(__dirname, 'packages/types/src'),
      '@english-learning-town/game-engine': resolve(__dirname, 'packages/game-engine/src'),
      '@english-learning-town/speech': resolve(__dirname, 'packages/speech/src'),
      '@english-learning-town/ui-components': resolve(__dirname, 'packages/ui-components/src'),
      '@english-learning-town/content': resolve(__dirname, 'packages/content/src')
    }
  }
});