'use client';

import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import { Dumbbell, Activity, Users, ShowerHead, Thermometer, Coffee } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function FeaturesPage() {
  const features = [
    { icon: <Dumbbell className="w-5 h-5" />, title: 'Free Weights Area', desc: 'Dumbbell dari 1kg hingga 50kg, bench press, squat rack, dan smith machine.' },
    { icon: <Activity className="w-5 h-5" />, title: 'Cardio Center', desc: 'Treadmill, elliptical, dan sepeda statis dengan layar sentuh dan koneksi internet.' },
    { icon: <Users className="w-5 h-5" />, title: 'Studio Kelas', desc: 'Ruang luas ber-AC untuk kelas Yoga, Zumba, Pilates, dan Body Combat.' },
    { icon: <ShowerHead className="w-5 h-5" />, title: 'Ruang Ganti Eksekutif', desc: 'Loker aman, shower air panas/dingin, dan fasilitas pengering rambut.' },
    { icon: <Thermometer className="w-5 h-5" />, title: 'Sauna', desc: 'Fasilitas sauna kering untuk relaksasi otot setelah latihan berat.' },
    { icon: <Coffee className="w-5 h-5" />, title: 'Protein Bar', desc: 'Menyediakan minuman protein, suplemen, dan makanan sehat.' }
  ];

  return (
    <ProtectedRoute>
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white">
      <PublicNavbar />
      
      <main className="flex-1 pt-[120px] pb-[96px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-[64px]">
            <h1 className="text-[40px] md:text-[56px] font-semibold text-[var(--color-ink)] tracking-[-0.03em] leading-[1.1] mb-6">
              Fasilitas Premium
            </h1>
            <p className="text-[18px] md:text-[20px] text-[var(--color-ink-muted)] max-w-[600px] mx-auto leading-[1.5]">
              Semua yang Anda butuhkan untuk mencapai target kebugaran dengan nyaman, aman, dan efisien ada di sini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="group bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] hairline-border p-[32px] rounded-[12px] transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-3)] hairline-border flex items-center justify-center mb-6 text-[var(--color-ink-subtle)] group-hover:text-[var(--color-ink)] transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-[18px] font-medium text-[var(--color-ink)] mb-3 tracking-[-0.01em]">
                  {feature.title}
                </h3>
                <p className="text-[15px] text-[var(--color-ink-muted)] leading-[1.6]">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
    </ProtectedRoute>
  );
}
