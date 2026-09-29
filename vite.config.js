import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: '/movie-search-app/',
  server: {
    host: '127.0.0.1',
    port: 5280,
    strictPort: true,
  },
  preview: {
    port: 4280,
    strictPort: true,
  },
})
