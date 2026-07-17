'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReport, useReportMutations } from '@/hooks/useReports';
import { useAuthStore } from '@/stores/auth.store';
import { DiamondLoader } from '@/components/DiamondLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Clock, Edit, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { EditReportModal } from '@/components/EditReportModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import toast from 'react-hot-toast';
import { isManagerRole } from '@/lib/permissions';

export function ReportDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: report, isLoading } = useReport(id);
  const { deleteReport } = useReportMutations();
  const user = useAuthStore((state) => state.user);
  const canManageAllReports = isManagerRole(user?.role);
  const isOwnReport = report?.user?.id === user?.id;
  const canEditDelete = canManageAllReports || (isOwnReport && report?.status === 'DRAFT');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteReport.mutateAsync(id);
      toast.success('Report deleted successfully');
      router.push('/reports');
    } catch {
      toast.error('Failed to delete report');
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <DiamondLoader />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Report not found</h3>
        <Button variant="link" onClick={() => router.push('/reports')} className="mt-4">
          Return to reports
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/reports')} 
            className="shrink-0 mt-0.5 md:mt-1"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-words">
              Week {report.weekNumber}, {report.year}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block truncate">
              {report.user?.firstName} {report.user?.lastName} • {report.project?.name || 'No Project'}
            </p>
          </div>
        </div>
        
        {canEditDelete && (
          <div className="flex items-center gap-2 shrink-0">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 rounded-md"
            >
              <Edit className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline text-sm">Edit</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-md"
            >
              <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline text-sm">Delete</span>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="p-6">
              <CardTitle className="text-lg">Tasks Completed</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-lg min-h-[80px]">
                {report.tasksCompleted}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader className="p-6">
              <CardTitle className="text-lg">Tasks Planned</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-lg min-h-[80px]">
                {report.tasksPlanned}
              </div>
            </CardContent>
          </Card>

          {report.blockers && (
            <Card className="shadow-sm border-red-200">
              <CardHeader className="p-6">
                <CardTitle className="text-lg text-red-700">Blockers</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="whitespace-pre-wrap text-red-700 bg-red-50 p-4 rounded-lg border border-red-100 min-h-[60px]">
                  {report.blockers}
                </div>
              </CardContent>
            </Card>
          )}

          {report.notes && (
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="p-6">
                <CardTitle className="text-lg">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-lg italic min-h-[60px]">
                  {report.notes}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="p-6">
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {/* Status Badge */}
              <div className={`p-3 rounded-lg border ${
                report.status === 'SUBMITTED' 
                  ? 'bg-blue-50 border-blue-200' 
                  : report.status === 'LATE'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    report.status === 'SUBMITTED'
                      ? 'text-blue-900'
                      : report.status === 'LATE'
                      ? 'text-red-900'
                      : 'text-orange-900'
                  }`}>
                    Status
                  </span>
                  <Badge 
                    variant={report.status === 'SUBMITTED' ? 'default' : report.status === 'LATE' ? 'destructive' : 'outline'}
                    className={`rounded-md ${
                      report.status === 'SUBMITTED' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                      report.status === 'LATE' ? 'bg-red-600 text-white hover:bg-red-700' :
                      'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    {report.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2" /> Hours Worked
                </span>
                <span className="font-semibold text-gray-900">{report.hoursWorked}h</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="h-4 w-4 mr-2" /> Week Period
                </div>
                <div className="text-sm text-gray-900">
                  {formatDate(report.startDate)} - {formatDate(report.endDate)}
                </div>
              </div>

              {report.submittedAt && report.status !== 'DRAFT' && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center text-green-700 text-sm mb-1">
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Submitted
                  </div>
                  <div className="text-sm text-green-900 font-medium">
                    {formatDate(report.submittedAt)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {canEditDelete && report && (
        <>
          <EditReportModal 
            open={isEditModalOpen} 
            onOpenChange={setIsEditModalOpen} 
            report={report} 
          />
          <ConfirmDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            title="Delete Report"
            description="Are you sure you want to delete this report? This action cannot be undone and you will be redirected to the reports list."
            onConfirm={handleDelete}
            confirmText="Delete"
            variant="destructive"
          />
        </>
      )}
    </div>
  );
}
export default ReportDetail;
