import Link from "next/link";
import { Coins, CheckCircle, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      {/* Top Banner */}
      <header className="flex h-16 items-center justify-between px-8 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2 font-bold text-orange-600 text-lg">
          <Coins className="h-6 w-6" />
          <span>StellarPay</span>
        </div>
        <Link
          href="/dashboard"
          className="rounded-md bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-600"
        >
          Enter Console
        </Link>
      </header>

      {/* Main Hero */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-20 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50/50 px-3 py-1 text-xs text-orange-600 font-medium mb-6 animate-fade-in">
          <Sparkles className="h-3 w-3" />
          <span>Soroban Smart Contracts Integrated</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-slate-900 mb-6 leading-tight animate-fade-in">
          Decentralized Payroll <br/>
          <span className="text-orange-500">Built for Stellar Ecosystem</span>
        </h1>

        <p className="text-base text-slate-500 max-w-2xl mb-8 animate-fade-in-delayed leading-relaxed">
          StellarPay coordinates company payrolls securely. Link your corporate treasury vault, register employee salaries, and automate milestone claims with role-based access control and atomic execution.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in-delayed">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-md bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            <span>Access Operator Console</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="https://github.com/stellar"
            target="_blank"
            className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Developer Hub
          </a>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full animate-fade-in-delayed">
          <div className="flex flex-col items-center p-6 bg-white border border-slate-200 rounded-lg">
            <CheckCircle className="h-8 w-8 text-orange-500 mb-4" />
            <h3 className="font-semibold text-sm text-slate-900 mb-2">Automated Milestones</h3>
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Employees claim salaries securely once payment frequencies elapse. Smart contract calculations prevent duplicate payouts.
            </p>
          </div>

          <div className="flex flex-col items-center p-6 bg-white border border-slate-200 rounded-lg">
            <Coins className="h-8 w-8 text-emerald-500 mb-4" />
            <h3 className="font-semibold text-sm text-slate-900 mb-2">Linked Treasury Vault</h3>
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Disbursements occur contract-to-contract from an isolated Treasury vault, protecting main balances from exposure.
            </p>
          </div>

          <div className="flex flex-col items-center p-6 bg-white border border-slate-200 rounded-lg">
            <ShieldAlert className="h-8 w-8 text-blue-500 mb-4" />
            <h3 className="font-semibold text-sm text-slate-900 mb-2">Role Permissions</h3>
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Cryptographic admin signatures restrict adding, terminating, or modifying employees profiles.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 flex items-center justify-between px-8 border-t border-slate-200 bg-white text-xs text-slate-400">
        <span>&copy; {new Date().getFullYear()} StellarPay. Production Portfolio Demonstration.</span>
        <div className="flex gap-4">
          <Link href="/settings" className="hover:underline">Settings</Link>
          <a href="https://stellar.org" target="_blank" className="hover:underline">Stellar Network</a>
        </div>
      </footer>
    </div>
  );
}
