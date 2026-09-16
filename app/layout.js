import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import './theme.css';
import AuthGate from '@/components/AuthGate';
import AppShell from '@/components/layout/AppShell';
import PwaBootstrap from '@/components/pwa/PwaBootstrap';

export const metadata = {
  applicationName: 'Astro Market Analytics',
  title: {
    default: 'AstroNextLevel | Astro Market Analysis',
    template: '%s | AstroNextLevel',
  },
  description: 'Astrology and market analysis application for studying planetary cycles and market movements.',
  keywords: ['astrology', 'market analysis', 'stock analysis', 'planetary cycles', 'nse', 'bse', 'research dashboard'],
  category: 'finance',
  authors: [{ name: 'AstroNextLevel' }],
  openGraph: {
    title: 'AstroNextLevel | Astro Market Analysis',
    description: 'Astrology and market analysis application for studying planetary cycles and market movements.',
    type: 'website',
    siteName: 'AstroNextLevel',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AstroNextLevel | Astro Market Analysis',
    description: 'Planetary intelligence and market analysis workspace.',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/AstroNextLevel/favicon.svg',
    shortcut: '/AstroNextLevel/favicon.svg',
    apple: '/icons/apple-touch-icon.png',
  },
  other: {
    'theme-color': '#071321',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#071321',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="visually-hidden-focusable">Skip to content</a>
        <PwaBootstrap />
        <AuthGate>
          <AppShell>{children}</AppShell>
        </AuthGate>
      </body>
    </html>
  );
}
