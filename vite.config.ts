import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' makes every asset path relative, so the built site works
// on GitHub Pages at https://<user>.github.io/<any-repo-name>/ with no edits.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 900 },
})
