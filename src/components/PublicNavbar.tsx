'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    <nav className="fixed top-0 left-0 right-0 h-[75px] glass z-50 flex items-center justify-between px-6 md:px-12 transition-all duration-300">
      {/* Logo */}
      <Link href="/" className="group flex items-center gap-2 outline-none">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)] group-hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all duration-300">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-orange-400 transition-all duration-300">
          GAUL GYM
        </h1>
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`relative text-sm font-medium transition-all duration-300 outline-none
                ${isActive ? 'text-white' : 'text-zinc-400 hover:text-white'}
              `}
            >
              {link.label}
              {/* Active Indicator */}
              {isActive && (
                <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center gap-4">
        <Link 
          href="/login" 
          className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors duration-200 outline-none"
        >
          Masuk
        </Link>
        <Link 
          href="/register" 
          className="relative group px-5 py-2.5 outline-none rounded-full"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-full blur opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative px-5 py-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full text-sm font-bold text-white shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] group-hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] group-hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2">
            Daftar Sekarang
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        </Link>
      </div>
    </nav>
  );
}
