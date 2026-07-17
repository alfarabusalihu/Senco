'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { usersService, reportsService } from '@/services/api';
import { DiamondLoader } from '@/components/DiamondLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Calendar, FileText, User } from 'lucide-react';
import { format } from 'date-fns';

export default function TeamMemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params?.id as string;

  // Fetch team member details
  const { data: member, isLoading: memberLoading } = useQuery({
    queryKey: ['team-member', memberId],
    queryFn: () => usersService.getUser(memberId),
    enabled: !!memberId,
  });

  // Fetch member's reports
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['member-reports', memberId],
    queryFn: () => reportsService.getReports({ userId: memberId, limit: 100 }),
    enabled: !!memberId,
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  if (memberLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <DiamondLoader />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Team member not found</h3>
        <Link href="/team">
          <Button variant="link" className="mt-4">
            Return to team
          </Button>
        </Link>
      </div>
    );
  }

  const reports = reportsData?.reports || [];
  const totalReports = reportsData?.total || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/team')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {member.firstName} {member.lastName}
          </h1>
          <p className="text-gray-500">Team member details and reports</p>
        </div>
      </div>

      {/* Member Info Card */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-2xl">
              {member.firstName[0]}{member.lastName[0]}
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">
                {member.firstName} {member.lastName}
              </CardTitle>
              <Badge variant={member.role === 'PROJECT_MANAGER' ? 'default' : 'outline'} className="mt-2">
                {member.role === 'PROJECT_MANAGER' ? 'Project Manager' : 'Team Member'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium text-gray-900">
                    {member.role === 'PROJECT_MANAGER' ? 'Project Manager' : 'Team Member'}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Reports</p>
                  <p className="font-medium text-gray-900">{totalReports}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">{formatDate(member.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="p-6">
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {reportsLoading ? (
            <div className="p-12 flex justify-center">
              <DiamondLoader />
            </div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No reports yet</h3>
              <p className="text-gray-500 mt-1">This team member hasn&apos;t submitted any reports.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Week</th>
                    <th className="px-6 py-4 font-medium">Project</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Hours</th>
                    <th className="px-6 py-4 font-medium">Submitted</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">Week {report.weekNumber}</div>
                        <div className="text-xs text-gray-500">{report.year}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {report.project?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
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
                      </td>
                      <td className="px-6 py-4 text-gray-600">{report.hoursWorked}h</td>
                      <td className="px-6 py-4 text-gray-600">
                        {report.submittedAt ? formatDate(report.submittedAt) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/reports/${report.id}`}>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
