import api from '../lib/api-client';
import { User, UserProfileUpdate } from '../types/User';
import { Project, CreateProjectPayload, UpdateProjectPayload } from '../types/Project';
import { WeeklyReport, CreateReportPayload, UpdateReportPayload, ReportStatus } from '../types/Report';
import { DashboardSummary, DashboardCharts, ActivityLog } from '../types/Dashboard';

// ---------------------------------------------------------------------------
// Authentication Services
// ---------------------------------------------------------------------------
export const authService = {
  async register(payload: Record<string, unknown>): Promise<{ user: User; accessToken: string }> {
    return api.post<{ user: User; accessToken: string }>('auth/register', payload);
  },

  async login(payload: Record<string, unknown>): Promise<{ user: User; accessToken: string }> {
    return api.post<{ user: User; accessToken: string }>('auth/login', payload);
  },

  async logout(): Promise<void> {
    await api.post('auth/logout', {});
  },
};

// ---------------------------------------------------------------------------
// Users Services
// ---------------------------------------------------------------------------
export const usersService = {
  async getMe(): Promise<User> {
    return api.get<User>('users/me');
  },

  async updateMe(payload: UserProfileUpdate): Promise<User> {
    return api.patch<User>('users/me', payload);
  },

  async updatePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
    return api.patch<void>('users/me/password', payload);
  },

  async getAllUsers(role?: string): Promise<User[]> {
    return api.get<User[]>('users', { params: { role } });
  },

  async getUser(id: string): Promise<User> {
    return api.get<User>(`users/${id}`);
  },
};

// ---------------------------------------------------------------------------
// Projects Services
// ---------------------------------------------------------------------------
export const projectsService = {
  async getProjects(status?: string): Promise<Project[]> {
    const projects = await api.get<Project[]>('projects', { params: { status } });
    // Filter out archived projects in the frontend as well
    return projects.filter(p => p.status !== 'ARCHIVED');
  },

  async getProject(id: string): Promise<Project> {
    return api.get<Project>(`projects/${id}`);
  },

  async createProject(payload: CreateProjectPayload): Promise<Project> {
    return api.post<Project>('projects', payload);
  },

  async updateProject(id: string, payload: UpdateProjectPayload): Promise<Project> {
    return api.patch<Project>(`projects/${id}`, payload);
  },

  async deleteProject(id: string): Promise<void> {
    return api.delete(`projects/${id}`);
  },
};

// ---------------------------------------------------------------------------
// Reports Services
// ---------------------------------------------------------------------------
export const reportsService = {
  async getReports(filters: {
    weekNumber?: number;
    year?: number;
    userId?: string;
    projectId?: string;
    status?: ReportStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ reports: WeeklyReport[]; total: number; page: number; totalPages: number }> {
    return api.get<{ reports: WeeklyReport[]; total: number; page: number; totalPages: number }>('reports', { params: filters });
  },

  async getReport(id: string): Promise<WeeklyReport> {
    return api.get<WeeklyReport>(`reports/${id}`);
  },

  async getReportHistory(): Promise<WeeklyReport[]> {
    return api.get<WeeklyReport[]>('reports/history');
  },

  async createReport(payload: CreateReportPayload): Promise<WeeklyReport> {
    return api.post<WeeklyReport>('reports', payload);
  },

  async updateReport(id: string, payload: UpdateReportPayload): Promise<WeeklyReport> {
    return api.patch<WeeklyReport>(`reports/${id}`, payload);
  },

  async submitReport(id: string): Promise<WeeklyReport> {
    return api.post<WeeklyReport>(`reports/${id}/submit`);
  },

  async deleteReport(id: string): Promise<void> {
    return api.delete(`reports/${id}`);
  },
};

// ---------------------------------------------------------------------------
// Dashboard Services
// ---------------------------------------------------------------------------
export const dashboardService = {
  async getSummary(filters: {
    weekNumber?: number;
    year?: number;
    projectId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<DashboardSummary> {
    return api.get<DashboardSummary>('dashboard/summary', { params: filters });
  },

  async getCharts(filters: {
    weekNumber?: number;
    year?: number;
    projectId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<DashboardCharts> {
    return api.get<DashboardCharts>('dashboard/charts', { params: filters });
  },

  async getActivityFeed(limit?: number): Promise<ActivityLog[]> {
    return api.get<ActivityLog[]>('dashboard/activity', { params: { limit } });
  },

  async getOverview(filters: {
    weekNumber?: number;
    year?: number;
    projectId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    activityLimit?: number;
  } = {}): Promise<{
    summary: DashboardSummary;
    charts: DashboardCharts;
    activity: ActivityLog[];
  }> {
    return api.get<{
      summary: DashboardSummary;
      charts: DashboardCharts;
      activity: ActivityLog[];
    }>('dashboard/overview', { params: filters });
  },
};

// ---------------------------------------------------------------------------
// AI Assistant Services
// ---------------------------------------------------------------------------
export const aiService = {
  async getStatus(): Promise<{ enabled: boolean }> {
    return api.get<{ enabled: boolean }>('ai/status');
  },

  async chat(message: string, history: Record<string, unknown>[] = []): Promise<string> {
    const data = await api.post<{ response: string }>('ai/chat', { message, history });
    return data.response;
  },
};

const apiServices = {
  auth: authService,
  users: usersService,
  projects: projectsService,
  reports: reportsService,
  dashboard: dashboardService,
  ai: aiService,
};
export default apiServices;
