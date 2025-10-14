import { defineConfig } from 'tsup'
import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  platform: 'browser',
  target: 'es2020',
  esbuildPlugins: [
    vanillaExtractPlugin({
      identifiers: 'short',
    }),
  ],
  external: [
    '@buildeross/ipfs-service',
    '@buildeross/constants',
    '@buildeross/hooks',
    '@buildeross/sdk',
    '@buildeross/stores',
    '@buildeross/types',
    '@buildeross/ui',
    '@buildeross/utils',
    '@buildeross/zord',
    'framer-motion',
    'react',
    'react-dom',
    'swr',
    'viem',
    'wagmi',
  ],
})
