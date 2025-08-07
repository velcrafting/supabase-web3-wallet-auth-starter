// app/api/_diag_create_user/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const admin = createClient(url, key, { auth: { persistSession: false } });

  const email = `diag_${crypto.randomUUID()}@wallet.local`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    // add a password to rule out older GoTrue quirks
    password: crypto.randomUUID(),
    user_metadata: { foo: "bar" },
  });

  return NextResponse.json({ ok: !error, email, data, error });
}
