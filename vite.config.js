import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        id: '/',
        name: 'JetaFlow Calculadora',
        short_name: 'JetaFlow',
        description: 'Calculadora de custos e orçamentos da JETAPRINT Gráfica Multimídia',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#EDF1F6',
        theme_color: '#17355B',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Licitações/CNPJ precisam sempre do dado mais novo — nunca servir do cache
            urlPattern: /^\/api\//,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          }
        ]
      }
    })
  ],
  build: {
    // recharts (Dashboard, via React.lazy) e html2pdf.js (import dinâmico ao exportar
    // a proposta) ficam em chunks assíncronos próprios — sem manualChunks. O limite
    // acomoda o chunk do html2pdf (~980 KB), que só baixa ao gerar o PDF.
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
