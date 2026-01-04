import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Milano Kafe',
    short_name: 'Milano Kafe',
    description: 'Milano Kafe - Zominning eng yaxshi restoran va kafesi. Premium kofe va taomlalar.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#ffffff',
    theme_color: '#22c55e',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-light-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    screenshots: [
      {
        src: '/milano.jpg',
        sizes: '540x720',
        type: 'image/jpeg',
        form_factor: 'narrow',
      },
      {
        src: '/milano.jpg',
        sizes: '1280x720',
        type: 'image/jpeg',
        form_factor: 'wide',
      },
    ],
    categories: ['food', 'restaurant'],
  }
}
