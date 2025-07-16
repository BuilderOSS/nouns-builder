import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin'
import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  platform: 'browser',
  external: ['react'],
  esbuildPlugins: [
    vanillaExtractPlugin({
      identifiers: 'short',
    }),
  ],
  // Use tsc to generate types and declaration maps in dev
  // so we can jump to source files instead of declarations
  dts: !options.watch,
  onSuccess: options.watch ? 'pnpm run dev:types' : undefined,
}))
