import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // GitHub Pages serves from /<repo>/; the deploy workflow sets VITE_BASE.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  // host: true exposes the dev server on your LAN so you can open it on a phone.
  server: { host: true },
  preview: { host: true },
  test: { environment: 'node' },
})
