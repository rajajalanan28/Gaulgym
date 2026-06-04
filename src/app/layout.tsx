import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#010102',
};

export const metadata: Metadata = {
  title: 'Gaul Gym | Investasi Terbaik untuk Tubuh Anda',
  description: 'Fasilitas kebugaran kelas dunia dengan peralatan premium dan pelatih tersertifikasi.',
  metadataBase: new URL('https://gaulgym.vercel.app'),
  manifest: '/manifest.json',
  openGraph: {
    title: 'Gaul Gym',
    description: 'Fasilitas kebugaran kelas dunia dengan peralatan premium.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="dns-prefetch" href="https://xyzcompany.supabase.co" />
        <link rel="preconnect" href="https://xyzcompany.supabase.co" crossOrigin="anonymous" />
        <link rel="preload" href="/logo.png" as="image" type="image/png" />
      </head>
      <body className={`${inter.variable} font-sans bg-[var(--color-canvas)] text-[var(--color-ink)] antialiased selection:bg-orange-500/30`}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#18191a',
            color: '#fff',
            border: '1px solid #23252a',
          },
        }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
