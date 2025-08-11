// eslint.config.mjs
import js from '@eslint/js';
import next from 'eslint-config-next';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,        // base JS rules
  ...next,                        // Next.js rules (flat-compatible)
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    ignores: ['.next/', 'node_modules/', 'dist/', 'coverage/'],
  },
];
