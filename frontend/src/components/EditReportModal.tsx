'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useReportMutations } from '@/hooks/useReports';
import { WeeklyReport } from '@/types/Report';
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

const reportSchema = z.object({
  weekNumber: z.number().min(1).max(53),
  year: z.number().min(2000),
  tasksCompleted: z.string().min(1, 'Please list tasks completed'),
  tasksPlanned: z.string().min(1, 'Please list tasks planned'),
  blockers: z.string().optional(),
  hoursWorked: z.number().min(0),
  notes: z.string().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'LATE']).optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface EditReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: WeeklyReport;
}

export function EditReportModal({ open, onOpenChange, report }: EditReportModalProps) {
  const { updateReport } = useReportMutations();

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
      weekNumber: report.weekNumber,
      year: report.year,
      tasksCompleted: report.tasksCompleted,
      tasksPlanned: report.tasksPlanned,
      blockers: report.blockers || '',
      hoursWorked: report.hoursWorked,
      notes: report.notes || '',
      status: report.status,
    },
  });

  // Reset form when report changes
  useEffect(() => {
    reset({
      weekNumber: report.weekNumber,
      year: report.year,
      tasksCompleted: report.tasksCompleted,
      tasksPlanned: report.tasksPlanned,
      blockers: report.blockers || '',
      hoursWorked: report.hoursWorked,
      notes: report.notes || '',
      status: report.status,
    });
  }, [report, reset]);

  const onSubmit = async (data: ReportFormValues) => {
    try {
      await updateReport.mutateAsync({ id: report.id, payload: data });
      toast.success('Report updated successfully');
      onOpenChange(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update report';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-4xl max-h-[calc(100vh-2rem)] md:max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl md:text-2xl">Edit Report</DialogTitle>
          <DialogDescription className="text-sm">Update your weekly report details</DialogDescription>
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
                <Label htmlFor="status">Report Status</Label>
                <Select 
                  value={watch('status')} 
                  onValueChange={(value) => setValue('status', value as 'DRAFT' | 'SUBMITTED' | 'LATE')}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="LATE">Late</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
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
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting}
              className="w-full sm:w-auto rounded-md"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="btn-primary w-full sm:w-auto rounded-md" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
