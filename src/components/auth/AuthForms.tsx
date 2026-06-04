"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";

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
  const router = useRouter();
  const selectedPlan = searchParams.get('plan');
  const isRegister = searchParams.get('register') === 'true' || pathname === '/register' || pathname === '/daftar';
  const [view, setView] = useState<'login' | 'register'>(isRegister ? 'register' : 'login');

  const { login, register, loginWithGoogle, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'Owner') router.replace('/dashboard');
      else if (user.role === 'Admin') router.replace('/admin/dashboard');
      else router.replace('/member/dashboard');
    }
  }, [user, router]);

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
    
    if (!regData.password || regData.password.length < 12) errs.password = 'Kata sandi minimal 12 karakter.';
    else if (!/[A-Z]/.test(regData.password)) errs.password = 'Kata sandi harus mengandung huruf besar.';
    else if (!/[a-z]/.test(regData.password)) errs.password = 'Kata sandi harus mengandung huruf kecil.';
    else if (!/[0-9]/.test(regData.password)) errs.password = 'Kata sandi harus mengandung angka.';
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(regData.password)) errs.password = 'Kata sandi harus mengandung karakter khusus.';
    
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

  // Helper styles
  const inputContainerClass = "relative flex items-center group";
  const iconClass = "absolute left-[14px] text-[var(--color-ink-subtle)] group-focus-within:text-[var(--color-primary-focus)] transition-colors w-[18px] h-[18px]";
  const inputClass = "w-full pl-[42px] pr-[16px] py-[12px] rounded-[10px] outline-none bg-[var(--color-surface-2)] text-[var(--color-ink)] border border-[var(--color-hairline)] focus:border-[var(--color-primary-focus)] focus:bg-[var(--color-surface-1)] focus:shadow-[0_0_0_4px_rgba(94,106,210,0.1)] placeholder:text-[var(--color-ink-subtle)] text-[15px] transition-all";

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 py-12 bg-[#010102] overflow-hidden selection:bg-[var(--color-primary-focus)] selection:text-white">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-[var(--color-primary)] opacity-[0.03] blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[var(--color-primary)] opacity-[0.03] blur-[120px]"></div>
      </div>

      <div className="relative w-full max-w-[440px] z-10 animate-fade-in-up">
        <div className="relative p-[32px] md:p-[48px] rounded-[24px] bg-[var(--color-surface-1)] border border-[var(--color-hairline)] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl">

          {/* Logo + Header */}
          <div className="text-center mb-[32px] flex flex-col items-center">
            <div className="relative mb-[20px] group">
              <div className="absolute inset-0 bg-[var(--color-primary)] blur-[24px] opacity-20 group-hover:opacity-30 transition-opacity duration-500 rounded-full"></div>
              <Image
                src="/logo.png"
                alt="Gaul Gym Logo"
                width={130}
                height={130}
                priority
                style={{ objectFit: 'contain', borderRadius: '24px', position: 'relative', zIndex: 10, filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.5))' }}
              />
            </div>
            <p className="text-[15px] text-[var(--color-ink-muted)] mt-[8px]">
              {view === 'login'
                ? "Masuk ke akun Anda untuk melanjutkan"
                : selectedPlan ? `Lengkapi profil untuk Paket ${selectedPlan.toUpperCase()}` : "Daftar untuk memulai perjalanan Anda"
              }
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-[24px] p-[12px] rounded-[10px] text-[13px] font-medium flex items-center gap-[10px] bg-red-500/10 text-red-400 border border-red-500/20 animate-shake">
              <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {errorMsg}
            </div>
          )}

          <div className={`transition-all duration-300 ease-in-out ${view === 'login' ? 'opacity-100 translate-x-0' : 'opacity-100 translate-x-0'}`}>
            {view === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-[20px]" noValidate>
                <div>
                  <label htmlFor="login-email" className="block text-[13px] font-medium mb-[8px] text-[var(--color-ink-subtle)] ml-[2px]">
                    Username atau Email
                  </label>
                  <div className={inputContainerClass}>
                    <User className={iconClass} />
                    <input
                      id="login-email"
                      type="text"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="contoh: budi123 atau budi@email.com"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="login-password" className="block text-[13px] font-medium mb-[8px] text-[var(--color-ink-subtle)] ml-[2px]">
                    Kata Sandi
                  </label>
                  <div className={inputContainerClass}>
                    <Lock className={iconClass} />
                    <input
                      id="login-password"
                      type={showLoginPw ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      required
                      className={`${inputClass} pr-[44px]`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPw(!showLoginPw)}
                      className="absolute right-[14px] text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors w-[18px] h-[18px] flex items-center justify-center"
                      aria-label={showLoginPw ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    >
                      {showLoginPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-[12px] group py-[12px] px-[16px] rounded-[10px] text-[15px] font-semibold text-white bg-gradient-to-b from-[var(--color-primary-hover)] to-[var(--color-primary)] hover:from-[var(--color-primary)] hover:to-[var(--color-primary-focus)] border border-[#ffffff10] shadow-[0_4px_12px_rgba(94,106,210,0.25)] hover:shadow-[0_6px_16px_rgba(94,106,210,0.35)] hover:-translate-y-[1px] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-focus)] focus:ring-offset-[var(--color-canvas)] disabled:opacity-50 flex items-center justify-center gap-[8px]"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">Memproses<span className="flex gap-1"><span className="animate-bounce">.</span><span className="animate-bounce" style={{animationDelay: '0.1s'}}>.</span><span className="animate-bounce" style={{animationDelay: '0.2s'}}>.</span></span></span>
                  ) : (
                    <>Masuk <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
                
                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--color-hairline)]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[var(--color-surface-1)] text-[var(--color-ink-muted)]">Atau</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  className="w-full flex items-center justify-center gap-3 py-[12px] px-[16px] rounded-[10px] bg-white text-gray-800 font-semibold border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 focus:ring-offset-[var(--color-canvas)]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Lanjutkan dengan Google
                </button>
                
                <div className="pt-[16px] border-t border-[var(--color-hairline)] mt-[24px]">
                  <p className="text-center text-[14px] text-[var(--color-ink-muted)]">
                    Belum punya akun?{" "}
                    <button
                      type="button"
                      onClick={() => { setView('register'); setErrorMsg(""); setFormErrors({}); }}
                      className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors focus:outline-none focus:underline"
                    >
                      Daftar Sekarang
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-[16px]" noValidate>
                <div>
                  <label htmlFor="reg-name" className="block text-[13px] font-medium mb-[6px] text-[var(--color-ink-subtle)] ml-[2px]">Nama Lengkap</label>
                  <div className={inputContainerClass}>
                    <User className={iconClass} />
                    <input
                      id="reg-name"
                      type="text"
                      value={regData.name}
                      onChange={(e) => { setRegData({ ...regData, name: e.target.value }); if (formErrors.name) setFormErrors({ ...formErrors, name: undefined }); }}
                      placeholder="Masukkan nama lengkap"
                      className={`${inputClass} ${formErrors.name ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]' : ''}`}
                      aria-invalid={!!formErrors.name}
                    />
                  </div>
                  {formErrors.name && <p className="text-[12px] mt-[6px] ml-[2px] text-red-400">{formErrors.name}</p>}
                </div>
                <div>
                  <label htmlFor="reg-username" className="block text-[13px] font-medium mb-[6px] text-[var(--color-ink-subtle)] ml-[2px]">Username</label>
                  <div className={inputContainerClass}>
                    <Mail className={iconClass} />
                    <input
                      id="reg-username"
                      type="text"
                      value={regData.username}
                      onChange={(e) => { setRegData({ ...regData, username: e.target.value }); if (formErrors.username) setFormErrors({ ...formErrors, username: undefined }); }}
                      placeholder="contoh: ucok_sangar"
                      className={`${inputClass} ${formErrors.username ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]' : ''}`}
                      aria-invalid={!!formErrors.username}
                    />
                  </div>
                  {formErrors.username && <p className="text-[12px] mt-[6px] ml-[2px] text-red-400">{formErrors.username}</p>}
                </div>
                <div>
                  <label htmlFor="reg-password" className="block text-[13px] font-medium mb-[6px] text-[var(--color-ink-subtle)] ml-[2px]">Kata Sandi</label>
                  <div className={inputContainerClass}>
                    <Lock className={iconClass} />
                    <input
                      id="reg-password"
                      type={showRegPw ? "text" : "password"}
                      value={regData.password}
                      onChange={(e) => { setRegData({ ...regData, password: e.target.value }); if (formErrors.password) setFormErrors({ ...formErrors, password: undefined }); }}
                      placeholder="Minimal 6 karakter"
                      className={`${inputClass} pr-[44px] ${formErrors.password ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]' : ''}`}
                      aria-invalid={!!formErrors.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPw(!showRegPw)}
                      className="absolute right-[14px] text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors w-[18px] h-[18px] flex items-center justify-center"
                      aria-label={showRegPw ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    >
                      {showRegPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formErrors.password && <p className="text-[12px] mt-[6px] ml-[2px] text-red-400">{formErrors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-[20px] py-[12px] px-[16px] rounded-[10px] text-[15px] font-semibold text-white bg-gradient-to-b from-[var(--color-primary-hover)] to-[var(--color-primary)] hover:from-[var(--color-primary)] hover:to-[var(--color-primary-focus)] border border-[#ffffff10] shadow-[0_4px_12px_rgba(94,106,210,0.25)] hover:shadow-[0_6px_16px_rgba(94,106,210,0.35)] hover:-translate-y-[1px] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-focus)] focus:ring-offset-[var(--color-canvas)] disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">Memproses<span className="flex gap-1"><span className="animate-bounce">.</span><span className="animate-bounce" style={{animationDelay: '0.1s'}}>.</span><span className="animate-bounce" style={{animationDelay: '0.2s'}}>.</span></span></span>
                  ) : (
                    "Buat Akun Sekarang"
                  )}
                </button>
                
                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--color-hairline)]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[var(--color-surface-1)] text-[var(--color-ink-muted)]">Atau</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  className="w-full flex items-center justify-center gap-3 py-[12px] px-[16px] rounded-[10px] bg-white text-gray-800 font-semibold border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 focus:ring-offset-[var(--color-canvas)]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Lanjutkan dengan Google
                </button>
                
                <div className="pt-[16px] border-t border-[var(--color-hairline)] mt-[24px]">
                  <p className="text-center text-[14px] text-[var(--color-ink-muted)]">
                    Sudah punya akun?{" "}
                    <button
                      type="button"
                      onClick={() => { setView('login'); setErrorMsg(""); setFormErrors({}); }}
                      className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors focus:outline-none focus:underline"
                    >
                      Masuk
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
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