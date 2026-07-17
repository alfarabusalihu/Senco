import { Project } from './Project';
import { User } from './User';

export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'LATE';

export interface WeeklyReport {
  id: string;
  userId: string;
  projectId: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  tasksCompleted: string;
  tasksPlanned: string;
  blockers: string | null;
  hoursWorked: number;
  notes: string | null;
  status: ReportStatus;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  project?: Project;
  user?: Omit<User, 'createdAt' | 'updatedAt'>;
}

export interface CreateReportPayload {
  projectId?: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  tasksCompleted: string;
  tasksPlanned: string;
  blockers?: string;
  hoursWorked: number;
  notes?: string;
  submit?: boolean;
}

export interface UpdateReportPayload {
  projectId?: string;
  weekNumber?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
  tasksCompleted?: string;
  tasksPlanned?: string;
  blockers?: string;
  hoursWorked?: number;
  notes?: string;
  submit?: boolean;
}
