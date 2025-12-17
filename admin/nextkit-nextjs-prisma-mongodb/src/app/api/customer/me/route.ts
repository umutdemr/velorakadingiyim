import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Dev ortamı için basit CORS */
function withCors(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get("origin") || "*";
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Vary", "Origin");
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function OPTIONS(req: NextRequest) {
  return withCors(req, new NextResponse(null, { status: 204 }));
}

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") || "";
    const tokenFromHeader = auth.startsWith("Bearer ")
      ? auth.slice("Bearer ".length).trim()
      : null;

    const tokenFromCookie = req.cookies.get("velora_token")?.value || null;

    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return withCors(
        req,
        NextResponse.json({ message: "Yetkisiz" }, { status: 401 })
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return withCors(
        req,
        NextResponse.json(
          { message: "JWT_SECRET tanımlı değil" },
          { status: 500 }
        )
      );
    }

    let payload: any;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      return withCors(
        req,
        NextResponse.json({ message: "Geçersiz oturum" }, { status: 401 })
      );
    }

    // login endpointinde hangi alanı yazdıysan onu yakalayalım
    const userId = String(payload?.userId || payload?.sub || "").trim();
    if (!userId) {
      return withCors(
        req,
        NextResponse.json(
          { message: "Geçersiz token payload" },
          { status: 401 }
        )
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return withCors(
        req,
        NextResponse.json({ message: "Kullanıcı bulunamadı" }, { status: 404 })
      );
    }

    return withCors(req, NextResponse.json({ user }, { status: 200 }));
  } catch (err) {
    console.error("ME ERROR:", err);
    return withCors(
      req,
      NextResponse.json({ message: "Sunucu hatası" }, { status: 500 })
    );
  }
}
