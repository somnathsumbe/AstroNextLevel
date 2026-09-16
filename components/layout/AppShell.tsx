'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import PageContainer from '@/components/layout/PageContainer';
import { getRoutePath } from '@/lib/site-path';

const publicRoutes = new Set(['/login', '/register']);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = getRoutePath(usePathname());

  if (publicRoutes.has(pathname)) return <>{children}</>;

  return <>
    <Header />
    <div className="app-shell">
      <Sidebar />
      <main id="main-content" className="main-content"><PageContainer>{children}</PageContainer></main>
    </div>
    <Footer />
  </>;
}