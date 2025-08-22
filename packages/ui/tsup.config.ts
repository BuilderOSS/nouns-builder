import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/styles.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  jsx: 'react-jsx',
  external: [
    'react',
    'react-dom',
    'viem',
    'wagmi',
    'swr',
    'formik',
    'framer-motion',
    'react-portal',
    '@vanilla-extract/css',
    '@vanilla-extract/recipes'
  ],
})