'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { QrCode, History, X, Dumbbell, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function MemberDashboard() {
  const { user } = useAuth();
  const [memberProfile, setMemberProfile] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    async function loadMemberData() {
      if (!user?.id) return;
      
      try {
        // 1. Get member profile
        const { data: profile, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (memberError && memberError.code !== 'PGRST116') throw memberError;

        if (profile) {
          setMemberProfile(profile);
          
          // 2. Get active subscription
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('member_id', profile.id)
            .eq('status', 'active')
            .order('end_date', { ascending: false })
            .limit(1)
            .single();
            
          if (subData) setMembership(subData);

          // 3. Get recent attendance
          const { data: attData } = await supabase
            .from('attendance')
            .select('*')
            .eq('member_id', profile.id)
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

  const maskPhone = (phone: string) => {
    if (!phone) return '-';
    // If Admin/Owner, show full. If Member, mask middle.
    if (user?.role === 'Admin' || user?.role === 'Owner') return phone;
    
    // Mask logic: e.g. 081234567890 -> 0812-****-7890
    if (phone.length >= 10) {
      const prefix = phone.substring(0, 4);
      const suffix = phone.substring(phone.length - 4);
      return `${prefix}-****-${suffix}`;
    }
    return phone.replace(/.(?=.{4})/g, '*');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--/--/----';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ');
  };

  return (
    <ProtectedRoute allowedRoles={['Member', 'Admin', 'Owner']}>
      <div className="min-h-screen bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white p-4 pb-28 md:p-[48px]">
        <div className="max-w-[1200px] mx-auto">
          <DashboardHeader />
          
          <div className="mb-[32px] flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-[28px] font-semibold text-[var(--color-ink)] tracking-[-0.02em]">Hai, {memberProfile?.name || user?.name || 'Member'}! 👋</h1>
              <p className="text-[var(--color-ink-muted)] mt-1 text-[15px]">Siap untuk latihan hari ini?</p>
            </div>
            
            <button 
              onClick={() => setShowQrModal(true)}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-[16px] py-[12px] rounded-[10px] font-medium transition-colors flex items-center gap-2 shadow-lg shadow-[var(--color-primary)]/20"
            >
              <QrCode size={20} />
              <span>Tampilkan QR Code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
            {/* Kiri: Membership Card */}
            <div className="lg:col-span-2 space-y-[24px]">
              <div className="relative rounded-[24px] p-[24px] md:p-[32px] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hairline-border group min-h-[220px]">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <img src="/images/member_card_bg.png" alt="Card Background" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-all duration-700 ease-out" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0f1115]/95 via-[#0f1115]/80 to-[var(--color-primary)]/30 mix-blend-multiply"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/10"></div>
                </div>
                
                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                  
                  {/* Top Section */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-4">
                      {/* Logo & Gym Name */}
                      <div className="flex items-center gap-3">
                        <img src="/images/logo gym-2.png" alt="Gaul Gym Logo" className="w-[32px] h-[32px] object-contain drop-shadow-md" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        <span className="text-[14px] font-black text-white tracking-[0.2em] uppercase drop-shadow-md">Gaul Gym</span>
                      </div>

                      {/* User Profile */}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="w-[60px] h-[60px] rounded-full border-2 border-[var(--color-primary)] overflow-hidden shadow-lg bg-gray-800 flex items-center justify-center shrink-0">
                          {memberProfile?.photo_url ? (
                            <img src={memberProfile.photo_url} alt="Member Photo" className="w-full h-full object-cover" />
                          ) : (
                            <User size={30} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-[20px] md:text-[24px] font-bold text-white leading-tight drop-shadow-md line-clamp-1">{memberProfile?.name || 'Member Name'}</h2>
                          <p className="text-[14px] text-white/70 font-medium font-mono">{maskPhone(memberProfile?.phone)}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* QR Code Mini */}
                    <div className="hidden sm:block bg-white p-2 rounded-xl shadow-lg shrink-0 cursor-pointer hover:scale-105 transition-transform" onClick={() => setShowQrModal(true)}>
                      {memberProfile?.qr_code ? (
                        <QRCodeSVG value={memberProfile.qr_code} size={64} level="L" />
                      ) : (
                        <QrCode size={64} className="text-gray-300" />
                      )}
                    </div>
                  </div>
                  
                  {/* Bottom Section: Package & Dates */}
                  <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap justify-between items-end gap-4">
                    
                    <div className="flex-1 min-w-[120px]">
                      <p className="text-[10px] text-white/50 uppercase tracking-[0.15em] mb-1 font-bold">Paket Aktif</p>
                      {loading ? (
                        <div className="h-6 w-32 bg-white/10 animate-pulse rounded"></div>
                      ) : membership ? (
                        <p className="text-[16px] md:text-[18px] font-bold text-[var(--color-primary)] tracking-wide drop-shadow-md">{membership.package_name}</p>
                      ) : (
                        <p className="text-[14px] font-medium text-white/50 italic">Belum Ada Paket Aktif</p>
                      )}
                    </div>

                    <div className="flex gap-6 text-right">
                      <div className="hidden sm:block text-left">
                        <p className="text-[10px] text-white/50 uppercase tracking-[0.1em] mb-1 font-bold">Join Date</p>
                        <p className="text-[13px] font-mono font-medium text-white/90">{formatDate(memberProfile?.join_date)}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-[10px] text-white/50 uppercase tracking-[0.1em] mb-1 font-bold">Valid Thru</p>
                        {loading ? (
                          <div className="h-5 w-24 bg-white/10 animate-pulse rounded ml-auto"></div>
                        ) : membership ? (
                          <p className="text-[15px] font-mono font-bold text-white drop-shadow-md">
                            {formatDate(membership.end_date)}
                          </p>
                        ) : (
                          <p className="text-[15px] font-mono font-medium text-white/30">--/--/----</p>
                        )}
                      </div>
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

        {/* Modal QR Code */}
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowQrModal(false)}>
            <div 
              className="bg-[var(--color-surface-1)] border border-[var(--color-hairline)] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative animate-in fade-in zoom-in duration-200"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-gray-400 hover:text-white rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-xl font-bold text-[var(--color-ink)] mb-2">Scan untuk Check-in</h3>
              <p className="text-[14px] text-[var(--color-ink-subtle)] mb-8">
                Tunjukkan QR Code ini ke petugas kasir / admin di gym.
              </p>
              
              <div className="bg-white p-6 rounded-2xl mx-auto inline-block shadow-lg">
                {memberProfile?.qr_code ? (
                  <QRCodeSVG 
                    value={memberProfile.qr_code} 
                    size={200}
                    level="H"
                    includeMargin={false}
                  />
                ) : (
                  <div className="w-[200px] h-[200px] flex items-center justify-center text-gray-400">
                    <QrCode size={48} />
                    <span className="ml-2">QR Belum Tersedia</span>
                  </div>
                )}
              </div>
              
              <div className="mt-8 font-mono text-[16px] font-bold tracking-widest text-[var(--color-primary)] bg-[var(--color-primary)]/10 py-3 rounded-xl">
                {memberProfile?.display_id || '------'}
              </div>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}