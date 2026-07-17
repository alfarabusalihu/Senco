import { User } from './User';

export interface DashboardSummary {
  totalReports: number;
  activeProjects: number;
  totalHoursWorked: number;
  totalSubmitted: number;
  submittedCount: number;
  lateCount: number;
  draftCount: number;
  pendingCount: number;
  blockersCount: number;
  totalHours: number;
  activeProjectsCount: number;
  activeTeamMembersCount: number;
  complianceRate: number;
}

export interface SubmissionStatusChart {
  name: 'Submitted' | 'Late' | 'Pending' | 'Drafts';
  value: number;
}

export interface WorkloadDistributionChart {
  name: string; // Project Name
  hours: number;
  tasks: number;
}

export interface TeamProductivityChart {
  name: string; // User Name
  tasks: number;
  hours: number;
}

export interface TasksTrendChart {
  week: string; // W28, etc.
  completed: number;
  planned: number;
}

export interface DashboardCharts {
  submissionStatus: SubmissionStatusChart[];
  workloadDistribution: WorkloadDistributionChart[];
  teamProductivity: TeamProductivityChart[];
  tasksTrend: TasksTrendChart[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  action:
    | 'REPORT_CREATED'
    | 'REPORT_SUBMITTED'
    | 'REPORT_UPDATED'
    | 'PROJECT_CREATED'
    | 'PROJECT_UPDATED'
    | 'PROJECT_ARCHIVED'
    | 'USER_REGISTERED'
    | 'USER_LOGGED_IN';
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: Omit<User, 'createdAt' | 'updatedAt'>;
}
