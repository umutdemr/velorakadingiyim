import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================
   PRISMA SINGLETON
========================= */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

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
    "Access-Control-Allow-Methods": "GET,OPTIONS",
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

/* =========================
   OPTIONS – Preflight
========================= */
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req),
  });
}

/* =========================
   GET – Product Detail
========================= */
export async function GET(
  req: NextRequest,
  context: { params: { slug?: string } }
) {
  const headers = corsHeaders(req);

  try {
    const slug = context.params?.slug;

    if (!slug) {
      return NextResponse.json(
        { data: null, message: "Slug required" },
        { status: 400, headers }
      );
    }

    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      return NextResponse.json(
        { data: null, message: "Product not found" },
        { status: 404, headers }
      );
    }

    return NextResponse.json({ data: product }, { status: 200, headers });
  } catch (error) {
    console.error("GET /product/[slug] error:", error);
    return NextResponse.json({ data: null }, { status: 500, headers });
  }
}
