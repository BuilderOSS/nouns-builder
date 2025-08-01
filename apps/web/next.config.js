const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin')
const { withSentryConfig } = require('@sentry/nextjs')
const createBundleAnalyzerPlugin = require('@next/bundle-analyzer')

const {
  NEXT_PUBLIC_SENTRY_DSN,
  SENTRY_ORG,
  SENTRY_PROJECT,
  VERCEL_ENV = 'development',
  VERCEL_URL,
  VERCEL_PROJECT_PRODUCTION_URL,
} = process.env

const protocol = VERCEL_ENV === 'development' ? 'http' : 'https'
const url = VERCEL_URL ?? 'localhost:3000'
const productionUrl = VERCEL_PROJECT_PRODUCTION_URL ?? url

const baseUrl =
  VERCEL_ENV === 'production' ? `${protocol}://${productionUrl}` : `${protocol}://${url}`

/** @type {import('next').NextConfig} */
const basicConfig = {
  reactStrictMode: true,
  transpilePackages: [
    'ipfs-service',
    'analytics',
    'blocklist',
    '@smartinvoicexyz/types',
    '@rainbow-me/rainbowkit',
    '@farcaster/frame-sdk',
    '@farcaster/frame-wagmi-connector',
  ],
  experimental: {
    optimizePackageImports: ['@rainbow-me/rainbowkit', '@buildeross/zord'],
  },
  env: {
    BASE_URL: baseUrl,
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nouns-builder.mypinata.cloud',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
      {
        protocol: 'https',
        hostname: 'dweb.link',
      },
      {
        protocol: 'https',
        hostname: 'w3s.link',
      },
      {
        protocol: 'https',
        hostname: 'flk-ipfs.xyz',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.decentralized-content.com',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
      {
        protocol: 'https',
        hostname: 'nouns.build',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/why',
        destination: '/about',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/.well-known/farcaster.json',
        destination: '/api/farcaster',
      },
      {
        source: '/.well-known/walletconnect.txt',
        destination: '/api/walletconnect',
      },
    ]
  },
  webpack(config, { dev }) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })

    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    })

    //Tree-shake barrel files: https://github.com/vercel/next.js/issues/12557
    config.module.rules.push({
      test: [
        /src\/data\/contract\/abis\/index.ts/i,
        /(src\/components).*\index.ts$/,
        /(src\/modules).*\index.ts$/,
      ],
      sideEffects: false,
    })

    config.resolve.fallback = { fs: false, net: false, tls: false }

    return {
      ...config,
      // Hot-fix for $RefreshReg issues: https://github.com/vanilla-extract-css/vanilla-extract/issues/679#issuecomment-1402839249
      mode: dev ? 'production' : config.mode,
    }
  },
}

/** @type {import('@sentry/nextjs').SentryWebpackPluginOptions} */
const sentryWebpackPluginOptions = {
  silent: true, // Suppresses all logs
  dryRun: process.env.VERCEL_ENV !== 'production',
  include: '.next',
  ignore: ['node_modules'],
  urlPrefix: '~/_next',
}

const sentryEnabled = NEXT_PUBLIC_SENTRY_DSN && SENTRY_ORG && SENTRY_PROJECT

const withVanillaExtract = createVanillaExtractPlugin()
const withVanillaExtractConfig = withVanillaExtract(basicConfig)

const withBundleAnalyzer = createBundleAnalyzerPlugin({
  enabled: process.env.ANALYZE === 'true',
})
const withBundleAnalyzerConfig = withBundleAnalyzer(withVanillaExtractConfig)

const config = sentryEnabled
  ? withSentryConfig(withBundleAnalyzerConfig, sentryWebpackPluginOptions)
  : withBundleAnalyzerConfig

module.exports = config
