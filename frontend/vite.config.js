import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  plugins: [sveltekit()],

  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Change this to your backend port
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  },

  resolve: {
    alias: {
      $components: path.resolve('./src/lib/components'),
      $utils: path.resolve('./src/lib/utils'),
      $stores: path.resolve('./src/lib/stores'),
      $server: path.resolve('./src/lib/server'),
      $types: path.resolve('./src/lib/types')
    }
  },

  optimizeDeps: {
    exclude: ['@sveltejs/kit']
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js']
  }
});