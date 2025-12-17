import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================
   PRISMA SINGLETON (dev'de connection leak önler)
========================= */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

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
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
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
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

/* =========================
   GET – Products
========================= */
export async function GET(req: NextRequest) {
  const headers = corsHeaders(req);

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(
        { data: products, message: "Products fetched successfully" },
        { status: 200, headers }
      );
    }

    const category = await prisma.category.findFirst({
      where: { slug },
      include: { children: true },
    });

    if (!category) {
      return NextResponse.json(
        { data: [], message: "No products found" },
        { status: 200, headers }
      );
    }

    const categoryIds = [
      category.id,
      ...category.children.map((child) => child.id),
    ];

    const products = await prisma.product.findMany({
      where: { categoryId: { in: categoryIds } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { data: products, message: "Products fetched successfully" },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500, headers }
    );
  }
}

/* =========================
   POST – Yeni ürün oluştur
========================= */
export async function POST(req: NextRequest) {
  const headers = corsHeaders(req);

  try {
    const body = await req.json();
    const {
      name,
      productCode,
      price,
      images,
      description,
      content,
      modelSizes,
      sizes,
      washing,
      categoryId,
      stock,
      slug,
    } = body;

    if (!name || !productCode || !price || !images || !slug) {
      return NextResponse.json(
        { error: "Please provide all required fields" },
        { status: 400, headers }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        productCode,
        price,
        images,
        description,
        content,
        modelSizes,
        sizes,
        washing,
        categoryId,
        stock: stock ?? 0,
        slug,
      },
    });

    return NextResponse.json(
      { data: newProduct, message: "Product created successfully" },
      { status: 201, headers }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers }
    );
  }
}

/* =========================
   PUT – Ürün güncelle
========================= */
export async function PUT(req: NextRequest) {
  const headers = corsHeaders(req);

  try {
    const body = await req.json();
    const {
      id,
      name,
      productCode,
      price,
      images,
      description,
      content,
      modelSizes,
      sizes,
      washing,
      categoryId,
      stock,
      slug,
    } = body;

    if (!id || !name || !productCode || !price || !images || !slug) {
      return NextResponse.json(
        { error: "Please provide all required fields" },
        { status: 400, headers }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        productCode,
        price,
        images,
        description,
        content,
        modelSizes,
        sizes,
        washing,
        categoryId,
        stock,
        slug,
      },
    });

    return NextResponse.json(
      { data: updatedProduct, message: "Product updated successfully" },
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error("Error updating product:", error);

    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404, headers }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers }
    );
  }
}

/* =========================
   DELETE – Ürün sil
   ✅ /api/product?id=... (query)
   ✅ veya body: { id: "..." }
========================= */
export async function DELETE(req: NextRequest) {
  const headers = corsHeaders(req);

  try {
    const idFromQuery = req.nextUrl.searchParams.get("id");

    let idFromBody: string | null = null;
    if (!idFromQuery) {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          const body = await req.json();
          idFromBody = body?.id ?? null;
        } catch {
          // ignore
        }
      }
    }

    const id = idFromQuery ?? idFromBody;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID required (use ?id=... or JSON body {id})" },
        { status: 400, headers }
      );
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error("Error deleting product:", error);

    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404, headers }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers }
    );
  }
}
