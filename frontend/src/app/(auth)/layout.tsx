import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F7E8A4] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl">
        {children}
      </div>
    </div>
  );
}
