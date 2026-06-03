"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, Camera, Loader2, Smartphone, PenLine, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";

interface CheckInData {
  memberId: string;
  memberName: string;
  checkInTime: Date;
  membershipType: string;
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
    const gymId = user.gym_id || 'dummy-gym-id';
    const today = new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('gym_id', gymId)
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

  // Simulate QR scan line animation
  useEffect(() => {
    if (!isScanning) return;

    const animationFrame = requestAnimationFrame(function animate() {
      setScanLinePosition((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [isScanning]);

  const processCheckin = async (memberIdQuery: string) => {
    if (!user) return;
    const gymId = user.gym_id || 'dummy-gym-id';
    setIsProcessing(true);
    
    try {
      // 1. Cari Member
      const { data: members, error: memberErr } = await supabase
        .from('members')
        .select('*')
        .eq('gym_id', gymId)
        .eq('display_id', memberIdQuery);

      if (memberErr || !members || members.length === 0) {
        setLastScanResult({ success: false, message: "Member tidak ditemukan di gym ini." });
        setShowConfirmation(true);
        return;
      }

      const member = members[0];

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

      // 3. Catat di Attendance
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      const { error: insertErr } = await supabase
        .from('attendance')
        .insert({
          member_id: member.id,
          member_name: member.name,
          gym_id: gymId,
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
  };

  const handleScan = useCallback(() => {
    setIsScanning(true);
    setLastScanResult(null);
    setShowConfirmation(false);

    // Simulate scan delay then pick a random member id from db
    setTimeout(async () => {
      setIsScanning(false);
      
      if (!user) return;
      const gymId = user.gym_id || 'dummy-gym-id';
      
      const { data } = await supabase.from('members').select('display_id').eq('gym_id', gymId).limit(10);
      if (data && data.length > 0) {
        const randomMember = data[Math.floor(Math.random() * data.length)];
        processCheckin(randomMember.display_id);
      } else {
        setLastScanResult({ success: false, message: "Tidak ada member di database untuk discan (Dummy Data)." });
        setShowConfirmation(true);
      }
    }, 2500);
  }, [user, processCheckin]);

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
      <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)] p-6 md:p-[48px] selection:bg-[var(--color-primary-focus)] selection:text-white">
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
              <div className="absolute inset-0 flex items-center justify-center">
                {isScanning ? (
                  <>
                    <div
                      className="absolute left-4 right-4 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-80 shadow-[0_0_8px_var(--color-primary)]"
                      style={{ top: `${scanLinePosition}%` }}
                    />
                    <div className="text-[var(--color-primary)] text-lg font-medium animate-pulse flex items-center gap-2 bg-[var(--color-surface-1)]/80 px-4 py-2 rounded-full backdrop-blur-sm">
                      <Loader2 className="w-5 h-5 animate-spin" /> Scanning...
                    </div>
                  </>
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
            <button
              onClick={handleScan}
              disabled={isScanning || isProcessing}
              className="flex-1 max-w-[200px] py-[16px] px-[20px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-[16px] font-semibold transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_-8px_var(--color-primary)] hover:-translate-y-1"
            >
              {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Smartphone className="w-5 h-5" />}
              <span>{isScanning ? "Scanning" : "Scan QR"}</span>
            </button>

            <button
              onClick={() => setShowManualModal(true)}
              disabled={isScanning || isProcessing}
              className="flex-1 max-w-[200px] py-[16px] px-[20px] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-ink)] disabled:opacity-50 disabled:cursor-not-allowed rounded-[16px] font-semibold transition-all flex items-center justify-center gap-2 border border-[var(--color-hairline)]"
            >
              <PenLine className="w-5 h-5" />
              <span>Input Manual</span>
            </button>
          </div>

          {/* Confirmation Card */}
          {showConfirmation && lastScanResult && (
            <div className={`rounded-[24px] p-[32px] border animate-fade-in ${lastScanResult.success ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
              <div className="text-center mb-[24px]">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-[16px] text-white shadow-xl ${lastScanResult.success ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/30' : 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30'}`}>
                  {lastScanResult.success ? <Check className="w-8 h-8" /> : <X className="w-8 h-8" />}
                </div>
                <h2 className={`text-[24px] font-bold mb-2 tracking-[-0.02em] ${lastScanResult.success ? 'text-green-500' : 'text-red-500'}`}>
                  {lastScanResult.message}
                </h2>
                {lastScanResult.success && lastScanResult.data && (
                  <p className="text-[var(--color-ink-muted)] text-[15px]">
                    {lastScanResult.data.checkInTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>

              {lastScanResult.success && lastScanResult.data && (
                <div className="space-y-[24px]">
                  <div className="bg-[var(--color-surface-1)] rounded-[16px] p-[24px] border border-[var(--color-hairline)]">
                    <div className="grid grid-cols-2 gap-[20px]">
                      <div>
                        <p className="text-[var(--color-ink-subtle)] text-[13px] mb-1">ID Member</p>
                        <p className="text-[16px] font-semibold text-[var(--color-ink)]">{lastScanResult.data.memberId}</p>
                      </div>
                      <div>
                        <p className="text-[var(--color-ink-subtle)] text-[13px] mb-1">Paket</p>
                        <span className="inline-block px-[10px] py-[4px] rounded-full text-[12px] font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                          {lastScanResult.data.membershipType}
                        </span>
                      </div>
                      <div className="col-span-2 pt-[16px] border-t border-[var(--color-hairline)]">
                        <p className="text-[var(--color-ink-subtle)] text-[13px] mb-1">Nama Member</p>
                        <p className="text-[20px] font-bold text-[var(--color-ink)] tracking-[-0.01em]">{lastScanResult.data.memberName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={resetScanner}
                className="w-full mt-[24px] py-[14px] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-ink)] rounded-[12px] font-semibold transition-colors focus-ring"
              >
                Tutup
              </button>
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
                        <div className="w-[42px] h-[42px] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-full flex items-center justify-center">
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
            <p className="text-[14px] text-[var(--color-ink-muted)] mb-[24px]">Masukkan ID Member (contoh: MBR-123)</p>
            
            <form onSubmit={handleManualEntrySubmit}>
              <input
                type="text"
                autoFocus
                placeholder="ID Member..."
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