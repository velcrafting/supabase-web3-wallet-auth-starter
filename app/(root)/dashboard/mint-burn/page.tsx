+55
-0

"use client";

import { useFormActionState, useSession } from "@/lib/hooks";
import { mintNft, burnNft } from "@/lib/actions/nft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DashboardMintBurnPage = () => {
  const { data: session } = useSession();

  const [mintState, mintAction, mintPending] = useFormActionState(mintNft);
  const [burnState, burnAction, burnPending] = useFormActionState(burnNft);

  if (!session) {
    return null;
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Mint / Burn NFT</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-8">
        <div>
          <h3 className="font-semibold mb-4">Mint</h3>
          <form className="flex flex-col gap-2 items-start" action={mintAction}>
            <Label htmlFor="mint-tokenId">Token ID</Label>
            <Input id="mint-tokenId" name="tokenId" required />
            <Button type="submit" className="mt-2" disabled={mintPending}>
              Mint
            </Button>
            {mintState.error && (
              <small className="text-destructive">{mintState.error}</small>
            )}
          </form>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Burn</h3>
          <form className="flex flex-col gap-2 items-start" action={burnAction}>
            <Label htmlFor="burn-tokenId">Token ID</Label>
            <Input id="burn-tokenId" name="tokenId" required />
            <Button type="submit" className="mt-2" disabled={burnPending}>
              Burn
            </Button>
            {burnState.error && (
              <small className="text-destructive">{burnState.error}</small>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default DashboardMintBurnPage;