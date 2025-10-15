import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2020',
  external: [
    '@buildeross/stores',
    '@buildeross/types',
    'react',
    'react-dom',
    'viem',
    'wagmi',
  ],
})
