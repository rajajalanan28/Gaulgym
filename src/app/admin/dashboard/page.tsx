'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { getAdminStats, supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalMembers: 0, checkinsToday: 0, newMembers: 0 });
  const [activeShift, setActiveShift] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      // Dalam implementasi nyata, admin seharusnya punya gym_id di object user mereka.
      // Kita asumsikan user.gym_id sudah di-set saat login untuk Admin.
      // Jika tidak ada, kita fallback dengan ID sembarangan untuk sementara (akan kosong).
      let gymId = user?.gymId;
      
      if (!gymId) {
        const { data: firstGym } = await supabase.from('gyms').select('id').limit(1).single();
        if (firstGym) gymId = firstGym.id;
      }
      
      if (!gymId) gymId = 'dummy-gym-id';
      
      try {
        const { data: statsData, error: statsError } = await getAdminStats(gymId);
        if (statsError) throw statsError;
        if (statsData) setStats(statsData);

        // Fetch shift status
        const { getCurrentActiveShiftAction } = await import('@/app/actions/shifts');
        const shiftRes = await getCurrentActiveShiftAction(gymId, user?.id || '');
        if (shiftRes.success && shiftRes.data) {
          setActiveShift(shiftRes.data);
        } else {
          setActiveShift(null);
        }

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
    { title: 'Check-in Hari Ini', value: loading ? '...' : stats.checkinsToday.toString() },
    { title: 'Member Aktif', value: loading ? '...' : stats.totalMembers.toString() },
    { title: 'Member Baru (30 Hari)', value: loading ? '...' : stats.newMembers.toString() },
  ];

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Owner']}>
      <div className="p-4 pb-28 md:p-[48px] max-w-[1200px] mx-auto min-h-screen bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white">
        <DashboardHeader />
        
        <div className="mb-[32px]">
          <h1 className="text-[28px] font-semibold text-[var(--color-ink)] tracking-[-0.02em]">Admin Dashboard</h1>
          <p className="text-[var(--color-ink-muted)] mt-1 text-[15px]">Kelola cabang gym Anda dari sini.</p>
        </div>

        {!loading && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between ${activeShift ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeShift ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {activeShift ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-400">Status Kasir (POS)</p>
                <p className={`font-bold ${activeShift ? 'text-green-400' : 'text-red-400'}`}>
                  {activeShift ? 'AKTIF / BUKA' : 'TUTUP'}
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/admin/pos'}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeShift ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white'}`}
            >
              {activeShift ? 'Buka POS' : 'Buka Kasir'}
            </button>
          </div>
        )}

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
            <button
              onClick={() => window.location.href = '/admin/checkin'}
              className="bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] transition-colors hairline-border rounded-[12px] p-[20px] text-left flex flex-col gap-[8px] focus-ring"
            >
              <span className="text-[var(--color-primary)] bg-[var(--color-primary)]/10 p-[8px] rounded-[8px] w-fit">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="m3 15 2 2 4-4"/></svg>
              </span>
              <span className="text-[16px] font-medium text-[var(--color-ink)] mt-[4px]">Scan Check-in</span>
              <span className="text-[13px] text-[var(--color-ink-subtle)]">Scan QR code kedatangan</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/admin/member'}
              className="bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] transition-colors hairline-border rounded-[12px] p-[20px] text-left flex flex-col gap-[8px] focus-ring"
            >
              <span className="text-[var(--color-primary)] bg-[var(--color-primary)]/10 p-[8px] rounded-[8px] w-fit">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </span>
              <span className="text-[16px] font-medium text-[var(--color-ink)] mt-[4px]">Data Member</span>
              <span className="text-[13px] text-[var(--color-ink-subtle)]">Kelola dan daftar member gym</span>
            </button>

            <button
              onClick={() => window.location.href = '/admin/pos'}
              className="bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] transition-colors hairline-border rounded-[12px] p-[20px] text-left flex flex-col gap-[8px] focus-ring"
            >
              <span className="text-green-500 bg-green-500/10 p-[8px] rounded-[8px] w-fit">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              </span>
              <span className="text-[16px] font-medium text-[var(--color-ink)] mt-[4px]">Kasir (POS)</span>
              <span className="text-[13px] text-[var(--color-ink-subtle)]">Jual minuman & suplemen</span>
            </button>

            <button
              onClick={() => window.location.href = '/admin/inventory'}
              className="bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] transition-colors hairline-border rounded-[12px] p-[20px] text-left flex flex-col gap-[8px] focus-ring"
            >
              <span className="text-orange-500 bg-orange-500/10 p-[8px] rounded-[8px] w-fit">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              </span>
              <span className="text-[16px] font-medium text-[var(--color-ink)] mt-[4px]">Data Barang</span>
              <span className="text-[13px] text-[var(--color-ink-subtle)]">Daftar stok dan harga jualan</span>
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
