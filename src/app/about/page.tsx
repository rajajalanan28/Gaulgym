'use client';

import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white">
      <PublicNavbar />
      
      <main className="flex-1 pt-[120px] pb-[96px]">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="text-center mb-[64px]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full hairline-border bg-[var(--color-surface-1)] text-[var(--color-ink-subtle)] text-[13px] font-medium tracking-[0.03em] mb-6 uppercase">
              Misi Kami
            </div>
            <h1 className="text-[40px] md:text-[56px] font-semibold text-[var(--color-ink)] tracking-[-0.03em] mb-8">
              Tentang Gaul Gym
            </h1>
          </div>

          <div className="bg-[var(--color-surface-1)] hairline-border p-[40px] md:p-[64px] rounded-[16px]">
            <div className="space-y-8 text-[18px] text-[var(--color-ink-muted)] leading-[1.6]">
              <p>
                <strong className="text-[var(--color-ink)] font-medium">Gaul Gym</strong> didirikan pada tahun 2026 dengan satu visi sederhana namun kuat: menciptakan ruang kebugaran eksklusif yang tidak hanya berfokus pada alat, tetapi pada hasil nyata dan komunitas yang positif.
              </p>
              
              <p>
                Kami percaya bahwa transformasi fisik sejati dimulai dari lingkungan yang tepat. Oleh karena itu, setiap inci dari fasilitas kami dirancang dengan detail untuk memberikan pengalaman <span className="text-[var(--color-ink)] font-medium">premium dan tanpa kompromi</span>.
              </p>

              <div className="py-8 my-8 border-y border-[var(--color-hairline)]">
                <blockquote className="text-[24px] md:text-[28px] font-medium text-[var(--color-ink)] text-center tracking-[-0.02em] leading-[1.3]">
                  "Kebugaran bukan hanya tentang mengangkat beban, tetapi tentang membangun versi terbaik dari diri Anda."
                </blockquote>
              </div>
              
              <p>
                Dengan peralatan berstandar internasional dari merk terkemuka, pelatih bersertifikasi ahli, dan lingkungan yang higienis serta modern, kami berkomitmen untuk menjadi katalisator dalam perjalanan kebugaran Anda.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-[32px] text-center">
            <div className="bg-[var(--color-surface-1)] hairline-border p-[24px] rounded-[12px]">
              <div className="text-[32px] font-semibold text-[var(--color-ink)] mb-1 tracking-[-0.02em]">50+</div>
              <div className="text-[13px] font-medium text-[var(--color-ink-subtle)]">Kelas Per Minggu</div>
            </div>
            <div className="bg-[var(--color-surface-1)] hairline-border p-[24px] rounded-[12px]">
              <div className="text-[32px] font-semibold text-[var(--color-ink)] mb-1 tracking-[-0.02em]">24/7</div>
              <div className="text-[13px] font-medium text-[var(--color-ink-subtle)]">Akses Member</div>
            </div>
            <div className="bg-[var(--color-surface-1)] hairline-border p-[24px] rounded-[12px]">
              <div className="text-[32px] font-semibold text-[var(--color-ink)] mb-1 tracking-[-0.02em]">30+</div>
              <div className="text-[13px] font-medium text-[var(--color-ink-subtle)]">Personal Trainer</div>
            </div>
            <div className="bg-[var(--color-surface-1)] hairline-border p-[24px] rounded-[12px]">
              <div className="text-[32px] font-semibold text-[var(--color-ink)] mb-1 tracking-[-0.02em]">10k</div>
              <div className="text-[13px] font-medium text-[var(--color-ink-subtle)]">Member Aktif</div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
