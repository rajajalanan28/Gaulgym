'use client';

import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';

export default function FeaturesPage() {
  const features = [
    { icon: '💪', title: 'Free Weights Area', desc: 'Dumbbell dari 1kg hingga 50kg, bench press, squat rack, dan smith machine.' },
    { icon: '🏃‍♂️', title: 'Cardio Center', desc: 'Treadmill, elliptical, dan sepeda statis dengan layar sentuh dan koneksi internet.' },
    { icon: '🧘‍♀️', title: 'Studio Kelas', desc: 'Ruang luas ber-AC untuk kelas Yoga, Zumba, Pilates, dan Body Combat.' },
    { icon: '🚿', title: 'Ruang Ganti Eksekutif', desc: 'Loker aman, shower air panas/dingin, dan fasilitas pengering rambut.' },
    { icon: '🧖‍♂️', title: 'Sauna', desc: 'Fasilitas sauna kering untuk relaksasi otot setelah latihan berat.' },
    { icon: '🥤', title: 'Protein Bar', desc: 'Menyediakan minuman protein, suplemen, dan makanan sehat.' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      <PublicNavbar />
      
      <main className="flex-1 pt-[120px] pb-32 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-24">
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-6">
              Fasilitas <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Premium</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mencapai target kebugaran dengan nyaman, aman, dan efisien ada di sini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="group glass-card p-8 rounded-3xl hover:-translate-y-2 hover:bg-white/[0.03] transition-all duration-300 relative overflow-hidden"
              >
                {/* Glow on hover */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-500/30 to-red-500/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-3xl mb-6 shadow-inner border border-zinc-700/50 group-hover:border-orange-500/50 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
