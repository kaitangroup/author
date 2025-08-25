import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password } = body ?? {};

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`.trim(),
        email,
        password: hash,
        role: "user",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
