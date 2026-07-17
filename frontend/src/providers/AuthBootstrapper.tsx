'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import type { User } from '@/types/User';
import type { ApiResponse } from '@/types/Api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * AuthBootstrapper - Optimized non-blocking auth hydration
 * Middleware handles route protection, this just hydrates user state
 */
export function AuthBootstrapper({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    let cancelled = false;

    async function hydrateAuth() {
      try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!res.ok) throw new Error('No active session');

        const json = (await res.json()) as ApiResponse<{ accessToken: string; user: User }>;
        if (!cancelled) {
          setAuth(json.data.user, json.data.accessToken);
          
          // Persist to sessionStorage for page refresh
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('accessToken', json.data.accessToken);
          }
        }
      } catch {
        if (!cancelled) {
          clearAuth();
        }
      }
    }

    hydrateAuth();

    // Listen for forced-logout events
    const handleLogout = () => {
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    };
    window.addEventListener('auth-logout', handleLogout);

    return () => {
      cancelled = true;
      window.removeEventListener('auth-logout', handleLogout);
    };
  }, [setAuth, clearAuth]);

  // No blocking - render immediately, auth hydrates in background
  return <>{children}</>;
}
