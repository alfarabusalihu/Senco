'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

// Root path redirects based on auth state
export default function RootPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Simple redirect based on current auth state
    // Middleware handles the actual protection
    if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router, user]);

  return null;
}

