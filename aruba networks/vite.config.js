import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/My_Portfolio/login-app/',
  build: {
    outDir: '../login-app',
    emptyOutDir: true,
  },
  server: {
    port: 5174,
    strictPort: true,
    open: false,
  },
})
