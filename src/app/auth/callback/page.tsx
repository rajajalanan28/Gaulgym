'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session that Supabase automatically parsed from the URL hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session?.user) {
          // If no session is found, it might still be parsing or there's an error.
          // Wait a bit and check onAuthStateChange
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
          // OAuth user baru - perlu provisioning oleh admin
          // Jangan auto-create
          await supabase.auth.signOut();
          throw new Error('Akun belum terdaftar di sistem. Hubungi admin untuk aktivasi.');
        } else if (existingUser) {
          userRole = existingUser.role;
          
          // PASTIKAN USER SUDAH ADA DI TABEL MEMBERS JUGA
          // Jika belum ada, otomatis tambahkan. Ini untuk handle user lama yg udah daftar sebelum fitur ini ada.
          if (userRole === 'Member') {
             const { data: memberData } = await supabase.from('members').select('id').eq('user_id', user.id).single();
             if (!memberData) {
               const { data: firstGym } = await supabase.from('gyms').select('id').limit(1).single();
               const targetGymId = firstGym ? firstGym.id : null;
               
               if (targetGymId) {
                 const randomBytes = new Uint8Array(4);
                 crypto.getRandomValues(randomBytes);
                 const displayId = 'GG-' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 6).toUpperCase();
                 const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
                 await supabase.from('members').insert({
                   user_id: user.id,
                   gym_id: targetGymId,
                   name,
                   email: user.email,
                   display_id: displayId,
                   join_date: new Date().toISOString().split('T')[0]
                 });
               }
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
        setError(e.message || 'Terjadi kesalahan saat memproses login.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] flex flex-col items-center justify-center p-4">
      <div className="bg-[var(--color-surface-1)] p-8 rounded-2xl shadow-xl border border-[var(--color-hairline)] max-w-sm w-full text-center">
        {error ? (
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
