"use client";

import { Navigation } from "@/components/navigation";
import { usePayrollStore } from "@/hooks/use-payroll-store";
import { useEventsQuery } from "@/hooks/use-payroll-queries";
import { 
  Activity, 
  ArrowUpRight, 
  ArrowDownLeft, 
  UserPlus, 
  UserMinus, 
  AlertCircle,
  RefreshCw
} from "lucide-react";

export default function ActivityFeedPage() {
  const { address, events } = usePayrollStore();
  const { isFetching } = useEventsQuery(!!address);

  return (
    <div className="min-h-screen bg-slate-50 md:pl-64">
      <Navigation />

      <main className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Activity Feed</h1>
            <p className="text-xs text-slate-500">Real-time ledger events streaming from the smart contracts.</p>
          </div>
          {isFetching && (
            <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Syncing feed...</span>
            </div>
          )}
        </div>

        {!address ? (
          <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50/50 p-4 text-orange-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold">Wallet disconnected.</span> Connect wallet to sync smart contract event streams.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-12 text-center text-slate-400 text-xs">
                <Activity className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                No activities captured in the last 1500 ledgers. Payout actions will trigger event logs.
              </div>
            ) : (
              events.map((ev) => {
                let Icon = Activity;
                let colorClass = "bg-slate-100 text-slate-600 border-slate-200";

                if (ev.type === "employee_added") {
                  Icon = UserPlus;
                  colorClass = "bg-orange-50 text-orange-600 border-orange-200";
                } else if (ev.type === "employee_terminated") {
                  Icon = UserMinus;
                  colorClass = "bg-rose-50 text-rose-600 border-rose-200";
                } else if (ev.type === "payroll_paid") {
                  Icon = ArrowUpRight;
                  colorClass = "bg-emerald-50 text-emerald-600 border-emerald-200";
                } else if (ev.type === "treasury_deposit") {
                  Icon = ArrowDownLeft;
                  colorClass = "bg-sky-50 text-sky-600 border-sky-200";
                } else if (ev.type === "treasury_withdraw") {
                  Icon = ArrowUpRight;
                  colorClass = "bg-indigo-50 text-indigo-600 border-indigo-200";
                }

                return (
                  <div 
                    key={ev.id} 
                    className="flex gap-4 rounded-lg border border-slate-200 bg-white p-5 hover:border-slate-300 transition"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 mb-1">
                        <span className="text-xs font-bold text-slate-900 capitalize">
                          {ev.type.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(ev.timestamp * 1000).toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-500 mb-1 leading-relaxed">
                        {ev.details}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                        <span>Actor: {ev.actor.slice(0, 8)}...</span>
                        {ev.employee && <span>Target Staff: {ev.employee.slice(0, 8)}...</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
