"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GlobeIcon, Home, LogOut } from "lucide-react";
import { useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

import { cn, getChainName, shortenAddress } from "@/lib/utils";
import { useSession } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

const ProfileImage: React.FC<{ chain: string; address: string }> = ({
  chain,
  address,
}) => {
  const [c1, c2, c3] = generateColours(`${chain}:${address}`);
  return (
    <div
      style={{
        backgroundImage: `conic-gradient(from -45deg, ${c1}, ${c2}, ${c3})`,
      }}
      className="size-9 shrink-0 rounded overflow-hidden"
    />
  );
};

const Header = () => {
  const [isHeaderShown, setIsHeaderShown] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { disconnect } = useDisconnect();
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsHeaderShown(currentScrollY < lastScrollY || currentScrollY < 56);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={cn(
        "fixed w-full transition-all duration-300 z-50",
        isHeaderShown ? "top-0" : "-top-14"
      )}
    >
      <div className="container mx-auto px-4 lg:px-6 h-14 flex items-center">
        <div className="absolute inset-0 h-[125%] -z-[1] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 [mask-image:linear-gradient(0deg,transparent,#000)]" />
        <Link className="flex items-center justify-center" href="/">
          <GlobeIcon className="h-6 w-6" />
          <span className="sr-only">Web3 App</span>
        </Link>

        <nav className="ml-auto flex gap-4 sm:gap-6"></nav>

        <div className="ml-4">
          {session ? (
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <ProfileImage
                    chain={getChainName(session.user.chainId)}
                    address={session.user.walletAddress}
                  />
                  <span className="text-sm font-medium text-foreground hidden sm:inline">
                    {session.user.username
                      ? session.user.username
                      : shortenAddress(session.user.walletAddress)}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="p-2">
                  <h4 className="text-sm font-bold">
                    Hello,{" "}
                    {session.user.username
                      ? session.user.username
                      : shortenAddress(session.user.walletAddress)}
                    !
                  </h4>
                  <small className="text-xs">
                    {getChainName(session.user.chainId)}:
                    {shortenAddress(session.user.walletAddress)}
                  </small>
                </div>
                <DropdownMenuItem className="w-full cursor-pointer" asChild>
                  <Link href="/dashboard" className="flex w-full items-center">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="w-full cursor-pointer"
                  onClick={() => disconnect()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
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
                    ? "Loading.."
                    : "Connect Wallet"}
                </Button>
              )}
            </ConnectButton.Custom>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;