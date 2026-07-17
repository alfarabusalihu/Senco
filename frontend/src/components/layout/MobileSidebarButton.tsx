'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';

export function MobileSidebarButton() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
    >
      <span className="sr-only">Open sidebar</span>
      <Menu className="h-6 w-6" aria-hidden="true" />
    </button>
  );
}
