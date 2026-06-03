'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { QrCode, History, CreditCard, Dumbbell } from 'lucide-react';

export default function MemberDashboard() {
  const { user } = useAuth();
  const [membership, setMembership] = useState<any>(null);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMemberData() {
      if (!user?.id) return;
      
      try {
        // 1. Get member profile to find their gym_id and member_id
        const { data: memberProfile, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (memberError && memberError.code !== 'PGRST116') throw memberError;

        if (memberProfile) {
          // 2. Get active subscription
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('member_id', memberProfile.id)
            .eq('status', 'active')
            .order('end_date', { ascending: false })
            .limit(1)
            .single();
            
          if (subData) setMembership(subData);

          // 3. Get recent attendance
          const { data: attData } = await supabase
            .from('attendance')
            .select('*')
            .eq('member_id', memberProfile.id)
            .order('check_in', { ascending: false })
            .limit(3);
            
          if (attData) setRecentAttendance(attData);
        }
      } catch (error) {
        console.error("Failed to load member data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadMemberData();
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['Member']}>
      <div className="min-h-screen bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white p-4 pb-28 md:p-[48px]">
        <div className="max-w-[1200px] mx-auto">
          <DashboardHeader />
          
          <div className="mb-[32px] flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-[28px] font-semibold text-[var(--color-ink)] tracking-[-0.02em]">Hai, {user?.name || 'Member'}! 👋</h1>
              <p className="text-[var(--color-ink-muted)] mt-1 text-[15px]">Siap untuk latihan hari ini?</p>
            </div>
            {/* Tombol QR Code Mobile */}
            <button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-[16px] py-[12px] rounded-[10px] font-medium transition-colors flex items-center gap-2 shadow-lg shadow-[var(--color-primary)]/20">
              <QrCode size={20} />
              <span>Tampilkan QR Code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
            {/* Kiri: Membership Card */}
            <div className="lg:col-span-2 space-y-[24px]">
              <div className="bg-gradient-to-br from-[#1a1c23] to-[#121318] hairline-border rounded-[20px] p-[28px] relative overflow-hidden shadow-xl">
                {/* Decorative background */}
                <div className="absolute -right-10 -top-10 text-[var(--color-hairline-strong)] opacity-50">
                  <Dumbbell size={180} />
                </div>
                
                <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard size={18} className="text-[var(--color-primary)]" />
                      <span className="text-[13px] font-medium text-[var(--color-ink-subtle)] tracking-wider uppercase">Membership Aktif</span>
                    </div>
                    {loading ? (
                      <div className="h-8 w-48 bg-[var(--color-hairline)] animate-pulse rounded mt-2"></div>
                    ) : membership ? (
                      <h2 className="text-[32px] font-bold text-white tracking-[-0.02em] leading-tight">{membership.package_name}</h2>
                    ) : (
                      <h2 className="text-[24px] font-semibold text-white tracking-[-0.02em] leading-tight mt-1">Belum Ada Paket Aktif</h2>
                    )}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-x-12 gap-y-4">
                    <div>
                      <p className="text-[12px] text-[var(--color-ink-subtle)] mb-1">Berlaku Sampai</p>
                      {loading ? (
                        <div className="h-5 w-24 bg-[var(--color-hairline)] animate-pulse rounded"></div>
                      ) : membership ? (
                        <p className="text-[15px] font-medium text-white">{new Date(membership.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      ) : (
                        <p className="text-[15px] font-medium text-[var(--color-ink-muted)]">-</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[12px] text-[var(--color-ink-subtle)] mb-1">Status</p>
                      {loading ? (
                        <div className="h-5 w-16 bg-[var(--color-hairline)] animate-pulse rounded"></div>
                      ) : membership ? (
                        <span className="inline-block px-[10px] py-[2px] rounded-full text-[12px] font-semibold bg-green-500/20 text-green-400">Aktif</span>
                      ) : (
                        <span className="inline-block px-[10px] py-[2px] rounded-full text-[12px] font-semibold bg-red-500/20 text-red-400">Tidak Aktif</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Tambahan */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-[16px]">
                <button className="bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] transition-colors hairline-border rounded-[16px] p-[20px] flex flex-col items-center justify-center gap-[12px] aspect-square">
                  <span className="bg-[var(--color-surface-3)] p-[12px] rounded-full text-[var(--color-primary)]">
                    <CreditCard size={24} />
                  </span>
                  <span className="text-[14px] font-medium">Beli Paket</span>
                </button>
                <button className="bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] transition-colors hairline-border rounded-[16px] p-[20px] flex flex-col items-center justify-center gap-[12px] aspect-square">
                  <span className="bg-[var(--color-surface-3)] p-[12px] rounded-full text-[var(--color-primary)]">
                    <History size={24} />
                  </span>
                  <span className="text-[14px] font-medium">Riwayat</span>
                </button>
              </div>
            </div>

            {/* Kanan: Riwayat Kedatangan */}
            <div className="bg-[var(--color-surface-1)] hairline-border rounded-[20px] p-[24px]">
              <div className="flex items-center gap-2 mb-[24px]">
                <History size={18} className="text-[var(--color-ink-subtle)]" />
                <h3 className="text-[16px] font-semibold text-[var(--color-ink)]">Kunjungan Terakhir</h3>
              </div>
              
              <div className="space-y-[16px]">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <div className="w-[10px] h-[10px] rounded-full bg-[var(--color-hairline)] animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-[var(--color-hairline)] animate-pulse rounded"></div>
                        <div className="h-3 w-16 bg-[var(--color-hairline)] animate-pulse rounded"></div>
                      </div>
                    </div>
                  ))
                ) : recentAttendance.length > 0 ? (
                  recentAttendance.map((att, i) => (
                    <div key={i} className="flex gap-4 relative">
                      {i !== recentAttendance.length - 1 && (
                        <div className="absolute left-[5px] top-[14px] bottom-[-16px] w-[2px] bg-[var(--color-hairline)]"></div>
                      )}
                      <div className="w-[12px] h-[12px] rounded-full bg-[var(--color-primary)] mt-[6px] relative z-10 ring-4 ring-[var(--color-surface-1)]"></div>
                      <div>
                        <p className="text-[14px] font-medium text-[var(--color-ink)]">
                          {new Date(att.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-[13px] text-[var(--color-ink-subtle)] mt-1">
                          Check-in: {new Date(att.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[14px] text-[var(--color-ink-muted)] text-center py-8">Belum ada riwayat kunjungan.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}