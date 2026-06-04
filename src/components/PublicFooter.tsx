'use client';

import Link from 'next/link';


export function PublicFooter() {
  return (
    <footer className="bg-[var(--color-canvas)] py-[64px] px-[32px] border-t border-[var(--color-hairline)]">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
        
        {/* Brand */}
        <div className="md:col-span-4">
          <Link href="/beranda" className="inline-flex items-center gap-2 outline-none mb-4 focus-ring rounded-sm">
            <img src="/images/logo gym-2.png" alt="Gaul Gym Logo" className="w-5 h-5 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <h2 className="text-[15px] font-semibold tracking-tight text-[var(--color-ink)]">
              GAUL GYM
            </h2>
          </Link>
          <p className="text-[var(--color-ink-subtle)] leading-[1.5] text-[13px] max-w-xs">
            Transformasikan tubuh dan pikiran Anda dengan fasilitas premium dan pelatih profesional kelas dunia.
          </p>
        </div>

        {/* Links */}
        <div className="md:col-span-2 md:col-start-7">
          <h3 className="text-[var(--color-ink)] font-medium mb-4 text-[13px]">Navigasi</h3>
          <div className="flex flex-col gap-[12px]">
            <Link href="/tentang" className="text-[13px] text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors focus-ring rounded-sm">
              Tentang Kami
            </Link>
            <Link href="/beranda" className="text-[13px] text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors focus-ring rounded-sm">
              Karir
            </Link>
            <Link href="/fasilitas" className="text-[13px] text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors focus-ring rounded-sm">
              Fasilitas & Alat
            </Link>
            <Link href="/beranda" className="text-[13px] text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors focus-ring rounded-sm">
              Testimoni
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="md:col-span-2">
          <h3 className="text-[var(--color-ink)] font-medium mb-4 text-[13px]">Bantuan</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/kontak" className="text-[13px] text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors focus-ring rounded-sm">
                Hubungi Kami
              </Link>
            </li>
            <li>
              <Link href="#" className="text-[13px] text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors focus-ring rounded-sm">
                Syarat & Ketentuan
              </Link>
            </li>
            <li>
              <Link href="#" className="text-[13px] text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors focus-ring rounded-sm">
                Kebijakan Privasi
              </Link>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div className="md:col-span-2">
          <h3 className="text-[var(--color-ink)] font-medium mb-4 text-[13px]">Sosial</h3>
          <ul className="space-y-3">
            <li>
              <Link href="#" className="text-[13px] text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors focus-ring rounded-sm">
                Twitter / X
              </Link>
            </li>
            <li>
              <Link href="#" className="text-[13px] text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors focus-ring rounded-sm">
                Instagram
              </Link>
            </li>
          </ul>
        </div>

      </div>
      
      <div className="max-w-[1200px] mx-auto mt-16 pt-8 border-t border-[var(--color-hairline)] text-left text-[var(--color-ink-tertiary)] text-[13px]">
        © {new Date().getFullYear()} Gaul Gym. All rights reserved.
      </div>
    </footer>
  );
}
