import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // Stesso alias di tsconfig.json: i moduli sotto test importano con '@/'.
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
})
