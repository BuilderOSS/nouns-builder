import path from 'path'
import { defineConfig } from 'vitest/config'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  plugins: [react(), vanillaExtractPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
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
