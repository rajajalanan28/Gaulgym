'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('Admin' | 'Member' | 'Owner')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Show a single loading state for both loading and unauthenticated states.
  // The useEffect above handles the redirect when !loading && !user.
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-canvas)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full" style={{
            border: '4px solid var(--color-hairline)',
            borderTopColor: 'var(--color-primary)',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p className="text-[var(--color-ink-muted)] font-medium text-[14px]">
            {loading ? 'Memuat data...' : 'Mengarahkan ke halaman login...'}
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Check roles if specified
  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-canvas)]">
        <div className="text-center">
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h2 className="text-[22px] font-semibold text-red-400 mb-2 tracking-[-0.01em]">Akses Ditolak</h2>
          <p className="text-[var(--color-ink-muted)] mb-6 text-[15px]">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          <a href="/dashboard" className="px-[16px] py-[8px] bg-[var(--color-primary)] text-white rounded-md text-[14px] font-medium hover:bg-[var(--color-primary-hover)] transition-colors">
            Kembali ke Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
