'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLoggedUser } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getLoggedUser() ? '/dashboard' : '/login');
  }, [router]);

  return <div className="auth-loading" aria-label="Redirecting" />;
}
