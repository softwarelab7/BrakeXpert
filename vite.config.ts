import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/BrakeXAlfa/' : '/',
  plugins: [
    react(),
    // PWA temporarily disabled to fix caching issues on GitHub Pages
  ],
}))
