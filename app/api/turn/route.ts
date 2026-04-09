import { NextResponse } from "next/server";
import crypto from "crypto";

const SECRET = process.env.NEXT_TURN_SECRET as string;

export async function GET() {
  const username = `${Math.floor(Date.now() / 1000) + 3600}`; // 1 hour expiry

  const credential = crypto
    .createHmac("sha1", SECRET)
    .update(username)
    .digest("base64");

  return NextResponse.json({
    username,
    credential,
    ttl: 3600,
    urls: [
      "turn:mooru.duckdns.org:3478?transport=udp",
      "turn:mooru.duckdns.org:3478?transport=tcp"
    ]
  });
}