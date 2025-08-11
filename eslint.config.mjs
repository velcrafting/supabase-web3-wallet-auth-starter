// eslint.config.mjs — flat config for JS/TS + React with pragmatic overrides
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      // Pragmatic defaults to pass CI while you iterate
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Service worker globals
  {
    files: ['public/serviceworker.js'],
    languageOptions: {
      globals: {
        self: 'readonly',
        caches: 'readonly',
        fetch: 'readonly',
      },
    },
    rules: {
      'no-undef': 'off',
    },
  },

  // Config files often use require()
  {
    files: ['**/tailwind.config.{js,ts}', '**/postcss.config.{js,ts}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // Ignore build output
  {
    ignores: ['.next/', 'node_modules/', 'dist/', 'coverage/'],
  },
];
