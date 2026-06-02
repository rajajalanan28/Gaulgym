'use client';

import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import { colors, spacing, borderRadius } from '@/lib/design-tokens';

export default function FeaturesPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: colors.background }}>
      <PublicNavbar />
      
      <main style={{ flex: 1, paddingTop: '120px', paddingBottom: spacing.xxl }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: `0 ${spacing.xl}` }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '800', color: colors.textPrimary, letterSpacing: '-1px', marginBottom: spacing.md }}>
              Fasilitas Premium
            </h1>
            <p style={{ fontSize: '18px', color: colors.textSecondary, maxWidth: '600px', margin: '0 auto' }}>
              Semua yang Anda butuhkan untuk mencapai target kebugaran ada di sini.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: spacing.xl }}>
            {[
              { icon: '💪', title: 'Free Weights Area', desc: 'Dumbbell dari 1kg hingga 50kg, bench press, squat rack, dan smith machine.' },
              { icon: '🏃‍♂️', title: 'Cardio Center', desc: 'Treadmill, elliptical, dan sepeda statis dengan layar sentuh dan koneksi internet.' },
              { icon: '🧘‍♀️', title: 'Studio Kelas', desc: 'Ruang luas ber-AC untuk kelas Yoga, Zumba, Pilates, dan Body Combat.' },
              { icon: '🚿', title: 'Ruang Ganti Eksekutif', desc: 'Loker aman, shower air panas/dingin, dan fasilitas pengering rambut.' },
              { icon: '🧖‍♂️', title: 'Sauna', desc: 'Fasilitas sauna kering untuk relaksasi otot setelah latihan berat.' },
              { icon: '🥤', title: 'Protein Bar', desc: 'Menyediakan minuman protein, suplemen, dan makanan sehat.' }
            ].map((feature, i) => (
              <div key={i} style={{ padding: spacing.xl, backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.xl }}>
                <div style={{ fontSize: '40px', marginBottom: spacing.md }}>{feature.icon}</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>{feature.title}</h3>
                <p style={{ color: colors.textSecondary, lineHeight: '1.5' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
