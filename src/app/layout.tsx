import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'Gym Management System',
  description: 'Sistem manajemen gym',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, backgroundColor: '#121212', color: '#fff' }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
