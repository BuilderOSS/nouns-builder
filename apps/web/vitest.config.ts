import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import react from '@vitejs/plugin-react'
import path from 'path'
import svgr from 'vite-plugin-svgr'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  plugins: [
    react(),
    vanillaExtractPlugin(),
    svgr({
      svgrOptions: {
        exportType: 'default',
      },
    }),
  ],
  assetsInclude: ['**/*.md'],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    include:
      process.env.FORK_TESTS === 'only'
        ? ['**/*.fork.test.{ts,tsx}']
        : ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}', '**/*.fork.test.{ts,tsx}'],
    deps: {
      // https://github.com/vanilla-extract-css/vanilla-extract/issues/666#issuecomment-1112736262
      fallbackCJS: true,
    },
  },
  resolve: {
    alias: {
      src: path.resolve('src/'),
    },
  },
})
