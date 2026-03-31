'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function AdminLogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    logout();
    router.replace('/');
  }, [logout, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Cerrando sesion...</p>
    </div>
  );
}
