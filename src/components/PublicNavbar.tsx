'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

export function PublicNavbar() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // If user is logged in, don't render - DashboardHeader handles it
  if (user || loading) {
    return null;
  }

  // Not logged in: show only logo + Masuk/Daftar, NO nav links
  return (
    <nav
      role="navigation"
      aria-label="Navigasi utama"
      className={`fixed top-0 left-0 right-0 z-50 h-[56px] transition-all duration-300 ${
        scrolled ? 'bg-[var(--color-canvas)] hairline-border border-x-0 border-t-0' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1280px] mx-auto h-full px-6 flex items-center justify-between">
        
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group focus-ring rounded-sm" aria-label="Gaul Gym - Beranda">
          <img src="/images/logo gym-2.png" alt="Gaul Gym Logo" className="w-6 h-6 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span className="text-[var(--color-ink)] font-semibold tracking-tight text-[15px]">
            GAUL GYM
          </span>
        </a>

        {/* Actions - only Masuk/Daftar */}
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
