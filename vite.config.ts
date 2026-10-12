import react from '@vitejs/plugin-react'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Minifies the JSON copied from public/ into the build output; the sources stay
// pretty-printed for editing.
function minifyJson(): Plugin {
  return {
    name: 'minify-json',
    apply: 'build',
    writeBundle({ dir }) {
      if (!dir) return
      for (const file of readdirSync(dir, { recursive: true, encoding: 'utf8' })) {
        if (!file.endsWith('.json')) continue
        const path = join(dir, file)
        writeFileSync(path, JSON.stringify(JSON.parse(readFileSync(path, 'utf8'))))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    minifyJson(),
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
        // precache only the app shell, so the app itself starts offline
        // (icons are added by includeAssets / manifest.icons)
        globPatterns: ['**/*.{js,css,html}'],
        // data and images are cached only once actually loaded
        runtimeCaching: [
          {
            // index, enums and recipes – served from cache, refreshed in the
            // background so edited recipes show up on the next visit
            urlPattern: ({ url }) => url.pathname.endsWith('.json'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'recipe-data',
              cacheableResponse: { statuses: [200] },
            },
          },
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
