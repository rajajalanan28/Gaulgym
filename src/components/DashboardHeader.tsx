'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Menu, LogOut, ArrowLeft } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { useRouter } from 'next/navigation';

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const dashboardUrl = user?.role === 'Owner' ? '/dashboard' : user?.role === 'Admin' ? '/admin/dashboard' : '/member/dashboard';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    } finally {
      window.location.href = '/login';
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="relative flex justify-between items-center mb-[24px] md:mb-[48px]">
        <div className="flex items-center gap-3 md:gap-4">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          aria-label="Kembali"
          className="p-[8px] text-[var(--color-ink)] bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] hairline-border rounded-md transition-colors focus-ring flex items-center justify-center"
          title="Kembali"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Hamburger Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu navigasi"
            aria-expanded={menuOpen}
            className="p-[8px] text-[var(--color-ink)] bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] hairline-border rounded-md transition-colors focus-ring flex items-center justify-center"
            title="Menu"
          >
            <Menu size={20} />
          </button>

          {menuOpen && (
            <div role="navigation" aria-label="Menu utama" className="absolute top-full left-0 mt-2 w-[200px] bg-[var(--color-surface-1)] hairline-border rounded-md shadow-2xl py-2 z-50">
              <a href="/beranda" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-[14px] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Beranda</a>
              <a href="/tentang" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-[14px] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Tentang</a>
              <a href="/fasilitas" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-[14px] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Fasilitas</a>
              <a href="/paket" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-[14px] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Paket</a>
              <a href="/kontak" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-[14px] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Kontak</a>
            </div>
          )}
        </div>

        <h1 className="text-[18px] md:text-[20px] font-semibold text-[var(--color-ink)] tracking-[-0.01em] hidden sm:block">
          GAUL GYM
        </h1>
      </div>

      {/* Right side: Dashboard button + Logout */}
      <div className="flex items-center gap-2 md:gap-3">
        <a
          href={dashboardUrl}
          aria-label="Buka dashboard"
          className="px-[12px] py-[6px] text-[12px] md:text-[13px] font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-md transition-colors focus-ring hidden md:inline-flex"
        >
          Dashboard
        </a>
        <button
          onClick={handleLogout}
          aria-label="Keluar dari akun"
          className="px-[10px] md:px-[12px] py-[6px] text-[12px] md:text-[13px] font-medium text-[var(--color-ink)] hover:text-white bg-[var(--color-surface-1)] hover:bg-red-500 hairline-border rounded-md transition-colors focus-ring flex items-center gap-2"
        >
          <LogOut size={16} className="md:hidden" />
          <span className="hidden md:inline">Logout</span>
        </button>
        </div>
      </div>
      
      {/* Inject BottomNav automatically for all pages using DashboardHeader */}
      <BottomNav />
    </>
  );
}
