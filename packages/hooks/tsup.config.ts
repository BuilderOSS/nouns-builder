import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/*.ts', 'src/*.tsx', '!src/*.test.ts', '!src/*.test.tsx'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: [
    '@buildeross/constants',
    '@buildeross/ipfs-service',
    '@buildeross/sdk',
    '@buildeross/types',
    '@buildeross/utils',
    'react',
    'react-dom',
  ],
})
