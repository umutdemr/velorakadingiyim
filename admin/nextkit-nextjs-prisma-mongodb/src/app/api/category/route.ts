import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* =========================
   CORS CONFIG
========================= */
const corsHeaders = {
  "Access-Control-Allow-Origin":
    process.env.NODE_ENV === "production"
      ? "https://velora-giyim.vercel.app"
      : "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/* =========================
   OPTIONS – Preflight (CORS)
========================= */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/* =========================
   GET – Categories (parent + children)
========================= */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        children: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ data: categories }, { headers: corsHeaders });
  } catch (error) {
    console.error("GET /category error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500, headers: corsHeaders }
    );
  }
}

/* =========================
   POST – Add Category (Main / Sub)
========================= */
export async function POST(req: NextRequest) {
  try {
    const { name, slug, parentId } = await req.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        parentId: parentId || null, // ✅ main category için kritik
      },
    });

    return NextResponse.json(
      { data: category },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("POST /category error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500, headers: corsHeaders }
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
        { status: 400, headers: corsHeaders }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("DELETE /category error:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500, headers: corsHeaders }
    );
  }
}
