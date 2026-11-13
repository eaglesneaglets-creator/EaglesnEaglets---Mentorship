import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'node_modules',
    'coverage',
    '.pytest_cache',
    '.cache',
    '.vite',
    '.next',
    'build',
    '*.min.js',
  ]),
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
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^[A-Z_]',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['vite.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // One toast API. A toast from a library with no mounted <Toaster/> is
    // silently dropped — ~120 react-hot-toast messages were never shown.
    files: ['src/**/*.{js,jsx}'],
    ignores: ['src/shared/components/ui/toast-utils.js', 'src/shared/components/ui/Toast.jsx', 'src/components/ui/sonner.jsx'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [
          { name: 'react-hot-toast', message: "Use { toast } from '@shared/components/ui/toast-utils'." },
          { name: 'sonner', message: "Use { toast } from '@shared/components/ui/toast-utils'." },
        ],
      }],
    },
  },
  {
    // shadcn/ui components are vendored source (added with `npx shadcn add`).
    // They export their variant helpers (buttonVariants, badgeVariants…)
    // beside the component by design; keep them close to upstream.
    files: ['src/components/ui/**/*.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Tests run under vitest/node, so they may reach for node globals
    // (`process.cwd()` in the Avatar sweep guard) and node: builtins.
    files: ['**/*.test.{js,jsx}', 'src/test/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
])
