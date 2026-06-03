import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';

const outfit = Outfit({ 
  subsets: ['latin'], 
  variable: '--font-outfit',
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
    <html lang="id" className={outfit.variable}>
      <head>
        <link rel="dns-prefetch" href="https://xyzcompany.supabase.co" />
        <link rel="preconnect" href="https://xyzcompany.supabase.co" crossOrigin="anonymous" />
        <link rel="preload" href="/logo.png" as="image" type="image/png" />
      </head>
      <body className="bg-[#050505] text-white font-sans antialiased selection:bg-orange-500/30">
        <AuthProvider>{children}</AuthProvider>
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
