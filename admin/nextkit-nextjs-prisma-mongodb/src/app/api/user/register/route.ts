import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullname, email, password } = body;

    if (!fullname || !email || !password) {
      return NextResponse.json(
        { error: "Please provide all valid fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already registered!" },
        { status: 400 }
      );
    }

    /* fullname → firstName + lastName */
    const [firstName, ...rest] = fullname.trim().split(" ");
    const lastName = rest.join(" ");

    /* Password Hashing */
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    /* JWT Token */
    const secret = process.env.ACCESS_TOKEN_SECRET as string;
    const accessToken = jwt.sign({ email, firstName, lastName }, secret, {
      expiresIn: "1d",
    });

    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash: hashedPassword,
      },
    });

    const response = NextResponse.json(
      {
        firstName,
        lastName,
        email,
        message: "User registered successfully!",
      },
      { status: 201 }
    );

    response.cookies.set({
      name: "accessToken",
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
