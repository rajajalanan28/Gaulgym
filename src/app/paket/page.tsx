'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/auth-context';
import { Check } from 'lucide-react';

const PublicNavbar = dynamic(() => import('@/components/PublicNavbar').then(m => ({ default: m.PublicNavbar })), { ssr: true });
import { DashboardHeader } from '@/components/DashboardHeader';
const PublicFooter = dynamic(() => import('@/components/PublicFooter').then(m => ({ default: m.PublicFooter })), { ssr: true, loading: () => <div className="h-[200px]" /> });

export default function PackagesPage() {
  const { user } = useAuth();

  const packages = [
    {
      name: 'Harian',
      price: '50.000',
      period: 'kunjungan',
      features: ['Akses Bebas Alat Gym', 'Ruang Ganti & Loker', 'Free WiFi'],
      highlighted: false,
    },
    {
      name: 'Bulanan',
      price: '150.000',
      period: 'bulan',
      features: ['Semua Fitur Harian', 'Bebas Kunjungan Tanpa Batas', 'Akses Semua Kelas (Yoga, Zumba)', 'Akses Sauna'],
      highlighted: true,
    },
    {
      name: 'VIP Premium',
      price: '400.000',
      period: 'bulan',
      features: [
        'Semua Fitur Bulanan',
        'Personal Trainer (2 Sesi/Bulan)',
        'Konsultasi Gizi',
        'Gratis Handuk & Minuman Protein',
        'Booking Kelas Prioritas',
      ],
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white">
      {user ? (
        <div className="px-6 pt-6"><DashboardHeader /></div>
      ) : (
        <PublicNavbar />
      )}
      
      <main className={`flex-1 ${user ? 'pt-[32px]' : 'pt-[120px]'} pb-[96px]`}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-[64px]">
            <h1 className="text-[40px] md:text-[56px] font-semibold text-[var(--color-ink)] tracking-[-0.03em] leading-[1.1] mb-6">
              Paket Membership
            </h1>
            <p className="text-[18px] md:text-[20px] text-[var(--color-ink-muted)] max-w-[600px] mx-auto leading-[1.5]">
              Pilih paket yang paling sesuai dengan target dan rutinitas kebugaran Anda di Gaul Gym.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px] max-w-[1000px] mx-auto items-center">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative rounded-[24px] p-[32px] transition-all duration-300 ${
                  pkg.highlighted 
                    ? 'bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-focus)] text-white shadow-2xl shadow-[var(--color-primary)]/20 scale-100 md:scale-105 z-10' 
                    : 'bg-[var(--color-surface-1)] text-[var(--color-ink)] hairline-border hover:bg-[var(--color-surface-2)] z-0'
                }`}
              >
                {pkg.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-950 px-[16px] py-[6px] rounded-full text-[12px] font-bold uppercase tracking-widest shadow-lg">
                    Paling Laris
                  </div>
                )}

                <h2 className={`text-[24px] font-bold mb-[8px] ${pkg.highlighted ? 'text-white' : 'text-[var(--color-ink)]'}`}>
                  {pkg.name}
                </h2>

                <div className="mb-[32px] flex items-end gap-1">
                  <span className="text-[16px] font-medium mb-2">Rp</span>
                  <span className={`text-[48px] font-extrabold leading-none tracking-[-0.04em] ${pkg.highlighted ? 'text-white' : 'text-[var(--color-ink)]'}`}>
                    {pkg.price}
                  </span>
                  <span className={`text-[15px] mb-2 ${pkg.highlighted ? 'text-white/80' : 'text-[var(--color-ink-subtle)]'}`}>
                    /{pkg.period}
                  </span>
                </div>

                <ul className="space-y-[16px] mb-[40px]">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-[12px]">
                      <div className={`mt-[2px] w-[20px] h-[20px] rounded-full flex items-center justify-center shrink-0 ${
                        pkg.highlighted ? 'bg-white/20 text-white' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      }`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className={`text-[15px] ${pkg.highlighted ? 'text-white/90' : 'text-[var(--color-ink-muted)]'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-[14px] rounded-[12px] font-semibold text-[15px] transition-transform hover:scale-[1.02] active:scale-100 ${
                    pkg.highlighted
                      ? 'bg-white text-[var(--color-primary)] shadow-lg'
                      : 'bg-[var(--color-surface-3)] text-[var(--color-ink)] hover:bg-[var(--color-primary)] hover:text-white'
                  }`}
                >
                  Pilih Paket {pkg.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}