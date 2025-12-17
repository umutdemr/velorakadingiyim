"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
};

const PLACEHOLDER_IMAGE = "/placeholder.jpg";

export default function SmoothProductSlider() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }),
    []
  );

  const scrollToItem = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const cardWidth = container.firstElementChild?.clientWidth || 320;

    container.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const controller = new AbortController();
    let alive = true;

    setLoading(true);

    (async () => {
      try {
        const res = await apiFetch<{ data: Product[] }>(
          `/api/product?limit=30`,
          { signal: controller.signal }
        );

        if (!alive) return;

        const safe = Array.isArray(res.data) ? res.data : [];
        setProducts(
          safe.map((p) => ({
            ...p,
            images:
              Array.isArray(p.images) && p.images.length > 0
                ? p.images.filter(Boolean)
                : [PLACEHOLDER_IMAGE],
          }))
        );
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("Slider product fetch error:", err);
        if (!alive) return;
        setProducts([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, []);

  return (
    <section className="relative w-full py-20 overflow-hidden bg-white">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs tracking-[0.22em] text-neutral-500 uppercase">
              Yeni Sezon
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
              Seçili Ürünler
            </h2>
            <p className="mt-2 text-sm text-neutral-600 max-w-2xl">
              Sezonun öne çıkan parçalarını keşfedin. Sade, modern ve premium
              kadın giyim seçkisi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollToItem("left")}
              className="
                inline-flex h-11 w-11 items-center justify-center rounded-full
                border border-neutral-200 bg-white shadow-sm
                hover:bg-neutral-50 transition
              "
              aria-label="Sola kaydır"
            >
              <ChevronLeft size={22} className="text-neutral-800" />
            </button>
            <button
              onClick={() => scrollToItem("right")}
              className="
                inline-flex h-11 w-11 items-center justify-center rounded-full
                border border-neutral-200 bg-white shadow-sm
                hover:bg-neutral-50 transition
              "
              aria-label="Sağa kaydır"
            >
              <ChevronRight size={22} className="text-neutral-800" />
            </button>
          </div>
        </div>

        {/* Slider */}
        <div
          ref={scrollRef}
          className="
            flex gap-5 overflow-x-auto scroll-smooth no-scrollbar
            snap-x snap-mandatory pb-2
          "
        >
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="
                  flex-shrink-0 snap-center
                  w-[78%] sm:w-[42%] md:w-[30%] lg:w-[22%] xl:w-[18%]
                "
              >
                <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                  <div className="h-[420px] bg-neutral-100 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-3/4 bg-neutral-100 rounded animate-pulse" />
                    <div className="h-6 w-1/2 bg-neutral-100 rounded animate-pulse" />
                    <div className="h-10 w-full bg-neutral-100 rounded-2xl animate-pulse" />
                  </div>
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((p) => (
              <Link
                key={p.id}
                href={`/urun/${p.slug}`}
                className="
                  group flex-shrink-0 snap-center
                  w-[78%] sm:w-[42%] md:w-[30%] lg:w-[22%] xl:w-[18%]
                "
              >
                <div
                  className="
                    rounded-3xl border border-neutral-200 bg-white shadow-sm
                    overflow-hidden transition
                    hover:shadow-xl hover:-translate-y-0.5
                  "
                >
                  {/* Image */}
                  <div className="relative h-[420px] overflow-hidden">
                    <img
                      src={p.images?.[0] || PLACEHOLDER_IMAGE}
                      alt={p.name}
                      className="
                        w-full h-full object-cover
                        transition-transform duration-700
                        group-hover:scale-[1.06]
                      "
                      loading="lazy"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="absolute left-4 top-4">
                      <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur border border-white/60 px-3 py-1 text-xs font-semibold text-neutral-900 shadow-sm">
                        Yeni
                      </span>
                    </div>

                    <div className="absolute inset-x-4 bottom-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="rounded-2xl bg-white/95 backdrop-blur border border-white/60 shadow-lg p-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-neutral-900 line-clamp-1">
                            {formatter.format(p.price)}
                          </span>
                          <span className="text-xs font-semibold text-neutral-600">
                            Ürünü incele
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <p className="text-xs tracking-[0.18em] text-neutral-500 uppercase">
                      Kadın Giyim
                    </p>
                    <h3 className="mt-2 font-semibold text-neutral-900 text-lg tracking-tight line-clamp-2">
                      {p.name}
                    </h3>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[#B39B4C] font-bold text-lg">
                        {formatter.format(p.price)}
                      </span>

                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800 group-hover:underline">
                        Detay
                        <span className="transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="w-full text-center text-neutral-600 py-10">
              Ürün bulunamadı.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
