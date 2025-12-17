"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Truck,
  RefreshCcw,
  CreditCard,
  ArrowRight,
} from "lucide-react";

const FEATURED = [
  {
    id: "new-season",
    eyebrow: "Yeni Sezon",
    title: "Modern silüetler, zamansız parçalar",
    desc: "Günlük şıklıktan özel gün stiline kadar seçili parçalar.",
    cta: "Yeni gelenleri keşfet",
    href: "/yeni-gelenler",
    img: "/images/5.png",
    size: "large" as const,
  },
  {
    id: "office-edit",
    eyebrow: "Ofis Edit",
    title: "Profesyonel görünüm",
    desc: "Minimal çizgiler, güçlü duruş.",
    cta: "Ofis stilini incele",
    href: "/koleksiyon/ofis",
    img: "/images/6.png",
    size: "small" as const,
  },
  {
    id: "evening",
    eyebrow: "Özel Gün",
    title: "Geceye uygun seçkiler",
    desc: "Işıltı, saten, zarif detaylar.",
    cta: "Özel gün seçkisi",
    href: "/koleksiyon/ozel-gun",
    img: "/images/4.png",
    size: "small" as const,
  },
];

const QUICK_CATEGORIES = [
  { label: "Elbise", href: "/ustgiyim/elbise" },
  { label: "Ceket", href: "/disgiyim/ceket" },
  { label: "Triko", href: "/ustgiyim/triko" },
  { label: "Takım", href: "/kadin-takim/takim" },
  { label: "Pantolon", href: "/altgiyim/pantolon" },
];

export default function HomeFeaturedSection() {
  return (
    <section className="relative w-full py-20 overflow-hidden bg-white">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Trust bar */}
        <div className="mb-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-neutral-900" />
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  Hızlı kargo
                </p>
                <p className="text-xs text-neutral-600">24-48 saat gönderim</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <RefreshCcw className="h-5 w-5 text-neutral-900" />
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  Kolay iade
                </p>
                <p className="text-xs text-neutral-600">14 gün içinde</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-neutral-900" />
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  Güvenli ödeme
                </p>
                <p className="text-xs text-neutral-600">3D Secure destekli</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-neutral-900" />
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  Orijinal ürün
                </p>
                <p className="text-xs text-neutral-600">Kalite garantisi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase text-neutral-500">
              Editör Seçkisi
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
              Ana sayfa seçkileri
            </h2>
            <p className="mt-2 text-sm text-neutral-600 max-w-2xl leading-relaxed">
              Kadın giyimde sezonun en iyi parçaları; sade, zarif ve
              kombinlemesi kolay.
            </p>
          </div>

          <Link
            href="/koleksiyonlar"
            className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50 transition"
          >
            Tüm koleksiyonlar <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {/* Featured grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Large card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <Link
              href={FEATURED[0].href}
              className="group relative block overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm hover:shadow-xl transition"
            >
              <div className="relative h-[520px] w-full">
                <Image
                  src={FEATURED[0].img}
                  alt={FEATURED[0].title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="inline-flex rounded-full bg-white/90 backdrop-blur border border-white/60 px-3 py-1 text-xs font-semibold text-neutral-900 shadow-sm">
                  {FEATURED[0].eyebrow}
                </p>

                <h3 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight text-white drop-shadow">
                  {FEATURED[0].title}
                </h3>

                <p className="mt-2 text-sm text-white/90 max-w-xl leading-relaxed">
                  {FEATURED[0].desc}
                </p>

                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-md hover:bg-neutral-100 transition">
                  {FEATURED[0].cta} <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Right stack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            {[FEATURED[1], FEATURED[2]].map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
              >
                <Link
                  href={item.href}
                  className="group relative block overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm hover:shadow-xl transition"
                >
                  <div className="relative h-[248px] w-full">
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="inline-flex rounded-full bg-white/90 backdrop-blur border border-white/60 px-3 py-1 text-xs font-semibold text-neutral-900 shadow-sm">
                      {item.eyebrow}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold tracking-tight text-white drop-shadow">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-white/90 leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
                      {item.cta} <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick categories */}
        <div className="mt-10 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                Hızlı kategori geçişi
              </p>
              <p className="text-sm text-neutral-600">
                En çok ziyaret edilen kategorilerden başlayın.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {QUICK_CATEGORIES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="
                  inline-flex items-center justify-center rounded-full
                  border border-neutral-200 bg-white px-4 py-2
                  text-sm font-semibold text-neutral-900
                  hover:bg-neutral-50 hover:border-neutral-300 transition
                "
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
