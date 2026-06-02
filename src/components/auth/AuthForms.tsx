"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useSearchParams, usePathname } from "next/navigation";
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

function AuthFormsContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const selectedPlan = searchParams.get('plan');
  const isRegister = searchParams.get('register') === 'true' || pathname === '/register';
  const [view, setView] = useState<'login' | 'register'>(isRegister ? 'register' : 'login');

  const { login, register } = useAuth();

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register State
  const [regData, setRegData] = useState({
    name: "",
    username: "",
    password: "",
    role: "Member",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 py-12 bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white">

      <div className="relative w-full max-w-md p-[32px] md:p-[48px] rounded-[16px] bg-[var(--color-surface-1)] hairline-border shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] mb-2 text-[var(--color-ink)]">
            GAUL GYM
          </h1>
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
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium mb-1.5 text-[var(--color-ink-subtle)]">
                Username atau Email
              </label>
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Username atau nama@email.com"
                required
                className="w-full px-[12px] py-[8px] rounded-md outline-none bg-[var(--color-surface-1)] text-[var(--color-ink)] hairline-border focus-ring placeholder:text-[var(--color-ink-tertiary)] text-[14px] transition-shadow"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium mb-1.5 text-[var(--color-ink-subtle)]">
                Kata Sandi
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                required
                className="w-full px-[12px] py-[8px] rounded-md outline-none bg-[var(--color-surface-1)] text-[var(--color-ink)] hairline-border focus-ring placeholder:text-[var(--color-ink-tertiary)] text-[14px] transition-shadow"
              />
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
                onClick={() => { setView('register'); setErrorMsg(""); }}
                className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors focus-ring rounded-sm outline-none"
              >
                Daftar sekarang
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium mb-1.5 text-[var(--color-ink-subtle)]">Nama Lengkap</label>
              <input
                type="text"
                value={regData.name}
                onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                required
                className="w-full px-[12px] py-[8px] rounded-md outline-none bg-[var(--color-surface-1)] text-[var(--color-ink)] hairline-border focus-ring placeholder:text-[var(--color-ink-tertiary)] text-[14px] transition-shadow"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium mb-1.5 text-[var(--color-ink-subtle)]">Username</label>
              <input
                type="text"
                value={regData.username}
                onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                placeholder="contoh: ucok_sangar"
                pattern="[a-zA-Z0-9_]+"
                required
                className="w-full px-[12px] py-[8px] rounded-md outline-none bg-[var(--color-surface-1)] text-[var(--color-ink)] hairline-border focus-ring placeholder:text-[var(--color-ink-tertiary)] text-[14px] transition-shadow"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium mb-1.5 text-[var(--color-ink-subtle)]">Kata Sandi</label>
              <input
                type="password"
                value={regData.password}
                onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                required
                minLength={6}
                className="w-full px-[12px] py-[8px] rounded-md outline-none bg-[var(--color-surface-1)] text-[var(--color-ink)] hairline-border focus-ring placeholder:text-[var(--color-ink-tertiary)] text-[14px] transition-shadow"
              />
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
                onClick={() => { setView('login'); setErrorMsg(""); }}
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