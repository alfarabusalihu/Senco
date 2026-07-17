'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { AiChatWrapper } from '@/components/layout/AiChatWrapper';
import { isManagerRole } from '@/lib/permissions';

const MANAGER_ONLY_ROUTES = ['/team', '/analytics'];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if employee is trying to access manager-only routes
    if (user && !isManagerRole(user.role)) {
      const isManagerRoute = MANAGER_ONLY_ROUTES.some(route => pathname?.startsWith(route));
      if (isManagerRoute) {
        router.replace('/unauthorized');
      }
    }
  }, [user, pathname, router]);

  return (
    <div className="flex h-screen w-full bg-[#F7E8A4] overflow-hidden">
      <Sidebar />
      <MobileSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      <AiChatWrapper />
    </div>
  );
}
