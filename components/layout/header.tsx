"use client";

import Link from "next/link";
import { GlobeIcon, Home, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { siteConfig, authConfig } from "@/lib/config";
import { getChainName, shortenAddress } from "@/lib/utils";
import { useSession } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

function stringToColour(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color =
    (((hash >> 16) & 0xff) << 16) | (((hash >> 8) & 0xff) << 8) | (hash & 0xff);
  return `#${(0x1000000 + color).toString(16).slice(1)}`;
}
function generateColours(s: string) {
  const s1 = s.substring(0, s.length / 3);
  const s2 = s.substring(s.length / 3, (2 * s.length) / 3);
  const s3 = s.substring((2 * s.length) / 3);
  const c1 = stringToColour(s1);
  const c2 = stringToColour(s2);
  const c3 = stringToColour(s3);
  return [c1, c2, c3];
}

function ProfileImage({ chain, address }: { chain: string; address: string }) {
  const [c1, c2, c3] = generateColours(`${chain}:${address}`);
  return (
    <div
      style={{ backgroundImage: `conic-gradient(from -45deg, ${c1}, ${c2}, ${c3})` }}
      className="size-9 shrink-0 rounded overflow-hidden"
    />
  );
}

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { disconnect } = useDisconnect();
  const { data: session, setData: setSession, setStatus } = useSession();

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST", credentials: "include" });
      disconnect();
    } finally {
      setSession(null);
      setStatus("unauthenticated");
      setIsMenuOpen(false);
      router.refresh();
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 h-14 z-50">
      <div className="relative container mx-auto px-4 lg:px-6 h-full flex items-center">
        <div className="absolute inset-0 -z-[1] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" />

        {/* Left: Logo */}
        <div className="flex items-center">
          <Link className="flex items-center justify-center" href="/">
            <GlobeIcon className="h-6 w-6" />
            <span className="sr-only">{siteConfig.name}</span>
          </Link>
        </div>

        {/* Right: Session/Login */}
        <div className="ml-auto flex items-center">
          {session ? (
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <ProfileImage
                    chain={getChainName(session.user.chainId)}
                    address={session.user.walletAddress}
                  />
                  <span className="text-sm font-medium hidden sm:inline">
                    {session.user.username || shortenAddress(session.user.walletAddress)}
                  </span>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <h4 className="text-sm font-bold">
                    Hello, {session.user.username || shortenAddress(session.user.walletAddress)}!
                  </h4>
                  <small className="text-xs text-muted-foreground">
                    {getChainName(session.user.chainId)}:{shortenAddress(session.user.walletAddress)}
                  </small>
                </div>

                {/* Nav items with bullet-style labels */}
                <DropdownMenuItem className="w-full cursor-pointer" asChild>
                  <Link href="/dashboard" className="flex w-full items-center">
                    <Home className="mr-2 h-4 w-4" />
                    <span className="">Dashboard</span>
                  </Link>
                </DropdownMenuItem>

                {/* Visual separation before the destructive action */}
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="w-full cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal, authenticationStatus, account }) => (
                <Button
                  variant="outline"
                  onClick={openConnectModal}
                  disabled={!!account || authenticationStatus === "loading"}
                >
                  {!!account || authenticationStatus === "loading"
                    ? authConfig.loading
                    : authConfig.connectWallet}
                </Button>
              )}
            </ConnectButton.Custom>
          )}
        </div>
      </div>
    </header>
  );
}
