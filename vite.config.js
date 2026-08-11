import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

function serveThemeBoot() {
  const bootPath = resolve(__dirname, 'src/popup/theme-boot.js');
  return {
    name: 'serve-theme-boot',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url !== '/theme-boot.js') return next();
        res.setHeader('Content-Type', 'application/javascript');
        res.end(readFileSync(bootPath, 'utf8'));
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const browser = process.env.BROWSER || 'chrome';
  const outDir = `dist-${browser}`;
  
  return {
    plugins: [react(), serveThemeBoot()],
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
