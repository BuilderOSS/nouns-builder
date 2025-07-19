import path from 'path'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      src: path.resolve('src/'),
    },
  },
})
