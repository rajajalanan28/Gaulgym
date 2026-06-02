'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Get user role from localStorage (adjust key as needed for your auth system)
    const userRole = localStorage.getItem('userRole') || localStorage.getItem('role');
    const userData = localStorage.getItem('user');

    if (userRole === 'Owner' || userRole === 'Admin') {
      console.log('Redirecting to /dashboard (owner/admin)');
      router.push('/dashboard');
    } else if (userRole === 'Member') {
      console.log('Redirecting to /member/dashboard (member)');
      router.push('/member/dashboard');
    } else {
      console.log('Redirecting to /login (unauthenticated)');
      router.push('/login');
    }
  }, [router]);

  // Optional: Show loading state while redirecting
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p>Redirecting...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}