"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

type LoginResponse = {
  message?: string;
  token: string;
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    createdAt?: string;
  };
};

const TOKEN_KEY = "velora_token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawCb = searchParams.get("callbackUrl");
  const callbackUrl = rawCb && rawCb.startsWith("/") ? rawCb : "/hesabim";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Token zaten varsa login ekranında kalma
  useEffect(() => {
    const token = getToken();
    if (token) router.replace(callbackUrl);
  }, [router, callbackUrl]);

  const canSubmit = useMemo(() => {
    if (!email.trim()) return false;
    if (!password.trim()) return false;
    return true;
  }, [email, password]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Lütfen e-posta ve şifre alanlarını doldurun.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiFetch<LoginResponse>("/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!data?.token || !data?.user) {
        setError("Giriş cevabı eksik (token/user).");
        return;
      }

      if (remember) {
        localStorage.setItem("velora_token", data.token);
        localStorage.setItem("velora_user", JSON.stringify(data.user));
        sessionStorage.removeItem("velora_token");
        sessionStorage.removeItem("velora_user");
      } else {
        sessionStorage.setItem("velora_token", data.token);
        sessionStorage.setItem("velora_user", JSON.stringify(data.user));
        localStorage.removeItem("velora_token");
        localStorage.removeItem("velora_user");
      }

      router.replace(callbackUrl);
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Giriş başarısız. Bilgilerinizi kontrol edin.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          {/* Sol */}
          <section className="hidden lg:block">
            <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
              <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#B39B4C]/12 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-black/5 blur-3xl" />

              <div className="relative p-10">
                <p className="text-xs tracking-[0.22em] uppercase text-neutral-500">
                  Velora
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-900">
                  Hesabınıza giriş yapın
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-neutral-600 max-w-md">
                  Favorilerinize, siparişlerinize ve adreslerinize hızlıca
                  erişin.
                </p>

                <p className="mt-8 text-sm text-neutral-600">
                  Hesabınız yok mu?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-neutral-900 hover:underline"
                  >
                    Üye olun
                  </Link>
                </p>
              </div>
            </div>
          </section>

          {/* Sağ */}
          <section className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="mb-6">
                <p className="text-xs tracking-[0.22em] uppercase text-neutral-500">
                  Üye Girişi
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
                  Giriş yap
                </h2>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-neutral-900">
                    E-posta
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="ornek@eposta.com"
                    className="mt-2 h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-neutral-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-neutral-900">
                    Şifre
                  </label>

                  <div className="mt-2 relative">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="h-12 w-full rounded-2xl border border-neutral-200 bg-white pl-4 pr-14 text-sm outline-none transition focus:border-neutral-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
                      aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                      {showPw ? "Gizle" : "Göster"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300"
                    />
                    Beni hatırla
                  </label>

                  <Link
                    href="/register"
                    className="text-sm font-semibold text-neutral-900 hover:underline"
                  >
                    Üye ol
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-neutral-900 text-sm font-semibold text-white hover:bg-black transition disabled:opacity-50 disabled:hover:bg-neutral-900 active:scale-[0.99]"
                >
                  {loading ? "Giriş yapılıyor..." : "Giriş yap"}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
