"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  ShieldIcon,
  WalletIcon,
  CoinsIcon,
  PieChart,
  Activity as ActivityIcon,
  DollarSignIcon,
  ArrowLeftRightIcon,
} from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "General", icon: LayoutDashboardIcon },
    { href: "/dashboard/portfolio", label: "Portfolio", icon: PieChart },
    { href: "/dashboard/onramp", label: "On-Ramp", icon: DollarSignIcon },
    { href: "/dashboard/swap", label: "Swap", icon: ArrowLeftRightIcon },
    { href: "/dashboard/activity", label: "Activity", icon: ActivityIcon },
    { href: "/dashboard/wallets", label: "Wallets", icon: WalletIcon },
    { href: "/dashboard/mint-burn", label: "Mint/Burn", icon: CoinsIcon },
    { href: "/dashboard/security", label: "Security", icon: ShieldIcon },
  ];

  return (
    <div className="container mx-auto flex sm:flex-row flex-col px-4 lg:px-6 flex-1">
      <aside className="w-full sm:w-48 mt-4">
        <ScrollArea className="h-full">
          <div>
            <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
            <nav className="space-y-2">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center space-x-2 rounded-md px-2 py-1 transition",
                      "text-muted-foreground hover:text-primary",
                      isActive && "bg-secondary shadow-inner text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </ScrollArea>
      </aside>

      <div className="relative mx-8">
        <div
          className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-gray-200 dark:via-gray-700 to-transparent"
          style={{
            background:
              "linear-gradient(to bottom, rgba(229, 231, 235, 0) 0%, rgba(229, 231, 235, 1) 15%, rgba(229, 231, 235, 1) 85%, rgba(229, 231, 235, 0) 100%)",
          }}
        />
      </div>

      <main className="flex flex-col mt-12 sm:mt-4 gap-4 flex-1">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
