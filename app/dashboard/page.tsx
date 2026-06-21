"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { usePayrollStore } from "@/hooks/use-payroll-store";
import { 
  useXlmBalanceQuery, 
  useTreasuryDataQuery, 
  useEmployeesQuery, 
  useAddEmployeeMutation, 
  useUpdateEmployeeMutation,
  useTerminateEmployeeMutation,
  useClaimPayrollMutation,
  useDepositTreasuryMutation,
  useWithdrawTreasuryMutation
} from "@/hooks/use-payroll-queries";
import { 
  PlusCircle, 
  Trash2, 
  Coins, 
  Plus, 
  Minus, 
  UserPlus, 
  RefreshCw, 
  Award,
  Calendar,
  AlertCircle
} from "lucide-react";

export default function Dashboard() {
  const { address, employees, treasuryBalance, totalDeposited, totalDisbursed, isConnecting } = usePayrollStore();

  // Trigger read queries
  useXlmBalanceQuery(address);
  const isLoaded = useTreasuryDataQuery(!!address).isSuccess;
  useEmployeesQuery(!!address);

  // Form states
  const [empAddress, setEmpAddress] = useState("");
  const [empSalary, setEmpSalary] = useState("");
  const [empFrequency, setEmpFrequency] = useState("86400"); // 1 day default
  const [empRole, setEmpRole] = useState("");
  
  const [fundingAmount, setFundingAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawRecipient, setWithdrawRecipient] = useState("");

  const [activeTab, setActiveTab] = useState<"admin" | "employee">("admin");

  // Mutation hooks
  const addEmployeeMut = useAddEmployeeMutation();
  const terminateEmployeeMut = useTerminateEmployeeMutation();
  const claimPayrollMut = useClaimPayrollMutation();
  const depositVaultMut = useDepositTreasuryMutation();
  const withdrawVaultMut = useWithdrawTreasuryMutation();

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empAddress || !empSalary || !empRole) {
      alert("Please fill in all employee fields.");
      return;
    }
    try {
      await addEmployeeMut.mutateAsync({
        employee: empAddress,
        salary: Number(empSalary),
        payFrequency: Number(empFrequency),
        role: empRole
      });
      setEmpAddress("");
      setEmpSalary("");
      setEmpRole("");
      alert("Employee added successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to add employee.");
    }
  };

  const handleTerminate = async (empAddr: string) => {
    if (!confirm("Are you sure you want to terminate this employee?")) return;
    try {
      await terminateEmployeeMut.mutateAsync({ employee: empAddr });
      alert("Employee terminated successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to terminate employee.");
    }
  };

  const handleClaim = async (empAddr: string) => {
    try {
      await claimPayrollMut.mutateAsync({ employee: empAddr });
      alert("Payroll claimed successfully!");
    } catch (err: any) {
      alert(err.message || "Payroll claim failed. Check eligibility or vault balance.");
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundingAmount || Number(fundingAmount) <= 0) return;
    try {
      await depositVaultMut.mutateAsync({ amount: Number(fundingAmount) });
      setFundingAmount("");
      alert("Treasury vault funded successfully!");
    } catch (err: any) {
      alert(err.message || "Deposit failed.");
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || !withdrawRecipient) return;
    try {
      await withdrawVaultMut.mutateAsync({
        amount: Number(withdrawAmount),
        to: withdrawRecipient
      });
      setWithdrawAmount("");
      setWithdrawRecipient("");
      alert("Funds withdrawn successfully!");
    } catch (err: any) {
      alert(err.message || "Withdrawal failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 md:pl-64">
      <Navigation />

      <main className="p-8 max-w-6xl mx-auto">
        {/* Banner Welcome */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Operator Console</h1>
            <p className="text-xs text-slate-500">Manage payroll disbursements and inspect on-chain vault metrics.</p>
          </div>
          <div className="flex rounded-md border border-slate-200 bg-white p-1">
            <button
              onClick={() => setActiveTab("admin")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "admin" ? "bg-orange-500 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Employer Console
            </button>
            <button
              onClick={() => setActiveTab("employee")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "employee" ? "bg-orange-500 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Staff Portal
            </button>
          </div>
        </div>

        {/* Global Wallet Alert */}
        {!address && (
          <div className="mb-8 flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50/50 p-4 text-orange-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold">Wallet disconnected.</span> Please connect your Freighter or Stellar-compatible wallet to read/write states.
            </div>
          </div>
        )}

        {activeTab === "admin" ? (
          <div className="space-y-8">
            {/* Stats Panel */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-slate-500">Treasury Capacity</span>
                  <Coins className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {treasuryBalance.toFixed(2)} <span className="text-xs font-semibold text-slate-500">XLM</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Available for automatic claims</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-slate-500">Total Funded Vault</span>
                  <Plus className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {totalDeposited.toFixed(2)} <span className="text-xs font-semibold text-slate-500">XLM</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Deposited historical sum</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-slate-500">Total Settled Payroll</span>
                  <Minus className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {totalDisbursed.toFixed(2)} <span className="text-xs font-semibold text-slate-500">XLM</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Disbursed to staff</p>
              </div>
            </div>

            {/* Treasury Actions Form */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Deposit Card */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Fund Treasury Vault</h3>
                <form onSubmit={handleDeposit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Funding Amount (XLM)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={fundingAmount}
                      onChange={(e) => setFundingAmount(e.target.value)}
                      className="w-full glass-input px-3 py-2 text-xs"
                      disabled={!address}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-md bg-orange-500 py-2 text-xs font-bold text-white hover:bg-orange-600 transition disabled:opacity-50"
                    disabled={!address || depositVaultMut.isPending}
                  >
                    {depositVaultMut.isPending ? "Submitting..." : "Deposit XLM Tokens"}
                  </button>
                </form>
              </div>

              {/* Withdraw Card */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Withdraw Vault (Admin Only)</h3>
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Withdrawal Amount</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full glass-input px-3 py-2 text-xs"
                        disabled={!address}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Recipient Address</label>
                      <input
                        type="text"
                        placeholder="G..."
                        value={withdrawRecipient}
                        onChange={(e) => setWithdrawRecipient(e.target.value)}
                        className="w-full glass-input px-3 py-2 text-xs"
                        disabled={!address}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-md bg-slate-800 py-2 text-xs font-bold text-white hover:bg-slate-900 transition disabled:opacity-50"
                    disabled={!address || withdrawVaultMut.isPending}
                  >
                    {withdrawVaultMut.isPending ? "Submitting..." : "Withdraw Tokens"}
                  </button>
                </form>
              </div>
            </div>

            {/* Register Employee Form */}
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Register New Employee Profile</h3>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Stellar Public Key / Address</label>
                    <input
                      type="text"
                      placeholder="G..."
                      value={empAddress}
                      onChange={(e) => setEmpAddress(e.target.value)}
                      className="w-full glass-input px-3 py-2 text-xs"
                      disabled={!address}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Salary Payout (XLM)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={empSalary}
                      onChange={(e) => setEmpSalary(e.target.value)}
                      className="w-full glass-input px-3 py-2 text-xs"
                      disabled={!address}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Role / Position</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Backend Dev"
                      value={empRole}
                      onChange={(e) => setEmpRole(e.target.value)}
                      className="w-full glass-input px-3 py-2 text-xs"
                      disabled={!address}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Payment Frequency</label>
                    <select
                      value={empFrequency}
                      onChange={(e) => setEmpFrequency(e.target.value)}
                      className="w-full glass-input px-3 py-2 text-xs"
                      disabled={!address}
                    >
                      <option value="60">1 Minute (Demonstration Loop)</option>
                      <option value="3600">Hourly</option>
                      <option value="86400">Daily</option>
                      <option value="604800">Weekly</option>
                      <option value="2592000">Monthly (30 Days)</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 rounded-md bg-orange-500 py-2 text-xs font-bold text-white hover:bg-orange-600 transition disabled:opacity-50"
                      disabled={!address || addEmployeeMut.isPending}
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>{addEmployeeMut.isPending ? "Registering..." : "Add Staff Profile"}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Employees List */}
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Employees Registry</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 font-semibold">
                  Count: {employees.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-3">Address</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Salary</th>
                      <th className="px-6 py-3">Frequency</th>
                      <th className="px-6 py-3">Next Claim Window</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                          No employees registered or loaded. Please connect your wallet.
                        </td>
                      </tr>
                    ) : (
                      employees.map((emp) => {
                        const isEligible = Date.now() / 1000 >= emp.nextPayoutTime;
                        return (
                          <tr key={emp.address} className="hover:bg-slate-50/50">
                            <td className="px-6 py-3 font-mono text-slate-500">
                              {emp.address.slice(0, 6)}...{emp.address.slice(-6)}
                            </td>
                            <td className="px-6 py-3 font-medium text-slate-900">{emp.role}</td>
                            <td className="px-6 py-3 font-semibold">{emp.salary.toFixed(2)} XLM</td>
                            <td className="px-6 py-3 text-slate-500">
                              {emp.payFrequency === 60 ? "1 min" :
                               emp.payFrequency === 3600 ? "Hourly" :
                               emp.payFrequency === 86400 ? "Daily" :
                               emp.payFrequency === 604800 ? "Weekly" : "Monthly"}
                            </td>
                            <td className="px-6 py-3 font-mono text-slate-500">
                              {new Date(emp.nextPayoutTime * 1000).toLocaleString()}
                            </td>
                            <td className="px-6 py-3">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                emp.active 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}>
                                {emp.active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {emp.active && (
                                  <>
                                    <button
                                      onClick={() => handleClaim(emp.address)}
                                      disabled={!address || !isEligible || claimPayrollMut.isPending}
                                      className={`rounded px-2.5 py-1 text-[10px] font-bold transition ${
                                        isEligible
                                          ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                      }`}
                                      title={isEligible ? "Disburse Payout" : "Claim window not reached"}
                                    >
                                      Claim Payout
                                    </button>
                                    <button
                                      onClick={() => handleTerminate(emp.address)}
                                      disabled={!address || terminateEmployeeMut.isPending}
                                      className="rounded bg-rose-50 p-1 text-rose-600 hover:bg-rose-100 transition disabled:opacity-50"
                                      title="Terminate Employee"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Staff View */
          <div className="rounded-lg border border-slate-200 bg-white p-8 max-w-xl mx-auto text-center">
            <Award className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-md font-bold text-slate-900 mb-2">Claim My Payroll</h3>
            <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
              If your address is registered on-chain as active, you can trigger your own salary claim directly once the pay cycle timer finishes.
            </p>
            {address ? (
              <div className="space-y-4">
                <div className="rounded border border-slate-100 bg-slate-50 p-4 text-xs font-mono text-slate-600">
                  My connected ID: {address}
                </div>
                <button
                  onClick={() => handleClaim(address)}
                  className="w-full flex items-center justify-center gap-2 rounded-md bg-orange-500 py-2.5 text-xs font-bold text-white hover:bg-orange-600 transition disabled:opacity-50"
                  disabled={claimPayrollMut.isPending}
                >
                  <RefreshCw className={`h-4 w-4 ${claimPayrollMut.isPending ? "animate-spin" : ""}`} />
                  <span>{claimPayrollMut.isPending ? "Executing payout claim..." : "Claim My Payroll Salary"}</span>
                </button>
              </div>
            ) : (
              <button
                className="w-full rounded-md bg-slate-800 py-2.5 text-xs font-bold text-white cursor-not-allowed"
                disabled
              >
                Connect wallet to trigger claim
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
