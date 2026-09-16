export const dynamic = 'force-static';

export default function manifest() {
  return {
    name: 'Astro Market Analytics',
    short_name: 'AstroMarket',
    description: 'Astrology and market intelligence workspace for lunar and market analysis.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#071321',
    theme_color: '#071321',
    categories: ['productivity', 'finance', 'utilities'],
    lang: 'en',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
