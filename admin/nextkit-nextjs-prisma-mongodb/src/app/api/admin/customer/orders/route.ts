// app/api/admin/customer/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ---------- CORS ----------
const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "http://localhost:3001",
]);

function corsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(req: NextRequest, body: any, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: { ...(init?.headers || {}), ...corsHeaders(req) },
  });
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

// ---------- AUTH (ADMIN) ----------
function normalizeSecret(v?: string | null) {
  if (!v) return "";
  const s = String(v).trim();
  // .env’de tırnakla yazılmışsa temizle
  return s
    .replace(/^"(.*)"$/, "$1")
    .replace(/^'(.*)'$/, "$1")
    .trim();
}

/**
 * Sadece Authorization: Bearer ... kullan (token localStorage’dan geliyor).
 * Cookie fallback kapalı: yanlış token yüzünden TOKEN_INVALID / NOT_ADMIN’a düşmemek için.
 */
function getBearerToken(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || null;
}

async function verifyWithSecrets(token: string) {
  // Öncelik: ACCESS_TOKEN_SECRET, sonra JWT_SECRET (sende ikisi de var)
  const secrets = [
    normalizeSecret(process.env.ACCESS_TOKEN_SECRET),
    normalizeSecret(process.env.JWT_SECRET),
    normalizeSecret(process.env.NEXTAUTH_SECRET),
  ].filter(Boolean);

  let lastErr: any = null;

  for (const s of secrets) {
    try {
      const out = await jwtVerify(token, new TextEncoder().encode(s));
      return out.payload as any;
    } catch (e) {
      lastErr = e;
    }
  }

  const err: any = new Error("TOKEN_INVALID");
  err.cause = lastErr;
  throw err;
}

function isAdminRole(role: unknown) {
  const r = String(role || "")
    .trim()
    .toLowerCase();
  return r === "admin" || r === "superadmin" || r === "owner";
}

// ---------- GET /api/admin/customer/orders ----------
export async function GET(req: NextRequest) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return json(
        req,
        { message: "Yetkisiz. Admin girişi gerekli.", reason: "TOKEN_MISSING" },
        { status: 401 }
      );
    }

    let payload: any;
    try {
      payload = await verifyWithSecrets(token);
    } catch (e: any) {
      return json(
        req,
        {
          message: "Yetkisiz. Admin girişi gerekli.",
          reason: "TOKEN_INVALID",
          debug:
            e?.cause?.code || e?.cause?.name || e?.cause?.message || e?.message,
        },
        { status: 401 }
      );
    }

    if (!isAdminRole(payload?.role)) {
      return json(
        req,
        {
          message: "Yetkisiz. Admin yetkisi yok.",
          reason: "NOT_ADMIN",
          debug: { role: payload?.role ?? null, email: payload?.email ?? null },
        },
        { status: 403 }
      );
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        items: true,
      },
    });

    return json(req, { orders }, { status: 200 });
  } catch (err) {
    console.error("ADMIN CUSTOMER ORDERS GET ERROR:", err);
    return json(req, { message: "Sunucu hatası" }, { status: 500 });
  }
}
