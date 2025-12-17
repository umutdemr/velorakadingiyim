import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = body?.email?.trim()?.toLowerCase();
  const password = body?.password as string | undefined;
  const name = body?.name?.trim() || null;

  if (!email || !password || password.length < 6) {
    return NextResponse.json(
      { message: "E-posta ve en az 6 karakter şifre gerekli." },
      { status: 400 }
    );
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json(
      { message: "Bu e-posta zaten kayıtlı." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: name,
      lastName: "",
    },
  });

  return NextResponse.json({ ok: true });
}
