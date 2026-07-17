'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardCharts } from '@/components/DashboardCharts';
import { useDashboardOverview } from '@/hooks/useDashboard';
import { DiamondLoader } from '@/components/DiamondLoader';
import { TrendingUp, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: overview, isLoading } = useDashboardOverview();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <DiamondLoader />
      </div>
    );
  }

  const summary = overview?.summary;
  const charts = overview?.charts;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
        <p className="text-gray-500">Deep dive into team performance and trends</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs md:text-sm font-medium text-gray-500">Total Reports</p>
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{summary?.totalSubmitted || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs md:text-sm font-medium text-gray-500">Avg Hours/Week</p>
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                {summary?.totalHours && summary?.totalSubmitted 
                  ? Math.round(summary.totalHours / summary.totalSubmitted) 
                  : 0}h
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs md:text-sm font-medium text-gray-500">Compliance Rate</p>
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                {summary?.complianceRate || 0}%
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs md:text-sm font-medium text-gray-500">Active Blockers</p>
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{summary?.blockersCount || 0}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      {charts && <DashboardCharts charts={charts} />}

      {/* Insights Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="p-6">
            <CardTitle>Top Performers This Week</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {charts?.teamProductivity.slice(0, 3).map((member, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.tasks} tasks • {member.hours} hours</p>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              )) || (
                <p className="text-center text-gray-500 py-4">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardHeader className="p-6">
            <CardTitle>Project Workload</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {charts?.workloadDistribution.slice(0, 3).map((project, idx) => (
                <div key={idx} className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{project.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {project.hours}h worked • {project.tasks} tasks
                      </p>
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-center text-gray-500 py-4">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
