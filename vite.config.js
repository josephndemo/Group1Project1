import { defineConfig } from 'vite'
// 🎯 FIXED: Changed from '@vitejs/react-plugin' to '@vitejs/plugin-react'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})