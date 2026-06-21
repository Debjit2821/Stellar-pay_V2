"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { usePayrollStore } from "@/hooks/use-payroll-store";
import { connectWallet, disconnectWallet } from "@/lib/stellar-wallet";
import { 
  LayoutDashboard, 
  Activity, 
  History, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  Wallet,
  Coins
} from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { address, balance, setAddress, isConnecting, setConnecting, clearStore } = usePayrollStore();

  // Load wallet connection session on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem("stellar_connected_address");
    if (savedAddress) {
      setAddress(savedAddress);
    }
  }, [setAddress]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const addr = await connectWallet();
      setAddress(addr);
      localStorage.setItem("stellar_connected_address", addr);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Failed to connect wallet.");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      clearStore();
      localStorage.removeItem("stellar_connected_address");
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Activity Feed", href: "/activity", icon: Activity },
    { name: "Transaction Center", href: "/transactions", icon: History },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-orange-600">
              <Coins className="h-6 w-6" />
              <span>StellarPay</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {address ? (
              <div className="flex items-center gap-3">
                <span className="hidden text-xs text-slate-500 sm:inline-block">
                  Balance: <span className="font-semibold text-slate-700">{Number(balance).toFixed(4)} XLM</span>
                </span>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  <Wallet className="h-3.5 w-3.5" />
                  <span>{address.slice(0, 4)}...{address.slice(-4)}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex items-center gap-2 rounded-md bg-orange-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                <Wallet className="h-3.5 w-3.5" />
                <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-50 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed bottom-0 top-16 left-0 z-40 hidden w-64 border-r border-gray-200 bg-white p-6 md:block">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-orange-50 text-orange-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${active ? "text-orange-600" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-30 bg-slate-900/10 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <nav className="flex flex-col gap-1 bg-white p-6 border-b border-gray-200" onClick={(e) => e.stopPropagation()}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-orange-50 text-orange-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
