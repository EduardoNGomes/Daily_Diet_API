import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    threads: true,
    isolate: true,
    include: ['./test/**/*.spec.ts'],
  },
})
