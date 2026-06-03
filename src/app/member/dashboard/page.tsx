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
              <div className="relative rounded-[24px] p-[32px] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hairline-border group min-h-[220px]">
                {/* The generated image background */}
                <div className="absolute inset-0 z-0">
                  <img src="/images/member_card_bg.png" alt="Card Background" className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700 ease-out" />
                  {/* Dark overlay to ensure text is readable */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0f1115]/90 via-[#0f1115]/70 to-[var(--color-primary)]/20 mix-blend-multiply"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/5"></div>
                </div>
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-[36px] h-[26px] rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 flex items-center justify-center shadow-sm relative overflow-hidden">
                          {/* Fake chip lines */}
                          <div className="absolute w-[1px] h-full bg-black/20 left-1/3"></div>
                          <div className="absolute w-[1px] h-full bg-black/20 right-1/3"></div>
                          <div className="absolute w-full h-[1px] bg-black/20 top-1/2"></div>
                        </div>
                        <span className="text-[11px] font-bold text-[var(--color-primary)] tracking-[0.25em] uppercase drop-shadow-md">Parenggean Elite</span>
                      </div>
                      
                      {loading ? (
                        <div className="h-8 w-48 bg-white/10 animate-pulse rounded mt-2"></div>
                      ) : membership ? (
                        <h2 className="text-[28px] sm:text-[36px] font-black text-white tracking-tight leading-none uppercase drop-shadow-lg">{membership.package_name}</h2>
                      ) : (
                        <div>
                          <h2 className="text-[24px] font-bold text-white tracking-tight leading-tight mt-1 drop-shadow-md">Belum Ada Paket</h2>
                          <p className="text-[13px] text-white/70 mt-2 font-medium max-w-[280px] leading-relaxed">Silakan hubungi admin di lokasi gym untuk memperpanjang paket Anda.</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Gym Logo / Icon */}
                    <div className="bg-black/30 backdrop-blur-md p-3 rounded-full border border-white/10 shadow-inner">
                      <Dumbbell size={24} className="text-[var(--color-primary)] drop-shadow-[0_0_8px_var(--color-primary)]" />
                    </div>
                  </div>
                  
                  <div className="mt-12 pt-6 flex justify-between items-end gap-4">
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] mb-1.5 font-bold">Berlaku Sampai</p>
                      {loading ? (
                        <div className="h-5 w-24 bg-white/10 animate-pulse rounded"></div>
                      ) : membership ? (
                        <p className="text-[16px] sm:text-[18px] font-mono font-medium text-white tracking-widest drop-shadow-md">
                          {new Date(membership.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, ' / ')}
                        </p>
                      ) : (
                        <p className="text-[16px] sm:text-[18px] font-mono font-medium text-white/30 tracking-widest">-- / -- / ----</p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] mb-1.5 font-bold">Status</p>
                      {loading ? (
                        <div className="h-6 w-16 bg-white/10 animate-pulse rounded-full ml-auto"></div>
                      ) : membership ? (
                        <span className="inline-block px-[14px] py-[6px] rounded-full text-[11px] font-black tracking-wider bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30 shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)] backdrop-blur-sm">AKTIF</span>
                      ) : (
                        <span className="inline-block px-[14px] py-[6px] rounded-full text-[11px] font-black tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 backdrop-blur-sm">EXPIRED</span>
                      )}
                    </div>
                  </div>
                </div>
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