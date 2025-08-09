import Link from "next/link";
import type { ActivityLog } from "@/lib/db/schema";
import { getActivityLogs } from "@/lib/actions/activity";

const DashboardActivityPage = async ({
  searchParams,
}: {
  searchParams?: { page?: string };
}) => {
  const page = Number(searchParams?.page ?? "1");
  const { data: logs } = await getActivityLogs({ page, limit: 10 });

  return (
    <>
      <h1 className="text-2xl font-bold">Activity</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <ul className="space-y-2">
          {(logs ?? []).map((log: ActivityLog) => (
            <li key={log.id} className="border-b pb-2 last:border-b-0">
              <div className="flex justify-between">
                <span>{log.action}</span>
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
          {(logs?.length ?? 0) === 10 && (
            <Link href={`?page=${page + 1}`} className="text-sm ml-auto">
              Next
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardActivityPage;