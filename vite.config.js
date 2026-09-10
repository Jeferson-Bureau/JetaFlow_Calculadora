import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // recharts (Dashboard) e html2pdf.js (gerador de proposta) já ficam em chunks
    // assíncronos próprios via React.lazy — não precisam de manualChunks.
    chunkSizeWarningLimit: 1100
  },
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
      },
      '/api/cnpjws': {
        target: 'https://publica.cnpj.ws',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cnpjws/, ''),
        secure: true
      },
      '/api/brasilapi': {
        target: 'https://brasilapi.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/brasilapi/, ''),
        secure: true
      }
    }
  }
});
