'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { colors, spacing, borderRadius } from '@/lib/design-tokens';

export function PublicNavbar() {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Tentang', href: '/about' },
    { label: 'Fasilitas', href: '/features' },
    { label: 'Paket', href: '/pricing' },
    { label: 'Kontak', href: '/contact' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '70px',
      backgroundColor: 'rgba(10, 10, 10, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid rgba(0,0,0,0.05)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `0 ${spacing.xl}`,
      zIndex: 1000,
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <h1 style={{ 
          color: colors.textPrimary, 
          fontWeight: '900', 
          fontSize: '22px',
          margin: 0,
          letterSpacing: '-0.5px'
        }}>
          GAUL GYM
        </h1>
      </Link>

      {/* Desktop Links */}
      <div style={{ display: 'flex', gap: spacing.lg, alignItems: 'center' }}>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              style={{
                textDecoration: 'none',
                color: isActive ? colors.primary : colors.textSecondary,
                fontWeight: isActive ? '600' : '500',
                fontSize: '15px',
                transition: 'color 0.2s',
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Auth Buttons */}
      <div style={{ display: 'flex', gap: spacing.sm }}>
        <Link href="/login" style={{ textDecoration: 'none' }}>
          <button style={{
            backgroundColor: 'transparent',
            color: colors.textPrimary,
            border: 'none',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            borderRadius: borderRadius.full,
          }}>
            Masuk
          </button>
        </Link>
        <Link href="/register" style={{ textDecoration: 'none' }}>
          <button style={{
            backgroundColor: colors.primary,
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            borderRadius: borderRadius.full,
            transition: 'opacity 0.2s',
          }}>
            Daftar
          </button>
        </Link>
      </div>
    </nav>
  );
}
