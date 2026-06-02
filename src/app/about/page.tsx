'use client';

import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      <PublicNavbar />
      
      <main className="flex-1 pt-[120px] pb-32 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-red-600/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[150px] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-sm font-semibold mb-6">
              Misi Kami
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8">
              Tentang <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">Gaul Gym</span>
            </h1>
          </div>

          <div className="glass-card p-10 md:p-14 rounded-3xl relative overflow-hidden">
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 space-y-8 text-lg md:text-xl text-zinc-400 leading-relaxed">
              <p>
                <strong className="text-white">Gaul Gym</strong> didirikan pada tahun 2026 dengan satu visi sederhana namun kuat: menciptakan ruang kebugaran eksklusif yang tidak hanya berfokus pada alat, tetapi pada hasil nyata dan komunitas yang positif.
              </p>
              
              <p>
                Kami percaya bahwa transformasi fisik sejati dimulai dari lingkungan yang tepat. Oleh karena itu, setiap inci dari fasilitas kami dirancang dengan detail untuk memberikan pengalaman <span className="text-orange-400 font-medium">premium dan tanpa kompromi</span>.
              </p>

              <div className="py-8 my-8 border-y border-zinc-800/50">
                <blockquote className="text-2xl md:text-3xl font-bold text-white text-center italic leading-tight">
                  "Kebugaran bukan hanya tentang mengangkat beban, tetapi tentang membangun versi terbaik dari diri Anda."
                </blockquote>
              </div>
              
              <p>
                Dengan peralatan berstandar internasional dari merk terkemuka, pelatih bersertifikasi ahli, dan lingkungan yang higienis serta modern, kami berkomitmen untuk menjadi katalisator dalam perjalanan kebugaran Anda.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 text-center">
            <div className="glass-card p-6 rounded-2xl">
              <div className="text-4xl font-black text-white mb-2">50+</div>
              <div className="text-sm font-medium text-orange-400">Kelas Per Minggu</div>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <div className="text-4xl font-black text-white mb-2">24/7</div>
              <div className="text-sm font-medium text-orange-400">Akses Member</div>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <div className="text-4xl font-black text-white mb-2">30+</div>
              <div className="text-sm font-medium text-orange-400">Personal Trainer</div>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <div className="text-4xl font-black text-white mb-2">10k</div>
              <div className="text-sm font-medium text-orange-400">Member Aktif</div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
