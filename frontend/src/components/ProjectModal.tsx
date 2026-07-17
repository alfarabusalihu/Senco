'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProjectMutations } from '@/hooks/useProjects';
import { CreateProjectPayload, UpdateProjectPayload, Project } from '@/types/Project';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const projectSchema = z.object({
  name: z.string().min(2, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  mode?: 'create' | 'edit';
}

export function ProjectModal({ 
  open, 
  onOpenChange, 
  project = null, 
  mode = 'create' 
}: ProjectModalProps) {
  const { createProject, updateProject } = useProjectMutations();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'ACTIVE',
    },
  });

  const status = watch('status');

  // Reset form when project prop changes
  useEffect(() => {
    if (project && mode === 'edit') {
      reset({
        name: project.name,
        description: project.description || '',
        status: project.status as 'ACTIVE' | 'ARCHIVED',
      });
    } else {
      reset({
        name: '',
        description: '',
        status: 'ACTIVE',
      });
    }
  }, [project, mode, reset]);

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      if (mode === 'edit' && project) {
        // Update existing project
        const payload: UpdateProjectPayload = {
          name: data.name.trim(),
          ...(data.description?.trim() && { description: data.description.trim() }),
          status: data.status,
        };
        await updateProject.mutateAsync({ id: project.id, data: payload });
        toast.success('Project updated successfully');
      } else {
        // Create new project
        const payload: CreateProjectPayload = {
          name: data.name.trim(),
          ...(data.description?.trim() && { description: data.description.trim() }),
        };
        await createProject.mutateAsync(payload);
        toast.success('Project created successfully');
      }
      reset();
      onOpenChange(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : `Failed to ${mode} project`;
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-4xl max-h-[calc(100vh-2rem)] md:max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl md:text-2xl">
            {mode === 'edit' ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {mode === 'edit' ? 'Update project details' : 'Add a new project for your team'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-4 md:space-y-5 py-2 overflow-y-auto px-1 flex-1">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input 
                id="name" 
                className="h-11"
                placeholder="e.g. Q3 Marketing Campaign"
                {...register('name')} 
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                rows={4} 
                placeholder="What is this project about?"
                {...register('description')} 
              />
            </div>

            {mode === 'edit' && (
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={status} 
                  onValueChange={(value) => setValue('status', value as 'ACTIVE' | 'ARCHIVED')}
                >
                  <SelectTrigger id="status" className="h-11">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
              </div>
            )}
          </div>
          <DialogFooter className="pt-4 md:pt-6 shrink-0 flex flex-row gap-3 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => { reset(); onOpenChange(false); }} 
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="btn-primary w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update Project' : 'Create Project')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
