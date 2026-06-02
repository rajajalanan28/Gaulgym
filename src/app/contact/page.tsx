'use client';

import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import { colors, spacing, borderRadius } from '@/lib/design-tokens';

export default function ContactPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      <PublicNavbar />
      
      <main style={{ flex: 1, paddingTop: '120px', paddingBottom: spacing.xxl }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: `0 ${spacing.xl}` }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '800', color: colors.textPrimary, letterSpacing: '-1px', marginBottom: spacing.md }}>
              Hubungi Kami
            </h1>
            <p style={{ fontSize: '18px', color: colors.textSecondary }}>
              Punya pertanyaan atau butuh bantuan? Tim kami siap membantu Anda.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.xl }}>
            <div style={{ padding: spacing.xl, backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.xl }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>Informasi Kontak</h3>
              <p style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>📍 Jl. Sudirman No. 123, Jakarta</p>
              <p style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>📞 (021) 1234-5678</p>
              <p style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>✉️ hello@gaulgym.com</p>
              
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.md }}>Jam Operasional</h3>
              <p style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>Senin - Jumat: 06:00 - 22:00</p>
              <p style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>Sabtu - Minggu: 07:00 - 20:00</p>
            </div>

            <div style={{ padding: spacing.xl, backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.xl }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>Kirim Pesan</h3>
              <form style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                <input type="text" placeholder="Nama Lengkap" style={{ padding: '12px', borderRadius: borderRadius.sm, border: `1px solid rgba(0,0,0,0.1)` }} />
                <input type="email" placeholder="Alamat Email" style={{ padding: '12px', borderRadius: borderRadius.sm, border: `1px solid rgba(0,0,0,0.1)` }} />
                <textarea placeholder="Pesan Anda" rows={4} style={{ padding: '12px', borderRadius: borderRadius.sm, border: `1px solid rgba(0,0,0,0.1)`, resize: 'vertical' }}></textarea>
                <button type="button" style={{
                  padding: '12px',
                  backgroundColor: colors.primary,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: borderRadius.sm,
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>Kirim Sekarang</button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
