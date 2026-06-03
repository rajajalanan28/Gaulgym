'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Lock, User, Mail, ShieldCheck, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ text: 'Password dan konfirmasi password tidak cocok!', type: 'error' });
      return;
    }
    if (password.length < 6) {
      setMessage({ text: 'Password minimal 6 karakter', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      setMessage({ text: 'Password berhasil diubah!', type: 'success' });
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ text: err.message || 'Gagal mengubah password', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Owner', 'Admin', 'Member']}>
      <div className="p-4 pb-28 md:p-[48px] max-w-[1200px] mx-auto min-h-screen bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white">
        <DashboardHeader />

        <div className="mb-[32px]">
          <h1 className="text-[28px] font-semibold text-[var(--color-ink)] tracking-[-0.02em]">Profil Saya</h1>
          <p className="text-[var(--color-ink-muted)] mt-1 text-[15px]">Kelola informasi akun dan keamanan Anda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
          {/* Card Info User */}
          <div className="bg-[var(--color-surface-1)] hairline-border rounded-[24px] p-[32px]">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-[64px] h-[64px] rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-[20px] font-bold text-[var(--color-ink)]">{user?.name || 'User GaulGym'}</h2>
                <div className="inline-flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full text-[12px] font-bold mt-1 uppercase">
                  <ShieldCheck size={12} />
                  {user?.role}
                </div>
              </div>
            </div>

            <div className="space-y-[16px]">
              <div>
                <label className="text-[12px] font-medium text-[var(--color-ink-subtle)] uppercase tracking-wider">Alamat Email</label>
                <div className="flex items-center gap-[12px] mt-1 bg-[var(--color-surface-2)] px-[16px] py-[12px] rounded-[12px] border border-[var(--color-hairline)]">
                  <Mail size={18} className="text-[var(--color-ink-subtle)]" />
                  <span className="text-[15px] font-medium text-[var(--color-ink)]">{user?.email || 'email@contoh.com'}</span>
                </div>
                <p className="text-[12px] text-[var(--color-ink-subtle)] mt-2 italic">* Email ini digunakan untuk login dan tidak dapat diubah dari dashboard.</p>
              </div>
            </div>
          </div>

          {/* Card Ganti Password */}
          <div className="bg-[var(--color-surface-1)] hairline-border rounded-[24px] p-[32px]">
            <div className="flex items-center gap-3 mb-[24px]">
              <div className="w-[40px] h-[40px] rounded-[10px] bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Lock size={20} />
              </div>
              <h2 className="text-[18px] font-bold text-[var(--color-ink)]">Ubah Password</h2>
            </div>

            {message.text && (
              <div className={`p-[16px] rounded-[12px] mb-[24px] text-[14px] font-medium ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-[20px]">
              <div>
                <label className="block text-[13px] font-medium mb-[6px] text-[var(--color-ink-subtle)]">Password Baru</label>
                <input 
                  type="password" 
                  required 
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-[16px] py-[12px] bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-[12px] border border-[var(--color-hairline)] focus-ring text-[15px]" 
                  placeholder="Minimal 6 karakter"
                />
              </div>
              
              <div>
                <label className="block text-[13px] font-medium mb-[6px] text-[var(--color-ink-subtle)]">Konfirmasi Password Baru</label>
                <input 
                  type="password" 
                  required 
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-[16px] py-[12px] bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-[12px] border border-[var(--color-hairline)] focus-ring text-[15px]" 
                  placeholder="Ketik ulang password baru"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || !password || !confirmPassword}
                className="w-full py-[14px] mt-[8px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white disabled:opacity-50 rounded-[12px] font-semibold transition-colors focus-ring flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                {loading ? 'Memproses...' : 'Simpan Password Baru'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
