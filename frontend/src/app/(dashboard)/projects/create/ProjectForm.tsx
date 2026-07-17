'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProjectMutations } from '@/hooks/useProjects';
import { CreateProjectPayload } from '@/types/Project';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

const projectSchema = z.object({
  name: z.string().min(2, 'Project name is required'),
  description: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export function ProjectForm() {
  const router = useRouter();
  const { createProject } = useProjectMutations();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      // Filter out empty description
      const payload: CreateProjectPayload = {
        name: data.name.trim(),
        ...(data.description?.trim() && { description: data.description.trim() }),
      };
      await createProject.mutateAsync(payload);
      toast.success('Project created successfully');
      router.push('/projects');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create project';
      toast.error(message);
      console.error('Failed to create project', error);
    }
  };

  return (
    <Card className="premium-card border-0 shadow-sm relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 h-8 w-8 rounded-full hover:bg-gray-100"
        onClick={() => router.back()}
      >
        <X className="h-4 w-4" />
      </Button>
      <form onSubmit={handleSubmit(onSubmit)}>
      <CardContent className="space-y-6 p-6 max-h-[calc(100vh-280px)] overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name</Label>
          <Input 
            id="name" 
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
      </CardContent>
      <CardFooter className="bg-gray-50/50 p-6 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Project'}
        </Button>
      </CardFooter>
      </form>
    </Card>
  );
}
export default ProjectForm;
