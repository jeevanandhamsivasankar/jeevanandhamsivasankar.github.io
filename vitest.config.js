import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['tests/setup.js'],
      include: [
        'tests/unit/**/*.test.{js,jsx}',
        'tests/integration/**/*.test.{js,jsx}',
      ],
      restoreMocks: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'json-summary'],
        reportsDirectory: 'coverage',
        include: ['src/**'],
        exclude: ['src/main.jsx'],
        thresholds: {
          lines: 80,
          'src/models/**': { lines: 90 },
          'src/lib/**': { lines: 90 },
          'src/hooks/**': { lines: 90 },
        },
      },
    },
  }),
)
