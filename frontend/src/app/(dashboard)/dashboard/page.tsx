'use client';

import React, { Suspense } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FolderOpen, Clock, CheckCircle2, Users } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { useProjects } from '@/hooks/useProjects';
import { useDashboardOverview } from '@/hooks/useDashboard';
import { DashboardCharts } from '@/components/DashboardCharts';
import { DashboardSkeleton, CardSkeleton } from '@/components/CardSkeleton';
import { isManagerRole } from '@/lib/permissions';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const canAccessManagerDashboard = isManagerRole(user?.role);

  // Manager: Use aggregated overview endpoint (1 API call instead of 3!)
  const { data: overview, isLoading: isOverviewLoading } = useDashboardOverview({
    activityLimit: 5,
  });

  // Employee: Fetch individual data
  const { data: allProjects, isLoading: projectsLoading } = useProjects('ACTIVE');
  const { data: myReportsData, isLoading: reportsLoading } = useReports({ 
    userId: user?.id, 
    limit: 50 
  });

  // Extract reports array from paginated response
  const myReports = myReportsData?.reports || [];

  // Calculate employee stats
  const totalReports = myReportsData?.total || 0;
  const submittedReports = myReports.filter(r => r.status === 'SUBMITTED').length;
  const draftReports = myReports.filter(r => r.status === 'DRAFT').length;
  
  // Get unique projects the employee is working on
  const myProjectIds = [...new Set(myReports.map(r => r.projectId))];
  const myProjects = allProjects?.filter(p => myProjectIds.includes(p.id)) || [];

  // Manager Dashboard (PROJECT_MANAGER or ADMINISTRATOR)
  if (canAccessManagerDashboard) {
    if (isOverviewLoading) {
      return <DashboardSkeleton />;
    }

    const summary = overview?.summary;
    const charts = overview?.charts;
    const activity = overview?.activity;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Overview of your team&apos;s weekly progress</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Total Reports</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{summary?.totalSubmitted || 0}</h3>
                </div>
                <div className="hidden md:flex h-12 w-12 rounded-full bg-blue-50 items-center justify-center flex-shrink-0 ml-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Active Projects</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{summary?.activeProjectsCount || 0}</h3>
                </div>
                <div className="hidden md:flex h-12 w-12 rounded-full bg-green-50 items-center justify-center flex-shrink-0 ml-2">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Total Hours</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{summary?.totalHours || 0}h</h3>
                </div>
                <div className="hidden md:flex h-12 w-12 rounded-full bg-orange-50 items-center justify-center flex-shrink-0 ml-2">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Team Members</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                    {summary?.activeTeamMembersCount || 0}
                  </h3>
                </div>
                <div className="hidden md:flex h-12 w-12 rounded-full bg-purple-50 items-center justify-center flex-shrink-0 ml-2">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts - Lazy loaded */}
        {charts && (
          <Suspense fallback={<div className="h-96 flex items-center justify-center text-gray-400">Loading charts...</div>}>
            <DashboardCharts charts={charts} />
          </Suspense>
        )}

        {/* Recent Activity */}
        {activity && activity.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="shadow-sm border-gray-200 lg:col-span-2">
              <CardHeader className="p-6">
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-6">
                  {activity.map((item, index) => (
                    <div key={item.id || index} className="flex gap-4">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1 font-semibold text-gray-700">
                        {item.user.firstName.charAt(0)}{item.user.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{item.user.firstName} {item.user.lastName}</span> {item.action.replace('REPORT_', '').replace('PROJECT_', '').toLowerCase().replace('_', ' ')} a {item.entityType.toLowerCase()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Employee Dashboard
  const isEmployeeLoading = projectsLoading || reportsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
        <p className="text-gray-500">Track your weekly reports and progress</p>
      </div>

      {/* Stats Cards */}
      <div className="flex justify-center">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-7xl">
          {isEmployeeLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </>
          ) : (
            <>
              <Card className="shadow-sm border-gray-200">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Total Reports</p>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{totalReports}</h3>
                    </div>
                    <div className="hidden md:flex h-12 w-12 rounded-full bg-blue-50 items-center justify-center flex-shrink-0 ml-2">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-gray-200">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Submitted</p>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{submittedReports}</h3>
                    </div>
                    <div className="hidden md:flex h-12 w-12 rounded-full bg-green-50 items-center justify-center flex-shrink-0 ml-2">
                      <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-gray-200">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Pending</p>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{draftReports}</h3>
                    </div>
                    <div className="hidden md:flex h-12 w-12 rounded-full bg-orange-50 items-center justify-center flex-shrink-0 ml-2">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-gray-200">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Active Projects</p>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{myProjects.length}</h3>
                    </div>
                    <div className="hidden md:flex h-12 w-12 rounded-full bg-purple-50 items-center justify-center flex-shrink-0 ml-2">
                      <FolderOpen className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* My Projects Section */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="p-6">
          <CardTitle>My Projects</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {myProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myProjects.map((project) => (
                <div key={project.id} className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{project.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{project.description || 'No description'}</p>
                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No active projects yet</p>
              <p className="text-sm text-gray-400 mt-1">Projects will appear here once assigned</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
