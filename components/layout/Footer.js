 'use client';

import { usePathname } from 'next/navigation';
import { getRoutePath } from '@/lib/site-path';

export default function Footer() {
  const pathname = getRoutePath(usePathname());
  if (pathname === '/login') return null;

  return (
    <footer className="site-footer text-center">
      © 2026 Astro Market Analysis. For research and educational purposes only.
    </footer>
  );
}
