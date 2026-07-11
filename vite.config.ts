import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Em produção o app é servido em https://<user>.github.io/peptrack/
// Em desenvolvimento (npm run dev) fica na raiz.
export default defineConfig(({ command }) => {
  const base = command === 'build' ? '/peptrack/' : '/'
  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
        manifest: {
          name: 'PepTrack',
          short_name: 'PepTrack',
          description:
            'Rastreamento pessoal de protocolo de peptídeos. Apenas para referência educacional.',
          lang: 'pt-BR',
          theme_color: '#05080F',
          background_color: '#05080F',
          display: 'standalone',
          orientation: 'portrait',
          start_url: base,
          scope: base,
          icons: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          navigateFallback: `${base}index.html`,
          cleanupOutdatedCaches: true
        },
        devOptions: {
          enabled: false
        }
      })
    ]
  }
})
