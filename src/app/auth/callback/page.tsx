'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        // Get the session that Supabase automatically parsed from the URL hash or PKCE exchange
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session?.user) {
          // If no session is found, it might still be parsing or there's an error.
          // Wait a bit and redirect to login
          timeoutId = setTimeout(() => {
            setError('Sesi tidak ditemukan atau kedaluwarsa. Mengalihkan ke halaman login...');
            setTimeout(() => router.push('/login'), 2000);
          }, 3000);
          return;
        }

        const user = session.user;
        
        // Cek apakah user ini sudah ada di tabel public.users kita
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        let userRole = 'Member';

        if (fetchError && fetchError.code === 'PGRST116') {
          // User belum ada (Berdasarkan Google Sign In pertama kali)
          // Auto-provision sebagai Member
          userRole = 'Member';
          
          await supabase.from('users').insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role: userRole,
            is_active: true,
          });
        } else if (existingUser) {
          userRole = existingUser.role;
          
          // PASTIKAN USER SUDAH ADA DI TABEL MEMBERS JUGA
          // Jika belum ada, otomatis tambahkan. Ini untuk handle user lama yg udah daftar sebelum fitur ini ada.
          if (userRole === 'Member') {
             const { data: memberData } = await supabase.from('members').select('id').eq('user_id', user.id).single();
             if (!memberData) {
               const randomBytes = new Uint8Array(4);
               crypto.getRandomValues(randomBytes);
               const displayId = 'GG-' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 6).toUpperCase();
               const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
               await supabase.from('members').insert({
                 user_id: user.id,
                 name,
                 email: user.email,
                 display_id: displayId,
                 join_date: new Date().toISOString().split('T')[0]
               });
             }
          }
        } else if (fetchError) {
          throw fetchError;
        }

        // Arahkan ke dashboard yang sesuai
        if (userRole === 'Owner') {
          router.push('/dashboard');
        } else if (userRole === 'Admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/member/dashboard');
        }

      } catch (e: any) {
        console.error('Error in auth callback:', e);
        
        // Auto-fix PKCE cache issues silently
        if (e.message && (e.message.includes('PKCE') || e.message.includes('code verifier'))) {
          if (typeof window !== 'undefined') {
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('sb-')) localStorage.removeItem(key);
            });
          }
          setIsRecovering(true);
          // Redirect seamlessly back to login without showing any red error
          window.location.href = '/login';
          return;
        }

        setError(e.message || 'Terjadi kesalahan saat memproses login.');
        timeoutId = setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleCallback();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] flex flex-col items-center justify-center p-4">
      <div className="bg-[var(--color-surface-1)] p-8 rounded-2xl shadow-xl border border-[var(--color-hairline)] max-w-sm w-full text-center">
        {isRecovering ? (
          <>
            <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[var(--color-ink)] mb-2">Memulihkan Sesi...</h2>
            <p className="text-[var(--color-ink-muted)] text-sm">Menyelaraskan data sesi Anda dengan aman.</p>
          </>
        ) : error ? (
          <>
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h2 className="text-xl font-bold text-red-500 mb-2">Login Gagal</h2>
            <p className="text-[var(--color-ink-muted)] text-sm">{error}</p>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[var(--color-ink)] mb-2">Memproses Akun...</h2>
            <p className="text-[var(--color-ink-muted)] text-sm">Sedang mengamankan sesi Anda dan menyiapkan dashboard. Mohon tunggu sebentar.</p>
          </>
        )}
      </div>
    </div>
  );
}
