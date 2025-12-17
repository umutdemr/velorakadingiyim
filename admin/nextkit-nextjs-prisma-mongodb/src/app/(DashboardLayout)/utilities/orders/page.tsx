"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import CardBox from "@/app/components/shared/CardBox";
import { Button, Badge, Tooltip } from "flowbite-react";
import { Icon } from "@iconify/react/dist/iconify.js";

type OrderItem = {
  id: string;
  productName: string;
  productSlug?: string | null;
  image?: string | null;
  size?: string | null;
  unitPrice: number;
  quantity: number;
};

type OrderUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
};

type AdminOrder = {
  id: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled" | string;
  total: number;
  currency: string;
  createdAt: string;
  user: OrderUser;
  items: OrderItem[];
};

type OrdersResponse = { orders: AdminOrder[] };

const statusMeta: Record<
  string,
  { label: string; color: "gray" | "info" | "success" | "warning" | "failure" }
> = {
  pending: { label: "Beklemede", color: "warning" },
  paid: { label: "Ödendi", color: "success" },
  shipped: { label: "Kargoda", color: "info" },
  delivered: { label: "Teslim", color: "success" },
  cancelled: { label: "İptal", color: "failure" },
};

const getAdminToken = () => {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("admin_token") ||
    sessionStorage.getItem("admin_token") ||
    localStorage.getItem("velora_admin_token") ||
    sessionStorage.getItem("velora_admin_token")
  );
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }),
    []
  );

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return orders.filter((o) => {
      const statusOk = status === "all" ? true : o.status === status;
      if (!qq) return statusOk;

      const hay =
        [
          o.id,
          o.user?.email,
          o.user?.firstName,
          o.user?.lastName,
          o.items?.map((i) => i.productName).join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase() || "";

      return statusOk && hay.includes(qq);
    });
  }, [orders, q, status]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchOrders = async (signal?: AbortSignal) => {
    const token = getAdminToken();

    // ✅ 404 fix: hardcoded 3000 yerine aynı origin'deki endpoint'e istek atıyoruz
    // (Admin panel projesinde app/api/admin/orders/route.ts varsa bu çalışır)
    const res = await fetch("/api/admin/customer/orders", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
      signal,
    });

    const data: Partial<OrdersResponse & { message?: string }> = await res
      .json()
      .catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.message || "Siparişler yüklenemedi (API).");
    }

    return (data.orders || []) as AdminOrder[];
  };

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const list = await fetchOrders(ac.signal);
        setOrders(list);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setErr(e?.message || "Siparişler yüklenemedi (API).");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  return (
    <main className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.22em] uppercase text-muted">
            Sipariş Yönetimi
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-dark">Siparişler</h1>
          <p className="mt-1 text-sm text-muted">
            Tüm siparişleri görüntüleyin ve durumlarını yönetin.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            color="light"
            onClick={() => {
              setQ("");
              setStatus("all");
            }}
          >
            Temizle
          </Button>
          <Button
            onClick={async () => {
              try {
                setLoading(true);
                setErr(null);
                const list = await fetchOrders();
                setOrders(list);
              } catch (e: any) {
                setErr(e?.message || "Siparişler yenilenemedi.");
              } finally {
                setLoading(false);
              }
            }}
            className="bg-primary"
          >
            Yenile
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_220px]">
        <div className="relative">
          <Icon
            icon="mdi:magnify"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            width={20}
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Sipariş no, müşteri e-posta, ürün adı..."
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-400"
        >
          <option value="all">Tüm durumlar</option>
          <option value="pending">Beklemede</option>
          <option value="paid">Ödendi</option>
          <option value="shipped">Kargoda</option>
          <option value="delivered">Teslim</option>
          <option value="cancelled">İptal</option>
        </select>
      </div>

      {err && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {err}
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardBox key={i} className="p-6">
                <div className="h-4 w-32 bg-gray-100 rounded mb-3" />
                <div className="h-3 w-48 bg-gray-100 rounded mb-6" />
                <div className="h-24 w-full bg-gray-100 rounded" />
              </CardBox>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <CardBox className="p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
              <Icon
                icon="mdi:package-variant"
                width={22}
                className="text-muted"
              />
            </div>
            <p className="text-sm text-muted">Gösterilecek sipariş yok.</p>
          </CardBox>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((o) => {
              const meta = statusMeta[o.status] || {
                label: o.status,
                color: "gray" as const,
              };

              const itemsCount =
                o.items?.reduce((s, it) => s + it.quantity, 0) || 0;

              const firstImg = o.items?.[0]?.image || "/images/placeholder.png";

              return (
                <CardBox
                  key={o.id}
                  className="p-0 overflow-hidden group card-hover"
                >
                  <div className="relative">
                    <div className="overflow-hidden h-[180px] w-full bg-gray-50">
                      <Image
                        src={firstImg}
                        alt="order"
                        height={180}
                        width={600}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="absolute left-4 top-4">
                      <Badge color={meta.color}>{meta.label}</Badge>
                    </div>

                    <div className="absolute right-4 top-4 flex gap-2">
                      <Tooltip content="Detay">
                        <Link
                          href={`/orders/${o.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 border border-white/60 shadow-sm"
                        >
                          <Icon icon="mdi:eye-outline" width={18} />
                        </Link>
                      </Tooltip>

                      <Tooltip content="Kopyala (ID)">
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(o.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 border border-white/60 shadow-sm"
                        >
                          <Icon icon="mdi:content-copy" width={18} />
                        </button>
                      </Tooltip>
                    </div>

                    <div className="p-6 pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h6 className="text-base line-clamp-1 group-hover:text-primary">
                            #{o.id.slice(-8).toUpperCase()}
                          </h6>
                          <p className="text-sm text-muted line-clamp-1">
                            {o.user?.firstName} {o.user?.lastName} •{" "}
                            {o.user?.email}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-muted">Toplam</p>
                          <p className="text-[15px] font-semibold text-dark">
                            {formatter.format(o.total)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-sm">
                        <div className="text-muted flex items-center gap-2 font-medium">
                          <Icon icon="mdi:calendar-month-outline" width={18} />
                          <span className="text-dark">
                            {formatDate(o.createdAt)}
                          </span>
                        </div>

                        <div className="text-muted flex items-center gap-2 font-medium">
                          <Icon icon="mdi:shopping-outline" width={18} />
                          <span className="text-dark">{itemsCount} ürün</span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        {(o.items || []).slice(0, 3).map((it) => (
                          <div
                            key={it.id}
                            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-2"
                          >
                            <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                              <Image
                                src={it.image || "/images/placeholder.png"}
                                alt={it.productName}
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-dark line-clamp-1">
                                {it.productName}
                              </p>
                              <p className="text-xs text-muted">
                                {it.size ? `Beden: ${it.size} • ` : ""}
                                {it.quantity} adet •{" "}
                                {formatter.format(it.unitPrice)}
                              </p>
                            </div>
                          </div>
                        ))}

                        {o.items.length > 3 && (
                          <p className="text-xs text-muted">
                            +{o.items.length - 3} ürün daha
                          </p>
                        )}
                      </div>

                      <div className="mt-5 flex gap-2">
                        <Button
                          color="light"
                          className="w-full"
                          as={Link}
                          href={`/orders/${o.id}`}
                        >
                          Detay
                        </Button>

                        <Button
                          className="w-full bg-primary"
                          onClick={() => {
                            alert("Durum güncelleme (sonraki adım).");
                          }}
                        >
                          Durum Güncelle
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardBox>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
