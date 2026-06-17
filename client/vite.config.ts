import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/zrender/')) {
            return 'zrender';
          }
          if (id.includes('/echarts/')) {
            const match = id.match(/\/echarts\/(?:lib|dist|src|packages)\/([^/]+)/);
            if (match && match[1] !== 'echarts.js') {
              return `echarts-${match[1]}`;
            }
            return 'echarts-core';
          }
          if (id.includes('/echarts-for-react/')) {
            return 'echarts-for-react';
          }
          if (id.includes('/react/') || id.includes('/react-dom/')) {
            return 'react-vendor';
          }
          if (id.includes('/@emotion/')) {
            return 'emotion';
          }
        }
      }
    }
  }
})
