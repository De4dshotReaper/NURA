import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Nura',
        short_name: 'Nura',
        description: 'A calm way to organize your health journey.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3B82F6',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{html,js,css,woff,woff2,svg,png,jpg,jpeg,webp}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/auth\/v1\//,
          /^\/rest\/v1\//,
          /^\/storage\/v1\//,
          /^\/functions\/v1\//,
        ],
        // Deliberately do not runtime-cache API, auth, Storage, Edge Function,
        // or authenticated medical-data responses. Only build assets are precached.
        runtimeCaching: [],
      },
    }),
  ],
});
