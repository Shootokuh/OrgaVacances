import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
  host: '127.0.0.1', // force Vite à écouter sur IPv4 local
  port: 5173,
  },
})
