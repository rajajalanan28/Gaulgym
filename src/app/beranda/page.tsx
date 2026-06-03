'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ArrowRight } from 'lucide-react';

// Lazy load components not needed for first paint
const PublicNavbar = dynamic(() => import('@/components/PublicNavbar').then(m => ({ default: m.PublicNavbar })), { ssr: true });
const DashboardHeader = dynamic(() => import('@/components/DashboardHeader').then(m => ({ default: m.DashboardHeader })), { ssr: false });
const PublicFooter = dynamic(() => import('@/components/PublicFooter').then(m => ({ default: m.PublicFooter })), { ssr: true, loading: () => <div className="h-[200px]" /> });

// Lazy load icons (lucide-react is heavy)
const Dumbbell = dynamic(() => import('lucide-react').then(m => ({ default: m.Dumbbell })), { ssr: false });
const Activity = dynamic(() => import('lucide-react').then(m => ({ default: m.Activity })), { ssr: false });
const ShowerHead = dynamic(() => import('lucide-react').then(m => ({ default: m.ShowerHead })), { ssr: false });

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)] overflow-x-hidden selection:bg-[var(--color-primary-focus)] selection:text-white">
      {user ? (
        <div className="px-6 pt-6">
          <DashboardHeader />
        </div>
      ) : (
        <PublicNavbar />
      )}
      
      <main className={`flex-1 ${user ? 'pt-[32px]' : 'pt-[120px]'}`}>
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center px-6 pt-16 pb-24">
          <div className="relative z-10 max-w-[1000px] mx-auto text-center flex flex-col items-center">
            
            <div className="mb-8 inline-flex items-center gap-3 px-3 py-1 rounded-full hairline-border bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer text-[13px] font-medium text-[var(--color-ink-muted)]">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
              Pusat Kebugaran No. 1 di Jakarta
              <svg className="w-3.5 h-3.5 text-[var(--color-ink-subtle)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <h1 className="text-[56px] md:text-[80px] font-semibold text-[var(--color-ink)] tracking-[-0.035em] leading-[1.05] mb-8 max-w-[900px]">
              Kebugaran profesional, <br />
              <span className="text-[var(--color-ink-muted)]">tanpa kompromi.</span>
            </h1>
            
            <p className="text-[18px] md:text-[20px] text-[var(--color-ink-muted)] leading-[1.5] max-w-[640px] mb-12">
              Gaul Gym menghadirkan fasilitas standar internasional, pelatih bersertifikasi, dan ekosistem kelas dunia untuk membantu Anda mencapai performa puncak.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
              <Link href="/paket" className="w-full sm:w-auto px-8 py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold rounded-md transition-colors focus-ring flex items-center justify-center gap-2">
                Daftar Sekarang <ArrowRight size={18} />
              </Link>
              <Link href="/fasilitas" className="w-full sm:w-auto px-8 py-4 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-ink)] font-medium rounded-md transition-colors focus-ring flex items-center justify-center">
                Lihat Fasilitas
              </Link>
            </div>
          </div>
          
          {/* Dashboard Preview */}
          <div className="w-full max-w-[1200px] mx-auto mt-24">
            <div className="w-full aspect-[16/9] bg-[var(--color-surface-1)] hairline-border rounded-[16px] p-6 shadow-2xl relative overflow-hidden flex flex-col">
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-[#33353a]"></div>
                <div className="w-3 h-3 rounded-full bg-[#33353a]"></div>
                <div className="w-3 h-3 rounded-full bg-[#33353a]"></div>
              </div>
              <div className="flex-1 hairline-border bg-[var(--color-canvas)] rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/images/dashboard_preview.png" alt="Dashboard Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-[96px] px-6">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-[64px]">
              <h2 className="text-[32px] md:text-[40px] font-semibold text-[var(--color-ink)] mb-4 tracking-[-0.02em]">
                Dirancang untuk hasil maksimal
              </h2>
              <p className="text-[18px] text-[var(--color-ink-muted)] max-w-[600px] mx-auto">
                Setiap detail fasilitas kami dioptimalkan agar Anda dapat berlatih lebih keras, memulihkan diri lebih cepat, dan berkembang lebih jauh.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[var(--color-surface-1)] hairline-border p-[32px] rounded-[12px] hover:bg-[var(--color-surface-2)] transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-3)] hairline-border flex items-center justify-center mb-6 text-[var(--color-ink-subtle)] group-hover:text-[var(--color-ink)] transition-colors">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <h3 className="text-[18px] font-medium text-[var(--color-ink)] mb-3 tracking-[-0.01em]">Alat Berstandar Global</h3>
                <p className="text-[15px] text-[var(--color-ink-muted)] leading-[1.6]">
                  Dilengkapi dengan mesin isolasi presisi dan free weights dari merk terbaik industri kebugaran.
                </p>
              </div>
              
              <div className="bg-[var(--color-surface-1)] hairline-border p-[32px] rounded-[12px] hover:bg-[var(--color-surface-2)] transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-3)] hairline-border flex items-center justify-center mb-6 text-[var(--color-ink-subtle)] group-hover:text-[var(--color-ink)] transition-colors">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-[18px] font-medium text-[var(--color-ink)] mb-3 tracking-[-0.01em]">Pelatih Tersertifikasi</h3>
                <p className="text-[15px] text-[var(--color-ink-muted)] leading-[1.6]">
                  Program yang disesuaikan secara saintifik dengan kondisi tubuh dan target jangka panjang Anda.
                </p>
              </div>
              
              <div className="bg-[var(--color-surface-1)] hairline-border p-[32px] rounded-[12px] hover:bg-[var(--color-surface-2)] transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-3)] hairline-border flex items-center justify-center mb-6 text-[var(--color-ink-subtle)] group-hover:text-[var(--color-ink)] transition-colors">
                  <ShowerHead className="w-5 h-5" />
                </div>
                <h3 className="text-[18px] font-medium text-[var(--color-ink)] mb-3 tracking-[-0.01em]">Fasilitas Eksekutif</h3>
                <p className="text-[15px] text-[var(--color-ink-muted)] leading-[1.6]">
                  Ruang ganti premium, sauna, dan lounge untuk bersantai dan memulihkan diri pasca latihan.
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
