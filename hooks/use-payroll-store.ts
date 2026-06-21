import { create } from "zustand";
import { Employee, ActivityEvent, TxTracker } from "@/types/payroll";
import { MANAGER_CONTRACT, TREASURY_CONTRACT, TOKEN_CONTRACT } from "@/lib/stellar-contract";

interface PayrollState {
  // Wallet
  address: string | null;
  balance: string;
  isConnecting: boolean;

  // Contracts
  managerId: string;
  treasuryId: string;
  tokenId: string;

  // Blockchain Data
  treasuryBalance: number;
  totalDeposited: number;
  totalDisbursed: number;
  employees: Employee[];
  events: ActivityEvent[];
  transactions: TxTracker[];

  // Actions
  setAddress: (address: string | null) => void;
  setBalance: (balance: string) => void;
  setConnecting: (val: boolean) => void;
  setContractsConfig: (managerId: string, treasuryId: string, tokenId: string) => void;
  setTreasuryBalance: (bal: number) => void;
  setTreasuryStats: (dep: number, disb: number) => void;
  setEmployees: (employees: Employee[]) => void;
  setEvents: (events: ActivityEvent[]) => void;
  addTransaction: (hash: string, title: string) => void;
  updateTransactionStatus: (hash: string, status: TxTracker["status"]) => void;
  clearStore: () => void;
}

export const usePayrollStore = create<PayrollState>((set) => ({
  address: null,
  balance: "0.0000000",
  isConnecting: false,

  managerId: MANAGER_CONTRACT,
  treasuryId: TREASURY_CONTRACT,
  tokenId: TOKEN_CONTRACT,

  treasuryBalance: 0,
  totalDeposited: 0,
  totalDisbursed: 0,
  employees: [],
  events: [],
  transactions: [],

  setAddress: (address) => set({ address }),
  setBalance: (balance) => set({ balance }),
  setConnecting: (isConnecting) => set({ isConnecting }),

  setContractsConfig: (managerId, treasuryId, tokenId) => 
    set({ managerId, treasuryId, tokenId }),

  setTreasuryBalance: (treasuryBalance) => set({ treasuryBalance }),
  setTreasuryStats: (totalDeposited, totalDisbursed) => 
    set({ totalDeposited, totalDisbursed }),

  setEmployees: (employees) => set({ employees }),
  setEvents: (events) => set({ events }),

  addTransaction: (hash, title) =>
    set((state) => ({
      transactions: [
        { hash, title, status: "pending", timestamp: Date.now() },
        ...state.transactions.slice(0, 19), // Limit history to last 20 txs
      ],
    })),

  updateTransactionStatus: (hash, status) =>
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.hash === hash ? { ...tx, status } : tx
      ),
    })),

  clearStore: () =>
    set({
      address: null,
      balance: "0.0000000",
      isConnecting: false,
      treasuryBalance: 0,
      totalDeposited: 0,
      totalDisbursed: 0,
      employees: [],
      events: [],
      transactions: [],
    }),
}));
