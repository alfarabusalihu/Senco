import { create } from 'zustand';
import type { User } from '@/types/User';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: (user, accessToken) => {
    // Persist token to sessionStorage for page refresh scenarios
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('accessToken', accessToken);
    }
    set({ user, accessToken, isAuthenticated: true });
  },

  setUser: (user) =>
    set({ user }),

  setToken: (accessToken) => {
    // Update sessionStorage when token changes
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('accessToken', accessToken);
    }
    set({ accessToken });
  },

  clearAuth: () => {
    // Clear sessionStorage on logout
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('accessToken');
    }
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
