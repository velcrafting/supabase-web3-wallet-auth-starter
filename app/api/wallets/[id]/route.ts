import { NextResponse } from "next/server";

import { removeWallet } from "@/lib/actions/wallet";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const res = await removeWallet({ id: params.id });

  if (res.error) {
    return NextResponse.json({ error: res.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}