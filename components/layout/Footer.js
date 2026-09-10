 'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname === '/login') return null;

  return (
    <footer className="site-footer text-center">
      © 2026 Astro Market Analysis. For research and educational purposes only.
    </footer>
  );
}
