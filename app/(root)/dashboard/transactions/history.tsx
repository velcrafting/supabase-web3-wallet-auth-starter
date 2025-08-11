"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getActivityLogsSSR } from "@/lib/actions/activity";
import { formatAction } from "@/lib/activity";
import WalletActivityButton from "./wallet-activity-client";
import type { Session } from "@/lib/auth/session-context";
import { ActivityLog } from "@/lib/db/schema";
import type { useAppKit } from "@reown/appkit/react";

type OpenFn = ReturnType<typeof useAppKit>["open"];

interface HistoryTabProps {
  session: Session | null | undefined;
  open: OpenFn;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ session, open }) => {
  const searchParams = useSearchParams();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    const fetchLogs = async () => {
      try {
        const pageParam = searchParams?.get("page");
        const pageStr = pageParam ? pageParam : "1";
        const n = Number(pageStr);
        const page = Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;

        const fetchedLogs = await getActivityLogsSSR({ page, limit: 10 });

        if (!fetchedLogs || fetchedLogs.length === 0) {
          setError("No activity found.");
        } else {
          setLogs(fetchedLogs);
        }
      } catch (err) {
        setError("Failed to load activity.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [session, searchParams]);

  if (!session) {
    return (
      <>
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-sm text-muted-foreground">Please sign in to view your activity.</p>
      </>
    );
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <>
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold">History</h1>
      <WalletActivityButton session={session} open={open} />
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
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ul>

        <div className="flex justify-between mt-4">
          {logs.length === 10 && (
            <Link
              href={`?page=${Number(searchParams?.get("page") || 1) + 1}`}
              className="text-sm ml-auto"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default HistoryTab;