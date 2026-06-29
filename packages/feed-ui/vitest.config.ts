import path from 'path'
import { defineConfig } from 'vitest/config'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: '.',
  plugins: [react(), vanillaExtractPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
  },
  server: {
    deps: {
      fallbackCJS: true,
    },
  },
  resolve: {
    alias: {
      src: path.resolve('src/'),
    },
  },
})
