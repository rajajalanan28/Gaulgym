'use client';

import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] overflow-x-hidden">
      <PublicNavbar />
      
      <main className="flex-1 pt-[75px]">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
          {/* Ambient Background Glows */}
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-600/20 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-red-600/10 blur-[150px] pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-sm font-semibold backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Gym Premium No. 1 di Jakarta
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1] mb-8">
              Transformasi Nyata,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-600">
                Dimulai dari Sini.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mb-12">
              Bergabunglah dengan fasilitas kebugaran paling eksklusif. Nikmati peralatan berstandar internasional, pelatih profesional, dan komunitas elit yang mendukung tujuan Anda.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center w-full sm:w-auto">
              <Link href="/pricing" className="group relative w-full sm:w-auto outline-none">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-full blur opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <button className="relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-full text-lg font-bold text-white shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] group-hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] group-hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  Mulai Sekarang
                </button>
              </Link>
              <Link href="/features" className="w-full sm:w-auto outline-none">
                <button className="w-full sm:w-auto px-8 py-4 bg-transparent border border-zinc-700 hover:border-zinc-500 rounded-full text-lg font-semibold text-white hover:bg-zinc-800/50 transition-all duration-200">
                  Lihat Fasilitas
                </button>
              </Link>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs font-medium text-zinc-500 tracking-widest uppercase">Scroll</span>
            <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-32 px-6 relative z-10 border-t border-zinc-900 bg-[#0A0A0A]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
                Mengapa Memilih <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Gaul Gym?</span>
              </h2>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                Fasilitas kelas dunia yang dirancang khusus untuk memastikan Anda mendapatkan hasil yang maksimal dalam setiap sesi latihan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group glass-card p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-3xl mb-6 shadow-inner border border-zinc-700/50 group-hover:border-orange-500/50 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all">
                  🏋️‍♂️
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Alat Standar Internasional</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Peralatan terbaru dan terlengkap dari merk ternama yang dirawat secara berkala untuk kenyamanan dan keamanan Anda.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="group glass-card p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-3xl mb-6 shadow-inner border border-zinc-700/50 group-hover:border-orange-500/50 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all">
                  👨‍🏫
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Pelatih Tersertifikasi</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Dapatkan program latihan khusus yang disesuaikan secara saintifik dengan target dan kondisi fisik Anda.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="group glass-card p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-3xl mb-6 shadow-inner border border-zinc-700/50 group-hover:border-orange-500/50 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all">
                  🚿
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Fasilitas Eksekutif</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Ruang ganti eksklusif, shower air panas, sauna, dan lounge premium untuk bersantai setelah sesi latihan yang intens.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
