'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useReportMutations } from '@/hooks/useReports';
import { useProjects } from '@/hooks/useProjects';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const reportSchema = z.object({
  weekNumber: z.number().min(1).max(53),
  year: z.number().min(2000),
  projectId: z.string().min(1, 'Please select a project'),
  tasksCompleted: z.string().min(1, 'Please list tasks completed'),
  tasksPlanned: z.string().min(1, 'Please list tasks planned'),
  blockers: z.string().optional(),
  hoursWorked: z.number().min(0),
  notes: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportModal({ open, onOpenChange }: ReportModalProps) {
  const { createReport } = useReportMutations();
  const { data: projects } = useProjects('ACTIVE');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      weekNumber: 1,
      year: 2026,
      projectId: '',
      tasksCompleted: '',
      tasksPlanned: '',
      blockers: '',
      hoursWorked: 40,
      notes: '',
    },
  });

  // Set current week/year on client side only to avoid hydration mismatch
  useEffect(() => {
    const now = new Date();
    setValue('weekNumber', getWeekNumber(now));
    setValue('year', now.getFullYear());
  }, [setValue]);

  const selectedProjectId = watch('projectId') || '';
  const selectedProject = projects?.find(p => p.id === selectedProjectId);

  const onSubmit = async (data: ReportFormValues) => {
    try {
      const { startDate, endDate } = getWeekDateRange(data.weekNumber, data.year);
      await createReport.mutateAsync({ ...data, startDate, endDate });
      toast.success('Report submitted successfully');
      reset();
      onOpenChange(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create report';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-4xl max-h-[calc(100vh-2rem)] md:max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl md:text-2xl">Create Weekly Report</DialogTitle>
          <DialogDescription className="text-sm">Submit your progress for the week</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-4 md:space-y-5 py-2 overflow-y-auto px-1 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weekNumber">Week Number</Label>
                <Input 
                  id="weekNumber" 
                  type="number" 
                  className="h-11"
                  {...register('weekNumber', { valueAsNumber: true })} 
                />
                {errors.weekNumber && <p className="text-sm text-red-500">{errors.weekNumber.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="hoursWorked">Hours Worked</Label>
                <Input 
                  id="hoursWorked" 
                  type="number" 
                  step="0.5"
                  className="h-11"
                  {...register('hoursWorked', { valueAsNumber: true })} 
                />
                {errors.hoursWorked && <p className="text-sm text-red-500">{errors.hoursWorked.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectId">Project *</Label>
                <Select 
                  value={selectedProjectId} 
                  onValueChange={(value) => {
                    if (value) setValue('projectId', value, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select a project">
                      {selectedProject ? selectedProject.name : 'Select a project'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {projects && projects.length > 0 ? (
                      projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No active projects</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.projectId && <p className="text-sm text-red-500">{errors.projectId.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tasksCompleted">Tasks Completed *</Label>
              <Textarea 
                id="tasksCompleted" 
                rows={5} 
                placeholder="Example:&#10;- Completed feature X&#10;- Fixed bug Y&#10;- Deployed to staging"
                {...register('tasksCompleted')} 
              />
              {errors.tasksCompleted && <p className="text-sm text-red-500">{errors.tasksCompleted.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tasksPlanned">Tasks Planned *</Label>
              <Textarea 
                id="tasksPlanned" 
                rows={5} 
                placeholder="Example:&#10;1. Implement feature Z&#10;2. Review pull requests&#10;3. Write unit tests"
                {...register('tasksPlanned')} 
              />
              {errors.tasksPlanned && <p className="text-sm text-red-500">{errors.tasksPlanned.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="blockers">Blockers (Optional)</Label>
              <Textarea 
                id="blockers" 
                rows={3} 
                placeholder="Any blockers or dependencies?"
                {...register('blockers')} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                rows={3} 
                placeholder="Any additional information?"
                {...register('notes')} 
              />
            </div>
          </div>
          <DialogFooter className="pt-4 md:pt-6 shrink-0 flex flex-row gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => { reset(); onOpenChange(false); }} disabled={isSubmitting} className="w-full sm:w-auto rounded-md">
              Cancel
            </Button>
            <Button type="submit" className="btn-primary w-full sm:w-auto rounded-md" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getWeekNumber(d: Date) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getWeekDateRange(weekNumber: number, year: number): { startDate: string; endDate: string } {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (dayOfWeek - 1));
  const weekStart = new Date(week1Monday);
  weekStart.setUTCDate(week1Monday.getUTCDate() + (weekNumber - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  return {
    startDate: weekStart.toISOString().split('T')[0],
    endDate: weekEnd.toISOString().split('T')[0],
  };
}
