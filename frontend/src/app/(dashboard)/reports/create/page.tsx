'use client';

import React from 'react';
import { ReportForm } from './ReportForm';

export default function CreateReportPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Weekly Report</h1>
        <p className="text-gray-500">Submit your progress for the week</p>
      </div>
      <ReportForm />
    </div>
  );
}
