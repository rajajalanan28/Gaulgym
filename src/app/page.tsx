'use client';

import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import { colors, spacing, borderRadius } from '@/lib/design-tokens';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      <PublicNavbar />
      
      <main style={{ flex: 1, paddingTop: '70px' }}>
        {/* Hero Section */}
        <section style={{
          padding: `${spacing.xxl} ${spacing.xl}`,
          textAlign: 'center',
          backgroundColor: colors.background,
          borderBottom: `1px solid rgba(0,0,0,0.05)`,
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 0' }}>
            <h1 style={{
              fontSize: '56px',
              fontWeight: '900',
              color: colors.textPrimary,
              letterSpacing: '-1.5px',
              lineHeight: '1.1',
              marginBottom: spacing.lg,
            }}>
              Transformasi Nyata,<br />
              <span style={{ color: colors.primary }}>Dimulai dari Sini.</span>
            </h1>
            <p style={{
              fontSize: '20px',
              color: colors.textSecondary,
              lineHeight: '1.5',
              marginBottom: spacing.xl,
            }}>
              Bergabung dengan fasilitas kebugaran paling eksklusif dengan peralatan premium, pelatih profesional, dan komunitas yang mendukung.
            </p>
            <div style={{ display: 'flex', gap: spacing.md, justifyContent: 'center' }}>
              <Link href="/pricing" style={{ textDecoration: 'none' }}>
                <button style={{
                  backgroundColor: colors.primary,
                  color: '#FFFFFF',
                  padding: '16px 32px',
                  borderRadius: borderRadius.full,
                  fontSize: '18px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  boxShadow: '0 4px 14px rgba(0, 102, 204, 0.3)',
                }}>
                  Mulai Sekarang
                </button>
              </Link>
              <Link href="/features" style={{ textDecoration: 'none' }}>
                <button style={{
                  backgroundColor: 'transparent',
                  color: colors.textPrimary,
                  padding: '16px 32px',
                  borderRadius: borderRadius.full,
                  fontSize: '18px',
                  fontWeight: '600',
                  border: `1px solid rgba(0,0,0,0.1)`,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Lihat Fasilitas
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section style={{ padding: `${spacing.xxl} ${spacing.xl}`, backgroundColor: '#FFFFFF' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: spacing.xxl }}>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.sm, letterSpacing: '-0.5px' }}>
                Mengapa Memilih Gaul Gym?
              </h2>
              <p style={{ fontSize: '18px', color: colors.textSecondary }}>Fasilitas kelas dunia untuk hasil yang maksimal.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: spacing.xl }}>
              {/* Feature 1 */}
              <div style={{ padding: spacing.xl, backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.xl }}>
                <div style={{ fontSize: '40px', marginBottom: spacing.md }}>🏋️‍♂️</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>Alat Standar Internasional</h3>
                <p style={{ color: colors.textSecondary, lineHeight: '1.5' }}>Peralatan terbaru dan terlengkap yang dirawat secara berkala untuk kenyamanan dan keamanan Anda.</p>
              </div>
              {/* Feature 2 */}
              <div style={{ padding: spacing.xl, backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.xl }}>
                <div style={{ fontSize: '40px', marginBottom: spacing.md }}>👨‍🏫</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>Personal Trainer Tersertifikasi</h3>
                <p style={{ color: colors.textSecondary, lineHeight: '1.5' }}>Dapatkan program latihan khusus yang disesuaikan dengan target dan kondisi fisik Anda.</p>
              </div>
              {/* Feature 3 */}
              <div style={{ padding: spacing.xl, backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.xl }}>
                <div style={{ fontSize: '40px', marginBottom: spacing.md }}>🚿</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>Fasilitas Eksekutif</h3>
                <p style={{ color: colors.textSecondary, lineHeight: '1.5' }}>Ruang ganti luas, shower air panas, sauna, dan area lounge untuk bersantai setelah latihan.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}