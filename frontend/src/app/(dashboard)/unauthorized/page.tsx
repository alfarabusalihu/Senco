'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { getRoleDisplayName, isManagerRole } from '@/lib/permissions';

export default function UnauthorizedPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="max-w-md w-full shadow-lg border-red-200">
        <CardContent className="p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldAlert className="h-10 w-10 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don&apos;t have permission to access this page. This area is restricted to managers only.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">
              <strong>Your Role:</strong> {isManagerRole(user?.role) ? getRoleDisplayName(user?.role) : 'Employee'}
            </p>
            <p className="text-xs text-red-600 mt-2">
              Contact your administrator if you believe this is an error.
            </p>
          </div>
          
          <Link href="/dashboard">
            <Button className="btn-primary rounded-md w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
