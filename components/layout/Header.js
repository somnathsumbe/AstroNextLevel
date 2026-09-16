'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLoggedUser, logout } from '@/lib/auth';
import ThemeSwitcher from '@/components/layout/ThemeSwitcher';
import { getRoutePath } from '@/lib/site-path';

export default function Header() {
  const pathname = getRoutePath(usePathname());
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => setUser(getLoggedUser()), [pathname]);

  useEffect(() => {
    const handleSidebarState = (event) => setSidebarOpen(Boolean(event.detail?.open));
    window.addEventListener('astro:sidebar-state', handleSidebarState);
    return () => window.removeEventListener('astro:sidebar-state', handleSidebarState);
  }, []);

  if (pathname === '/login') return null;

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <header className="site-header">
      <Link className="brand-mark" href="/dashboard" aria-label="Astro Market Analytics home">
        <span className="brand-star">✦</span>
        <span><strong>ASTRO</strong><small>MARKET ANALYTICS</small></span>
      </Link>
      <button className="mobile-menu-button d-md-none" type="button" onClick={() => window.dispatchEvent(new Event('astro:toggle-sidebar'))} aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'} aria-controls="main-sidebar" aria-expanded={sidebarOpen}><i className={`bi bi-${sidebarOpen ? 'x-lg' : 'list'}`} /></button>
      <div className="header-context d-none d-md-flex">
        <span className="market-pill">NSE</span><span className="market-divider">|</span><span className="market-pill">BSE</span>
        <span className="header-context-label">Planetary Market Intelligence</span>
      </div>
      <div className="header-user ms-auto">
        <Link href="/profile" className="header-profile-link" aria-label="User profile and settings">
          <div className="user-avatar"><i className="bi bi-person-fill" /></div>
          <div className="d-none d-sm-block"><strong>{user?.name || 'User'}</strong><small>{user?.username || ''}</small></div>
        </Link>
        <ThemeSwitcher />
        <button type="button" className="logout-button" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right" /> <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
