import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsService } from '@/services/api';
import { CreateReportPayload, UpdateReportPayload, ReportStatus } from '@/types/Report';

export function useReports(filters: {
  weekNumber?: number | string;
  year?: number | string;
  userId?: string;
  projectId?: string;
  status?: ReportStatus | string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
} = {}) {
  // Convert string filters to proper types and filter out empty strings
  const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
    if (value === '' || value === undefined || value === null) return acc;
    
    // Convert weekNumber and year to numbers if they're strings
    if ((key === 'weekNumber' || key === 'year') && typeof value === 'string') {
      const num = parseInt(value, 10);
      if (!isNaN(num)) acc[key] = num;
    } else {
      acc[key] = value;
    }
    
    return acc;
  }, {} as Record<string, number | string | ReportStatus | undefined>);

  return useQuery({
    queryKey: ['reports', cleanFilters],
    queryFn: () => reportsService.getReports(cleanFilters),
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ['reports', id],
    queryFn: () => reportsService.getReport(id),
    enabled: !!id,
  });
}

export function useReportMutations() {
  const queryClient = useQueryClient();

  const createReport = useMutation({
    mutationFn: (payload: CreateReportPayload) => reportsService.createReport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateReport = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateReportPayload }) => 
      reportsService.updateReport(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.setQueryData(['reports', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const submitReport = useMutation({
    mutationFn: (id: string) => reportsService.submitReport(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.setQueryData(['reports', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteReport = useMutation({
    mutationFn: (id: string) => reportsService.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    createReport,
    updateReport,
    submitReport,
    deleteReport,
  };
}
