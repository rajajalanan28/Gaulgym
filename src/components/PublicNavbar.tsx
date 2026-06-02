'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className={`text-[13px] font-medium transition-colors focus-ring rounded-sm ${
        active 
          ? 'text-[var(--color-ink)]' 
          : 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]'
      }`}
    >
      {children}
    </a>
  );
}

export function PublicNavbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // If user is logged in, don't render this navbar at all
  // The page will show DashboardHeader instead
  if (user) {
    return null;
  }

  // Don't render anything while checking auth state to prevent flash
  if (loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 h-[56px] bg-transparent">
        <div className="max-w-[1280px] mx-auto h-full px-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group focus-ring rounded-sm">
            <span className="text-[var(--color-ink)] font-semibold tracking-tight text-[15px]">
              GAUL GYM
            </span>
          </a>
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 h-[56px] transition-all duration-300 ${
        scrolled ? 'bg-[var(--color-canvas)] hairline-border border-x-0 border-t-0' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1280px] mx-auto h-full px-6 flex items-center justify-between">
        
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group focus-ring rounded-sm">
          <span className="text-[var(--color-ink)] font-semibold tracking-tight text-[15px]">
            GAUL GYM
          </span>
        </a>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink href="/" active={pathname === '/'}>Beranda</NavLink>
          <NavLink href="/about" active={pathname === '/about'}>Tentang</NavLink>
          <NavLink href="/features" active={pathname === '/features'}>Fasilitas</NavLink>
          <NavLink href="/pricing" active={pathname === '/pricing'}>Paket</NavLink>
          <NavLink href="/contact" active={pathname === '/contact'}>Kontak</NavLink>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <a 
            href="/login"
            className="text-[13px] font-medium text-[var(--color-ink)] px-[14px] py-[6px] rounded-md transition-colors hover:text-[var(--color-ink-muted)] focus-ring"
          >
            Masuk
          </a>
          <a 
            href="/daftar"
            className="text-[13px] font-medium bg-[var(--color-primary)] text-white px-[14px] py-[6px] rounded-md transition-colors hover:bg-[var(--color-primary-hover)] focus-ring"
          >
            Daftar
          </a>
        </div>

      </div>
    </nav>
  );
}
