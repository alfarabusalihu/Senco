import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative">
          <h1 className="text-9xl font-black text-gray-200 tracking-tighter">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-2xl font-bold text-gray-900 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-gray-100">
              Page not found
            </h2>
          </div>
        </div>
        
        <p className="text-gray-500 text-lg">
          Sorry, we couldn&apos;t find the page you were looking for. It might have been moved or doesn&apos;t exist.
        </p>
        
        <Link href="/dashboard" className="inline-block mt-8">
          <Button className="btn-primary h-12 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            <Home className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
