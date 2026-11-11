import { defineConfig } from 'vite';

export default defineConfig({
  base: '/zombie-sandbox/',
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
});
