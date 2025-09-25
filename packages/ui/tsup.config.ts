import { defineConfig } from 'tsup'
import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin'

export default defineConfig({
  entry: ['src/index.ts', 'src/styles.ts', 'src/*/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
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
