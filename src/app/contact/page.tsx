'use client';

import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white">
      <PublicNavbar />
      
      <main className="flex-1 pt-[120px] pb-[96px]">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="text-center mb-[64px]">
            <h1 className="text-[40px] md:text-[56px] font-semibold text-[var(--color-ink)] tracking-[-0.03em] leading-[1.1] mb-6">
              Hubungi Kami
            </h1>
            <p className="text-[18px] md:text-[20px] text-[var(--color-ink-muted)] max-w-[600px] mx-auto leading-[1.5]">
              Punya pertanyaan atau butuh bantuan? Tim elit kami siap membantu Anda kapan saja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[var(--color-surface-1)] hairline-border p-[32px] rounded-[12px]">
              <h3 className="text-[18px] font-medium text-[var(--color-ink)] mb-8 tracking-[-0.01em]">
                Informasi Kontak
              </h3>
              
              <div className="space-y-6 mb-12">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-3)] hairline-border flex items-center justify-center shrink-0">
                    📍
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-ink)] mb-1 text-[15px]">Alamat Utama</p>
                    <p className="text-[14px] text-[var(--color-ink-muted)]">Jl. Sudirman No. 123, Jakarta Selatan</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-3)] hairline-border flex items-center justify-center shrink-0">
                    📞
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-ink)] mb-1 text-[15px]">Telepon</p>
                    <p className="text-[14px] text-[var(--color-ink-muted)]">(021) 1234-5678</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-3)] hairline-border flex items-center justify-center shrink-0">
                    ✉️
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-ink)] mb-1 text-[15px]">Email</p>
                    <p className="text-[14px] text-[var(--color-ink-muted)]">hello@gaulgym.com</p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-[18px] font-medium text-[var(--color-ink)] mb-4 tracking-[-0.01em]">Jam Operasional</h3>
              <div className="space-y-3 text-[14px]">
                <div className="flex justify-between items-center py-2 border-b border-[var(--color-hairline)]">
                  <span className="text-[var(--color-ink-muted)]">Senin - Jumat</span>
                  <span className="text-[var(--color-ink)] font-medium">06:00 - 22:00</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[var(--color-ink-muted)]">Sabtu - Minggu</span>
                  <span className="text-[var(--color-ink)] font-medium">07:00 - 20:00</span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-surface-1)] hairline-border p-[32px] rounded-[12px]">
              <h3 className="text-[18px] font-medium text-[var(--color-ink)] mb-6 tracking-[-0.01em]">Kirim Pesan</h3>
              <form className="flex flex-col gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--color-ink-subtle)] mb-2">Nama Lengkap</label>
                  <input 
                    type="text" 
                    placeholder="Masukkan nama Anda" 
                    className="w-full bg-[var(--color-surface-1)] text-[var(--color-ink)] px-[12px] py-[8px] rounded-md hairline-border focus-ring placeholder:text-[var(--color-ink-tertiary)] text-[14px] transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--color-ink-subtle)] mb-2">Alamat Email</label>
                  <input 
                    type="email" 
                    placeholder="nama@email.com" 
                    className="w-full bg-[var(--color-surface-1)] text-[var(--color-ink)] px-[12px] py-[8px] rounded-md hairline-border focus-ring placeholder:text-[var(--color-ink-tertiary)] text-[14px] transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--color-ink-subtle)] mb-2">Pesan Anda</label>
                  <textarea 
                    placeholder="Tuliskan pesan atau pertanyaan..." 
                    rows={5} 
                    className="w-full bg-[var(--color-surface-1)] text-[var(--color-ink)] px-[12px] py-[8px] rounded-md hairline-border focus-ring placeholder:text-[var(--color-ink-tertiary)] text-[14px] transition-shadow resize-y"
                  ></textarea>
                </div>
                
                <button 
                  type="button" 
                  className="w-full mt-4 py-[8px] px-[14px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-focus)] rounded-md text-white font-medium text-[14px] transition-colors focus-ring"
                >
                  Kirim Pesan
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
