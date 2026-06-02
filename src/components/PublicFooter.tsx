'use client';

import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="bg-[#050505] pt-24 pb-12 border-t border-zinc-900 relative overflow-hidden">
      {/* Subtle bottom glow */}
      <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-orange-600/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
        
        {/* Brand */}
        <div className="md:col-span-4">
          <Link href="/" className="inline-block outline-none mb-6 group">
            <h2 className="text-3xl font-black tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-orange-400 transition-all duration-300">
              GAUL GYM
            </h2>
          </Link>
          <p className="text-zinc-400 leading-relaxed text-sm md:text-base max-w-xs">
            Transformasikan tubuh dan pikiran Anda dengan fasilitas premium dan pelatih profesional kelas dunia.
          </p>
        </div>

        {/* Links */}
        <div className="md:col-span-2 md:col-start-7">
          <h3 className="text-white font-bold mb-6">Navigasi</h3>
          <ul className="space-y-4">
            <li>
              <Link href="/about" className="text-sm text-zinc-400 hover:text-orange-400 transition-colors outline-none">
                Tentang Kami
              </Link>
            </li>
            <li>
              <Link href="/features" className="text-sm text-zinc-400 hover:text-orange-400 transition-colors outline-none">
                Fasilitas
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="text-sm text-zinc-400 hover:text-orange-400 transition-colors outline-none">
                Paket Harga
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div className="md:col-span-2">
          <h3 className="text-white font-bold mb-6">Bantuan</h3>
          <ul className="space-y-4">
            <li>
              <Link href="/contact" className="text-sm text-zinc-400 hover:text-orange-400 transition-colors outline-none">
                Hubungi Kami
              </Link>
            </li>
            <li>
              <Link href="#" className="text-sm text-zinc-400 hover:text-orange-400 transition-colors outline-none">
                Syarat & Ketentuan
              </Link>
            </li>
            <li>
              <Link href="#" className="text-sm text-zinc-400 hover:text-orange-400 transition-colors outline-none">
                Kebijakan Privasi
              </Link>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div className="md:col-span-2">
          <h3 className="text-white font-bold mb-6">Sosial Media</h3>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-orange-500 hover:text-white transition-all outline-none">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-orange-500 hover:text-white transition-all outline-none">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          </div>
        </div>

      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 mt-20 pt-8 border-t border-zinc-900 text-center text-zinc-600 text-sm">
        © {new Date().getFullYear()} Gaul Gym. All rights reserved.
      </div>
    </footer>
  );
}
