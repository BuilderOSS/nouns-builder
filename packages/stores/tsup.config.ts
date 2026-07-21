import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: [
    '@buildeross/constants',
    '@buildeross/types',
    'react',
    'react/jsx-runtime',
    'use-sync-external-store',
    'use-sync-external-store/*',
    'wagmi',
    'zustand',
    'zustand/*',
  ],
})
