'use client';

import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import { colors, spacing, borderRadius } from '@/lib/design-tokens';
import Link from 'next/link';

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: colors.background }}>
      <PublicNavbar />
      
      <main style={{ flex: 1, paddingTop: '120px', paddingBottom: spacing.xxl }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: `0 ${spacing.xl}` }}>
          
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '800', color: colors.textPrimary, letterSpacing: '-1px', marginBottom: spacing.md }}>
              Investasi Terbaik untuk Tubuh Anda
            </h1>
            <p style={{ fontSize: '18px', color: colors.textSecondary, maxWidth: '600px', margin: '0 auto' }}>
              Pilih paket yang sesuai dengan target kebugaran Anda. Tanpa biaya tersembunyi, batal kapan saja.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: spacing.xl, alignItems: 'center' }}>
            {plans.map((plan) => (
              <div key={plan.id} style={{
                position: 'relative',
                backgroundColor: plan.popular ? colors.primary : colors.surfaceVariant,
                borderRadius: borderRadius.xl,
                padding: spacing.xl,
                display: 'flex',
                flexDirection: 'column',
                height: plan.popular ? '520px' : '480px',
                boxShadow: plan.popular ? '0 20px 40px rgba(0,0,0,0.2)' : 'none',
                transform: plan.popular ? 'scale(1.02)' : 'scale(1)',
              }}>
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: colors.primary,
                    color: colors.background,
                    padding: '4px 16px',
                    borderRadius: borderRadius.full,
                    fontSize: '12px',
                    fontWeight: '700',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}>
                    Paling Diminati
                  </div>
                )}
                
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: plan.popular ? colors.background : colors.textPrimary, marginBottom: spacing.sm }}>
                  {plan.name}
                </h2>
                <p style={{ color: plan.popular ? '#A1A1A6' : colors.textSecondary, fontSize: '14px', marginBottom: spacing.md, minHeight: '42px' }}>
                  {plan.description}
                </p>
                
                <div style={{ marginBottom: spacing.lg }}>
                  <span style={{ fontSize: '36px', fontWeight: '800', color: plan.popular ? colors.background : colors.textPrimary }}>{plan.price}</span>
                  <span style={{ fontSize: '14px', color: plan.popular ? '#A1A1A6' : colors.textSecondary }}>{plan.period}</span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: `0 0 ${spacing.xl} 0`, flex: 1, display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, color: plan.popular ? colors.background : colors.textPrimary, fontSize: '15px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke={plan.popular ? colors.primary : colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href={`/register?plan=${plan.id}`} style={{ textDecoration: 'none' }}>
                  <button style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: borderRadius.full,
                    backgroundColor: plan.popular ? colors.primary : colors.background,
                    color: plan.popular ? colors.background : colors.textPrimary,
                    border: plan.popular ? 'none' : `1px solid rgba(0,0,0,0.1)`,
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}>
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
  );
}
