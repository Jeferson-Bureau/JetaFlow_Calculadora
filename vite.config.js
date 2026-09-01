import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/pncp': {
        target: 'https://pncp.gov.br/api/consulta',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pncp/, ''),
        secure: true
      },
      '/api/compras': {
        target: 'https://dadosabertos.compras.gov.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/compras/, ''),
        secure: true
      }
    }
  }
});
