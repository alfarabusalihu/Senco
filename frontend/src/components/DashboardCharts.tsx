'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardCharts as DashboardChartsType } from '@/types/Dashboard';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

interface DashboardChartsProps {
  charts: DashboardChartsType;
}

// Dynamic import for Recharts - saves ~150KB on initial load
const PieChart = dynamic(() => import('recharts').then(mod => ({ default: mod.PieChart })), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
const Pie = dynamic(() => import('recharts').then(mod => ({ default: mod.Pie })), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => ({ default: mod.Cell })), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => ({ default: mod.AreaChart })), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
const Area = dynamic(() => import('recharts').then(mod => ({ default: mod.Area })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis })), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip })), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })), { ssr: false });

function ChartSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded animate-pulse">
      <div className="text-gray-400">Loading chart...</div>
    </div>
  );
}

export function DashboardCharts({ charts }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Submissions by Status (Pie Chart) */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="p-6">
          <CardTitle>Report Status</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 h-80">
          {charts.submissionStatus.length > 0 ? (
            <Suspense fallback={<ChartSkeleton />}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.submissionStatus}
                    cx="50%"
                    cy="45%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => `${entry.name || ''}: ${entry.value || 0}`}
                  >
                    {charts.submissionStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Activity (Area Chart) */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="p-6">
          <CardTitle>Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 h-80">
          {charts.tasksTrend.length > 0 ? (
            <Suspense fallback={<ChartSkeleton />}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.tasksTrend}>
                  <defs>
                    <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="completed" stroke="#2563EB" fillOpacity={1} fill="url(#colorReports)" />
                </AreaChart>
              </ResponsiveContainer>
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
