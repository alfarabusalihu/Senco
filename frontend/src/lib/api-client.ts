import { useAuthStore } from '@/stores/auth.store';
import type { ApiErrorResponse, ApiResponse } from '../types/Api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private refreshPromise: Promise<string | null> | null = null;

  getAccessToken(): string | null {
    // Try Zustand store first, then sessionStorage backup
    const storeToken = useAuthStore.getState().accessToken;
    if (storeToken) return storeToken;
    
    // Fallback to sessionStorage if store is empty (page refresh scenario)
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('accessToken');
    }
    return null;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    let url = `${BASE_URL}/${endpoint.replace(/^\//, '')}`;

    if (options.params) {
      const queryParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.append(key, String(val));
        }
      });
      const queryStr = queryParams.toString();
      if (queryStr) url += `?${queryStr}`;
    }

    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const token = this.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = { ...options, headers, credentials: 'include' };
    let response = await fetch(url, config);

    // 401 → try silent token refresh via HttpOnly cookie
    if (
      response.status === 401 &&
      endpoint !== 'auth/login' &&
      endpoint !== 'auth/register' &&
      endpoint !== 'auth/refresh'
    ) {
      const refreshedToken = await this.performTokenRefresh();
      if (refreshedToken) {
        headers.set('Authorization', `Bearer ${refreshedToken}`);
        response = await fetch(url, { ...config, headers });
      } else {
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-logout'));
        }
        throw new Error('Session expired. Please log in again.');
      }
    }

    const json = await response.json();

    if (!response.ok) {
      const errResponse = json as ApiErrorResponse;
      const errMsg = Array.isArray(errResponse.message)
        ? errResponse.message.join(' ')
        : errResponse.message || 'An error occurred';
      throw new Error(errMsg);
    }

    const successResponse = json as ApiResponse<T>;
    return successResponse.data;
  }

  private async performTokenRefresh(): Promise<string | null> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Refresh failed');

        const json = (await res.json()) as ApiResponse<{ accessToken: string; user: unknown }>;
        const newToken = json.data.accessToken;
        useAuthStore.getState().setToken(newToken);
        
        // Persist to sessionStorage for page refresh scenarios
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('accessToken', newToken);
        }
        
        return newToken;
      } catch {
        // Clear sessionStorage on failed refresh
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('accessToken');
        }
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  get<T>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(
    endpoint: string,
    body?: object | null,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(
    endpoint: string,
    body?: object | null,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
export default api;
