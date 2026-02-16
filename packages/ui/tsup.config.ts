import { defineConfig } from 'tsup'
import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin'

export default defineConfig({
  entry: ['src/index.ts', 'src/styles.ts', 'src/*/index.ts'],
  format: ['cjs', 'esm'],
  dts: false,
  clean: true,
  platform: 'browser',
  target: 'es2020',
  esbuildPlugins: [
    vanillaExtractPlugin({
      identifiers: 'short',
    }),
  ],
  external: [
    '@buildeross/constants',
    '@buildeross/hooks',
    '@buildeross/ipfs-service',
    '@buildeross/sdk',
    '@buildeross/swap',
    '@buildeross/types',
    '@buildeross/utils',
    '@buildeross/zord',
    'flatpickr',
    'formik',
    'framer-motion',
    'react',
    'react-dom',
    'react-mde',
    'viem',
    'wagmi',
  ],
})
