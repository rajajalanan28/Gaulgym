'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, Mail, X, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export function VerifyEmailBanner() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  // Jika belum login atau sudah terverifikasi, jangan tampilkan apa-apa
  if (!user || user.emailConfirmedAt) {
    return null;
  }

  const handleSendOtp = async () => {
    try {
      setSending(true);
      setError('');
      // Supabase resend OTP
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (resendError) throw resendError;
      
      setShowModal(true);
    } catch (e: any) {
      setError(e.message || 'Gagal mengirim kode OTP.');
      setShowModal(true); // Tetap buka modal supaya user bisa lihat error atau masukin kode kalau udh punya
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Kode harus 6 digit angka');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: user.email,
        token: otp,
        type: 'signup',
      });

      if (verifyError) throw verifyError;

      setSuccess(true);
      // Refresh halaman untuk mengupdate state session (atau bisa pakai supabase.auth.refreshSession)
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (e: any) {
      setError(e.message || 'Kode OTP tidak valid atau kadaluarsa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Banner Peringatan */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 text-amber-500">
          <AlertTriangle className="shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-sm">Akun Belum Diverifikasi</h3>
            <p className="text-sm opacity-80 mt-1">
              Verifikasi email <strong>{user.email}</strong> lu sekarang biar akun ini aman 100% dan semua fitur kebuka.
            </p>
          </div>
        </div>
        <button 
          onClick={handleSendOtp}
          disabled={sending}
          className="shrink-0 whitespace-nowrap bg-amber-500 hover:bg-amber-600 text-white border-transparent px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-ring disabled:opacity-50"
        >
          {sending ? 'Mengirim Kode...' : 'Verifikasi Sekarang'}
        </button>
      </div>

      {/* Modal Input OTP */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--color-surface-1)] border border-[var(--color-hairline)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-hairline)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg">
                  <Mail size={20} />
                </div>
                <h2 className="text-lg font-bold text-[var(--color-ink)]">Cek Email Lu!</h2>
              </div>
              <button 
                onClick={() => !success && setShowModal(false)}
                disabled={success || loading}
                className="text-[var(--color-ink)] opacity-50 hover:opacity-100 transition-opacity"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {success ? (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500 mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-ink)] mb-2">Sukses!</h3>
                  <p className="text-[var(--color-ink)] opacity-70">Email lu berhasil diverifikasi. Halaman akan otomatis dimuat ulang...</p>
                </div>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <p className="text-[var(--color-ink)] opacity-70 text-sm">
                    Gua udah ngirim 6 digit kode OTP ke <strong>{user.email}</strong>. Cek *Inbox* atau folder *Spam*, terus masukin kodenya di bawah:
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-ink)] mb-2">Kode OTP (6 Digit)</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Hanya angka
                      className="w-full bg-[var(--color-surface-2)] border border-[var(--color-hairline)] rounded-lg px-4 text-center text-2xl tracking-[0.5em] font-mono py-4 text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                      required
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm flex items-start gap-2">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-2">
                    <button type="submit" disabled={loading || otp.length < 6} className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-ring disabled:opacity-50 flex items-center justify-center">
                      {loading ? (
                        <>
                          <Loader2 size={18} className="mr-2 animate-spin" /> Memproses...
                        </>
                      ) : 'Konfirmasi Kode'}
                    </button>
                    <button 
                      type="button" 
                      onClick={handleSendOtp}
                      disabled={sending || loading}
                      className="text-sm text-[var(--color-primary)] hover:underline opacity-80 transition-opacity disabled:opacity-50"
                    >
                      {sending ? 'Mengirim ulang...' : 'Belum dapet emailnya? Kirim Ulang'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
