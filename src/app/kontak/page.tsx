'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/auth-context';

const PublicNavbar = dynamic(() => import('@/components/PublicNavbar').then(m => ({ default: m.PublicNavbar })), { ssr: true });
import { DashboardHeader } from '@/components/DashboardHeader';
const PublicFooter = dynamic(() => import('@/components/PublicFooter').then(m => ({ default: m.PublicFooter })), { ssr: true, loading: () => <div className="h-[200px]" /> });

const MapPin = dynamic(() => import('lucide-react').then(m => ({ default: m.MapPin })), { ssr: false });
const Phone = dynamic(() => import('lucide-react').then(m => ({ default: m.Phone })), { ssr: false });
const Mail = dynamic(() => import('lucide-react').then(m => ({ default: m.Mail })), { ssr: false });

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name || form.name.trim().length < 2) errs.name = 'Nama minimal 2 karakter.';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email tidak valid.';
    if (!form.message || form.message.trim().length < 10) errs.message = 'Pesan minimal 10 karakter.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
      setErrors({});
      setTimeout(() => setSubmitted(false), 4000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white">
      {user ? (
        <div className="px-6 pt-6"><DashboardHeader /></div>
      ) : (
        <PublicNavbar />
      )}
      
      <main className={`flex-1 ${user ? 'pt-[32px]' : 'pt-[120px]'} pb-[96px]`}>
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="text-center mb-[64px]">
            <h1 className="text-[40px] md:text-[56px] font-semibold text-[var(--color-ink)] tracking-[-0.03em] leading-[1.1] mb-6">
              Hubungi Kami
            </h1>
            <p className="text-[18px] md:text-[20px] text-[var(--color-ink-muted)] max-w-[600px] mx-auto leading-[1.5]">
              Punya pertanyaan atau butuh bantuan? Tim elit kami siap membantu Anda kapan saja.
            </p>
          </div>

          {/* Success Toast */}
          {submitted && (
            <div className="mb-8 p-4 rounded-[12px] text-center text-[15px] font-medium" style={{ background: 'rgba(94, 106, 210, 0.15)', color: 'var(--color-primary-hover)', border: '1px solid rgba(94, 106, 210, 0.3)' }}>
              ✓ Pesan Anda berhasil dikirim! Kami akan segera menghubungi Anda.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[var(--color-surface-1)] hairline-border p-[32px] rounded-[12px]">
              <h3 className="text-[18px] font-medium text-[var(--color-ink)] mb-8 tracking-[-0.01em]">Informasi Kontak</h3>
              <div className="space-y-6 mb-12">
                {[
                  { Icon: MapPin, label: 'Alamat Utama', value: 'Parenggean, Provinsi Kalimantan Tengah' },
                  { Icon: Phone, label: 'Telepon', value: '(021) 1234-5678' },
                  { Icon: Mail, label: 'Email', value: 'hello@gaulgym.com' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-3)] hairline-border flex items-center justify-center shrink-0 text-[var(--color-ink-subtle)]">
                      <item.Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-ink)] mb-1 text-[15px]">{item.label}</p>
                      <p className="text-[14px] text-[var(--color-ink-muted)]">{item.value}</p>
                    </div>
                  </div>
                ))}
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
              <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="contact-name" className="block text-[13px] font-medium text-[var(--color-ink-subtle)] mb-2">Nama Lengkap</label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Masukkan nama Anda"
                    value={form.name}
                    onChange={e => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: undefined }); }}
                    className="w-full bg-[var(--color-surface-1)] text-[var(--color-ink)] px-[12px] py-[8px] rounded-md hairline-border focus-ring placeholder:text-[var(--color-ink-subtle)] text-[14px] transition-shadow"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && <p id="name-error" className="text-[12px] mt-1" style={{ color: '#ef4444' }}>{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-[13px] font-medium text-[var(--color-ink-subtle)] mb-2">Alamat Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={form.email}
                    onChange={e => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                    className="w-full bg-[var(--color-surface-1)] text-[var(--color-ink)] px-[12px] py-[8px] rounded-md hairline-border focus-ring placeholder:text-[var(--color-ink-subtle)] text-[14px] transition-shadow"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && <p id="email-error" className="text-[12px] mt-1" style={{ color: '#ef4444' }}>{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-[13px] font-medium text-[var(--color-ink-subtle)] mb-2">Pesan Anda</label>
                  <textarea
                    id="contact-message"
                    placeholder="Tuliskan pesan atau pertanyaan..."
                    rows={5}
                    value={form.message}
                    onChange={e => { setForm({ ...form, message: e.target.value }); if (errors.message) setErrors({ ...errors, message: undefined }); }}
                    className="w-full bg-[var(--color-surface-1)] text-[var(--color-ink)] px-[12px] py-[8px] rounded-md hairline-border focus-ring placeholder:text-[var(--color-ink-subtle)] text-[14px] transition-shadow resize-y"
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                  />
                  {errors.message && <p id="message-error" className="text-[12px] mt-1" style={{ color: '#ef4444' }}>{errors.message}</p>}
                </div>
                <button type="submit" className="w-full mt-4 py-[8px] px-[14px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-focus)] rounded-md text-white font-medium text-[14px] transition-colors focus-ring">
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
