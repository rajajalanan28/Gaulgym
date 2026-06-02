"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { colors, gradients, spacing, borderRadius } from "@/lib/design-tokens";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    const { success, error } = await login(email, password);
    
    if (success) {
      router.push("/dashboard");
    } else {
      setErrorMsg(error || "Gagal masuk. Periksa email dan kata sandi Anda.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {/* Background gradient overlay */}
      <div
        className="absolute inset-0 opacity-10"
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
          <div
            className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: gradients.primary }}
          >
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: colors.textPrimary }}
          >
            GYM PRO
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
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
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

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px" style={{ backgroundColor: colors.surfaceVariant }} />
          <span className="px-4 text-sm" style={{ color: colors.textHint }}>
            atau
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: colors.surfaceVariant }} />
        </div>

        {/* Social Login */}
        <div className="flex gap-4">
          <button
            type="button"
            className="flex-1 py-3 rounded-xl font-medium transition-all duration-200 hover:opacity-80"
            style={{
              backgroundColor: colors.surfaceVariant,
              color: colors.textPrimary,
              borderRadius: borderRadius.md,
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </span>
          </button>
          <button
            type="button"
            className="flex-1 py-3 rounded-xl font-medium transition-all duration-200 hover:opacity-80"
            style={{
              backgroundColor: colors.surfaceVariant,
              color: colors.textPrimary,
              borderRadius: borderRadius.md,
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </span>
          </button>
        </div>

        {/* Register Link */}
        <p className="text-center mt-6 text-sm" style={{ color: colors.textSecondary }}>
          Belum punya akun?{" "}
          <a
            href="#"
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