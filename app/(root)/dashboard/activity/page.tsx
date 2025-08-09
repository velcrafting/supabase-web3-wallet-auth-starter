import Link from "next/link";
import type { ActivityLog } from "@/lib/db/schema";
import { getActivityLogsSSR } from "@/lib/actions/activity";
import { formatAction } from "@/lib/activity";

export default async function DashboardActivityPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string | string[] }>;
}) {
  const sp = await searchParams;
  const pageStr = Array.isArray(sp?.page) ? sp.page[0] : sp?.page;
  const n = Number(pageStr ?? "1");
  const page = Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;

  const logs = await getActivityLogsSSR({ page, limit: 10 });
  if (!logs) {
    return (
      <>
        <h1 className="text-2xl font-bold">Activity</h1>
        <p className="text-sm text-muted-foreground">Sign in to view activity.</p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Activity</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <ul className="space-y-2">
          {logs.map((log: ActivityLog) => (
            <li key={log.id} className="border-b pb-2 last:border-b-0">
              <div className="flex justify-between">
                <span>{formatAction(log.action, log.metadata)}</span>
                <span className="text-sm text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <pre className="text-xs text-gray-500">
                  {JSON.stringify(log.metadata)}
                </pre>
              )}
            </li>
          ))}
        </ul>

        <div className="flex justify-between mt-4">
          {page > 1 && (
            <Link href={`?page=${page - 1}`} className="text-sm">
              Previous
            </Link>
          )}
          {logs.length === 10 && (
            <Link href={`?page=${page + 1}`} className="text-sm ml-auto">
              Next
            </Link>
          )}
        </div>
      </div>
    </>
  );
}