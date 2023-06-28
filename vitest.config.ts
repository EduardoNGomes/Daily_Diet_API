import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    threads: false,
    isolate: true,
    include: ['./test/**/*.spec.ts'],
    sequence: {
      hooks: 'list',
      setupFiles: 'list',
      shuffle: true,
    },
  },
})
