'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { registerMemberAction } from '@/app/actions/user';
import { UserPlus, Mail, Phone, User, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewMemberPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.gymId) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    formData.append('gymId', user.gymId);
    
    const result = await registerMemberAction(formData);
    
    setLoading(false);
    
    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/members');
      }, 2000);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Owner']}>
      <div className="p-4 pb-28 md:p-[48px] max-w-[1200px] mx-auto min-h-screen bg-[var(--color-canvas)] text-white">
        <DashboardHeader />
        
        <div className="max-w-[600px] mx-auto mt-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
              <UserPlus className="text-[var(--color-primary)]" size={28} />
              Daftar Member Baru
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Member yang didaftarkan akan mendapatkan password default: <strong className="text-white">gaulgym123</strong>
            </p>
          </div>

          {success ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Member Berhasil Didaftarkan!</h2>
              <p className="text-green-200/70 mb-6">Mengarahkan kembali ke daftar member...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl">
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nama Lengkap</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-500" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full bg-[var(--color-surface-2)] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors"
                      placeholder="Contoh: Budi Santoso"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-500" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full bg-[var(--color-surface-2)] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors"
                      placeholder="Contoh: budi@gmail.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">No. WhatsApp</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={18} className="text-gray-500" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full bg-[var(--color-surface-2)] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors"
                      placeholder="Contoh: 08123456789"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-4 border-t border-white/5 pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 rounded-xl font-medium text-gray-300 hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : (
                    'Daftarkan Member'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
