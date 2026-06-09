"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, Camera, Loader2, Smartphone, PenLine, X, AlertTriangle, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Html5Qrcode } from "html5-qrcode";

interface CheckInData {
  memberId: string;
  memberName: string;
  checkInTime: Date;
  membershipType: string;
  photoUrl?: string;
  checkInCountToday: number;
}

interface ScanResult {
  success: boolean;
  message: string;
  data?: CheckInData;
}

export default function CheckInPage() {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [scanLinePosition, setScanLinePosition] = useState(0);
  
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  
  const [manualInput, setManualInput] = useState("");
  const [showManualModal, setShowManualModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch recent checkins today
  const loadRecentCheckins = useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', today)
        .order('check_in', { ascending: false })
        .limit(5);

      if (!error && data) {
        setRecentCheckins(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecent(false);
    }
  }, [user]);

  useEffect(() => {
    loadRecentCheckins();
  }, [loadRecentCheckins]);

  const processCheckin = useCallback(async (memberIdQuery: string) => {
    if (!user) return;
    setIsProcessing(true);
    
    try {
      // 1. Cari Member by display_id, qr_code, OR phone number
      // Use separate queries to avoid injection via string interpolation in .or()
      const sanitizedQuery = memberIdQuery.replace(/[^a-zA-Z0-9\-_+]/g, '');
      const { data: membersByDisplayId } = await supabase
        .from('members')
        .select('*')
        .eq('display_id', sanitizedQuery);

      const { data: membersByQrCode } = await supabase
        .from('members')
        .select('*')
        .eq('qr_code', sanitizedQuery);

      // Also search by phone number (allow original input with special chars for phone)
      const phoneQuery = memberIdQuery.replace(/[^0-9+]/g, '');
      let membersByPhone: any[] = [];
      if (phoneQuery.length >= 8) {
        const { data } = await supabase
          .from('members')
          .select('*')
          .eq('phone', memberIdQuery.trim());
        membersByPhone = data || [];
        
        // Also try without leading 0 -> +62 and vice versa
        if (membersByPhone.length === 0) {
          let altPhone = '';
          if (phoneQuery.startsWith('0')) {
            altPhone = '+62' + phoneQuery.substring(1);
          } else if (phoneQuery.startsWith('62')) {
            altPhone = '0' + phoneQuery.substring(2);
          } else if (phoneQuery.startsWith('+62')) {
            altPhone = '0' + phoneQuery.substring(3);
          }
          if (altPhone) {
            const { data: altData } = await supabase
              .from('members')
              .select('*')
              .eq('phone', altPhone);
            membersByPhone = altData || [];
          }
        }
      }

      const members = [...(membersByDisplayId || []), ...(membersByQrCode || []), ...membersByPhone];
      // Deduplicate by id
      const uniqueMembers = members.filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i);

      if (uniqueMembers.length === 0) {
        setLastScanResult({ success: false, message: "Member tidak ditemukan." });
        setShowConfirmation(true);
        return;
      }

      const member = uniqueMembers[0];

      // 2. Cari Subscription aktif
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('member_id', member.id)
        .eq('status', 'active')
        .order('end_date', { ascending: false })
        .limit(1)
        .single();

      if (!subData) {
        setLastScanResult({ success: false, message: `Member ${member.name} tidak memiliki paket aktif.` });
        setShowConfirmation(true);
        return;
      }

      const todayStr = new Date().toISOString().split('T')[0];
      if (subData.end_date < todayStr) {
        setLastScanResult({ success: false, message: `Paket Member ${member.name} sudah kedaluwarsa pada ${new Date(subData.end_date).toLocaleDateString('id-ID')}.` });
        setShowConfirmation(true);
        return;
      }

      // 3. Hitung jumlah check-in hari ini (Validasi)
      const today = new Date().toISOString().split('T')[0];
      const { data: todayCheckins } = await supabase
        .from('attendance')
        .select('id')
        .eq('member_id', member.id)
        .eq('date', today);
        
      const checkInCount = todayCheckins ? todayCheckins.length : 0;

      // 4. Catat di Attendance
      const now = new Date().toISOString();
      const { error: insertErr } = await supabase
        .from('attendance')
        .insert({
          member_id: member.id,
          member_name: member.name,
          date: today,
          check_in: now,
          check_in_by: 'Admin',
          checked_in_by_admin_id: user.id,
          status: 'checked_in'
        });

      if (insertErr) throw insertErr;

      // Berhasil
      setLastScanResult({
        success: true,
        message: "Check-in Berhasil!",
        data: {
          memberId: member.display_id,
          memberName: member.name,
          checkInTime: new Date(now),
          membershipType: subData.package_name,
          photoUrl: member.photo_url,
          checkInCountToday: checkInCount + 1
        }
      });
      setShowConfirmation(true);
      loadRecentCheckins();

    } catch (err: any) {
      setLastScanResult({ success: false, message: err.message || "Terjadi kesalahan." });
      setShowConfirmation(true);
    } finally {
      setIsProcessing(false);
      setShowManualModal(false);
      setManualInput("");
    }
  }, [user, loadRecentCheckins]);
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    if (isScanning) {
      html5QrCode = new Html5Qrcode("reader");
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (html5QrCode) {
            html5QrCode.stop().then(() => {
              setIsScanning(false);
              processCheckin(decodedText);
            }).catch(console.error);
          }
        },
        (errorMessage) => {
          // ignore frame errors
        }
      ).catch(err => {
        console.error("Camera error:", err);
        setIsScanning(false);
        setLastScanResult({ success: false, message: "Kamera tidak diizinkan atau tidak ditemukan." });
        setShowConfirmation(true);
      });
    }

    return () => {
      if (html5QrCode) {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().then(() => {
            html5QrCode?.clear();
          }).catch(console.error);
        } else {
          html5QrCode.clear();
        }
      }
    };
  }, [isScanning, processCheckin]);


  const handleScan = useCallback(() => {
    setIsScanning(true);
    setLastScanResult(null);
    setShowConfirmation(false);
  }, []);

  const handleManualEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    processCheckin(manualInput.trim());
  };

  const resetScanner = () => {
    setShowConfirmation(false);
    setLastScanResult(null);
    setIsScanning(false);
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Owner']}>
      <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)] p-6 md:p-[48px] selection:bg-[var(--color-primary-focus)] selection:text-white pb-28 md:pb-[48px]">
        <DashboardHeader />
        
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[28px] font-semibold text-center mb-2 tracking-[-0.02em]">QR Check-In</h1>
            <p className="text-[var(--color-ink-muted)] text-center text-[15px]">
              Scan member QR code atau input manual ID member
            </p>
          </div>

          {/* Scanner Area */}
          <div className="relative mb-8">
            <div
              className={`relative w-72 h-72 mx-auto bg-[var(--color-surface-1)] rounded-[24px] overflow-hidden border-[4px] transition-colors shadow-2xl ${
                isScanning ? "border-[var(--color-primary)]" : "border-[var(--color-hairline)]"
              }`}
            >
              {/* Corner markers */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-[var(--color-primary)] rounded-tl-lg opacity-80" />
              <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-[var(--color-primary)] rounded-tr-lg opacity-80" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-[var(--color-primary)] rounded-bl-lg opacity-80" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-[var(--color-primary)] rounded-br-lg opacity-80" />

              {/* Scan area */}
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                {isScanning ? (
                  <div id="reader" className="w-full h-full"></div>
                ) : showConfirmation && lastScanResult ? (
                  <div className={lastScanResult.success ? "text-green-500" : "text-red-500"}>
                    {lastScanResult.success ? <Check className="w-24 h-24 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" /> : <X className="w-24 h-24 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />}
                  </div>
                ) : (
                  <div className="text-[var(--color-ink-subtle)]"><Camera className="w-16 h-16 opacity-50" /></div>
                )}
              </div>
            </div>

            {/* Status indicator */}
            <div className="mt-6 text-center">
              <span
                className={`inline-block px-[16px] py-[8px] rounded-full text-[13px] font-medium transition-colors ${
                  isScanning
                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    : showConfirmation && lastScanResult?.success
                    ? "bg-green-500/10 text-green-500"
                    : showConfirmation && !lastScanResult?.success
                    ? "bg-red-500/10 text-red-500"
                    : "bg-[var(--color-surface-2)] text-[var(--color-ink-muted)]"
                }`}
              >
                {isScanning
                  ? "● Memindai..."
                  : showConfirmation && lastScanResult?.success
                  ? "✓ Check-in Selesai"
                  : showConfirmation && !lastScanResult?.success
                  ? "✗ Gagal Memindai"
                  : "○ Siap Memindai"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-[16px] justify-center mb-[40px]">
            {isScanning ? (
              <button
                onClick={() => setIsScanning(false)}
                className="flex-1 max-w-[200px] py-[16px] px-[20px] bg-red-500 hover:bg-red-600 text-white rounded-[16px] font-semibold transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_-8px_rgba(239,68,68,0.5)] hover:-translate-y-1"
              >
                <X className="w-5 h-5" />
                <span>Batal Scan</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleScan}
                  disabled={isProcessing}
                  className="flex-1 max-w-[200px] py-[16px] px-[20px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-[16px] font-semibold transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_-8px_var(--color-primary)] hover:-translate-y-1"
                >
                  <Camera className="w-5 h-5" />
                  <span>Scan QR Code</span>
                </button>

                <button
                  onClick={() => setShowManualModal(true)}
                  disabled={isProcessing}
                  className="flex-1 max-w-[200px] py-[16px] px-[20px] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-ink)] disabled:opacity-50 disabled:cursor-not-allowed rounded-[16px] font-semibold transition-all flex items-center justify-center gap-2 border border-[var(--color-hairline)]"
                >
                  <PenLine className="w-5 h-5" />
                  <span>Input Manual</span>
                </button>
              </>
            )}
          </div>

          {/* Confirmation Card with Photo Validation */}
          {showConfirmation && lastScanResult && (
            <div className={`rounded-[24px] overflow-hidden border animate-fade-in ${lastScanResult.success ? 'bg-green-500/5 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]' : 'bg-red-500/5 border-red-500/20 p-[32px]'}`}>
              
              {!lastScanResult.success ? (
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-[16px] text-white shadow-xl bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30`}>
                    <X className="w-8 h-8" />
                  </div>
                  <h2 className={`text-[24px] font-bold mb-2 tracking-[-0.02em] text-red-500`}>
                    {lastScanResult.message}
                  </h2>
                  <button
                    onClick={resetScanner}
                    className="w-full mt-[24px] py-[14px] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-ink)] rounded-[12px] font-semibold transition-colors focus-ring"
                  >
                    Tutup
                  </button>
                </div>
              ) : (
                <div className="p-[24px] md:p-[32px]">
                  {/* Photo Profile for Validation */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-green-500 p-1 mb-4 relative shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                      <div className="w-full h-full rounded-full overflow-hidden bg-[var(--color-surface-2)] flex items-center justify-center relative">
                        {lastScanResult.data?.photoUrl ? (
                          <img src={lastScanResult.data.photoUrl} alt="Member Face" className="w-full h-full object-cover" />
                        ) : (
                          <User size={48} className="text-[var(--color-ink-muted)]" />
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white border-4 border-[var(--color-canvas)]">
                        <Check size={20} strokeWidth={3} />
                      </div>
                    </div>
                    <h2 className="text-[24px] font-bold text-center text-green-500">
                      Check-in Berhasil!
                    </h2>
                  </div>

                  {/* Anti-Cheat / Multiple Checkins Alert */}
                  {lastScanResult.data!.checkInCountToday > 1 && (
                    <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-3 rounded-xl flex items-start gap-3 mb-6">
                      <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                      <div className="text-sm">
                        <span className="font-bold block mb-1">Perhatian (Anti-Kecurangan):</span>
                        Member ini sudah check-in sebanyak <strong className="text-orange-300">{lastScanResult.data!.checkInCountToday} kali</strong> hari ini. Pastikan wajah di foto sesuai dengan orang yang datang.
                      </div>
                    </div>
                  )}

                  <div className="space-y-[24px]">
                    <div className="bg-[var(--color-surface-1)] rounded-[16px] p-[24px] border border-[var(--color-hairline)]">
                      <div className="grid grid-cols-2 gap-[20px]">
                        <div>
                          <p className="text-[var(--color-ink-subtle)] text-[13px] mb-1">Nama Member</p>
                          <p className="text-[18px] font-bold text-[var(--color-ink)] tracking-[-0.01em]">{lastScanResult.data!.memberName}</p>
                        </div>
                        <div>
                          <p className="text-[var(--color-ink-subtle)] text-[13px] mb-1">Paket</p>
                          <span className="inline-block px-[10px] py-[4px] rounded-full text-[12px] font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                            {lastScanResult.data!.membershipType}
                          </span>
                        </div>
                        <div className="pt-[16px] border-t border-[var(--color-hairline)]">
                          <p className="text-[var(--color-ink-subtle)] text-[13px] mb-1">ID Member</p>
                          <p className="text-[15px] font-semibold text-[var(--color-ink)]">{lastScanResult.data!.memberId}</p>
                        </div>
                        <div className="pt-[16px] border-t border-[var(--color-hairline)]">
                          <p className="text-[var(--color-ink-subtle)] text-[13px] mb-1">Waktu Check-in</p>
                          <p className="text-[15px] font-semibold text-[var(--color-ink)]">
                            {lastScanResult.data!.checkInTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={resetScanner}
                    className="w-full mt-[24px] py-[14px] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-ink)] rounded-[12px] font-semibold transition-colors focus-ring"
                  >
                    Tutup Validasi
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Recent Check-ins */}
          {!showConfirmation && (
            <div className="bg-[var(--color-surface-1)] hairline-border rounded-[24px] p-[32px]">
              <h3 className="text-[18px] font-semibold mb-[20px] tracking-[-0.01em]">Check-in Terakhir Hari Ini</h3>
              <div className="space-y-[12px]">
                {loadingRecent ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-4 items-center bg-[var(--color-surface-2)]/50 rounded-[12px] p-[16px]">
                      <div className="w-10 h-10 bg-[var(--color-surface-3)] animate-pulse rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-[var(--color-surface-3)] animate-pulse rounded"></div>
                        <div className="h-3 w-16 bg-[var(--color-surface-3)] animate-pulse rounded"></div>
                      </div>
                    </div>
                  ))
                ) : recentCheckins.length > 0 ? (
                  recentCheckins.map((checkin) => (
                    <div
                      key={checkin.id}
                      className="flex items-center justify-between bg-[var(--color-surface-2)] rounded-[12px] p-[16px] hover:bg-[var(--color-surface-3)] transition-colors border border-[var(--color-hairline)]"
                    >
                      <div className="flex items-center gap-[16px]">
                        <div className="w-[42px] h-[42px] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-full flex items-center justify-center overflow-hidden">
                          {/* If photo is available, ideally we'd show it here, but we don't fetch photo_url for recent checkins yet. So we show initials. */}
                          <span className="text-[var(--color-primary)] font-bold text-[16px]">
                            {checkin.member_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-[15px] text-[var(--color-ink)] tracking-[-0.01em]">{checkin.member_name}</p>
                          <p className="text-[13px] text-[var(--color-ink-subtle)] mt-[2px]">
                            {new Date(checkin.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-[8px] text-[13px] font-medium text-green-500 bg-green-500/10 px-[10px] py-[4px] rounded-full">
                        <Check size={14} /> Berhasil
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-[32px] text-[var(--color-ink-muted)]">
                    <p className="text-[14px]">Belum ada check-in hari ini</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Input Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--color-surface-1)] w-full max-w-md rounded-[24px] p-[32px] border border-[var(--color-hairline)] shadow-2xl">
            <h3 className="text-[20px] font-bold text-[var(--color-ink)] mb-[8px] tracking-[-0.01em]">Input Manual Check-in</h3>
            <p className="text-[14px] text-[var(--color-ink-muted)] mb-[24px]">Masukkan ID Member, No. HP, atau Scan ID QR</p>
            
            <form onSubmit={handleManualEntrySubmit}>
              <input
                type="text"
                autoFocus
                placeholder="ID Member / No. HP..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="w-full px-[16px] py-[12px] bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-[12px] border border-[var(--color-hairline)] focus-ring mb-[24px] font-medium text-[16px]"
              />
              
              <div className="flex gap-[12px]">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 py-[12px] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-ink)] rounded-[12px] font-medium transition-colors focus-ring"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !manualInput.trim()}
                  className="flex-1 py-[12px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white disabled:opacity-50 rounded-[12px] font-medium transition-colors focus-ring flex justify-center items-center gap-2"
                >
                  {isProcessing && <Loader2 size={16} className="animate-spin" />}
                  Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </ProtectedRoute>
  );
}