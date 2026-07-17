'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10 * 60 * 1000, // 10 minutes - longer fresh time reduces API calls
            gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache much longer
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: 'always', // Allow smart refetching based on staleTime
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
