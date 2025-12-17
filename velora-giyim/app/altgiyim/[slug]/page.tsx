"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
};

export default function AltGiyimPage() {
  const params = useParams();

  // Hydration tamamlandı mı? (ilk render flicker'ını engeller)
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const slug: string | null = useMemo(() => {
    const s = (params as any)?.slug;
    if (typeof s === "string") return s;
    if (Array.isArray(s)) return s[0] ?? null;
    return null;
  }, [params]);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydration bitmeden hiçbir şey gösterme/fetchleme
    if (!hydrated) return;

    // slug henüz gelmediyse: loading açık kalsın (flash fix)
    if (!slug) {
      setLoading(true);
      return;
    }

    const controller = new AbortController();
    let alive = true;

    setLoading(true);

    (async () => {
      try {
        const res = await apiFetch<{ data: Product[] }>(
          `/product?slug=${encodeURIComponent(slug)}`,
          { signal: controller.signal }
        );

        if (!alive) return;

        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("Product fetch error:", err);
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
  }, [slug, hydrated]);

  const titles: Record<string, string> = {
    pantolon: "Pantolon Koleksiyonu 👖",
    etek: "Etek Koleksiyonu 👗",
    jeans: "Jean Koleksiyonu 👖",
    tayt: "Tayt Koleksiyonu 🧘‍♀️",
    sort: "Şort Koleksiyonu 🩳",
    tulum: "Tulum Koleksiyonu 🌟",
  };

  const descriptions: Record<string, string> = {
    pantolon:
      "Ofis şıklığından günlük stile uzanan pantolon koleksiyonumuzu keşfet.",
    etek: "Feminen ve zarif etek modelleriyle tarzına farklı bir dokunuş kat.",
    jeans:
      "Rahat ve modern jean koleksiyonumuzla her ana uygun kombinler oluştur.",
    tayt: "Spor ve günlük kullanım için konforlu tayt modelleriyle tanış.",
    sort: "Sıcak günlerde özgürlüğü hissetmek için şort koleksiyonumuzu incele.",
    tulum:
      "Şık, modern ve tek parça rahatlığı sunan tulum modellerimizle tanış.",
  };

  // Hydration/slug hazır değilken: direkt loading
  if (!hydrated || !slug) {
    return (
      <main className="pt-28 px-8 min-h-screen bg-[#fefcfb] text-gray-900">
        <section className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-semibold mb-4 text-center text-[#B39B4C]">
            Alt Giyim Koleksiyonu 👖
          </h1>
          <p className="text-center">Yükleniyor...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="pt-28 px-8 min-h-screen bg-[#fefcfb] text-gray-900">
      <section className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-semibold mb-4 text-center text-[#B39B4C]">
          {titles[slug] ?? "Alt Giyim Koleksiyonu 👖"}
        </h1>

        {descriptions[slug] && (
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            {descriptions[slug]}
          </p>
        )}

        {loading ? (
          <p className="text-center">Yükleniyor...</p>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link key={product.id} href={`/urun/${product.slug}`}>
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer">
                  <div className="overflow-hidden">
                    <img
                      src={product.images?.[0] || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-full h-80 object-cover hover:scale-105 transition"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5 text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      {product.name}
                    </h3>
                    <p className="text-[#B39B4C] font-medium">
                      ₺{product.price}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            Bu kategoriye ait ürün bulunmamaktadır.
          </p>
        )}
      </section>
    </main>
  );
}
