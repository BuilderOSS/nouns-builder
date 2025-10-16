import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin'
import type { NextConfig } from 'next'

const withVanillaExtract = createVanillaExtractPlugin()

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@buildeross/constants',
    '@buildeross/hooks',
    '@buildeross/ipfs-service',
    '@buildeross/sdk',
    '@buildeross/types',
    '@buildeross/utils',
    '@buildeross/zord',
    '@buildeross/ui',
    '@buildeross/stores',
    '@buildeross/auction-ui',
    '@buildeross/proposal-ui',
    '@buildeross/dao-ui',
    '@buildeross/create-proposal-ui',
    '@rainbow-me/rainbowkit',
  ],
  experimental: {
    optimizePackageImports: [
      '@rainbow-me/rainbowkit',
      '@buildeross/zord',
      '@buildeross/hooks',
      '@buildeross/ui',
      '@buildeross/sdk',
    ],
  },
}

export default withVanillaExtract(nextConfig)
