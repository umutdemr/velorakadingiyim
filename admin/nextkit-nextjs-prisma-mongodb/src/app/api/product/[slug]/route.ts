import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

/* =========================
   CORS CONFIG
========================= */
const corsHeaders = {
  "Access-Control-Allow-Origin":
    process.env.NODE_ENV === "production"
      ? "https://velora-giyim.vercel.app"
      : "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/* =========================
   OPTIONS – Preflight
========================= */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/* =========================
   GET – Product Detail
========================= */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { data: null, message: "Slug required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      return NextResponse.json(
        { data: null, message: "Product not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { data: product },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("GET /product/[slug] error:", error);
    return NextResponse.json(
      { data: null },
      { status: 500, headers: corsHeaders }
    );
  }
}
