'use client';

import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import { colors, spacing } from '@/lib/design-tokens';

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      <PublicNavbar />
      
      <main style={{ flex: 1, paddingTop: '120px', paddingBottom: spacing.xxl }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: `0 ${spacing.xl}` }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: colors.textPrimary, letterSpacing: '-1px', marginBottom: spacing.lg }}>
            Tentang Gaul Gym
          </h1>
          <p style={{ fontSize: '18px', color: colors.textSecondary, lineHeight: '1.6', marginBottom: spacing.md }}>
            Gaul Gym didirikan pada tahun 2026 dengan satu visi sederhana: menciptakan ruang kebugaran yang inklusif, modern, dan memberikan hasil nyata. Kami percaya bahwa kebugaran bukan hanya tentang mengangkat beban, tetapi tentang membangun gaya hidup yang lebih baik.
          </p>
          <p style={{ fontSize: '18px', color: colors.textSecondary, lineHeight: '1.6', marginBottom: spacing.md }}>
            Dengan peralatan berstandar internasional, lingkungan yang suportif, dan pelatih bersertifikasi, kami berkomitmen untuk membantu setiap anggota mencapai potensi maksimal mereka.
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
