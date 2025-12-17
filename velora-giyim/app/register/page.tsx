"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // opsiyonel
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(true);

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!firstName.trim()) return false;
    if (!lastName.trim()) return false;
    if (!email.trim()) return false;
    if (!password.trim()) return false;
    if (password.length < 6) return false;
    if (password !== password2) return false;
    if (!acceptTerms) return false;
    return true;
  }, [firstName, lastName, email, password, password2, acceptTerms]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!canSubmit) {
      if (!acceptTerms) {
        setError(
          "Devam etmek için Kullanım Koşulları ve KVKK metinlerini kabul etmelisiniz."
        );
        return;
      }
      if (password !== password2) {
        setError("Şifreler eşleşmiyor.");
        return;
      }
      if (password.length < 6) {
        setError("Şifre en az 6 karakter olmalıdır.");
        return;
      }
      setError("Lütfen zorunlu alanları doldurun.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() ? phone.trim() : null,
        password,
        newsletter,
      };

      // ✅ Backend: app/api/customer/route.ts (POST)
      await apiFetch("/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setSuccess("Kayıt başarılı. Giriş sayfasına yönlendiriliyorsunuz...");
      setTimeout(() => router.push("/login"), 700);
    } catch (err: any) {
      // apiFetch'in hata formatına göre en güvenlisi:
      const msg =
        err?.message ||
        err?.data?.message ||
        "Kayıt başarısız. Lütfen bilgileri kontrol edip tekrar deneyin.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-2 items-start">
          {/* Sol panel */}
          <section className="hidden lg:block">
            <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
              <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#B39B4C]/12 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-black/5 blur-3xl" />

              <div className="relative p-10">
                <p className="text-xs tracking-[0.22em] uppercase text-neutral-500">
                  Velora
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-900">
                  Üyelik oluşturun
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-neutral-600 max-w-md">
                  Siparişlerinizi takip edin, adreslerinizi kaydedin ve favori
                  ürünlerinize hızlıca erişin.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-3">
                  <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                    <p className="text-sm font-semibold text-neutral-900">
                      Hızlı alışveriş
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      Adres & ödeme bilgisi kayıt
                    </p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                    <p className="text-sm font-semibold text-neutral-900">
                      Sipariş takibi
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      Durum güncellemeleri
                    </p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                    <p className="text-sm font-semibold text-neutral-900">
                      Kişisel öneriler
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      Size özel seçkiler
                    </p>
                  </div>
                </div>

                <p className="mt-8 text-sm text-neutral-600">
                  Zaten üye misiniz?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-neutral-900 hover:underline"
                  >
                    Giriş yapın
                  </Link>
                </p>
              </div>
            </div>
          </section>

          {/* Form */}
          <section className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="mb-6">
                <p className="text-xs tracking-[0.22em] uppercase text-neutral-500">
                  Üyelik
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
                  Üye ol
                </h2>
                <p className="mt-2 text-sm text-neutral-600">
                  Bilgilerinizi girin ve hesabınızı oluşturun.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-neutral-900">
                      Ad
                    </label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      type="text"
                      autoComplete="given-name"
                      placeholder="Adınız"
                      className="mt-2 h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-neutral-900">
                      Soyad
                    </label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      type="text"
                      autoComplete="family-name"
                      placeholder="Soyadınız"
                      className="mt-2 h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-neutral-400"
                    />
                  </div>
                </div>

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
                    Telefon{" "}
                    <span className="text-xs text-neutral-500">
                      (opsiyonel)
                    </span>
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    autoComplete="tel"
                    placeholder="05xx xxx xx xx"
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
                      autoComplete="new-password"
                      placeholder="En az 6 karakter"
                      className="h-12 w-full rounded-2xl border border-neutral-200 bg-white pl-4 pr-14 text-sm outline-none transition focus:border-neutral-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
                    >
                      {showPw ? "Gizle" : "Göster"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-neutral-900">
                    Şifre tekrar
                  </label>
                  <div className="mt-2 relative">
                    <input
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                      type={showPw2 ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Şifreyi tekrar girin"
                      className="h-12 w-full rounded-2xl border border-neutral-200 bg-white pl-4 pr-14 text-sm outline-none transition focus:border-neutral-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw2((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
                    >
                      {showPw2 ? "Gizle" : "Göster"}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <label className="flex items-start gap-3 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-neutral-300"
                    />
                    <span className="leading-relaxed">
                      <Link
                        href="/kosullar"
                        className="font-semibold text-neutral-900 hover:underline"
                      >
                        Kullanım Koşulları
                      </Link>{" "}
                      ve{" "}
                      <Link
                        href="/kvkk"
                        className="font-semibold text-neutral-900 hover:underline"
                      >
                        KVKK
                      </Link>{" "}
                      metinlerini okudum ve kabul ediyorum.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={newsletter}
                      onChange={(e) => setNewsletter(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-neutral-300"
                    />
                    <span className="leading-relaxed">
                      Kampanya ve yeniliklerden e-posta ile haberdar olmak
                      istiyorum.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-neutral-900 text-sm font-semibold text-white hover:bg-black transition disabled:opacity-50 disabled:hover:bg-neutral-900 active:scale-[0.99]"
                >
                  {loading ? "Hesap oluşturuluyor..." : "Üye ol"}
                </button>

                <p className="pt-2 text-xs text-neutral-500 leading-relaxed">
                  Zaten üye misiniz?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-neutral-700 hover:underline"
                  >
                    Giriş yapın
                  </Link>
                  .
                </p>
              </form>
            </div>

            <div className="lg:hidden mt-6 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-neutral-900">
                Üyelik avantajları
              </p>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                <li className="flex items-center justify-between">
                  <span>Hızlı alışveriş</span>
                  <span className="text-neutral-500">Kayıtlı adres</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Sipariş takibi</span>
                  <span className="text-neutral-500">Tek ekranda</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Özel seçkiler</span>
                  <span className="text-neutral-500">Size özel</span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
