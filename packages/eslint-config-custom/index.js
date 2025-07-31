module.exports = {
  extends: ['next', 'turbo', 'prettier', 'plugin:prettier/recommended'],
  plugins: ['@typescript-eslint', 'unused-imports', 'simple-import-sort'],
  parser: '@typescript-eslint/parser',
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/jsx-key': 'off',
    'react/display-name': 'off',
    '@next/next/no-img-element': 'off',
    'react/no-unescaped-entities': 0,
    'unused-imports/no-unused-imports-ts': 2,
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ], // disable unused vars
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'prettier/prettier': ['warn', {}, { usePrettierrc: true }],
    'no-console': [
      'warn',
      {
        allow: ['error', 'warn', 'info'],
      },
    ],
  },
  parserOptions: {
    babelOptions: {
      presets: [require.resolve('next/babel')],
    },
  },
}
