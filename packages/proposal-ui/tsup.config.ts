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
    '@ethereum-attestation-service/eas-sdk',
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
    'formik',
    'react',
    'react-dom',
    'swr',
    'yup',
    'viem',
    'wagmi',
  ],
})
