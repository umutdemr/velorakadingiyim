"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

type FavoriteItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
};

const STORAGE_KEY = "velora_favorites";
const PLACEHOLDER_IMAGE = "/placeholder.jpg";

export default function FavoritesPage() {
  const { addToCart } = useCart();

  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }),
    []
  );

  const readFavorites = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? (arr as FavoriteItem[]) : [];
    } catch {
      return [];
    }
  };

  const writeFavorites = (next: FavoriteItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setItems(next);
  };

  useEffect(() => {
    const initial = readFavorites();
    setItems(
      initial.map((x) => ({
        ...x,
        image: x.image || PLACEHOLDER_IMAGE,
      }))
    );
    setLoaded(true);

    // başka sekmeden güncellenirse
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const next = readFavorites();
        setItems(next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeOne = (id: string) => {
    const next = items.filter((x) => x.id !== id);
    writeFavorites(next);
  };

  const clearAll = () => writeFavorites([]);

  return (
    <main className="pt-24 pb-20 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase text-neutral-500">
              Favoriler
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
              Beğendiklerim
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Favoriye eklediğiniz ürünleri burada takip edin.
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearAll}
              className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50 transition"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Tümünü temizle
            </button>
          )}
        </div>

        <div className="mt-8 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />

        {/* Empty */}
        {loaded && items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-50 border border-neutral-200">
              <Heart className="h-6 w-6" />
            </div>

            <h2 className="text-xl font-semibold text-neutral-900">
              Favorileriniz boş
            </h2>
            <p className="mt-2 text-sm text-neutral-600 max-w-md mx-auto">
              Ürün detay sayfasındaki kalp ikonuna tıklayarak favorilerinize
              ekleyebilirsiniz.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-black transition"
            >
              Alışverişe başla
            </Link>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((p) => (
                <div
                  key={p.id}
                  className="group rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden hover:shadow-xl transition"
                >
                  <Link href={`/urun/${p.slug}`} className="block">
                    <div className="relative h-[420px] overflow-hidden">
                      <img
                        src={p.image || PLACEHOLDER_IMAGE}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          removeOne(p.id);
                        }}
                        className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur border border-white/60 shadow-sm hover:bg-white transition"
                        aria-label="Favorilerden kaldır"
                      >
                        <Heart className="h-5 w-5 fill-black" />
                      </button>
                    </div>
                  </Link>

                  <div className="p-5">
                    <p className="text-xs tracking-[0.18em] uppercase text-neutral-500">
                      Kadın giyim
                    </p>

                    <Link href={`/urun/${p.slug}`}>
                      <h3 className="mt-2 text-lg font-semibold tracking-tight text-neutral-900 line-clamp-2 hover:underline">
                        {p.name}
                      </h3>
                    </Link>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[#B39B4C] font-bold text-lg">
                        {formatter.format(p.price)}
                      </span>

                      <button
                        onClick={() => {
                          addToCart({
                            id: p.id,
                            name: p.name,
                            slug: p.slug,
                            price: p.price,
                            image: p.image || PLACEHOLDER_IMAGE,
                            size: "",
                            quantity: 1,
                          });
                        }}
                        className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black transition"
                      >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Sepete ekle
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer note */}
            <div className="mt-10 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-neutral-600">
                Favoriler tarayıcınızda saklanır. Cihaz/ tarayıcı
                değiştirirseniz liste sıfırlanabilir.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
