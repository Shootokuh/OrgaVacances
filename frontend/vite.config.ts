// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true, // 🔁 surveille manuellement les fichiers
      interval: 100,     // 👀 vérifie toutes les 100ms
    },
  },
})
