const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      'out/**',
      '**/out/**',
      'out/*',
      '**/.next/**',
      '**/__tests__/**',
      'tests-e2e/**',
      'src/**',
      'generate-comprehensive-tests.cjs',
      'generate-tests.js',
      'test-runner.js',
      'validate-testing-framework.js',
    ],
  },
  {
    files: ['**/*.js', '**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off', // Also common to disable for CJS
    },
  },
];
