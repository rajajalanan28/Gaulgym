"use client";

import { useState } from "react";
import { colors, gradients, borderRadius } from "@/lib/design-tokens";
import { useAuth } from "@/lib/auth-context";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthFormsContent() {
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan');
  const isRegister = searchParams.get('register') === 'true';
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
      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise<{success: boolean, error?: string}>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("Koneksi timeout (45 detik). Server Supabase mungkin lambat.")), 45000);
      });
      
      const result = await Promise.race([
        login(finalEmail, loginPassword),
        timeoutPromise
      ]);

      clearTimeout(timeoutId!);
      
      if (!result.success) {
        setErrorMsg(result.error || "Gagal masuk. Periksa kembali.");
        setIsLoading(false);
      }
      // If success, AuthContext sets 'user' and ProtectedRoute instantly shows the dashboard
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal masuk (Koneksi bermasalah)");
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const email = `${regData.username.trim().toLowerCase()}@gaulgym.com`;

    try {
      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise<{success: boolean, error?: string}>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("Koneksi timeout (45 detik). Server Supabase mungkin lambat.")), 45000);
      });

      const result = await Promise.race([
        register(regData.name, email, regData.password, regData.role),
        timeoutPromise
      ]);

      clearTimeout(timeoutId!);

      if (!result.success) {
        setErrorMsg(result.error || "Pendaftaran gagal. Silakan coba lagi.");
        setIsLoading(false);
      }
      // If success, AuthContext sets 'user' and ProtectedRoute instantly shows the dashboard
    } catch (err: any) {
      setErrorMsg(err.message || "Pendaftaran gagal (Koneksi bermasalah)");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 py-12"
      style={{ backgroundColor: colors.background }}
    >
      {/* Background gradient overlay */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{ background: gradients.primary }}
      />

      <div
        className="relative w-full max-w-md p-8 rounded-2xl shadow-2xl"
        style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.xl,
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-black tracking-tight mb-2 uppercase"
            style={{ color: colors.primary }}
          >
            GAUL GYM
          </h1>
          <p style={{ color: colors.textSecondary }}>
            {view === 'login' 
              ? "Masuk untuk mulai latihan" 
              : selectedPlan ? `Mendaftar untuk Paket ${selectedPlan.toUpperCase()}` : "Buat akun baru"
            }
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2" style={{ backgroundColor: 'rgba(239, 83, 80, 0.1)', color: colors.error, border: `1px solid rgba(239, 83, 80, 0.2)` }}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {errorMsg}
          </div>
        )}

        {view === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                Username atau Email
              </label>
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Username atau nama@email.com"
                required
                className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 focus:ring-2"
                style={{
                  backgroundColor: colors.surfaceVariant,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.surfaceVariant}`,
                }}
                onFocus={(e) => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = `0 0 0 3px rgba(255, 87, 34, 0.2)`; }}
                onBlur={(e) => { e.target.style.borderColor = colors.surfaceVariant; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                Kata Sandi
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                required
                className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 focus:ring-2"
                style={{
                  backgroundColor: colors.surfaceVariant,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.surfaceVariant}`,
                }}
                onFocus={(e) => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = `0 0 0 3px rgba(255, 87, 34, 0.2)`; }}
                onBlur={(e) => { e.target.style.borderColor = colors.surfaceVariant; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{ background: gradients.primary, borderRadius: borderRadius.md }}
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
            <p className="text-center mt-6 text-sm" style={{ color: colors.textSecondary }}>
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => { setView('register'); setErrorMsg(""); }}
                className="font-semibold transition-colors duration-200 hover:opacity-80"
                style={{ color: colors.primary }}
              >
                Daftar sekarang
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Nama Lengkap</label>
              <input
                type="text"
                value={regData.name}
                onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 focus:ring-2"
                style={{
                  backgroundColor: colors.surfaceVariant,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.surfaceVariant}`,
                }}
                onFocus={(e) => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = `0 0 0 3px rgba(255, 87, 34, 0.2)`; }}
                onBlur={(e) => { e.target.style.borderColor = colors.surfaceVariant; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Username</label>
              <input
                type="text"
                value={regData.username}
                onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                placeholder="contoh: ucok_sangar"
                pattern="[a-zA-Z0-9_]+"
                required
                className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 focus:ring-2"
                style={{
                  backgroundColor: colors.surfaceVariant,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.surfaceVariant}`,
                }}
                onFocus={(e) => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = `0 0 0 3px rgba(255, 87, 34, 0.2)`; }}
                onBlur={(e) => { e.target.style.borderColor = colors.surfaceVariant; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Kata Sandi</label>
              <input
                type="password"
                value={regData.password}
                onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 focus:ring-2"
                style={{
                  backgroundColor: colors.surfaceVariant,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.surfaceVariant}`,
                }}
                onFocus={(e) => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = `0 0 0 3px rgba(255, 87, 34, 0.2)`; }}
                onBlur={(e) => { e.target.style.borderColor = colors.surfaceVariant; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{ background: gradients.primary }}
            >
              {isLoading ? "Memproses..." : "Daftar"}
            </button>
            <p className="text-center mt-6 text-sm" style={{ color: colors.textSecondary }}>
              Sudah punya akun?{" "}
              <button
                type="button"
                onClick={() => { setView('login'); setErrorMsg(""); }}
                className="font-semibold transition-colors duration-200 hover:opacity-80"
                style={{ color: colors.primary }}
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
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: colors.background }} />}>
      <AuthFormsContent />
    </Suspense>
  );
}
