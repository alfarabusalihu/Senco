'use client';

import React, { useState, lazy, Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, History } from 'lucide-react';
import { ReportModal } from '@/components/ReportModal';
import { DiamondLoader } from '@/components/DiamondLoader';

// Lazy load the reports list
const ReportsList = lazy(() => import('./ReportsList'));

export default function ReportsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Weekly Reports</h1>
          <p className="text-gray-500 hidden sm:block">Manage and view all weekly reports</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/reports/history">
            <Button 
              variant="outline"
              className="flex items-center gap-2 rounded-md"
              size="default"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </Button>
          </Link>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="btn-primary flex items-center gap-2 rounded-md"
            size="default"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Report</span>
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          <Suspense fallback={
            <div className="p-12 flex justify-center">
              <DiamondLoader />
            </div>
          }>
            <ReportsList />
          </Suspense>
        </CardContent>
      </Card>

      <ReportModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
