"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { colors } from "@/lib/design-tokens";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Pure redirector to the protected route which now hosts the AuthForms inline
    router.replace("/dashboard");
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: colors.background }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Mengalihkan ke Area Member...</p>
      </div>
    </div>
  );
}