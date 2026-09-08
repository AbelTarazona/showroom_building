import { defineConfig, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// vitest trae su propio vite 5 en tipos; declaramos `test` sin depender de 'vitest/config' (choque vite 5 vs 6)
const config: UserConfig & { test: { environment: 'node' } } = {
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
  test: { environment: 'node' },
}

export default defineConfig(config)
