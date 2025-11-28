import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: 'localhost',
        port: 5173,
        strictPort: true,
        proxy: {
            // Forward any /api requests from Vite dev server to the Express backend
            '/api': {
                target: 'http://localhost:5050',
                changeOrigin: true,
            },
        },
    },
})
