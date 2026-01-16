import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': {
        target: 'http://192.168.1.200:5000' || 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
