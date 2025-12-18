import { NextResponse } from "next/server";

export async function GET() {
  const r = await fetch("https://admin3-five.vercel.app/api/category", {
    cache: "no-store",
  });

  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
