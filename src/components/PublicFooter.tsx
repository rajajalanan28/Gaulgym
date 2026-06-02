'use client';

import Link from 'next/link';
import { colors, spacing } from '@/lib/design-tokens';

export function PublicFooter() {
  return (
    <footer style={{
      backgroundColor: colors.background,
      padding: `${spacing.xxl} ${spacing.xl}`,
      borderTop: `1px solid rgba(0,0,0,0.05)`,
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: spacing.xl,
      }}>
        {/* Brand */}
        <div>
          <h2 style={{ 
            color: colors.textPrimary, 
            fontWeight: '900', 
            fontSize: '24px',
            margin: `0 0 ${spacing.sm} 0`,
            letterSpacing: '-0.5px'
          }}>
            GAUL GYM
          </h2>
          <p style={{ color: colors.textSecondary, lineHeight: '1.6', fontSize: '14px' }}>
            Transformasikan tubuh dan pikiran Anda dengan fasilitas premium dan pelatih profesional.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 style={{ color: colors.textPrimary, fontSize: '16px', fontWeight: '700', marginBottom: spacing.md }}>Navigasi</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
            <li><Link href="/about" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '14px' }}>Tentang Kami</Link></li>
            <li><Link href="/features" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '14px' }}>Fasilitas</Link></li>
            <li><Link href="/pricing" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '14px' }}>Paket Harga</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 style={{ color: colors.textPrimary, fontSize: '16px', fontWeight: '700', marginBottom: spacing.md }}>Bantuan</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
            <li><Link href="/contact" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '14px' }}>Hubungi Kami</Link></li>
            <li><Link href="#" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '14px' }}>Syarat & Ketentuan</Link></li>
            <li><Link href="#" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '14px' }}>Kebijakan Privasi</Link></li>
          </ul>
        </div>
      </div>
      
      <div style={{
        marginTop: spacing.xxl,
        paddingTop: spacing.lg,
        borderTop: `1px solid rgba(0,0,0,0.05)`,
        textAlign: 'center',
        color: colors.textHint,
        fontSize: '14px'
      }}>
        © {new Date().getFullYear()} Gaul Gym. All rights reserved.
      </div>
    </footer>
  );
}
