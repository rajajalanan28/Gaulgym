'use client';

import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import Link from 'next/link';

export default function PricingPage() {
  const plans = [
    {
      id: 'reguler',
      name: 'Reguler',
      price: 'Rp 250.000',
      period: '/bulan',
      description: 'Akses standar ke semua fasilitas gym dasar.',
      features: ['Akses alat gym lengkap', 'Loker harian', 'Shower & ruang ganti', 'WiFi gratis'],
      popular: false,
    },
    {
      id: 'vip',
      name: 'VIP Member',
      price: 'Rp 450.000',
      period: '/bulan',
      description: 'Pengalaman kebugaran premium dengan fasilitas ekstra.',
      features: ['Akses alat gym lengkap', 'Loker pribadi bulanan', 'Akses ke kelas (Yoga, Zumba)', 'Gratis handuk', 'Akses sauna'],
      popular: true,
    },
    {
      id: 'pt',
      name: 'Personal Trainer',
      price: 'Rp 1.500.000',
      period: '/12 sesi',
      description: 'Pendampingan khusus untuk hasil yang lebih cepat dan aman.',
      features: ['Termasuk VIP Member 1 bulan', '12 Sesi dengan PT tersertifikasi', 'Program latihan kustom', 'Konsultasi gizi & diet', 'Fasilitas VIP'],
      popular: false,
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      <PublicNavbar />
      
      <main className="flex-1 pt-[120px] pb-32 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-[100%] bg-orange-600/10 blur-[150px] pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-6">
              Investasi Terbaik untuk <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Tubuh Anda</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
              Pilih paket yang sesuai dengan target kebugaran Anda. Tanpa biaya tersembunyi, batal kapan saja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`relative group rounded-3xl transition-all duration-300 ${
                  plan.popular 
                    ? 'p-1 bg-gradient-to-b from-orange-500 to-red-600 md:-translate-y-4 shadow-[0_20px_40px_-15px_rgba(249,115,22,0.5)]' 
                    : 'glass-card border border-zinc-800/50 hover:border-zinc-600/50 hover:-translate-y-2'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-orange-500 to-red-600 rounded-full text-xs font-bold text-white tracking-widest uppercase shadow-lg">
                    Paling Diminati
                  </div>
                )}
                
                {/* Inner Card */}
                <div className={`h-full rounded-[23px] flex flex-col ${plan.popular ? 'bg-[#0f0f0f] p-8' : 'p-8'}`}>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h2>
                  <p className="text-zinc-400 text-sm mb-8 min-h-[40px]">
                    {plan.description}
                  </p>
                  
                  <div className="mb-8 pb-8 border-b border-zinc-800">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black text-white">{plan.price}</span>
                      <span className="text-zinc-500 text-sm font-medium mb-1">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="flex-1 space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-zinc-300 text-sm">
                        <svg className={`w-5 h-5 shrink-0 ${plan.popular ? 'text-orange-500' : 'text-zinc-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={`/register?plan=${plan.id}`} className="w-full outline-none">
                    <button className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-200 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)]'
                        : 'bg-zinc-800/50 hover:bg-zinc-700 text-white border border-zinc-700/50'
                    }`}>
                      Pilih Paket Ini
                    </button>
                  </Link>
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
