'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { getAdminStats } from '@/lib/supabase';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalMembers: 0, checkinsToday: 0, newMembers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      // Dalam implementasi nyata, admin seharusnya punya gym_id di object user mereka.
      // Kita asumsikan user.gym_id sudah di-set saat login untuk staff.
      // Jika tidak ada, kita fallback dengan ID sembarangan untuk sementara (akan kosong).
      const gymId = user?.gym_id || 'dummy-gym-id';
      
      try {
        const data = await getAdminStats(gymId);
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      loadStats();
    }
  }, [user]);

  const statCards = [
    { title: 'Check-in Hari Ini', value: loading ? '...' : stats.checkinsToday.toString(), change: '+0', positive: true },
    { title: 'Member Aktif', value: loading ? '...' : stats.totalMembers.toString(), change: '+0', positive: true },
    { title: 'Member Baru (30 Hari)', value: loading ? '...' : stats.newMembers.toString(), change: '+0', positive: true },
  ];

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Owner']}>
      <div className="p-[32px] md:p-[48px] max-w-[1200px] mx-auto min-h-screen bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white">
        <DashboardHeader />
        
        <div className="mb-[32px]">
          <h1 className="text-[28px] font-semibold text-[var(--color-ink)] tracking-[-0.02em]">Admin Dashboard</h1>
          <p className="text-[var(--color-ink-muted)] mt-1 text-[15px]">Kelola cabang gym Anda dari sini.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] mb-[48px]">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-[var(--color-surface-1)] hairline-border rounded-[12px] p-[24px]">
              <p className="text-[13px] font-medium text-[var(--color-ink-subtle)] mb-[8px]">{stat.title}</p>
              <p className="text-[32px] font-semibold text-[var(--color-ink)] tracking-[-0.02em] leading-[1]">{stat.value}</p>
              {/* <p className={`text-[13px] font-medium mt-[8px] ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </p> */}
            </div>
          ))}
        </div>

        {/* Tambahan: Shortcut Button buat Check-in / Members */}
        <div>
          <h2 className="text-[15px] font-medium text-[var(--color-ink)] mb-[16px]">Menu Utama</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
            <button
              onClick={() => window.location.href = '/admin/checkin'}
              className="bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] transition-colors hairline-border rounded-[12px] p-[20px] text-left flex flex-col gap-[8px] focus-ring"
            >
              <span className="text-[var(--color-primary)] bg-[var(--color-primary)]/10 p-[8px] rounded-[8px] w-fit">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="m3 15 2 2 4-4"/></svg>
              </span>
              <span className="text-[16px] font-medium text-[var(--color-ink)] mt-[4px]">Scan Check-in</span>
              <span className="text-[13px] text-[var(--color-ink-subtle)]">Scan QR code member yang datang</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/admin/members'}
              className="bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] transition-colors hairline-border rounded-[12px] p-[20px] text-left flex flex-col gap-[8px] focus-ring"
            >
              <span className="text-[var(--color-primary)] bg-[var(--color-primary)]/10 p-[8px] rounded-[8px] w-fit">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </span>
              <span className="text-[16px] font-medium text-[var(--color-ink)] mt-[4px]">Data Member</span>
              <span className="text-[13px] text-[var(--color-ink-subtle)]">Kelola dan daftar member gym</span>
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}