import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function PUT(req: Request) {
  try {
    const { fullname, email, password } = await req.json();

    if (!fullname || !email || !password) {
      return NextResponse.json(
        { error: "Please provide all valid fields!" },
        { status: 400 }
      );
    }

    const environment = process.env.NODE_ENV;

    if (environment !== "development") {
      return NextResponse.json(
        { error: "Modification not allowed in demo mode!" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found!" }, { status: 400 });
    }

    // fullname → firstName + lastName
    const [firstName, ...rest] = fullname.trim().split(" ");
    const lastName = rest.join(" ");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        firstName,
        lastName,
        email,
        passwordHash: hashedPassword,
      },
    });

    return NextResponse.json({ data: updatedUser }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error!" },
      { status: 500 }
    );
  }
}
