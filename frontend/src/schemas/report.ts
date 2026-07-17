import { z } from 'zod';

export const reportSchema = z.object({
  projectId: z
    .string()
    .min(1, { message: 'Project is required.' }),
  weekNumber: z
    .number()
    .int()
    .min(1, 'Week number must be at least 1')
    .max(53, 'Week number cannot exceed 53'),
  year: z
    .number()
    .int()
    .min(2020, 'Year must be at least 2020')
    .max(2100, 'Year cannot exceed 2100'),
  startDate: z
    .string()
    .min(1, { message: 'Start date is required.' }),
  endDate: z
    .string()
    .min(1, { message: 'End date is required.' }),
  tasksCompleted: z
    .string()
    .min(1, { message: 'Tasks completed are required.' })
    .min(10, { message: 'Completed tasks description must be at least 10 characters long.' }),
  tasksPlanned: z
    .string()
    .min(1, { message: 'Tasks planned are required.' })
    .min(10, { message: 'Planned tasks description must be at least 10 characters long.' }),
  blockers: z
    .string()
    .optional(),
  hoursWorked: z
    .number()
    .min(0, { message: 'Hours worked cannot be negative.' })
    .max(168, { message: 'Hours worked cannot exceed 168 hours in a week.' }),
  notes: z
    .string()
    .optional(),
});

export type ReportFields = z.infer<typeof reportSchema>;
