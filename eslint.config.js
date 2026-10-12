import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'playwright-report', 'test-results', 'blob-report', '.claude']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  // ThemeContext exports the provider component plus the consumer hook (SUDS 6.7)
  {
    files: ['src/context/ThemeContext.jsx'],
    rules: {
      'react-refresh/only-export-components': ['error', { allowConstantExport: true, allowExportNames: ['useThemeContext'] }],
    },
  },
  // Node-side config files
  {
    files: ['*.config.js'],
    languageOptions: { globals: globals.node },
  },
  // Vitest unit/integration tests and shared test utilities
  {
    files: ['tests/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.vitest },
    },
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // Playwright qualification tests run in Node; `use` is the fixture callback,
  // not React's use() hook.
  {
    files: ['tests/qualification/**/*.js'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
])
