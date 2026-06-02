'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`text-[13px] font-medium transition-colors focus-ring rounded-sm ${
        active 
          ? 'text-[var(--color-ink)]' 
          : 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]'
      }`}
    >
      {children}
    </Link>
  );
}

export function PublicNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 h-[56px] transition-all duration-300 ${
        scrolled ? 'bg-[var(--color-canvas)] hairline-border border-x-0 border-t-0' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1280px] mx-auto h-full px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group focus-ring rounded-sm">
          <span className="text-[var(--color-ink)] font-semibold tracking-tight text-[15px]">
            GAUL GYM
          </span>
        </Link>

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
          <Link 
            href="/dashboard"
            className="text-[13px] font-medium text-[var(--color-ink)] px-[14px] py-[6px] rounded-md transition-colors hover:text-[var(--color-ink-muted)] focus-ring"
          >
            Masuk
          </Link>
          <Link 
            href="/register"
            className="text-[13px] font-medium bg-[var(--color-primary)] text-white px-[14px] py-[6px] rounded-md transition-colors hover:bg-[var(--color-primary-hover)] focus-ring"
          >
            Daftar
          </Link>
        </div>

      </div>
    </nav>
  );
}
