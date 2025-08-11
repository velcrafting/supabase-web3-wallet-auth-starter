import { NextResponse } from "next/server";
import { removeWallet } from "@/lib/actions/wallet";

// Correct method for accessing params in Next.js 15.x
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params; // Accessing dynamic id from params
  const res = await removeWallet({ id });

  if (res.error) {
    return NextResponse.json({ error: res.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
