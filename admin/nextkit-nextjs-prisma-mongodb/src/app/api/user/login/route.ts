import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const prisma = new PrismaClient();

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "All valid fields are required!" },
        { status: 400 }
      );
    }

    // Admin kullanıcıyı bul
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin not registered!" },
        { status: 404 }
      );
    }

    // Şifreyi doğrula
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Email/Password is incorrect!" },
        { status: 401 }
      );
    }

    // JWT oluştur
    const secret = process.env.ACCESS_TOKEN_SECRET as string;
    const accessToken = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      secret,
      { expiresIn: "1d" }
    );

    // Response ve cookie ayarla
    const response = NextResponse.json(
      {
        email: admin.email,
        role: admin.role,
        message: "Admin logged in successfully!",
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "accessToken",
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 gün
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error logging admin:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
