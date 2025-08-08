"use client";

import { useAccount, useBalance, useReadContracts } from "wagmi";
import { erc721Abi } from "viem";

const nftContracts = [
  {
    address: "0x57f1887A8BF19b14fC0dF6Fd9B2acc9Af147eA85",
    name: "ENS",
  },
];

const DashboardPortfolioPage = () => {
  const { address } = useAccount();
  const { data: nativeBalance } = useBalance({ address });
  const { data: nftBalances } = useReadContracts({
    contracts: nftContracts.map((c) => ({
      abi: erc721Abi,
      address: c.address as `0x${string}`,
      functionName: "balanceOf",
      args: [address!],
    })),
    query: { enabled: !!address },
  });

  const totalNfts = nftBalances?.reduce((sum, b) => {
    const value = b.result ? BigInt(b.result as string) : 0n;
    return sum + value;
  }, 0n);

  return (
    <>
      <h1 className="text-2xl font-bold">Portfolio</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Balances</h3>
        {nativeBalance ? (
          <p>
            Native: {nativeBalance.formatted} {nativeBalance.symbol}
          </p>
        ) : (
          <p>Connect wallet to view balance.</p>
        )}
        <h3 className="font-semibold mt-6 mb-4">NFTs</h3>
        {nftBalances && nftBalances.length > 0 ? (
          <ul className="list-disc list-inside">
            {nftBalances.map((b, i) => (
              <li key={nftContracts[i].address}>
                {nftContracts[i].name}: {b.result?.toString() ?? "0"}
              </li>
            ))}
            <li>Total NFTs: {totalNfts?.toString() ?? "0"}</li>
          </ul>
        ) : (
          <p>No NFTs found.</p>
        )}
      </div>
    </>
  );
};

export default DashboardPortfolioPage;

