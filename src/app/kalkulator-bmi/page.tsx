'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { PublicNavbar } from '@/components/PublicNavbar';
import { DashboardHeader } from '@/components/DashboardHeader';
import dynamic from 'next/dynamic';
import { Calculator, Activity, ArrowRight, Info } from 'lucide-react';

const PublicFooter = dynamic(() => import('@/components/PublicFooter').then(m => ({ default: m.PublicFooter })), { ssr: true, loading: () => <div className="h-[200px]" /> });

type BMICategory = 'Kurus' | 'Normal' | 'Gemuk' | 'Obesitas';

export default function KalkulatorBMIPage() {
  const { user, loading } = useAuth();
  
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [bmiResult, setBmiResult] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<BMICategory | null>(null);

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !height) return;

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height) / 100; // convert cm to meters

    if (weightNum > 0 && heightNum > 0) {
      const bmi = weightNum / (heightNum * heightNum);
      setBmiResult(parseFloat(bmi.toFixed(1)));

      if (bmi < 18.5) {
        setBmiCategory('Kurus');
      } else if (bmi >= 18.5 && bmi < 25) {
        setBmiCategory('Normal');
      } else if (bmi >= 25 && bmi < 30) {
        setBmiCategory('Gemuk');
      } else {
        setBmiCategory('Obesitas');
      }
    }
  };

  const getCategoryColor = (category: BMICategory | null) => {
    switch (category) {
      case 'Kurus': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Normal': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Gemuk': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Obesitas': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-[var(--color-ink)] bg-[var(--color-surface-2)] border-[var(--color-hairline)]';
    }
  };

  const resetForm = () => {
    setWeight('');
    setHeight('');
    setBmiResult(null);
    setBmiCategory(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white">
      {loading ? (
        <div className="h-[56px] bg-[var(--color-surface-1)] animate-pulse" />
      ) : user ? (
        <div className="px-6 pt-6 max-w-[1200px] mx-auto w-full"><DashboardHeader /></div>
      ) : (
        <PublicNavbar />
      )}

      <main className={`flex-1 ${user ? 'pt-[0px]' : 'pt-[80px]'} px-6 pb-24 max-w-[1200px] mx-auto w-full`}>
        
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center justify-center p-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-2xl mb-4">
            <Calculator size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-[32px] md:text-[40px] font-bold text-[var(--color-ink)] mb-4 tracking-tight">
            Kalkulator BMI
          </h1>
          <p className="text-[16px] text-[var(--color-ink-muted)] max-w-[600px] mx-auto leading-relaxed">
            Hitung Body Mass Index (BMI) kamu untuk mengetahui apakah berat badanmu ideal, kurang, atau berlebih.
          </p>
        </div>

        {/* Content Section */}
        <div className="max-w-[500px] mx-auto">
          {/* Calculator Card */}
          <div className="bg-[var(--color-surface-1)] hairline-border rounded-2xl p-6 md:p-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <form onSubmit={calculateBMI} className="flex flex-col gap-5">
              
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-[var(--color-ink-muted)] flex items-center justify-between">
                  <span>Berat Badan</span>
                  <span className="text-[12px] text-[var(--color-ink-subtle)] bg-[var(--color-surface-2)] px-2 py-0.5 rounded">kg</span>
                </label>
                <input
                  type="number"
                  required
                  min="20"
                  max="300"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Contoh: 65"
                  className="w-full bg-[var(--color-canvas)] text-[var(--color-ink)] px-4 py-3 rounded-lg hairline-border focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all placeholder:text-[var(--color-ink-subtle)]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-[var(--color-ink-muted)] flex items-center justify-between">
                  <span>Tinggi Badan</span>
                  <span className="text-[12px] text-[var(--color-ink-subtle)] bg-[var(--color-surface-2)] px-2 py-0.5 rounded">cm</span>
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  max="250"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Contoh: 170"
                  className="w-full bg-[var(--color-canvas)] text-[var(--color-ink)] px-4 py-3 rounded-lg hairline-border focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all placeholder:text-[var(--color-ink-subtle)]"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-3.5 rounded-xl font-medium mt-2 flex items-center justify-center gap-2"
              >
                <Activity size={18} />
                Hitung BMI
              </button>

              {bmiResult !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[14px] text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors py-2"
                >
                  Hitung Ulang
                </button>
              )}
            </form>

            {/* Result Section */}
            {bmiResult !== null && (
              <div className="mt-8 pt-8 border-t border-[var(--color-hairline)] animate-fade-in">
                <div className="text-center flex flex-col items-center">
                  <span className="text-[14px] text-[var(--color-ink-muted)] mb-2">Skor BMI Kamu</span>
                  <div className="text-[48px] font-bold text-[var(--color-ink)] leading-none mb-3">
                    {bmiResult}
                  </div>
                  <div className={`px-4 py-1.5 rounded-full border text-[14px] font-medium ${getCategoryColor(bmiCategory)}`}>
                    Kategori: {bmiCategory}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mt-8 bg-[var(--color-canvas)] rounded-xl p-5 hairline-border">
                  <div className="flex items-start gap-3">
                    <Info size={20} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[14px] font-medium text-[var(--color-ink)] mb-1">Rekomendasi</h4>
                      <p className="text-[13px] text-[var(--color-ink-muted)] leading-relaxed">
                        {bmiCategory === 'Kurus' && 'Fokus pada surplus kalori (+300-500 kalori) dan latihan angkat beban rutin untuk menambah massa otot.'}
                        {bmiCategory === 'Normal' && 'Pertahankan pola makan seimbang dan rutin berolahraga 3-4 kali seminggu untuk menjaga kebugaran.'}
                        {bmiCategory === 'Gemuk' && 'Mulai defisit kalori ringan dan kombinasikan latihan kardio dengan angkat beban secara konsisten.'}
                        {bmiCategory === 'Obesitas' && 'Sangat disarankan untuk berkonsultasi dengan ahli gizi dan *personal trainer* untuk program penurunan berat badan yang aman.'}
                      </p>
                      
                      {!user && (
                        <a href="/register" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors mt-3">
                          Mulai program di Gaul Gym <ArrowRight size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
