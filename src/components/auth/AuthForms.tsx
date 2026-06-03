"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";

interface TimeoutResult {
  success: boolean;
  error?: string;
  user?: AuthUser;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface FormErrors {
  name?: string;
  username?: string;
  password?: string;
  login?: string;
}

function AuthFormsContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const selectedPlan = searchParams.get('plan');
  const isRegister = searchParams.get('register') === 'true' || pathname === '/register' || pathname === '/daftar';
  const [view, setView] = useState<'login' | 'register'>(isRegister ? 'register' : 'login');

  const { login, register } = useAuth();

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);

  // Register State
  const [regData, setRegData] = useState({
    name: "",
    username: "",
    password: "",
    role: "Member",
  });
  const [showRegPw, setShowRegPw] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Register validation
  const validateRegister = (): boolean => {
    const errs: FormErrors = {};
    if (!regData.name || regData.name.trim().length < 2) errs.name = 'Nama minimal 2 karakter.';
    if (!regData.username || regData.username.trim().length < 3) errs.username = 'Username minimal 3 karakter.';
    else if (!/^[a-zA-Z0-9_]+$/.test(regData.username)) errs.username = 'Username hanya boleh huruf, angka, dan underscore.';
    if (!regData.password || regData.password.length < 6) errs.password = 'Kata sandi minimal 6 karakter.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const finalEmail = loginEmail.includes("@")
      ? loginEmail.trim().toLowerCase()
      : `${loginEmail.trim().toLowerCase()}@gaulgym.com`;

    try {
      let timeoutId: NodeJS.Timeout | undefined;
      const timeoutPromise = new Promise<TimeoutResult>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("Koneksi timeout (45 detik). Server Supabase mungkin lambat.")), 45000);
      });

      const result = await Promise.race([
        login(finalEmail, loginPassword),
        timeoutPromise
      ]);

      if (timeoutId) clearTimeout(timeoutId);

      if (!result.success) {
        setErrorMsg(result.error || "Gagal masuk. Periksa kembali.");
        setIsLoading(false);
      } else {
        const role = result.user?.role;
        if (role === 'Owner') window.location.href = '/dashboard';
        else if (role === 'Admin') window.location.href = '/admin/dashboard';
        else window.location.href = '/member/dashboard';
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal masuk (Koneksi bermasalah)";
      setErrorMsg(errorMessage);
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setIsLoading(true);
    setErrorMsg("");

    const email = `${regData.username.trim().toLowerCase()}@gaulgym.com`;

    try {
      let timeoutId: NodeJS.Timeout | undefined;
      const timeoutPromise = new Promise<TimeoutResult>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("Koneksi timeout (45 detik). Server Supabase mungkin lambat.")), 45000);
      });

      const result = await Promise.race([
        register(regData.name, email, regData.password, regData.role),
        timeoutPromise
      ]);

      if (timeoutId) clearTimeout(timeoutId);

      if (!result.success) {
        setErrorMsg(result.error || "Pendaftaran gagal. Silakan coba lagi.");
        setIsLoading(false);
      } else {
        const role = result.user?.role;
        if (role === 'Owner') window.location.href = '/dashboard';
        else if (role === 'Admin') window.location.href = '/admin/dashboard';
        else window.location.href = '/member/dashboard';
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Pendaftaran gagal (Koneksi bermasalah)";
      setErrorMsg(errorMessage);
      setIsLoading(false);
    }
  };

  const EyeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  );
  const EyeOffIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  );

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 py-12 bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white">

      <div className="relative w-full max-w-md p-[32px] md:p-[48px] rounded-[16px] bg-[var(--color-surface-1)] hairline-border shadow-2xl">

        {/* Logo + Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Gaul Gym Logo"
            width={120}
            height={120}
            priority
            style={{ objectFit: 'contain', margin: '0 auto 16px', borderRadius: '16px' }}
          />
          <p className="text-[14px] text-[var(--color-ink-muted)]">
            {view === 'login'
              ? "Masuk untuk mulai latihan"
              : selectedPlan ? `Mendaftar untuk Paket ${selectedPlan.toUpperCase()}` : "Buat akun baru"
            }
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-3 rounded-md text-[13px] font-medium flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {errorMsg}
          </div>
        )}

        {view === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="block text-[13px] font-medium mb-1.5 text-[var(--color-ink-subtle)]">
                Username atau Email
              </label>
              <input
                id="login-email"
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Username atau nama@email.com"
                required
                className="w-full px-[12px] py-[8px] rounded-md outline-none bg-[var(--color-surface-1)] text-[var(--color-ink)] hairline-border focus-ring placeholder:text-[var(--color-ink-subtle)] text-[14px] transition-shadow"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-[13px] font-medium mb-1.5 text-[var(--color-ink-subtle)]">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showLoginPw ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                  className="w-full px-[12px] py-[8px] pr-[40px] rounded-md outline-none bg-[var(--color-surface-1)] text-[var(--color-ink)] hairline-border focus-ring placeholder:text-[var(--color-ink-subtle)] text-[14px] transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPw(!showLoginPw)}
                  className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors"
                  aria-label={showLoginPw ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showLoginPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-[8px] px-[14px] rounded-md text-[14px] font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-focus)] transition-colors focus-ring disabled:opacity-50"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
            <p className="text-center mt-6 text-[13px] text-[var(--color-ink-muted)]">
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => { setView('register'); setErrorMsg(""); setFormErrors({}); }}
                className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors focus-ring rounded-sm outline-none"
              >
                Daftar sekarang
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="reg-name" className="block text-[13px] font-medium mb-1.5 text-[var(--color-ink-subtle)]">Nama Lengkap</label>
              <input
                id="reg-name"
                type="text"
                value={regData.name}
                onChange={(e) => { setRegData({ ...regData, name: e.target.value }); if (formErrors.name) setFormErrors({ ...formErrors, name: undefined }); }}
                placeholder="Masukkan nama lengkap"
                className="w-full px-[12px] py-[8px] rounded-md outline-none bg-[var(--color-surface-1)] text-[var(--color-ink)] hairline-border focus-ring placeholder:text-[var(--color-ink-subtle)] text-[14px] transition-shadow"
                aria-invalid={!!formErrors.name}
              />
              {formErrors.name && <p className="text-[12px] mt-1" style={{ color: '#ef4444' }}>{formErrors.name}</p>}
            </div>
            <div>
              <label htmlFor="reg-username" className="block text-[13px] font-medium mb-1.5 text-[var(--color-ink-subtle)]">Username</label>
              <input
                id="reg-username"
                type="text"
                value={regData.username}
                onChange={(e) => { setRegData({ ...regData, username: e.target.value }); if (formErrors.username) setFormErrors({ ...formErrors, username: undefined }); }}
                placeholder="contoh: ucok_sangar"
                className="w-full px-[12px] py-[8px] rounded-md outline-none bg-[var(--color-surface-1)] text-[var(--color-ink)] hairline-border focus-ring placeholder:text-[var(--color-ink-subtle)] text-[14px] transition-shadow"
                aria-invalid={!!formErrors.username}
              />
              {formErrors.username && <p className="text-[12px] mt-1" style={{ color: '#ef4444' }}>{formErrors.username}</p>}
            </div>
            <div>
              <label htmlFor="reg-password" className="block text-[13px] font-medium mb-1.5 text-[var(--color-ink-subtle)]">Kata Sandi</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showRegPw ? "text" : "password"}
                  value={regData.password}
                  onChange={(e) => { setRegData({ ...regData, password: e.target.value }); if (formErrors.password) setFormErrors({ ...formErrors, password: undefined }); }}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-[12px] py-[8px] pr-[40px] rounded-md outline-none bg-[var(--color-surface-1)] text-[var(--color-ink)] hairline-border focus-ring placeholder:text-[var(--color-ink-subtle)] text-[14px] transition-shadow"
                  aria-invalid={!!formErrors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowRegPw(!showRegPw)}
                  className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors"
                  aria-label={showRegPw ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showRegPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {formErrors.password && <p className="text-[12px] mt-1" style={{ color: '#ef4444' }}>{formErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-[8px] px-[14px] rounded-md text-[14px] font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-focus)] transition-colors focus-ring disabled:opacity-50"
            >
              {isLoading ? "Memproses..." : "Daftar"}
            </button>
            <p className="text-center mt-6 text-[13px] text-[var(--color-ink-muted)]">
              Sudah punya akun?{" "}
              <button
                type="button"
                onClick={() => { setView('login'); setErrorMsg(""); setFormErrors({}); }}
                className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors focus-ring rounded-sm outline-none"
              >
                Masuk
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AuthForms() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-canvas)]" />}>
      <AuthFormsContent />
    </Suspense>
  );
}