# @buildeross/eslint-config-custom

Shared ESLint configuration for BuilderOSS projects using Next.js, TypeScript, and modern React patterns.

## Installation

```bash
pnpm install @buildeross/eslint-config-custom eslint --save-dev
```

## Features

- **Next.js Optimized**: Built-in Next.js specific rules and optimizations
- **TypeScript Support**: Full TypeScript linting with type-aware rules
- **Prettier Integration**: Automatic code formatting with Prettier
- **Import Management**: Automatic removal of unused imports
- **Monorepo Support**: Turbo-optimized for monorepo environments
- **Customizable**: Reasonable defaults with room for project-specific overrides

## Usage

### Basic Setup

Create an `.eslintrc.js` file in your project root:

```js
module.exports = {
  extends: ['@buildeross/eslint-config-custom'],
}
```

### With Additional Rules

```js
module.exports = {
  extends: ['@buildeross/eslint-config-custom'],
  rules: {
    // Your custom rules here
    'no-console': 'error',
  },
}
```

### Package.json Scripts

Add linting scripts to your `package.json`:

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix"
  }
}
```

## Configuration Details

### Extended Configurations
- `next` - Next.js specific rules
- `turbo` - Turborepo optimizations
- `prettier` - Prettier integration
- `plugin:prettier/recommended` - Prettier plugin recommendations

### Active Plugins
- `@typescript-eslint` - TypeScript-specific linting
- `unused-imports` - Automatic unused import removal

### Key Rules

#### TypeScript
- `@typescript-eslint/no-unused-vars`: Warns on unused vars (allows underscore prefix)
- Unused imports automatically removed

#### React/Next.js
- `@next/next/no-html-link-for-pages`: Disabled for flexibility
- `react/jsx-key`: Disabled (handled by TypeScript)
- `react/display-name`: Disabled for functional components
- `@next/next/no-img-element`: Disabled (allows regular img tags)
- `react/no-unescaped-entities`: Disabled

#### Code Quality
- `prettier/prettier`: Warns on formatting issues
- `no-console`: Warns on console usage (allows error/warn)

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Dependencies

The configuration includes all necessary ESLint plugins and configurations:

- `@typescript-eslint/eslint-plugin`: TypeScript linting
- `@typescript-eslint/parser`: TypeScript parser
- `eslint-config-next`: Next.js optimizations
- `eslint-config-prettier`: Prettier integration
- `eslint-config-turbo`: Turborepo support
- `eslint-plugin-prettier`: Prettier as ESLint plugin
- `eslint-plugin-react`: React specific rules
- `eslint-plugin-unused-imports`: Import cleanup

## Prettier Integration

This config includes automatic Prettier formatting. Create a `.prettierrc` file to customize formatting:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

## IDE Integration

### VS Code

Install the ESLint extension and add to your `settings.json`:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true
}
```

## Monorepo Usage

This configuration is optimized for monorepo environments with Turborepo. It automatically handles workspace dependencies and cross-package imports.

## Customization

### Disabling Rules

```js
module.exports = {
  extends: ['@buildeross/eslint-config-custom'],
  rules: {
    'no-console': 'off',
    'prettier/prettier': 'off',
  },
}
```

### Adding Environment-Specific Rules

```js
module.exports = {
  extends: ['@buildeross/eslint-config-custom'],
  env: {
    jest: true, // Enable Jest globals
  },
  overrides: [
    {
      files: ['*.test.{js,ts,tsx}'],
      rules: {
        'no-console': 'off', // Allow console in tests
      },
    },
  ],
}
```

## License

MIT License - see LICENSE file for details.
