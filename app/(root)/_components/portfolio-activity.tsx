// app/(root)/_components/portfolio-activity.tsx
// Server Component
import {
  getActivityLogsSSR,
  getActivityByWalletsSSR,
} from "@/lib/actions/activity";

export default async function PortfolioActivity({
  wallets,
  page,
}: {
  wallets: `0x${string}`[];
  page: number;
}) {
  const rows = wallets.length
    ? await getActivityByWalletsSSR({ wallets, page, limit: 20 })
    : await getActivityLogsSSR({ page, limit: 20 });
  if (!rows) return <p className="text-sm text-muted-foreground">Sign in to view your activity.</p>;
  if (!rows.length) return <p className="text-sm text-muted-foreground">No activity yet.</p>;

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Recent activity</h3>
      <ul className="text-sm divide-y">
        {rows.map((row: any) => (
          <li key={row.id} className="py-2 flex items-center justify-between">
            <span>
              {row.action ?? "action"}
              {row.metadata?.wallet && (
                <> • <code className="text-xs">{String(row.metadata.wallet).slice(0,6)}…{String(row.metadata.wallet).slice(-4)}</code></>
              )}
            </span>
            <span className="text-muted-foreground">
              {new Date(row.createdAt ?? row.created_at).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
