import './globals.css';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Gaul Gym | Investasi Terbaik untuk Tubuh Anda',
  description: 'Fasilitas kebugaran kelas dunia dengan peralatan premium dan pelatih tersertifikasi.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={outfit.variable}>
      <body className="bg-[#050505] text-white font-sans antialiased selection:bg-orange-500/30">
        <AuthProvider>
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}
