"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { colors, gradients, spacing, borderRadius } from "@/lib/design-tokens";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "Member",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const email = `${formData.username.trim().toLowerCase()}@gaulgym.com`;

    const { success, error } = await register(
      formData.name,
      email,
      formData.password,
      formData.role
    );

    if (success) {
      router.push("/dashboard");
    } else {
      setErrorMsg(error || "Pendaftaran gagal. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 py-12"
      style={{ backgroundColor: colors.background }}
    >
      <div
        className="relative w-full max-w-md p-8 rounded-2xl shadow-2xl"
        style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.xl,
        }}
      >
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-black tracking-tight mb-2 uppercase"
            style={{ color: colors.primary }}
          >
            GAUL GYM
          </h1>
          <p style={{ color: colors.textSecondary }}>Buat akun baru</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2" style={{ backgroundColor: 'rgba(239, 83, 80, 0.1)', color: colors.error, border: `1px solid rgba(239, 83, 80, 0.2)` }}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
              Nama Lengkap
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
            <label htmlFor="username" className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="contoh: ucok_sangar"
              pattern="[a-zA-Z0-9_]+"
              title="Hanya huruf, angka, dan underscore (_)"
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
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
              Kata Sandi
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
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
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: colors.textSecondary }}>
          Sudah punya akun?{" "}
          <a
            href="/login"
            className="font-semibold transition-colors duration-200 hover:opacity-80"
            style={{ color: colors.primary }}
          >
            Masuk
          </a>
        </p>
      </div>
    </div>
  );
}