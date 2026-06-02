"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { colors, gradients, spacing, borderRadius } from "@/lib/design-tokens";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!loading && user) {
      window.location.href = "/dashboard";
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    // Auto-append @gaulgym.local if it's a username (no @ symbol)
    const loginEmail = email.includes("@") 
      ? email.trim().toLowerCase() 
      : `${email.trim().toLowerCase()}@gaulgym.com`;
    
    try {
      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise<{success: boolean, error?: string}>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("Koneksi timeout (45 detik). Server Supabase mungkin sedang lambat.")), 45000);
      });
      
      const result = await Promise.race([
        login(loginEmail, password),
        timeoutPromise
      ]);

      clearTimeout(timeoutId!);
      
      if (result.success) {
        router.push("/dashboard");
      } else {
        setErrorMsg(result.error || "Gagal masuk. Periksa email dan kata sandi Anda.");
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal masuk (Koneksi bermasalah)");
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
        style={{
          background: gradients.primary,
        }}
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
            Masuk untuk mulai latihan
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2" style={{ backgroundColor: 'rgba(239, 83, 80, 0.1)', color: colors.error, border: `1px solid rgba(239, 83, 80, 0.2)` }}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2"
              style={{ color: colors.textSecondary }}
            >
              Username atau Email
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Username atau nama@email.com"
              required
              className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 focus:ring-2"
              style={{
                backgroundColor: colors.surfaceVariant,
                color: colors.textPrimary,
                borderRadius: borderRadius.md,
                border: `1px solid ${colors.surfaceVariant}`,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary;
                e.target.style.boxShadow = `0 0 0 3px rgba(255, 87, 34, 0.2)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.surfaceVariant;
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
              style={{ color: colors.textSecondary }}
            >
              Kata Sandi
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
              required
              className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 focus:ring-2"
              style={{
                backgroundColor: colors.surfaceVariant,
                color: colors.textPrimary,
                borderRadius: borderRadius.md,
                border: `1px solid ${colors.surfaceVariant}`,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary;
                e.target.style.boxShadow = `0 0 0 3px rgba(255, 87, 34, 0.2)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.surfaceVariant;
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded"
                style={{ accentColor: colors.primary }}
              />
              <span
                className="ml-2"
                style={{ color: colors.textSecondary }}
              >
                Ingat saya
              </span>
            </label>
            <a
              href="#"
              className="transition-colors duration-200 hover:opacity-80"
              style={{ color: colors.primary }}
            >
              Lupa kata sandi?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: gradients.primary,
              borderRadius: borderRadius.md,
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Memproses...
              </span>
            ) : (
              "Masuk"
            )}
          </button>
        </form>



        {/* Register Link */}
        <p className="text-center mt-6 text-sm" style={{ color: colors.textSecondary }}>
          Belum punya akun?{" "}
          <a
            href="/register"
            className="font-semibold transition-colors duration-200 hover:opacity-80"
            style={{ color: colors.primary }}
          >
            Daftar sekarang
          </a>
        </p>
      </div>
    </div>
  );
}