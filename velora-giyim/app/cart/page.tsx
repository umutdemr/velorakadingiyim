"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";

type CreateOrderResponse = {
  message?: string;
  order?: { id: string };
};

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, clearCart } = useCart();

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }),
    []
  );

  const [promo, setPromo] = useState("");

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const FREE_SHIPPING_THRESHOLD = 1000;
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : cart.length ? 49.9 : 0;

  const total = subtotal + shipping;

  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem("velora_token") ||
      sessionStorage.getItem("velora_token")
    );
  };

  const onCompleteOrder = async () => {
    setPlaceError(null);
    if (!cart.length) return;

    const token = getToken();
    if (!token) {
      router.push(`/login?callbackUrl=/sepet`);
      return;
    }

    try {
      setPlacing(true);

      // ✅ schema.prisma ile uyumlu payload:
      // Order: total, currency
      // OrderItem: productId, productName, productSlug, image, size, unitPrice, quantity
      const res = await fetch("http://localhost:3000/api/customer/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          total, // Order.total (Float) zorunlu
          currency: "TRY",
          items: cart.map((i) => ({
            productId: i.id,
            productName: i.name,
            productSlug: i.slug ?? null,
            image: i.image ?? null,
            size: i.size ?? null,
            unitPrice: i.price,
            quantity: i.quantity,
          })),
        }),
      });

      const data: Partial<CreateOrderResponse> = await res
        .json()
        .catch(() => ({}));

      if (!res.ok) {
        setPlaceError(
          data?.message || "Sipariş oluşturulamadı. Lütfen tekrar deneyin."
        );
        return;
      }

      clearCart();
      router.push("/hesabim?tab=siparisler");
    } catch {
      setPlaceError("Sipariş oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-[70vh] pt-36 px-4">
        <div className="max-w-xl mx-auto text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              className="text-neutral-700"
            >
              <path
                d="M6.5 9.5h14l-1.2 6.5a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.6L6.5 9.5Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M6.5 9.5 5.7 6.8A2 2 0 0 0 3.8 5.5H2.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M9.5 20.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Sepetiniz boş
          </h1>
          <p className="mt-2 text-neutral-600">
            Sepetinize ürün ekleyerek alışverişe devam edebilirsiniz.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800 active:scale-[0.99] transition"
            >
              Alışverişe devam et
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition"
            >
              Yeni ürünleri keşfet
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-20 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-neutral-500">
              <Link href="/" className="hover:underline">
                Anasayfa
              </Link>
              <span className="mx-2">/</span>
              <span className="text-neutral-700">Sepet</span>
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Sepetim
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              {itemCount} ürün • Ara toplam:{" "}
              <span className="font-semibold text-neutral-900">
                {formatter.format(subtotal)}
              </span>
            </p>
          </div>

          <button
            onClick={clearCart}
            className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition"
          >
            Sepeti temizle
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <section className="space-y-4">
            {cart.map((item) => (
              <div
                key={`${item.id}-${item.size ?? ""}`}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <div className="flex gap-4">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    <img
                      src={item.image ?? "/placeholder.jpg"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-neutral-900">
                          {item.name}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
                          {item.size && (
                            <span className="rounded-lg bg-neutral-100 px-2 py-0.5">
                              Beden:{" "}
                              <span className="font-medium text-neutral-900">
                                {item.size}
                              </span>
                            </span>
                          )}
                          <span className="rounded-lg bg-neutral-100 px-2 py-0.5">
                            Adet:{" "}
                            <span className="font-medium text-neutral-900">
                              {item.quantity}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-neutral-500">Birim</p>
                        <p className="font-semibold text-neutral-900">
                          {formatter.format(item.price)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <button
                        onClick={() => removeFromCart(item.id, item.size)}
                        className="text-sm font-semibold text-red-600 hover:text-red-700 hover:underline"
                      >
                        Kaldır
                      </button>

                      <div className="text-right">
                        <p className="text-sm text-neutral-500">Ara toplam</p>
                        <p className="font-semibold text-neutral-900">
                          {formatter.format(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <aside className="lg:sticky lg:top-28 h-fit">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold tracking-tight">
                Sipariş özeti
              </h2>

              {shipping === 0 ? (
                <div className="mt-3 rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
                  Ücretsiz kargo uygulanıyor.
                </div>
              ) : (
                <div className="mt-3 rounded-xl bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                  Ücretsiz kargo için{" "}
                  <span className="font-semibold">
                    {formatter.format(
                      Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
                    )}
                  </span>{" "}
                  daha ekleyin.
                </div>
              )}

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between text-neutral-700">
                  <span>Ara toplam</span>
                  <span className="font-semibold text-neutral-900">
                    {formatter.format(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-neutral-700">
                  <span>Kargo</span>
                  <span className="font-semibold text-neutral-900">
                    {shipping === 0 ? "Ücretsiz" : formatter.format(shipping)}
                  </span>
                </div>

                <div className="h-px bg-neutral-200" />

                <div className="flex items-center justify-between">
                  <span className="text-neutral-700">Toplam</span>
                  <span className="text-base font-semibold text-neutral-900">
                    {formatter.format(total)}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <label className="text-sm font-semibold text-neutral-900">
                  Promosyon kodu
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder="Kodu girin"
                    className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-400"
                  />
                  <button
                    type="button"
                    className="h-11 shrink-0 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold hover:bg-neutral-50 transition"
                    onClick={() => {}}
                  >
                    Uygula
                  </button>
                </div>
              </div>

              {placeError && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {placeError}
                </div>
              )}

              <button
                onClick={onCompleteOrder}
                disabled={placing}
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-black text-sm font-semibold text-white hover:bg-neutral-800 active:scale-[0.99] transition disabled:opacity-60"
              >
                {placing ? "Sipariş oluşturuluyor..." : "Siparişi Tamamla"}
              </button>

              <p className="mt-3 text-xs text-neutral-500">
                Devam ederek Mesafeli Satış Sözleşmesi ve KVKK metnini kabul
                etmiş olursunuz.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
