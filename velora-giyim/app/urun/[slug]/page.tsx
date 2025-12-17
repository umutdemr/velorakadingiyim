"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/app/lib/api";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { useCart } from "@/app/context/CartContext";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  productCode: string;
  description?: string;
  content?: string;
  modelSizes?: string;
  sizes?: string[];
  washing?: string;
  stock: number;
};

type FavoriteItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
};

const PLACEHOLDER_IMAGE = "/placeholder.jpg";
const FAV_KEY = "velora_favorites";

function readFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? (arr as FavoriteItem[]) : [];
  } catch {
    return [];
  }
}

function writeFavorites(list: FavoriteItem[]) {
  localStorage.setItem(FAV_KEY, JSON.stringify(list));
}

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();

  const slug = useMemo(() => {
    const s = (params as any)?.slug;
    if (typeof s === "string") return s;
    if (Array.isArray(s)) return s[0] ?? null;
    return null;
  }, [params]);

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(PLACEHOLDER_IMAGE);
  const [selectedSize, setSelectedSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);

  const [isFav, setIsFav] = useState(false);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }),
    []
  );

  const toggleFavorite = () => {
    if (!product) return;

    const item: FavoriteItem = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: selectedImage || product.images?.[0] || PLACEHOLDER_IMAGE,
    };

    const list = readFavorites();
    const exists = list.some((x) => x.id === item.id);
    const next = exists
      ? list.filter((x) => x.id !== item.id)
      : [item, ...list];

    writeFavorites(next);
    setIsFav(!exists);
    setToast(exists ? "Favorilerden kaldırıldı." : "Favorilere eklendi.");
  };

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();
    let alive = true;

    setLoading(true);

    (async () => {
      try {
        const res = await apiFetch<{ data: Product }>(
          `/product/${encodeURIComponent(slug)}`,
          { signal: controller.signal }
        );

        const data = res.data;

        const safeImages =
          Array.isArray(data.images) && data.images.length > 0
            ? data.images.filter(Boolean)
            : [PLACEHOLDER_IMAGE];

        if (!alive) return;

        setProduct({ ...data, images: safeImages });
        setSelectedImage(safeImages[0] ?? PLACEHOLDER_IMAGE);
        setSelectedSize("");
        setSizeError(false);

        // ✅ favori kontrol
        try {
          const favs = readFavorites();
          setIsFav(favs.some((x) => x.id === data.id));
        } catch {}
      } catch (error: any) {
        if (error?.name === "AbortError") return;
        console.error("Product detail fetch error:", error);
        if (!alive) return;
        setProduct(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [slug]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  if (loading) {
    return (
      <main className="pt-24 pb-20 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="h-5 w-52 bg-neutral-100 rounded mb-6" />
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="aspect-[3/4] w-full rounded-3xl bg-neutral-100 animate-pulse" />
            <div className="space-y-4">
              <div className="h-9 w-3/4 bg-neutral-100 rounded animate-pulse" />
              <div className="h-4 w-1/3 bg-neutral-100 rounded animate-pulse" />
              <div className="h-8 w-40 bg-neutral-100 rounded animate-pulse" />
              <div className="h-28 w-full bg-neutral-100 rounded-3xl animate-pulse" />
              <div className="h-12 w-full bg-neutral-100 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="pt-36 px-4">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Ürün bulunamadı
          </h1>
          <p className="mt-2 text-neutral-600">
            Ürün kaldırılmış olabilir veya bağlantı hatalı olabilir.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition"
          >
            Alışverişe dön
          </Link>
        </div>
      </main>
    );
  }

  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;

  return (
    <main className="pt-20 pb-20 px-4 bg-[#fffdfb]">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div className="rounded-xl bg-black text-white text-sm font-semibold px-4 py-2 shadow-lg">
            {toast}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        <div className="mb-6 text-sm text-neutral-500">
          <Link href="/" className="hover:underline">
            Anasayfa
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-700">{product.name}</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <section className="lg:sticky lg:top-20 h-fit">
            <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
              <div className="relative">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full aspect-[3/4] object-cover"
                />

                {/* ✅ Favori toggle */}
                <button
                  type="button"
                  onClick={toggleFavorite}
                  className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur border border-neutral-200 shadow-sm hover:bg-white transition"
                  aria-label={isFav ? "Favorilerden kaldır" : "Favorilere ekle"}
                >
                  {isFav ? <BsHeartFill size={20} /> : <BsHeart size={20} />}
                </button>

                <div className="absolute left-4 top-4">
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                      Stokta
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white">
                      Tükendi
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {product.images.map((img, i) => {
                    const active = selectedImage === img;
                    return (
                      <button
                        key={`${img}-${i}`}
                        type="button"
                        onClick={() => setSelectedImage(img)}
                        className={`shrink-0 rounded-2xl border p-0.5 transition ${
                          active
                            ? "border-neutral-900"
                            : "border-neutral-200 hover:border-neutral-400"
                        }`}
                        aria-label={`Görsel ${i + 1}`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} ${i + 1}`}
                          className="h-24 w-20 rounded-xl object-cover"
                          loading="lazy"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
                <p className="font-semibold text-neutral-900">Hızlı kargo</p>
                <p className="text-neutral-600 mt-1">
                  24-48 saat içinde gönderim
                </p>
              </div>
              <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
                <p className="font-semibold text-neutral-900">Kolay iade</p>
                <p className="text-neutral-600 mt-1">14 gün içinde iade</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
                    {product.name}
                  </h1>
                  <p className="mt-2 text-sm text-neutral-500">
                    Ürün Kodu:{" "}
                    <span className="font-semibold text-neutral-900">
                      {product.productCode}
                    </span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-neutral-500">Fiyat</p>
                  <p className="text-3xl font-semibold text-neutral-900">
                    {formatter.format(product.price)}
                  </p>
                </div>
              </div>

              {product.description && (
                <p className="mt-5 text-sm leading-6 text-neutral-700">
                  {product.description}
                </p>
              )}

              {hasSizes && (
                <fieldset className="mt-7">
                  <div className="flex items-center justify-between">
                    <legend className="text-sm font-semibold text-neutral-900">
                      Beden
                      <span className="ml-2 text-xs font-semibold text-rose-600">
                        *
                      </span>
                    </legend>

                    <button
                      type="button"
                      className="text-xs font-semibold text-neutral-700 hover:underline"
                      onClick={() => setToast("Beden tablosu yakında.")}
                    >
                      Beden tablosu
                    </button>
                  </div>

                  <div
                    className={`mt-3 rounded-3xl border p-4 transition ${
                      sizeError
                        ? "border-rose-300 bg-rose-50"
                        : selectedSize
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-neutral-200 bg-neutral-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-neutral-600">
                          Seçiminiz
                        </p>
                        <p className="text-sm font-semibold text-neutral-900">
                          {selectedSize ? (
                            <span className="inline-flex items-center gap-2">
                              <span className="inline-block h-2 w-2 rounded-full bg-emerald-600" />
                              {selectedSize} beden seçildi
                            </span>
                          ) : (
                            "Lütfen bir beden seçin"
                          )}
                        </p>
                      </div>

                      {!selectedSize && (
                        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-700 border border-neutral-200">
                          Zorunlu
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {product.sizes!.map((size) => {
                        const active = selectedSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => {
                              setSelectedSize(size);
                              setSizeError(false);
                            }}
                            aria-pressed={active}
                            className={`group relative flex h-12 items-center justify-between rounded-2xl border px-4 text-sm font-semibold transition
                              ${
                                active
                                  ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
                                  : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400"
                              }`}
                          >
                            <span>{size}</span>

                            <span
                              className={`inline-flex h-5 w-5 items-center justify-center rounded-full border transition
                                ${
                                  active
                                    ? "border-white bg-white"
                                    : "border-neutral-300 bg-white group-hover:border-neutral-500"
                                }`}
                            >
                              {active && (
                                <span className="h-2.5 w-2.5 rounded-full bg-neutral-900" />
                              )}
                            </span>

                            {active && (
                              <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-neutral-900 ring-offset-2 ring-offset-white" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {sizeError && (
                      <p className="mt-3 text-xs font-semibold text-rose-700">
                        Sepete eklemek için beden seçmelisiniz.
                      </p>
                    )}
                  </div>
                </fieldset>
              )}

              <div className="mt-7 grid grid-cols-1 sm:grid-cols-[1fr_56px] gap-3">
                <button
                  disabled={!product.stock}
                  onClick={() => {
                    if (hasSizes && !selectedSize) {
                      setSizeError(true);
                      setToast("Beden seçmeden sepete ekleyemezsiniz.");
                      return;
                    }

                    addToCart({
                      id: product.id,
                      name: product.name,
                      slug: product.slug,
                      price: product.price,
                      image: selectedImage,
                      size: selectedSize,
                      quantity: 1,
                    });

                    setToast("Ürün sepete eklendi.");
                  }}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-neutral-900 text-sm font-semibold text-white hover:bg-black disabled:opacity-50 transition active:scale-[0.99]"
                >
                  Sepete ekle
                </button>

                {/* ✅ Favori toggle (CTA yanında) */}
                <button
                  type="button"
                  onClick={toggleFavorite}
                  className="inline-flex h-12 w-14 items-center justify-center rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 transition"
                  aria-label={isFav ? "Favorilerden kaldır" : "Favorilere ekle"}
                >
                  {isFav ? <BsHeartFill size={20} /> : <BsHeart size={20} />}
                </button>
              </div>

              <div className="mt-4 rounded-2xl bg-neutral-50 border border-neutral-200 p-4 text-xs text-neutral-700">
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <span className="font-semibold">Güvenli ödeme</span>
                  <span className="text-neutral-300">•</span>
                  <span>14 gün iade</span>
                  <span className="text-neutral-300">•</span>
                  <span>Hızlı kargo</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
                Ürün detayları
              </h2>

              <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4">
                  <dt className="text-neutral-500">Ürün içeriği</dt>
                  <dd className="font-semibold text-neutral-900 mt-1">
                    {product.content || "-"}
                  </dd>
                </div>

                <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4">
                  <dt className="text-neutral-500">Manken ölçüleri</dt>
                  <dd className="font-semibold text-neutral-900 mt-1">
                    {product.modelSizes || "-"}
                  </dd>
                </div>

                <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4">
                  <dt className="text-neutral-500">Yıkama talimatı</dt>
                  <dd className="font-semibold text-neutral-900 mt-1">
                    {product.washing || "-"}
                  </dd>
                </div>

                <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4">
                  <dt className="text-neutral-500">Stok</dt>
                  <dd className="font-semibold text-neutral-900 mt-1">
                    {product.stock > 0 ? product.stock : "Yok"}
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
