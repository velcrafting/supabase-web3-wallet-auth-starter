import Link from "next/link";
import type { ActivityLog } from "@/lib/db/schema";
import { getActivityLogs } from "@/lib/actions/activity";

export default async function PortfolioActivity({
  wallets,
  page,
}: {
  wallets: `0x${string}`[];
  page: number;
}) {
  const { data: logs } = await getActivityLogs({
    page,
    limit: 10,
    where: wallets.length ? { subjectType: "wallet", subjectIds: wallets } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h3 className="font-semibold mb-4">Activity</h3>
      <ul className="space-y-2">
        {(logs ?? []).map((log: ActivityLog) => (
          <li key={log.id} className="border-b pb-2 last:border-b-0">
            <div className="flex justify-between">
              <span className="font-medium">{formatAction(log.action, log.metadata)}</span>
              <span className="text-sm text-gray-500">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {short(log.subjectId)} • {log.metadata?.symbol ?? ""}
            </p>
          </li>
        ))}
      </ul>
      <Pager page={page} hasNext={(logs?.length ?? 0) === 10} />
    </div>
  );
}

function short(a?: string) {
  return a ? `${a.slice(0,6)}…${a.slice(-4)}` : "";
}
function formatAction(action: string, meta: any) {
  if (action === "transfer_in") return `Received ${fmt(meta)}`
  if (action === "transfer_out") return `Sent ${fmt(meta)}`
  if (action === "nft_balance") return `NFT balance updated for ${meta?.collectionName ?? meta?.contract}`
  if (action === "approval") return `Approval set for ${meta?.spender ?? ""}`
  return action;
}
function fmt(meta: any) {
  const d = typeof meta?.decimals === "number" ? meta.decimals : 18;
  const v = meta?.amount ? Number(BigInt(meta.amount)) / 10 ** d : 0;
  return `${v.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${meta?.symbol ?? ""}`;
}
function Pager({ page, hasNext }: { page: number; hasNext: boolean }) {
  return (
    <div className="flex justify-between mt-4">
      {page > 1 && <Link href={`?page=${page - 1}`} className="text-sm">Previous</Link>}
      {hasNext && <Link href={`?page=${page + 1}`} className="text-sm ml-auto">Next</Link>}
    </div>
  );
}
