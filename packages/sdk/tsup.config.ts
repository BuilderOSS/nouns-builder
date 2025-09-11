import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/*.ts',
    'src/contract/*.ts',
    'src/subgraph/*.ts',
    'src/eas/*.ts',
    '!src/*.test.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  minify: 'terser',
  external: [
    'viem',
    'wagmi',
    'wagmi/actions',
    'wagmi/codegen',
    'graphql',
    'graphql-request',
    'graphql-tag',
    '@farcaster/hub-nodejs',
    '@sentry/nextjs',
    'axios',
  ],
})
