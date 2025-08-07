import { NextResponse } from "next/server";

import { verify } from "@/lib/actions/auth/verify";

export async function POST(req: Request) {
  const { message, signature } = await req.json();
  const res = await verify({ message, signature });

  if (res.error) {
    return NextResponse.json({ error: res.error }, { status: 400 });
  }

  return NextResponse.json(res.data);
}