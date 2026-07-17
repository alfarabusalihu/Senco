import React from 'react';
import type { Metadata } from 'next';
import { ReportDetail } from './ReportDetail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Report #${id}`,
    description: `View details of weekly report #${id}.`,
  };
}

export default async function ReportDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ReportDetail id={id} />;
}
