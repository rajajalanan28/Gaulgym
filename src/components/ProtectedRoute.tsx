'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import AuthForms from '@/components/auth/AuthForms';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('Admin' | 'Staff' | 'Member' | 'Owner')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForms />;
  }

  // Check roles if specified
  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600 mb-4">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          <a href="/dashboard" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            Kembali ke Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
