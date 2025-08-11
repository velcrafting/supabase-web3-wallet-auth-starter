import { NextResponse } from "next/server";
import { getActivityLogsSSR } from "@/lib/actions/activity";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pageParam = Number(searchParams.get("page") ?? "1");
  const limitParam = Number(searchParams.get("limit") ?? "10");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const limit =
    Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 50
      ? Math.floor(limitParam)
      : 20;
  try {
    const logs = await getActivityLogsSSR({ page, limit });
    if (!logs) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ logs }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load activity" }, { status: 500 });
  }
}