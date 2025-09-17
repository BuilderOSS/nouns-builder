import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/*.ts', 'src/wagmi/*.ts', 'src/yup/*.ts', '!src/*.test.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: [
    '@buildeross/constants',
    '@buildeross/ipfs-service',
    '@buildeross/types',
    'viem',
    'wagmi',
    'wagmi/chains',
    'yup',
    'lodash',
    'tinycolor2',
    '@farcaster/frame-wagmi-connector',
    '@rainbow-me/rainbowkit',
    '@rainbow-me/rainbowkit/wallets',
  ],
})
