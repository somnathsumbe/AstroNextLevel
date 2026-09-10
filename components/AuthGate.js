'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getLoggedUser } from '@/lib/auth';

export default function AuthGate({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(pathname === '/login');

  useEffect(() => {
    const loggedUser = getLoggedUser();

    if (pathname === '/login') {
      if (loggedUser) router.replace('/dashboard');
      setReady(true);
      return;
    }

    if (!loggedUser) {
      router.replace('/login');
      return;
    }

    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return <div className="auth-loading" aria-label="Loading application" />;
  }

  return children;
}
