import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/*.ts', 'src/wagmi/*.ts', 'src/yup/*.ts', '!src/*.test.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [
    'viem', 
    'wagmi', 
    'wagmi/chains', 
    'yup', 
    'lodash',
    'tinycolor2',
    '@farcaster/frame-wagmi-connector',
    '@rainbow-me/rainbowkit',
    '@rainbow-me/rainbowkit/wallets'
  ],
})