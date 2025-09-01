import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const body = await req.json();
   

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
