import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/*.ts', 'src/*.tsx', '!src/*.test.ts', '!src/*.test.tsx'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: [
    'react',
    'react-dom'
  ],
})