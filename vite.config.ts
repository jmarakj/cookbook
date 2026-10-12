import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Recepty',
        short_name: 'Recepty',
        lang: 'sk',
        display: 'standalone',
        theme_color: '#2f7d4f',
        background_color: '#ffffff',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // recipe data is small – precache all of it so every recipe opens offline
        // (icons are added by includeAssets / manifest.icons)
        globPatterns: ['**/*.{js,css,html,json}'],
        // images are large – cache only those actually viewed
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/images/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'recipe-images',
              cacheableResponse: { statuses: [200] },
              expiration: { maxEntries: 200 },
            },
          },
        ],
      },
    }),
  ],
  base: '/cookbook/',
})
