"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { usePayrollStore } from "@/hooks/use-payroll-store";
import { useXlmBalanceQuery } from "@/hooks/use-payroll-queries";
import { Settings, ShieldCheck, RefreshCw, Send, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const { 
    address, 
    managerId, 
    treasuryId, 
    tokenId, 
    setContractsConfig 
  } = usePayrollStore();

  const [inputManagerId, setInputManagerId] = useState(managerId);
  const [inputTreasuryId, setInputTreasuryId] = useState(treasuryId);
  const [inputTokenId, setInputTokenId] = useState(tokenId);

  const [fundingFriendbot, setFundingFriendbot] = useState(false);
  const { refetch } = useXlmBalanceQuery(address);

  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputManagerId || !inputTreasuryId || !inputTokenId) {
      alert("Please specify valid contract addresses.");
      return;
    }
    setContractsConfig(inputManagerId.trim(), inputTreasuryId.trim(), inputTokenId.trim());
    alert("Smart contract overrides updated successfully.");
  };

  const handleFundFriendbot = async () => {
    if (!address) return;
    setFundingFriendbot(true);
    try {
      const res = await fetch(`https://friendbot.stellar.org?addr=${address}`);
      if (res.ok) {
        alert("Friendbot funding complete! Syncing balance...");
        await refetch();
      } else {
        alert("Friendbot request failed. The account might already be funded or server is busy.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to reach Friendbot.");
    } finally {
      setFundingFriendbot(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 md:pl-64">
      <Navigation />

      <main className="p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Console Settings</h1>
          <p className="text-xs text-slate-500">Configure contract overrides and fund developer credentials on testnet.</p>
        </div>

        <div className="space-y-8 animate-fade-in">
          {/* Contracts Configuration */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Smart Contract Offsets</h3>
            <form onSubmit={handleSaveConfigs} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Payroll Manager Contract ID</label>
                <input
                  type="text"
                  value={inputManagerId}
                  onChange={(e) => setInputManagerId(e.target.value)}
                  className="w-full glass-input px-3 py-2 text-xs font-mono text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Payroll Treasury Vault ID</label>
                <input
                  type="text"
                  value={inputTreasuryId}
                  onChange={(e) => setInputTreasuryId(e.target.value)}
                  className="w-full glass-input px-3 py-2 text-xs font-mono text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Payment Token Contract (SAC)</label>
                <input
                  type="text"
                  value={inputTokenId}
                  onChange={(e) => setInputTokenId(e.target.value)}
                  className="w-full glass-input px-3 py-2 text-xs font-mono text-slate-700"
                />
              </div>

              <button
                type="submit"
                className="rounded-md bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 transition"
              >
                Save Overrides
              </button>
            </form>
          </div>

          {/* Stellar Testnet Fund Card */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Friendbot Developer Faucet</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Use Stellar's Testnet Friendbot to request 10,000 native XLM for your connected developer wallet.
            </p>
            {address ? (
              <button
                onClick={handleFundFriendbot}
                disabled={fundingFriendbot}
                className="flex items-center gap-2 rounded-md bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 transition disabled:opacity-50"
              >
                {fundingFriendbot ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Funding account...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Request Friendbot XLM</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-slate-400 text-xs mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>Connect wallet to fund account.</span>
              </div>
            )}
          </div>

          {/* Network Parameters */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Network Specifications</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-medium">Active Network</span>
                <span className="font-semibold text-slate-800">Stellar Testnet</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-medium">Soroban RPC URL</span>
                <span className="font-mono text-slate-500">https://soroban-testnet.stellar.org</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="font-medium">Passphrase</span>
                <span className="font-mono text-slate-500 text-right">Test Stellar Network ; September 2015</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
