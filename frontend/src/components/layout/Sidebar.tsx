'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, FileText, Folder, PieChart, Users, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { NavLink } from './NavLink';
import toast from 'react-hot-toast';
import { authService } from '@/services/api';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { type Role } from '@/types/User';

export const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['TEAM_MEMBER', 'PROJECT_MANAGER', 'ADMINISTRATOR'] as Role[] },
    { name: 'Reports', href: '/reports', icon: FileText, roles: ['TEAM_MEMBER', 'PROJECT_MANAGER', 'ADMINISTRATOR'] as Role[] },
    { name: 'Projects', href: '/projects', icon: Folder, roles: ['TEAM_MEMBER', 'PROJECT_MANAGER', 'ADMINISTRATOR'] as Role[] },
    { name: 'Analytics', href: '/analytics', icon: PieChart, roles: ['PROJECT_MANAGER', 'ADMINISTRATOR'] as Role[] },
    { name: 'Team', href: '/team', icon: Users, roles: ['PROJECT_MANAGER', 'ADMINISTRATOR'] as Role[] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['TEAM_MEMBER', 'PROJECT_MANAGER', 'ADMINISTRATOR'] as Role[] },
  ];

  // Prevent hydration mismatch by waiting for client-side hydration
  const filteredNavItems = isHydrated
    ? navItems.filter(item => item.roles.includes(user?.role || 'TEAM_MEMBER'))
    : navItems.filter(item => item.roles.includes('TEAM_MEMBER')); // Default on server

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearAuth();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      clearAuth();
      router.push('/login');
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-full shadow-sm">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded transform rotate-45 mr-3">
          <div className="transform -rotate-45 w-4 h-4 bg-white rounded-sm"></div>
        </div>
        <span className="text-xl font-bold text-gray-800 tracking-tight">Senco</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.name}
            href={item.href}
            label={item.name}
            Icon={item.icon}
          />
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold flex-shrink-0 relative">
              {getInitials(user?.firstName, user?.lastName)}
              <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</span>
              <span className="text-xs text-gray-500 truncate">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Confirm Logout"
        description="Are you sure you want to log out? Any unsaved changes will be lost."
        onConfirm={handleLogout}
        confirmText="Log out"
        variant="destructive"
      />
    </aside>
  );
};
