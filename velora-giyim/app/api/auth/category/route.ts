import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL || "https://admin3-five.vercel.app";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/category`, {
      cache: "no-store",
    });

    const data = await res.json();

    return NextResponse.json(data, {
      status: res.status,
    });
  } catch (err) {
    console.error("Proxy /api/category error:", err);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
