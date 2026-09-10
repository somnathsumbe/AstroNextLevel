import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Weekly Market Tracking | Astro Market Analytics',
  description: 'Sun-Jupiter degree crossing and weekly market observation reference calendar.',
};

export default function SunJupiterTrackingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
