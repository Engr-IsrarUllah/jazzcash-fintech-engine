'use client';

import React from 'react';
import { Wallet, Eye, EyeOff, ShieldCheck, Loader2, CreditCard, RefreshCw } from 'lucide-react';

interface WalletCardProps {
  balance: string;
  showBalance: boolean;
  onToggleBalance: () => void;
  onDeposit: () => void;
  depositing: boolean;
  onRefresh: () => void;
}

export function WalletCard({
  balance,
  showBalance,
  onToggleBalance,
  onDeposit,
  depositing,
  onRefresh,
}: WalletCardProps) {
  const formattedBalance = Number(balance).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#00875A] via-[#009664] to-[#00A859] rounded-3xl p-6 sm:p-7 text-white shadow-lg shadow-emerald-900/15">
      <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute right-20 -top-12 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Balance Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-100 text-xs font-medium uppercase tracking-wider">
            <Wallet className="w-4 h-4 text-emerald-200" />
            <span>Easypaisa Account Balance</span>
            <button
              type="button"
              onClick={onToggleBalance}
              className="p-1 rounded-full hover:bg-white/10 transition-colors ml-1"
              title={showBalance ? 'Hide Balance' : 'Show Balance'}
            >
              {showBalance ? (
                <EyeOff className="w-3.5 h-3.5 text-emerald-200" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-emerald-200" />
              )}
            </button>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-lg text-emerald-200 font-semibold">Rs.</span>
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              {showBalance ? formattedBalance : '• • • • • •'}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-1 text-[11px] text-emerald-100">
            <span className="flex items-center gap-1 bg-white/15 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 text-emerald-300" /> Daily Limit: Rs. 50,000
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Tier 1 Super Biometric</span>
          </div>
        </div>

        {/* Quick Actions (Add Cash via Stripe) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onDeposit}
            disabled={depositing}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#00875A] font-bold text-sm px-6 py-3.5 rounded-2xl shadow-md hover:bg-emerald-50 active:scale-95 transition-all disabled:opacity-50"
          >
            {depositing ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#00875A]" />
            ) : (
              <CreditCard className="w-4 h-4 text-[#00875A]" />
            )}
            <span>+ Add Cash (Debit / Credit Card)</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/15"
            title="Refresh Balance"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default WalletCard;

