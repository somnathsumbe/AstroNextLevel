'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getLoggedUser } from '@/lib/auth';
import { getRoutePath } from '@/lib/site-path';

export default function AuthGate({ children }) {
  const pathname = getRoutePath(usePathname());
  const router = useRouter();
  const isPublicRoute = pathname === '/' || pathname === '/login' || pathname === '/register';
  const [ready, setReady] = useState(isPublicRoute);

  useEffect(() => {
    const loggedUser = getLoggedUser();

    if (isPublicRoute) {
      if (loggedUser) router.replace('/dashboard');
      setReady(true);
      return;
    }

    if (!loggedUser) {
      router.replace('/login');
      return;
    }

    setReady(true);
  }, [isPublicRoute, pathname, router]);

  if (!ready) {
    return <div className="auth-loading" aria-label="Loading application" />;
  }

  return children;
}
