"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet, sepolia } from "viem/chains";

import { protectedProcedure } from "@/lib/actions/core";
import { nfts } from "@/lib/db/schema";

const nftAbi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "burn",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
] as const;

const privateKey = process.env.WALLET_PRIVATE_KEY as `0x${string}`;
const nftAddress = process.env.NFT_CONTRACT_ADDRESS as `0x${string}`;

function getChain(chainId: number) {
  switch (chainId) {
    case sepolia.id:
      return sepolia;
    default:
      return mainnet;
  }
}

export const mintNft = protectedProcedure
  .input(z.object({ tokenId: z.string() }))
  .action(async ({ ctx, input }) => {
    const tokenIdBigInt = BigInt(input.tokenId);
    const tokenId = Number(input.tokenId);
    const account = privateKeyToAccount(privateKey);
    const walletClient = createWalletClient({
      account,
      chain: getChain(Number(ctx.session.user.app_metadata.chainId)),
      transport: http(),
    });

    const hash = await walletClient.writeContract({
      address: nftAddress,
      abi: nftAbi,
      functionName: "mint",
      args: [ctx.session.user.app_metadata.walletAddress, tokenIdBigInt],
    });

    await ctx.db.insert(nfts).values({
      userId: ctx.session.user.id,
      tokenId,
    });

    return { hash };
  });

export const burnNft = protectedProcedure
  .input(z.object({ tokenId: z.string() }))
  .action(async ({ ctx, input }) => {
    const tokenIdBigInt = BigInt(input.tokenId);
    const tokenId = Number(input.tokenId);
    const account = privateKeyToAccount(privateKey);
    const walletClient = createWalletClient({
      account,
      chain: getChain(Number(ctx.session.user.app_metadata.chainId)),
      transport: http(),
    });

    const hash = await walletClient.writeContract({
      address: nftAddress,
      abi: nftAbi,
      functionName: "burn",
      args: [tokenIdBigInt],
    });

    await ctx.db
      .delete(nfts)
      .where(
        and(
          eq(nfts.tokenId, tokenId),
          eq(nfts.userId, ctx.session.user.id),
        ),
      );

    return { hash };
  });
