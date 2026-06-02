'use client';

import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function PricingPage() {
  const plans = [
    {
      id: 'reguler',
      name: 'Reguler',
      price: 'Rp 250.000',
      period: '/bulan',
      description: 'Akses standar ke semua fasilitas gym dasar.',
      features: ['Akses alat gym lengkap', 'Loker harian', 'Shower & ruang ganti', 'WiFi gratis'],
      popular: false,
    },
    {
      id: 'vip',
      name: 'VIP Member',
      price: 'Rp 450.000',
      period: '/bulan',
      description: 'Pengalaman kebugaran premium dengan fasilitas ekstra.',
      features: ['Akses alat gym lengkap', 'Loker pribadi bulanan', 'Akses ke kelas (Yoga, Zumba)', 'Gratis handuk', 'Akses sauna'],
      popular: true,
    },
    {
      id: 'pt',
      name: 'Personal Trainer',
      price: 'Rp 1.500.000',
      period: '/12 sesi',
      description: 'Pendampingan khusus untuk hasil yang lebih cepat dan aman.',
      features: ['Termasuk VIP Member 1 bulan', '12 Sesi dengan PT tersertifikasi', 'Program latihan kustom', 'Konsultasi gizi & diet', 'Fasilitas VIP'],
      popular: false,
    }
  ];

  return (
    <ProtectedRoute>
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white">
      <PublicNavbar />
      
      <main className="flex-1 pt-[120px] pb-[96px]">
        
        <div className="max-w-[1200px] mx-auto px-6">
          
          <div className="text-center mb-[64px]">
            <h1 className="text-[40px] md:text-[56px] font-semibold text-[var(--color-ink)] tracking-[-0.03em] leading-[1.1] mb-6">
              Investasi Terbaik untuk Tubuh Anda
            </h1>
            <p className="text-[18px] md:text-[20px] text-[var(--color-ink-muted)] max-w-[600px] mx-auto leading-[1.5]">
              Pilih paket yang sesuai dengan target kebugaran Anda. Tanpa biaya tersembunyi, batal kapan saja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start max-w-[1000px] mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`relative rounded-[12px] flex flex-col p-[24px] transition-colors ${
                  plan.popular 
                    ? 'bg-[var(--color-surface-2)] hairline-border-strong' 
                    : 'bg-[var(--color-surface-1)] hairline-border'
                }`}
              >
                <div className="mb-6">
                  <h2 className="text-[22px] font-medium text-[var(--color-ink)] mb-2 tracking-[-0.01em]">
                    {plan.name}
                  </h2>
                  <p className="text-[15px] text-[var(--color-ink-muted)] min-h-[44px] leading-[1.5]">
                    {plan.description}
                  </p>
                </div>
                
                <div className="mb-8 pb-8 border-b border-[var(--color-hairline)]">
                  <div className="flex items-end gap-1">
                    <span className="text-[40px] font-semibold text-[var(--color-ink)] tracking-[-0.02em] leading-[1]">{plan.price}</span>
                  </div>
                  <div className="text-[var(--color-ink-subtle)] text-[15px] font-medium mt-1">{plan.period}</div>
                </div>

                <ul className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[var(--color-ink-muted)] text-[15px]">
                      <svg className="w-5 h-5 shrink-0 text-[var(--color-ink-subtle)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={`/daftar?plan=${plan.id}`} className="w-full focus-ring rounded-md mt-auto">
                  <button className={`w-full py-[8px] px-[14px] rounded-md text-[14px] font-medium transition-colors ${
                    plan.popular
                      ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-focus)]'
                      : 'bg-[var(--color-surface-1)] text-[var(--color-ink)] hairline-border hover:bg-[var(--color-surface-2)]'
                  }`}>
                    Pilih Paket Ini
                  </button>
                </Link>
              </div>
            ))}
          </div>

        </div>
      </main>

      <PublicFooter />
    </div>
    </ProtectedRoute>
  );
}
