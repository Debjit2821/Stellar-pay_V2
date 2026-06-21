"use client";

import { Navigation } from "@/components/navigation";
import { usePayrollStore } from "@/hooks/use-payroll-store";
import { useTreasuryDataQuery, useEmployeesQuery } from "@/hooks/use-payroll-queries";
import { BarChart3, AlertTriangle, CheckCircle, ShieldAlert, Coins, Users } from "lucide-react";

export default function AnalyticsPage() {
  const { address, employees, treasuryBalance } = usePayrollStore();

  // Load latest on-chain stats
  useTreasuryDataQuery(!!address);
  useEmployeesQuery(!!address);

  // Analytics logic
  const activeEmployees = employees.filter((e) => e.active);
  const inactiveEmployees = employees.filter((e) => !e.active);
  
  // Calculate cycle budget (converting all frequencies to daily equivalent or simple total cycle sum)
  const totalSalariesSum = activeEmployees.reduce((sum, emp) => sum + emp.salary, 0);

  // Runway projection (Simple estimation: how many full payout cycle commitments the treasury can cover)
  const runwayCycles = totalSalariesSum > 0 ? treasuryBalance / totalSalariesSum : 0;

  let runwayStatus = "Safe";
  let statusColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
  let RunwayIcon = CheckCircle;

  if (runwayCycles <= 0.0) {
    runwayStatus = "Depleted";
    statusColor = "text-rose-600 bg-rose-50 border-rose-200";
    RunwayIcon = ShieldAlert;
  } else if (runwayCycles <= 1.5) {
    runwayStatus = "Underfunded Alert";
    statusColor = "text-amber-600 bg-amber-50 border-amber-200";
    RunwayIcon = AlertTriangle;
  }

  return (
    <div className="min-h-screen bg-slate-50 md:pl-64">
      <Navigation />

      <main className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Application Metrics</h1>
          <p className="text-xs text-slate-500">Real-time runway projections and financial allocations of the linked smart contracts.</p>
        </div>

        {!address ? (
          <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50/50 p-4 text-orange-800">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold">Wallet disconnected.</span> Connect wallet to inspect financial analytics and runway indicators.
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Runway Warning Card */}
            <div className={`flex items-center gap-4 rounded-lg border p-6 ${statusColor}`}>
              <RunwayIcon className="h-10 w-10 shrink-0" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-1">Treasury Health: {runwayStatus}</h3>
                <p className="text-xs leading-relaxed opacity-90">
                  {runwayCycles <= 0 
                    ? "The treasury vault holds no tokens. Automated staff payout cycles will fail until the vault is funded."
                    : runwayCycles <= 1.5
                    ? `The treasury vault has ${runwayCycles.toFixed(1)} cycles of runway remaining. Funding is required soon.`
                    : `The treasury vault holds sufficient tokens to fund ${runwayCycles.toFixed(1)} full cycles of employee payouts.`
                  }
                </p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Card 1 */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-slate-500">Active Staff Commitments</span>
                  <Users className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {activeEmployees.length} <span className="text-xs font-semibold text-slate-400">Active Profiles</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  ({inactiveEmployees.length} terminated profiles archived on-chain)
                </p>
              </div>

              {/* Card 2 */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-slate-500">Milestone Cycle Budget</span>
                  <Coins className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {totalSalariesSum.toFixed(2)} <span className="text-xs font-semibold text-slate-500">XLM</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Total tokens required to satisfy one full claim cycle
                </p>
              </div>
            </div>

            {/* Detail Breakdowns */}
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-6">Staff Salary Allocations</h3>
              {activeEmployees.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-6">No active employees to analyze.</p>
              ) : (
                <div className="space-y-4">
                  {activeEmployees.map((emp) => {
                    const ratio = totalSalariesSum > 0 ? (emp.salary / totalSalariesSum) * 100 : 0;
                    return (
                      <div key={emp.address} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-700">{emp.role}</span>
                          <span className="text-slate-500">{emp.salary.toFixed(2)} XLM ({ratio.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-orange-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
