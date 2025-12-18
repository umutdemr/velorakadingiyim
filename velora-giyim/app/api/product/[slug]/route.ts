import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL || "https://admin3-five.vercel.app";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const res = await fetch(
      `${BACKEND_URL}/api/product/${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Proxy /api/product/[slug] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch product detail" },
      { status: 500 }
    );
  }
}
