'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Menu } from 'lucide-react';

export function DashboardHeader() {
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <div className="relative flex justify-between items-center mb-[48px]">
      <div className="flex items-center gap-4">
        {/* Hamburger Menu for Public Pages */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-[8px] text-[var(--color-ink)] bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] hairline-border rounded-md transition-colors focus-ring flex items-center justify-center"
            title="Menu Publik"
          >
            <Menu size={20} />
          </button>

          {menuOpen && (
            <div className="absolute top-full left-0 mt-2 w-[200px] bg-[var(--color-surface-1)] hairline-border rounded-md shadow-2xl py-2 z-50">
              <Link href="/" className="block px-4 py-2 text-[14px] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]">Beranda</Link>
              <Link href="/about" className="block px-4 py-2 text-[14px] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]">Tentang</Link>
              <Link href="/features" className="block px-4 py-2 text-[14px] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]">Fasilitas</Link>
              <Link href="/pricing" className="block px-4 py-2 text-[14px] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]">Paket</Link>
              <Link href="/contact" className="block px-4 py-2 text-[14px] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]">Kontak</Link>
            </div>
          )}
        </div>

        <h1 className="text-[20px] font-semibold text-[var(--color-ink)] tracking-[-0.01em]">
          GAUL GYM
        </h1>
      </div>

      <button
        onClick={handleLogout}
        className="px-[12px] py-[6px] text-[13px] font-medium text-[var(--color-ink)] hover:text-white bg-[var(--color-surface-1)] hover:bg-red-500 hairline-border rounded-md transition-colors focus-ring"
      >
        Logout
      </button>
    </div>
  );
}
