import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AWARI - Property Marketplace',
    short_name: 'AWARI',
    description: 'Find and book verified properties across Nigeria. Rentals, shortlets, hotels, and sales.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#10b981',
    icons: [
      {
        src: '/assets/images/favicon.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/assets/images/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/assets/images/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['business', 'lifestyle', 'travel'],
    orientation: 'portrait-primary',
  };
}
