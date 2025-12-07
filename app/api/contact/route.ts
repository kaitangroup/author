import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const wpUrl = process.env.NEXT_PUBLIC_WP_URL || "http://localhost/wordpress";

    const res = await fetch(`${wpUrl}/wp-json/contact/v1/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    return NextResponse.json(json);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message });
  }
}
