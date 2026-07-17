'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useReport, useReportMutations } from '@/hooks/useReports';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DiamondLoader } from '@/components/DiamondLoader';
import { X } from 'lucide-react';

const reportSchema = z.object({
  weekNumber: z.number().min(1, 'Week number must be at least 1').max(53, 'Week number cannot exceed 53'),
  year: z.number().min(2000, 'Year must be at least 2000'),
  tasksCompleted: z.string().min(1, 'Please list tasks completed'),
  tasksPlanned: z.string().min(1, 'Please list tasks planned for next week'),
  blockers: z.string().optional(),
  hoursWorked: z.number().min(0, 'Hours worked cannot be negative'),
  notes: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface EditReportFormProps {
  id: string;
}

export function EditReportForm({ id }: EditReportFormProps) {
  const router = useRouter();
  const { data: report, isLoading } = useReport(id);
  const { updateReport } = useReportMutations();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    values: report ? {
      weekNumber: report.weekNumber,
      year: report.year,
      tasksCompleted: report.tasksCompleted,
      tasksPlanned: report.tasksPlanned,
      blockers: report.blockers || '',
      hoursWorked: report.hoursWorked,
      notes: report.notes || '',
    } : undefined,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <DiamondLoader />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Report not found</h3>
        <Button variant="link" onClick={() => router.push('/reports')} className="mt-4">
          Return to reports
        </Button>
      </div>
    );
  }

  if (report.status !== 'DRAFT') {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Cannot Edit Submitted Report</h3>
        <p className="text-gray-500 mt-2">Only draft reports can be edited.</p>
        <Button onClick={() => router.push(`/reports/${id}`)} className="mt-4">
          View Report
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: ReportFormValues) => {
    try {
      await updateReport.mutateAsync({ id, payload: data });
      toast.success('Report updated successfully');
      router.push(`/reports/${id}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update report';
      toast.error(message);
      console.error('Failed to update report', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="premium-card border-0 shadow-sm relative">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 h-8 w-8 rounded-full hover:bg-gray-100 z-10"
          onClick={() => router.push(`/reports/${id}`)}
        >
          <X className="h-4 w-4" />
        </Button>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 p-6 max-h-[calc(100vh-280px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="weekNumber">Week Number</Label>
                <Input 
                  id="weekNumber" 
                  type="number" 
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
                  {...register('hoursWorked', { valueAsNumber: true })} 
                />
                {errors.hoursWorked && <p className="text-sm text-red-500">{errors.hoursWorked.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tasksCompleted">Tasks Completed</Label>
              <Textarea 
                id="tasksCompleted" 
                rows={4} 
                placeholder="What did you accomplish this week?"
                {...register('tasksCompleted')} 
              />
              {errors.tasksCompleted && <p className="text-sm text-red-500">{errors.tasksCompleted.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tasksPlanned">Tasks Planned</Label>
              <Textarea 
                id="tasksPlanned" 
                rows={4} 
                placeholder="What are your main goals for next week?"
                {...register('tasksPlanned')} 
              />
              {errors.tasksPlanned && <p className="text-sm text-red-500">{errors.tasksPlanned.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="blockers">Blockers (Optional)</Label>
              <Textarea 
                id="blockers" 
                rows={3} 
                placeholder="Are there any blockers or dependencies?"
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
          </CardContent>
          <CardFooter className="bg-gray-50/50 p-6 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push(`/reports/${id}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
