import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
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
]);

function corsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "";

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
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
   GET – Categories
========================= */
export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        children: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      { data: categories },
      { status: 200, headers: corsHeaders(req) }
    );
  } catch (error) {
    console.error("GET /category error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}

/* =========================
   POST – Add Category
========================= */
export async function POST(req: NextRequest) {
  try {
    const { name, slug, parentId } = await req.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400, headers: corsHeaders(req) }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        parentId: parentId || null,
      },
    });

    return NextResponse.json(
      { data: category },
      { status: 201, headers: corsHeaders(req) }
    );
  } catch (error) {
    console.error("POST /category error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}

/* =========================
   DELETE – Remove Category
========================= */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400, headers: corsHeaders(req) }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true },
      { status: 200, headers: corsHeaders(req) }
    );
  } catch (error) {
    console.error("DELETE /category error:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}
