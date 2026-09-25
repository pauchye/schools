import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = import.meta.dirname

// Source lives in src/ (index.html, app.tsx, frontend/) so Vite's html-as-
// entry model has a real, separate outDir to write into -- pointing outDir
// at the same directory as the source index.html silently overwrites that
// source file with the build's own output on every build. Output still
// lands at the repo root (outDir: '..' from src/) to keep the existing
// "static files committed at repo root, served directly by GitHub Pages"
// deployment model: no CI, rebuild locally and commit like bundle.js
// always has been. Fixed filenames (bundle.js/bundle.css) instead of
// Vite's default hashed names keep each rebuild's diff small.
export default defineConfig({
  root: 'src',
  publicDir: path.resolve(__dirname, 'public'),
  plugins: [react()],
  // Served from a GitHub Pages project page (pauchye.github.io/schools/),
  // not domain root -- root-absolute references (the favicon/manifest
  // links in src/index.html, which live in public/ and are deliberately
  // left unprocessed by Vite's asset pipeline) need this to resolve.
  base: '/schools/',
  build: {
    outDir: path.resolve(__dirname, '.'),
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'bundle.js',
        chunkFileNames: 'bundle.[name].js',
        assetFileNames: (assetInfo) => (
          assetInfo.names?.[0]?.endsWith('.css') ? 'bundle.css' : 'assets/[name][extname]'
        ),
      },
    },
  },
})
