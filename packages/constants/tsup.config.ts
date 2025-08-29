import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/*.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['wagmi', 'wagmi/chains'],
})
