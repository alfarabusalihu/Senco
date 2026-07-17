'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/api';
import { DiamondLoader } from '@/components/DiamondLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Clock, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportHistoryPage() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['report-history'],
    queryFn: () => reportsService.getReportHistory(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <DiamondLoader />
      </div>
    );
  }

  // Group reports by year and week
  interface ReportGroup {
    year: number;
    weekNumber: number;
    startDate: string;
    endDate: string;
    reports: NonNullable<typeof reports>;
  }

  const groupedReports = reports?.reduce((acc, report) => {
    const key = `${report.year}-W${report.weekNumber}`;
    if (!acc[key]) {
      acc[key] = {
        year: report.year,
        weekNumber: report.weekNumber,
        startDate: report.startDate,
        endDate: report.endDate,
        reports: [],
      };
    }
    acc[key].reports.push(report);
    return acc;
  }, {} as Record<string, ReportGroup>);

  const sortedGroups = Object.values(groupedReports || {}).sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return b.weekNumber - a.weekNumber;
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report History</h1>
          <p className="text-gray-500">View all your past weekly reports organized by week</p>
        </div>
      </div>

      {!sortedGroups || sortedGroups.length === 0 ? (
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-12 text-center">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4 mx-auto">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No reports yet</h3>
            <p className="text-gray-500 mt-1">Your report history will appear here once you create reports.</p>
            <Link href="/reports">
              <Button className="btn-primary mt-4">Create Your First Report</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedGroups.map((group) => (
            <Card key={`${group.year}-W${group.weekNumber}`} className="shadow-sm border-gray-200">
              <CardHeader className="p-4 md:p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Week {group.weekNumber}, {group.year}</CardTitle>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {formatDate(group.startDate)} - {formatDate(group.endDate)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    {group.reports.length} {group.reports.length === 1 ? 'Report' : 'Reports'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="space-y-3">
                  {group.reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-gray-900 truncate">
                              {report.project?.name || 'No Project'}
                            </h4>
                            <Badge
                              variant={
                                report.status === 'SUBMITTED' ? 'default' :
                                report.status === 'LATE' ? 'destructive' : 'outline'
                              }
                              className={
                                report.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                report.status === 'LATE' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
                                'bg-gray-100 text-gray-800'
                              }
                            >
                              {report.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {report.hoursWorked}h worked
                            </span>
                            {report.submittedAt && (
                              <span className="text-xs">
                                Submitted {formatDate(report.submittedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link href={`/reports/${report.id}`}>
                        <Button variant="outline" size="sm" className="shrink-0">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
