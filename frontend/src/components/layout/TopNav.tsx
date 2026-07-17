'use client';

import React from 'react';
import { MobileSidebarButton } from './MobileSidebarButton';

export const TopNav = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 sm:px-6 z-10 relative">
      <div className="flex items-center">
        <MobileSidebarButton />
      </div>
    </header>
  );
};
