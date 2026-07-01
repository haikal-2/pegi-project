import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Otomatis update kalau ada versi web baru
      includeAssets: ['favicon.ico', 'apple.png', '192.png'], // Masukin aset yang mau di-cache
      manifest: {
        name: 'Pegi.id',
        short_name: 'Pegi',
        description: 'Aplikasi booking andalan',
        theme_color: '#7b3fe4', // Warna tema header di HP (sesuain sama warna utama web lu)
        icons: [
          {
            src: '192.png?v=2',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '512.png?v=2',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});