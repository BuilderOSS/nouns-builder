const path = require('path')

module.exports = {
  extends: ['@buildeross/eslint-config-custom', 'next'],
  rules: {
    // Absolute so the rule works whether eslint runs from apps/web or the repo root
    '@next/next/no-html-link-for-pages': ['error', path.join(__dirname, 'src/pages')],
    'react/no-unescaped-entities': 'off',
  },
}
