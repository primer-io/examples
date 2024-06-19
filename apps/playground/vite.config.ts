import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    sourcemap: true, // Source map generation must be turned on
  },
  preview: {
    port: 5000,
  },
  server: {
    port: 5000,
  }
})
