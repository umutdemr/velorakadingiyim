"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Package,
  MapPin,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { apiFetch } from "@/app/lib/api";

type MeUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  createdAt?: string;
};

type MeResponse = { user: MeUser };

type OrderItem = {
  id: string;
  productName: string;
  productSlug?: string | null;
  image?: string | null;
  size?: string | null;
  unitPrice: number;
  quantity: number;
};

type Order = {
  id: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  items: OrderItem[];
};

type OrdersResponse = { orders: Order[] };

const TOKEN_KEY = "velora_token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null
  );
}

function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("velora_token");
  sessionStorage.removeItem("velora_token");
  localStorage.removeItem("velora_user");
  sessionStorage.removeItem("velora_user");
}

const formatTRY = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
    n
  );

function statusLabel(s: string) {
  switch (s) {
    case "pending":
      return "Beklemede";
    case "paid":
      return "Ödendi";
    case "shipped":
      return "Kargoda";
    case "delivered":
      return "Teslim edildi";
    case "cancelled":
      return "İptal";
    default:
      return s;
  }
}

function statusBadgeClass(s: string) {
  switch (s) {
    case "paid":
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "shipped":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "cancelled":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-neutral-50 text-neutral-700 border-neutral-200";
  }
}

export default function AccountPage() {
  const router = useRouter();

  const [tab, setTab] = useState<"profile" | "orders">("profile");

  const [me, setMe] = useState<MeUser | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [errMe, setErrMe] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [errOrders, setErrOrders] = useState<string | null>(null);

  const initials = useMemo(() => {
    const a = (me?.firstName?.[0] || "").toUpperCase();
    const b = (me?.lastName?.[0] || "").toUpperCase();
    return (a + b).trim() || "V";
  }, [me]);

  const redirectToLogin = useCallback(() => {
    router.replace(`/login?callbackUrl=${encodeURIComponent("/hesabim")}`);
  }, [router]);

  const fetchMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoadingMe(false);
      redirectToLogin();
      return;
    }

    try {
      setLoadingMe(true);
      setErrMe(null);

      const res = await apiFetch<MeResponse>("/customer/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      setMe(res.user);
    } catch (e: any) {
      const msg =
        e?.data?.message ||
        e?.message ||
        "Profil bilgileri alınamadı. Lütfen tekrar giriş yapın.";
      setErrMe(msg);

      // yetkisiz ise temizle + login
      clearAuth();
      redirectToLogin();
    } finally {
      setLoadingMe(false);
    }
  }, [redirectToLogin]);

  const fetchOrders = useCallback(async () => {
    const token = getToken();
    if (!token) {
      redirectToLogin();
      return;
    }

    try {
      setLoadingOrders(true);
      setErrOrders(null);

      const res = await apiFetch<OrdersResponse>("/customer/orders", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(Array.isArray(res.orders) ? res.orders : []);
    } catch (e: any) {
      const msg =
        e?.data?.message ||
        e?.message ||
        "Siparişler alınamadı. Lütfen tekrar deneyin.";
      setErrOrders(msg);

      clearAuth();
      redirectToLogin();
    } finally {
      setLoadingOrders(false);
    }
  }, [redirectToLogin]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (tab === "orders") fetchOrders();
  }, [tab, fetchOrders]);

  const logout = () => {
    clearAuth();
    router.replace("/login");
  };

  return (
    <main className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-neutral-500">
          <Link href="/" className="hover:underline">
            Anasayfa
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-700">Hesabım</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase text-neutral-500">
              Hesap Yönetimi
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
              {tab === "profile" ? "Profilim" : "Siparişlerim"}
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              {tab === "profile"
                ? "Bilgilerinizi görüntüleyin ve hesabınızı yönetin."
                : "Sipariş geçmişinizi görüntüleyin."}
            </p>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50 transition"
          >
            <LogOut className="h-4 w-4" />
            Çıkış yap
          </button>
        </div>

        {errMe && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errMe}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Sol Menü */}
          <aside className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-semibold text-lg">
                  {initials}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 truncate">
                    {loadingMe
                      ? "Yükleniyor..."
                      : `${me?.firstName || ""} ${me?.lastName || ""}`.trim() ||
                        "—"}
                  </p>
                  <p className="text-sm text-neutral-600 truncate">
                    {loadingMe ? "—" : me?.email || "—"}
                  </p>
                </div>
              </div>
            </div>

            <nav className="p-3">
              <MenuItem
                icon={<User className="h-4 w-4" />}
                active={tab === "profile"}
                onClick={() => setTab("profile")}
              >
                Profil
              </MenuItem>

              <MenuItem
                icon={<Package className="h-4 w-4" />}
                active={tab === "orders"}
                onClick={() => setTab("orders")}
              >
                Siparişler
              </MenuItem>

              <MenuItem icon={<MapPin className="h-4 w-4" />} disabled>
                Adresler (yakında)
              </MenuItem>

              <MenuItem icon={<Settings className="h-4 w-4" />} disabled>
                Ayarlar (yakında)
              </MenuItem>
            </nav>
          </aside>

          {/* Sağ İçerik */}
          <section className="space-y-6">
            {tab === "profile" ? (
              <>
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
                        Kişisel bilgiler
                      </h2>
                      <p className="mt-1 text-sm text-neutral-600">
                        Bu bilgiler sipariş ve iletişim için kullanılır.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="h-4 w-4" />
                      Güvenli hesap
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Ad"
                      value={loadingMe ? "—" : me?.firstName || "-"}
                    />
                    <Field
                      label="Soyad"
                      value={loadingMe ? "—" : me?.lastName || "-"}
                    />
                    <Field
                      label="E-posta"
                      value={loadingMe ? "—" : me?.email || "-"}
                    />
                    <Field
                      label="Telefon"
                      value={loadingMe ? "—" : me?.phone || "-"}
                    />
                  </div>

                  <div className="mt-6 rounded-2xl bg-neutral-50 border border-neutral-200 p-4 text-sm text-neutral-700">
                    Profil düzenleme ve şifre değiştirme ekranını istersen bir
                    sonraki adımda ekleyebiliriz (PATCH endpoint ile).
                  </div>
                </div>
              </>
            ) : (
              <>
                {errOrders && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {errOrders}
                  </div>
                )}

                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
                        Siparişlerim
                      </h2>
                      <p className="mt-1 text-sm text-neutral-600">
                        Son siparişleriniz burada listelenir.
                      </p>
                    </div>

                    <button
                      onClick={fetchOrders}
                      className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition"
                      disabled={loadingOrders}
                    >
                      {loadingOrders ? "Yükleniyor..." : "Yenile"}
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    {loadingOrders ? (
                      <OrdersSkeleton />
                    ) : orders.length === 0 ? (
                      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-700">
                        Henüz siparişiniz yok.
                      </div>
                    ) : (
                      orders.map((o) => (
                        <div
                          key={o.id}
                          className="rounded-2xl border border-neutral-200 bg-white p-5"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-neutral-900">
                                Sipariş #{o.id.slice(-6).toUpperCase()}
                              </p>
                              <p className="mt-1 text-sm text-neutral-600">
                                {new Date(o.createdAt).toLocaleString("tr-TR")}
                                {" · "}
                                {o.items.reduce(
                                  (a, it) => a + it.quantity,
                                  0
                                )}{" "}
                                ürün
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                                  o.status
                                )}`}
                              >
                                {statusLabel(o.status)}
                              </span>
                              <span className="text-sm font-semibold text-neutral-900">
                                {formatTRY(o.total)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {o.items.slice(0, 4).map((it) => (
                              <div
                                key={it.id}
                                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                              >
                                <div className="h-12 w-12 overflow-hidden rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
                                  {it.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={it.image}
                                      alt={it.productName}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-xs text-neutral-400">
                                      —
                                    </span>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-neutral-900 truncate">
                                    {it.productName}
                                  </p>
                                  <p className="text-xs text-neutral-600">
                                    {it.size ? `Beden: ${it.size} · ` : ""}
                                    Adet: {it.quantity}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {o.items.length > 4 && (
                            <p className="mt-3 text-xs text-neutral-500">
                              +{o.items.length - 4} ürün daha
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function MenuItem({
  children,
  icon,
  active,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition text-left ${
        disabled
          ? "opacity-60 cursor-not-allowed text-neutral-700"
          : active
          ? "bg-neutral-900 text-white"
          : "text-neutral-900 hover:bg-neutral-50"
      }`}
    >
      <span className={active ? "text-white" : "text-neutral-700"}>{icon}</span>
      <span className="truncate">{children}</span>
    </button>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.18em]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-neutral-900 break-words">
        {value}
      </p>
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-neutral-200 bg-white p-5"
        >
          <div className="h-4 w-40 bg-neutral-100 rounded animate-pulse" />
          <div className="mt-2 h-4 w-64 bg-neutral-100 rounded animate-pulse" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
            <div className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
