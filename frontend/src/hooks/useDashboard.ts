import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { isManagerRole } from '@/lib/permissions';

export function useDashboardSummary(filters: {
  weekNumber?: number;
  year?: number;
  projectId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
} = {}) {
  const user = useAuthStore((state) => state.user);
  const canAccessDashboard = isManagerRole(user?.role);

  return useQuery({
    queryKey: ['dashboard', 'summary', filters],
    queryFn: () => dashboardService.getSummary(filters),
    enabled: canAccessDashboard, // Only run query if user has manager permissions
    retry: false, // Don't retry on 403
  });
}

export function useDashboardCharts(filters: {
  weekNumber?: number;
  year?: number;
  projectId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
} = {}) {
  const user = useAuthStore((state) => state.user);
  const canAccessDashboard = isManagerRole(user?.role);

  return useQuery({
    queryKey: ['dashboard', 'charts', filters],
    queryFn: () => dashboardService.getCharts(filters),
    enabled: canAccessDashboard, // Only run query if user has manager permissions
    retry: false, // Don't retry on 403
  });
}

export function useActivityFeed(limit = 10) {
  const user = useAuthStore((state) => state.user);
  const canAccessDashboard = isManagerRole(user?.role);

  return useQuery({
    queryKey: ['dashboard', 'activity', { limit }],
    queryFn: () => dashboardService.getActivityFeed(limit),
    enabled: canAccessDashboard, // Only run query if user has manager permissions
    retry: false, // Don't retry on 403
  });
}

/**
 * Aggregated dashboard overview hook - fetches summary, charts, and activity in one call
 * Significantly faster than 3 separate API calls
 */
export function useDashboardOverview(filters: {
  weekNumber?: number;
  year?: number;
  projectId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  activityLimit?: number;
} = {}) {
  const user = useAuthStore((state) => state.user);
  const canAccessDashboard = isManagerRole(user?.role);

  return useQuery({
    queryKey: ['dashboard', 'overview', filters],
    queryFn: () => dashboardService.getOverview(filters),
    enabled: canAccessDashboard, // Only run query if user has manager permissions
    retry: false, // Don't retry on 403
  });
}
