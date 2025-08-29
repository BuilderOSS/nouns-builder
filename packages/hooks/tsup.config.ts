import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/*.ts', 'src/*.tsx', '!src/*.test.ts', '!src/*.test.tsx'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom'],
})
