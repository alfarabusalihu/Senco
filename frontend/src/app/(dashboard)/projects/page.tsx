'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProjectsList } from './ProjectsList';
import { ProjectModal } from '@/components/ProjectModal';
import { useAuthStore } from '@/stores/auth.store';
import { useProjects } from '@/hooks/useProjects';
import { DiamondLoader } from '@/components/DiamondLoader';
import { isManagerRole } from '@/lib/permissions';

export default function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const canManageProjects = isManagerRole(user?.role);

  // Fallback to client-side fetching since SSR doesn't have sessionStorage access
  const { data: projects, isLoading } = useProjects('ACTIVE');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <DiamondLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 hidden sm:block">
            {canManageProjects ? 'Manage your team projects and assignments' : 'View all active projects'}
          </p>
        </div>
        {canManageProjects && (
          <Button 
            className="btn-primary flex items-center gap-2 shrink-0 rounded-md" 
            onClick={() => setIsModalOpen(true)}
            size="default"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Project</span>
          </Button>
        )}
      </div>

      <ProjectsList initialProjects={projects || []} />
      
      {/* Create Modal - Manager Only */}
      {canManageProjects && (
        <ProjectModal 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen}
          mode="create"
        />
      )}
    </div>
  );
}
