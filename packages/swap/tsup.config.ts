import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'viem',
    '@buildeross/constants',
    '@buildeross/sdk',
    '@buildeross/utils',
    '@buildeross/types',
  ],
})
