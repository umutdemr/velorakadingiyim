import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL || "https://admin3-five.vercel.app";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const qs = searchParams.toString(); // slug=etek&limit=30 gibi
    const url = `${BACKEND_URL}/api/product${qs ? `?${qs}` : ""}`;

    const res = await fetch(url, { cache: "no-store" });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "Upstream error" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Proxy /api/product error:", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
