import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planet Stock Mapping | Astro Market Analytics',
  description: 'Financial astrology planet, sector, and stock mapping reference tool.',
};

export default function PlanetStockMappingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
