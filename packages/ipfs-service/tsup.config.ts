import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/*.ts', '!src/**/*.test.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['@buildeross/constants'],
})
