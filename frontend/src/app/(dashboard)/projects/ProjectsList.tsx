'use client';

import React, { useState } from 'react';
import { useProjects, useProjectMutations } from '@/hooks/useProjects';
import { useAuthStore } from '@/stores/auth.store';
import { DiamondLoader } from '@/components/DiamondLoader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Folder, Calendar, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ProjectModal } from '@/components/ProjectModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Project } from '@/types/Project';
import toast from 'react-hot-toast';
import { isManagerRole } from '@/lib/permissions';

interface ProjectsListProps {
  initialProjects: Project[];
}

export function ProjectsList({ initialProjects }: ProjectsListProps) {
  // Use React Query with initial data from SSR
  const { data: projects = initialProjects, isLoading } = useProjects('ACTIVE', {
    initialData: initialProjects,
    staleTime: 30000, // Use SSR data for 30s
  });
  
  const { deleteProject } = useProjectMutations();
  const user = useAuthStore((state) => state.user);
  const canManageProjects = isManagerRole(user?.role);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleDelete = (project: Project) => {
    setDeletingProject(project);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingProject) return;
    
    try {
      await deleteProject.mutateAsync(deletingProject.id);
      toast.success('Project archived successfully');
      setIsDeleteDialogOpen(false);
      setDeletingProject(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to archive project';
      toast.error(message);
    }
  };

  if (isLoading && !initialProjects.length) {
    return (
      <div className="p-12 flex justify-center">
        <DiamondLoader />
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <Folder className="h-6 w-6 text-blue-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
        <p className="text-gray-500 mt-1 max-w-sm mx-auto">
          Get started by creating your first project to track reports against.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="premium-card border-0 shadow-sm hover:shadow-md transition-shadow group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Folder className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className={
                      project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }
                  >
                    {project.status}
                  </Badge>
                  {canManageProjects && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                        onClick={() => handleEdit(project)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                        onClick={() => handleDelete(project)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                {project.name}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                {project.description || 'No description provided.'}
              </p>
              
              <div className="flex items-center text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Created: {format(new Date(project.createdAt), 'MMM d, yyyy')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {canManageProjects && (
        <ProjectModal
          open={isEditModalOpen}
          onOpenChange={(open) => {
            setIsEditModalOpen(open);
            if (!open) setEditingProject(null);
          }}
          project={editingProject}
          mode="edit"
        />
      )}

      {/* Delete Confirmation Dialog */}
      {canManageProjects && (
        <ConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Archive Project"
          description={`Are you sure you want to archive "${deletingProject?.name}"? This will mark the project as archived but preserve all associated reports.`}
          onConfirm={confirmDelete}
          confirmText="Archive"
          variant="destructive"
        />
      )}
    </>
  );
}
export default ProjectsList;
