'use client';

import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      <PublicNavbar />
      
      <main className="flex-1 pt-[120px] pb-32 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-20 left-0 w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[150px] pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-6">
              Hubungi <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Kami</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
              Punya pertanyaan atau butuh bantuan? Tim elit kami siap membantu Anda kapan saja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-10 rounded-3xl">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-orange-500 border border-zinc-700/50 shadow-inner">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                Informasi Kontak
              </h3>
              
              <div className="space-y-6 mb-12">
                <div className="flex items-start gap-4 text-zinc-400">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-semibold text-white mb-1">Alamat Utama</p>
                    <p>Jl. Sudirman No. 123, Jakarta Selatan</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 text-zinc-400">
                  <span className="text-2xl">📞</span>
                  <div>
                    <p className="font-semibold text-white mb-1">Telepon</p>
                    <p>(021) 1234-5678</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 text-zinc-400">
                  <span className="text-2xl">✉️</span>
                  <div>
                    <p className="font-semibold text-white mb-1">Email</p>
                    <p>hello@gaulgym.com</p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-6">Jam Operasional</h3>
              <div className="space-y-3 text-zinc-400">
                <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                  <span>Senin - Jumat</span>
                  <span className="text-white font-medium">06:00 - 22:00</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>Sabtu - Minggu</span>
                  <span className="text-white font-medium">07:00 - 20:00</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-10 rounded-3xl">
              <h3 className="text-2xl font-bold text-white mb-8">Kirim Pesan</h3>
              <form className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Nama Lengkap</label>
                  <input 
                    type="text" 
                    placeholder="Masukkan nama Anda" 
                    className="w-full bg-[#0a0a0a] text-white px-5 py-4 rounded-2xl border border-zinc-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Alamat Email</label>
                  <input 
                    type="email" 
                    placeholder="nama@email.com" 
                    className="w-full bg-[#0a0a0a] text-white px-5 py-4 rounded-2xl border border-zinc-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Pesan Anda</label>
                  <textarea 
                    placeholder="Tuliskan pesan atau pertanyaan..." 
                    rows={5} 
                    className="w-full bg-[#0a0a0a] text-white px-5 py-4 rounded-2xl border border-zinc-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all resize-y placeholder:text-zinc-600"
                  ></textarea>
                </div>
                
                <button 
                  type="button" 
                  className="w-full py-4 mt-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl text-white font-bold shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
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
