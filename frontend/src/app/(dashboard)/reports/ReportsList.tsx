'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useReports } from '@/hooks/useReports';
import { useProjects } from '@/hooks/useProjects';
import { useAuthStore } from '@/stores/auth.store';
import { DiamondLoader } from '@/components/DiamondLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { isManagerRole } from '@/lib/permissions';

export function ReportsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;
  const user = useAuthStore((state) => state.user);
  const canViewAllReports = isManagerRole(user?.role);
  
  // Filter states
  const [filters, setFilters] = useState({
    userId: '',
    projectId: '',
    status: '',
    weekNumber: '',
    year: '',
    startDate: '',
    endDate: '',
  });
  
  const { data: projects } = useProjects('ACTIVE');
  const { data, isLoading } = useReports({ 
    page: currentPage, 
    limit,
    ...filters,
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      projectId: '',
      status: '',
      weekNumber: '',
      year: '',
      startDate: '',
      endDate: '',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center">
        <DiamondLoader />
      </div>
    );
  }

  const reports = data?.reports || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  if (!reports || reports.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <FileText className="h-6 w-6 text-blue-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No reports found</h3>
        <p className="text-gray-500 mt-1 max-w-sm mx-auto">
          Get started by creating your first weekly report.
        </p>
        <Link href="/reports/create" className="mt-6">
          <Button className="btn-primary">Create Report</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Panel - Always Visible for Managers */}
      {canViewAllReports && (
        <div className="p-3 md:p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
              {/* Project Filter */}
              <div className="space-y-1.5">
                <Label htmlFor="filter-project" className="text-xs font-medium text-gray-700">Project</Label>
                <Select
                  value={filters.projectId}
                  onValueChange={(value) => handleFilterChange('projectId', value || '')}
                >
                  <SelectTrigger id="filter-project" className="h-8 md:h-9 text-xs md:text-sm">
                    <SelectValue placeholder="All projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All projects</SelectItem>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1.5">
                <Label htmlFor="filter-status" className="text-xs font-medium text-gray-700">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value || '')}
                >
                  <SelectTrigger id="filter-status" className="h-8 md:h-9 text-xs md:text-sm">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="LATE">Late</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Week Number Filter */}
              <div className="space-y-1.5">
                <Label htmlFor="filter-week" className="text-xs font-medium text-gray-700">Week</Label>
                <Input
                  id="filter-week"
                  type="number"
                  min="1"
                  max="53"
                  placeholder="Week"
                  value={filters.weekNumber}
                  onChange={(e) => handleFilterChange('weekNumber', e.target.value)}
                  className="h-8 md:h-9 text-xs md:text-sm"
                />
              </div>

              {/* Year Filter */}
              <div className="space-y-1.5">
                <Label htmlFor="filter-year" className="text-xs font-medium text-gray-700">Year</Label>
                <Input
                  id="filter-year"
                  type="number"
                  min="2020"
                  max="2030"
                  placeholder="Year"
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="h-8 md:h-9 text-xs md:text-sm"
                />
              </div>

              {/* Start Date Filter */}
              <div className="space-y-1.5">
                <Label htmlFor="filter-start-date" className="text-xs font-medium text-gray-700">Start Date</Label>
                <Input
                  id="filter-start-date"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="h-8 md:h-9 text-xs md:text-sm"
                />
              </div>

              {/* End Date Filter */}
              <div className="space-y-1.5">
                <Label htmlFor="filter-end-date" className="text-xs font-medium text-gray-700">End Date</Label>
                <Input
                  id="filter-end-date"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="h-8 md:h-9 text-xs md:text-sm"
                />
              </div>
            </div>
            
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-900 h-7 md:h-8 text-xs rounded-md"
                >
                  <X className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-4 md:px-6 py-3 md:py-4 font-medium">Week</th>
              {canViewAllReports && <th className="px-4 md:px-6 py-3 md:py-4 font-medium hidden md:table-cell">User</th>}
              <th className="px-4 md:px-6 py-3 md:py-4 font-medium">Project</th>
              <th className="px-4 md:px-6 py-3 md:py-4 font-medium">Status</th>
              <th className="px-4 md:px-6 py-3 md:py-4 font-medium hidden sm:table-cell">Hours</th>
              <th className="px-4 md:px-6 py-3 md:py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 md:px-6 py-3 md:py-4">
                  <div className="font-medium text-gray-900">Week {report.weekNumber}</div>
                  <div className="text-xs text-gray-500">{report.year}</div>
                </td>
                {canViewAllReports && (
                  <td className="px-4 md:px-6 py-3 md:py-4 font-medium text-gray-900 hidden md:table-cell">
                    {report.user?.firstName} {report.user?.lastName}
                  </td>
                )}
                <td className="px-4 md:px-6 py-3 md:py-4 text-gray-600">
                  <div className="truncate max-w-[120px] md:max-w-none">{report.project?.name || 'N/A'}</div>
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4">
                  <Badge 
                    variant={
                      report.status === 'SUBMITTED' ? 'default' : 
                      report.status === 'LATE' ? 'destructive' : 'outline'
                    }
                    className={`rounded-md ${
                      report.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                      report.status === 'LATE' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {report.status}
                  </Badge>
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-gray-600 hidden sm:table-cell">
                  {report.hoursWorked}h
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                  <Link href={`/reports/${report.id}`}>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-7 md:h-8 text-xs md:text-sm px-2 md:px-3">
                      View
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 md:px-6 py-4 border-t border-gray-100 gap-3">
          <div className="text-sm text-gray-500 hidden md:block">
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} reports
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-2 sm:px-3 rounded-md"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 p-0 rounded-md ${currentPage === pageNum ? 'bg-blue-600 text-white' : ''}`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-2 sm:px-3 rounded-md"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
export default ReportsList;
