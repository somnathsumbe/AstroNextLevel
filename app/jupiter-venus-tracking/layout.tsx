import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jupiter Venus Tracking | Astro Market Analytics',
  description: 'Jupiter/Venus degree crossing and market observation reference calendar.',
};

export default function JupiterVenusTrackingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
