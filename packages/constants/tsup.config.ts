import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/*.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['wagmi', 'wagmi/chains'],
})

