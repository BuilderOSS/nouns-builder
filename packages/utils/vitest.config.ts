import path from 'path'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  test: {
    globals: true,
    include: process.env.FORK_TESTS === 'only'
      ? ['**/*.fork.test.{ts,tsx}']
      : ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}', '**/*.fork.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      src: path.resolve('src/'),
    },
  },
})
