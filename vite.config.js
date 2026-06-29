import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const browser = process.env.BROWSER || 'chrome';
  const outDir = `dist-${browser}`;
  
  return {
    plugins: [react()],
    build: {
      outDir: outDir,
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'index.html'),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]'
        }
      }
    },
    define: {
      'process.env.BROWSER': JSON.stringify(browser)
    },
    // Ensure popup assets go to the right place
    publicDir: false // Don't copy public dir automatically
  }
})