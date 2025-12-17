"use client";

import Link from "next/link";
import { Instagram, Mail, MessageCircle, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className=" border-black/5 bg-gradient-to-b from-white via-[#FFFCF3] to-[#FFF6E2] text-neutral-900">
      {/* premium glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full bg-[#B39B4C]/10 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 h-[420px] w-[420px] rounded-full bg-black/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Newsletter */}
        <div className="pt-14 pb-10">
          <div className="rounded-3xl border border-neutral-200 bg-white/80 backdrop-blur shadow-sm p-7 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
              <div>
                <p className="text-xs tracking-[0.22em] uppercase text-neutral-500">
                  Velora
                </p>
                <h3 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
                  Yeni sezon & özel fırsatlar
                </h3>
                <p className="mt-2 text-sm text-neutral-600 max-w-xl">
                  Kampanyalardan ilk siz haberdar olun. E-posta listemize
                  katılın; yeni koleksiyonlar, indirimler ve stil önerileri.
                </p>
              </div>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="flex-1">
                  <label className="sr-only" htmlFor="footer-email">
                    E-posta
                  </label>
                  <input
                    id="footer-email"
                    type="email"
                    placeholder="E-posta adresiniz"
                    className="
                      h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm
                      outline-none transition focus:border-neutral-400
                      placeholder:text-neutral-400
                    "
                  />
                </div>
                <button
                  type="submit"
                  className="
                    inline-flex h-12 items-center justify-center gap-2 rounded-2xl
                    bg-neutral-900 px-5 text-sm font-semibold text-white
                    hover:bg-black transition active:scale-[0.99]
                  "
                >
                  Abone ol <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <p className="text-xs text-neutral-500 lg:col-span-2">
                Abone olarak{" "}
                <Link href="/kvkk" className="font-semibold hover:underline">
                  KVKK
                </Link>{" "}
                kapsamında bilgilendirmeyi kabul etmiş olursunuz.
              </p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="pb-14">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <p className="font-serif text-2xl tracking-widest">VELORA</p>
              <p className="mt-3 text-sm text-neutral-600 leading-relaxed max-w-sm">
                Zarafet ve modern çizgilerle tasarlanan kadın giyim
                koleksiyonları. Her gün için sade, premium ve güçlü bir stil.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <a
                  href="https://www.instagram.com/velora__giyim/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 transition"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>

                <a
                  href="https://wa.me/905427139714?text=Merhaba%20Velora%20Butik%2C%20%C3%BCr%C3%BCn%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 transition"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>

                <a
                  href="mailto:velorakadingiyimm@gmail.com"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 transition"
                  aria-label="E-posta"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4 className="text-sm font-semibold tracking-[0.22em] uppercase text-neutral-700">
                Mağaza
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-neutral-600">
                <li>
                  <Link
                    href="/ustgiyim/ceket"
                    className="hover:text-neutral-900 hover:underline"
                  >
                    Üst giyim
                  </Link>
                </li>
                <li>
                  <Link
                    href="/altgiyim/pantolon"
                    className="hover:text-neutral-900 hover:underline"
                  >
                    Alt giyim
                  </Link>
                </li>
                <li>
                  <Link
                    href="/disgiyim/kaban"
                    className="hover:text-neutral-900 hover:underline"
                  >
                    Dış giyim
                  </Link>
                </li>
                <li>
                  <Link
                    href="/takim/takimelbise"
                    className="hover:text-neutral-900 hover:underline"
                  >
                    Takımlar
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help */}
            <div>
              <h4 className="text-sm font-semibold tracking-[0.22em] uppercase text-neutral-700">
                Yardım
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-neutral-600">
                <li>
                  <Link
                    href="/sss"
                    className="hover:text-neutral-900 hover:underline"
                  >
                    S.S.S
                  </Link>
                </li>
                <li>
                  <Link
                    href="/kargo-teslimat"
                    className="hover:text-neutral-900 hover:underline"
                  >
                    Kargo & Teslimat
                  </Link>
                </li>
                <li>
                  <Link
                    href="/iade"
                    className="hover:text-neutral-900 hover:underline"
                  >
                    İade politikası
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gizlilik"
                    className="hover:text-neutral-900 hover:underline"
                  >
                    Gizlilik politikası
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold tracking-[0.22em] uppercase text-neutral-700">
                İletişim
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-neutral-600">
                <li className="flex items-center justify-between gap-3">
                  <span className="text-neutral-500">E-posta</span>
                  <a
                    href="mailto:velorakadingiyimm@gmail.com"
                    className="font-semibold text-neutral-900 hover:underline"
                  >
                    velorakadingiyimm@gmail.com
                  </a>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-neutral-500">Telefon</span>
                  <a
                    href="tel:+905427139714"
                    className="font-semibold text-neutral-900 hover:underline"
                  >
                    +90 542 713 97 14
                  </a>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-neutral-500">Konum</span>
                  <span className="font-semibold text-neutral-900">
                    İstanbul, Türkiye
                  </span>
                </li>
              </ul>

              <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
                <p className="text-xs font-semibold text-neutral-700">
                  Çalışma saatleri
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  Hafta içi 09:00 – 18:00
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative py-6 border-t border-black/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-600">
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-neutral-900">Velora</span>.
              Tüm hakları saklıdır.
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link
                href="/kosullar"
                className="text-neutral-600 hover:text-neutral-900 hover:underline"
              >
                Kullanım Koşulları
              </Link>
              <Link
                href="/kvkk"
                className="text-neutral-600 hover:text-neutral-900 hover:underline"
              >
                KVKK
              </Link>
              <Link
                href="/gizlilik"
                className="text-neutral-600 hover:text-neutral-900 hover:underline"
              >
                Gizlilik
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
