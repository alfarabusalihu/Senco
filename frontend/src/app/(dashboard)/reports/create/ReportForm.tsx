'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useReportMutations } from '@/hooks/useReports';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

const reportSchema = z.object({
  weekNumber: z.number().min(1, 'Week number must be at least 1').max(53, 'Week number cannot exceed 53'),
  year: z.number().min(2000, 'Year must be at least 2000'),
  projectId: z.string().optional(),
  tasksCompleted: z.string().min(1, 'Please list tasks completed'),
  tasksPlanned: z.string().min(1, 'Please list tasks planned for next week'),
  blockers: z.string().optional(),
  hoursWorked: z.number().min(0, 'Hours worked cannot be negative'),
  notes: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export function ReportForm() {
  const router = useRouter();
  const { createReport } = useReportMutations();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      weekNumber: 1,
      year: 2026,
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

  const onSubmit = async (data: ReportFormValues) => {
    try {
      const { startDate, endDate } = getWeekDateRange(data.weekNumber, data.year);
      await createReport.mutateAsync({ ...data, startDate, endDate });
      toast.success('Report submitted successfully');
      router.push('/reports');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create report';
      toast.error(message);
      console.error('Failed to create report', error);
    }
  };

  return (
    <Card className="premium-card border-0 shadow-sm relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 h-8 w-8 rounded-full hover:bg-gray-100 z-10"
        onClick={() => router.back()}
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
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function getWeekNumber(d: Date) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

/** Derives the ISO-8601 Monday–Sunday date range for a given week number + year */
function getWeekDateRange(weekNumber: number, year: number): { startDate: string; endDate: string } {
  // Jan 4 is always in week 1 per ISO 8601
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7; // Mon=1 … Sun=7
  // Monday of week 1
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (dayOfWeek - 1));
  // Monday of target week
  const weekStart = new Date(week1Monday);
  weekStart.setUTCDate(week1Monday.getUTCDate() + (weekNumber - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  return {
    startDate: weekStart.toISOString().split('T')[0],
    endDate: weekEnd.toISOString().split('T')[0],
  };
}

export default ReportForm;
