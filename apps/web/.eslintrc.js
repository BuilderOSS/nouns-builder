module.exports = {
  extends: ['@buildeross/eslint-config-custom', 'next'],
  rules: {
    '@next/next/no-html-link-for-pages': ['error', 'src/pages'],
    'react/no-unescaped-entities': 'off',
  },
}
