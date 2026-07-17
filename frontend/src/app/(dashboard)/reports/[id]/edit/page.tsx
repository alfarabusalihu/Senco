import React from 'react';
import type { Metadata } from 'next';
import { EditReportForm } from './EditReportForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit Report #${id}`,
    description: `Edit weekly report #${id}.`,
  };
}

export default async function EditReportPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Report</h1>
        <p className="text-gray-500">Update your weekly report details</p>
      </div>
      <EditReportForm id={id} />
    </div>
  );
}
