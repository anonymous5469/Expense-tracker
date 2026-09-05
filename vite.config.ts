import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const pagesBase = process.env.VITE_BASE

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages supplies a project path unless a custom domain is active.
  base: pagesBase ? `${pagesBase.replace(/\/$/, "")}/` : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/victory-vendor/")) return "chart-vendor"
          if (id.includes("/node_modules/recharts/")) return "charts"
          if (id.includes("/node_modules/@google/generative-ai/")) return "gemini"
        },
      },
    },
  },
})
