import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin'
import { defineConfig } from 'tsup'
import svgr from 'esbuild-plugin-svgr'

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  platform: 'browser',
  external: ['react', 'react-dom'],
  esbuildPlugins: [
    svgr({
      dimensions: false,
    }),
    vanillaExtractPlugin({
      identifiers: 'short',
    }),
  ],
  // Use tsc to generate types and declaration maps in dev
  // so we can jump to source files instead of declarations
  dts: !options.watch,
  clean: true,
  onSuccess: options.watch ? 'pnpm run dev:types' : undefined,
}))
