// app/api/customer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ✅ DEV için izinli origin listesi
const ALLOWED_ORIGINS = new Set([
  "http://localhost:3001", // FE
  "http://localhost:3000", // BE aynı origin testleri
]);

function corsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "null";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    // Eğer cookie/credentials kullanacaksan:
    // "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

// ✅ Preflight
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function POST(req: NextRequest) {
  const headers = corsHeaders(req);

  try {
    const body = await req.json().catch(() => null);

    const firstName = String(body?.firstName ?? "").trim();
    const lastName = String(body?.lastName ?? "").trim();
    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();
    const phoneRaw = body?.phone;
    const phone =
      phoneRaw === null || phoneRaw === undefined
        ? null
        : String(phoneRaw).trim();
    const password = String(body?.password ?? "");

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "Ad, soyad, e-posta ve şifre zorunludur." },
        { status: 400, headers }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Şifre en az 6 karakter olmalıdır." },
        { status: 400, headers }
      );
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { message: "Bu e-posta zaten kayıtlı." },
        { status: 409, headers }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone: phone ? phone : null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Kayıt başarılı", user },
      { status: 201, headers }
    );
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return NextResponse.json(
      { message: "Sunucu hatası" },
      { status: 500, headers }
    );
  }
}
