import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/*.ts', '!src/**/*.test.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: [
    '@buildeross/constants',
    '@buildeross/ipfs-service',
    '@buildeross/swap',
    '@buildeross/sdk',
    '@buildeross/types',
    '@buildeross/utils',
    'react',
    'react-dom',
    'swr',
    'viem',
    'wagmi',
  ],
})
