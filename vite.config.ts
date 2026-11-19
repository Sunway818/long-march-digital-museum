import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { historyMediaPlugin } from './scripts/historyMediaPlugin.ts'

export default defineConfig({
  plugins: [react(), tailwindcss(), historyMediaPlugin()],
  build: { target: ['chrome120', 'edge120'] },
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
})
