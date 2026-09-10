import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stock Gann Pressure Calculator | Astro Market Analytics',
  description: 'Calculate probable Gann pressure dates from financial or stock reference dates.',
};

export default function StockGannPressureCalcLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
