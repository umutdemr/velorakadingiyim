// app/api/customer/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================
   PRISMA SINGLETON
========================= */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/* =========================
   CORS CONFIG (FIXED)
========================= */
const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "http://localhost:3001",
  "https://velorakadingiyim.vercel.app",
  "https://illustrious-cendol-8fe0cb.netlify.app",
]);

function corsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "";

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (allowOrigin) {
    headers["Access-Control-Allow-Origin"] = allowOrigin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
}

function json(req: NextRequest, body: any, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: { ...(init?.headers || {}), ...corsHeaders(req) },
  });
}

/* =========================
   OPTIONS – Preflight
========================= */
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

/* =========================
   AUTH
========================= */
function normalizeSecret(v?: string | null) {
  if (!v) return "";
  const s = String(v).trim();
  return s
    .replace(/^"(.*)"$/, "$1")
    .replace(/^'(.*)'$/, "$1")
    .trim();
}

function getUserIdFromReq(req: NextRequest): string | null {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) return null;

  try {
    const secret = normalizeSecret(process.env.JWT_SECRET);
    if (!secret) return null;

    const payload = jwt.verify(token, secret) as any;
    return payload?.userId || payload?.sub || payload?.id || null;
  } catch {
    return null;
  }
}

type CreateOrderBody = {
  currency?: string; // default TRY
  status?: string; // pending|paid|...
  items: Array<{
    id?: string;
    productId?: string | null;

    name?: string;
    productName?: string;

    slug?: string;
    productSlug?: string | null;

    image?: string | null;
    size?: string | null;

    price?: number;
    unitPrice?: number;

    quantity?: number;
  }>;
};

/* =========================
   GET /api/customer/orders
========================= */
export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return json(
        req,
        { message: "Yetkisiz. Lütfen giriş yapın." },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    return json(req, { orders }, { status: 200 });
  } catch (err) {
    console.error("ORDERS GET ERROR:", err);
    return json(req, { message: "Sunucu hatası" }, { status: 500 });
  }
}

/* =========================
   POST /api/customer/orders
========================= */
export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return json(
        req,
        { message: "Yetkisiz. Lütfen giriş yapın." },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => null)) as CreateOrderBody | null;
    const items = Array.isArray(body?.items) ? body!.items : [];

    if (!items.length) {
      return json(
        req,
        { message: "Sepet boş. Sipariş oluşturulamadı." },
        { status: 400 }
      );
    }

    let total = 0;

    const mappedItems = items.map((it) => {
      const productIdRaw = String(it?.productId ?? it?.id ?? "").trim();
      const productName = String(it?.productName ?? it?.name ?? "").trim();

      const productSlugRaw = String(it?.productSlug ?? it?.slug ?? "").trim();
      const productSlug = productSlugRaw ? productSlugRaw : null;

      const unitPrice = Number(it?.unitPrice ?? it?.price);
      const quantity = Number(it?.quantity ?? 1);

      const image =
        it?.image !== undefined && it?.image !== null && String(it.image).trim()
          ? String(it.image).trim()
          : null;

      const size =
        it?.size !== undefined && it?.size !== null && String(it.size).trim()
          ? String(it.size).trim()
          : null;

      if (!productName) throw new Error("Ürün adı eksik.");
      if (!Number.isFinite(unitPrice) || unitPrice <= 0)
        throw new Error("Ürün fiyatı hatalı.");
      if (!Number.isInteger(quantity) || quantity <= 0)
        throw new Error("Ürün adedi hatalı.");

      total += unitPrice * quantity;

      return {
        productId: productIdRaw ? productIdRaw : null,
        productName,
        productSlug,
        image,
        size,
        unitPrice,
        quantity,
      };
    });

    const currency = String(body?.currency ?? "TRY").trim() || "TRY";
    const status = String(body?.status ?? "pending").trim() || "pending";

    const order = await prisma.order.create({
      data: {
        userId,
        status,
        total,
        currency,
        items: { create: mappedItems },
      },
      include: { items: true },
    });

    return json(
      req,
      { message: "Sipariş oluşturuldu", order },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("ORDERS POST ERROR:", err);

    const msg =
      typeof err?.message === "string" && err.message
        ? err.message
        : "Sunucu hatası";

    return json(req, { message: msg }, { status: 500 });
  }
}
