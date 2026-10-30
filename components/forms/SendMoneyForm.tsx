'use client';

import React from 'react';
import { Send, User, Loader2, AlertCircle } from 'lucide-react';
import { QUICK_AMOUNTS } from '@/lib/constants';

interface SendMoneyFormProps {
  transferName: string;
  onChangeName: (val: string) => void;
  transferPhone: string;
  onChangePhone: (val: string) => void;
  transferAmount: string;
  onChangeAmount: (val: string) => void;
  transferPurpose: string;
  onChangePurpose: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  balance: string;
  onDeposit: () => void;
}

export function SendMoneyForm({
  transferName,
  onChangeName,
  transferPhone,
  onChangePhone,
  transferAmount,
  onChangeAmount,
  transferPurpose,
  onChangePurpose,
  onSubmit,
  submitting,
  balance,
  onDeposit,
}: SendMoneyFormProps) {
  const currentBalanceNum = Number(balance) || 0;
  const isInsufficient = (Number(transferAmount) || 0) > currentBalanceNum;

  return (
    <>
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Send Money (رقم منتقل کریں)</h2>
            <p className="text-xs text-slate-500">Instant 24/7 transfer to any mobile account or CNIC</p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          Instant Transfer
        </span>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Recipient Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Receiver Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={transferName}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="e.g. Ahmed Raza"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              required
            />
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <User className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Recipient Phone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Receiver Mobile / Account Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                🇵🇰 +92
              </span>
            </div>
            <input
              type="text"
              value={transferPhone}
              onChange={(e) => onChangePhone(e.target.value)}
              placeholder="03123456789"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-20 pr-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono"
              required
            />
          </div>
        </div>

        {/* Transfer Amount */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Transfer Amount (Rs.)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center font-bold text-slate-400 text-sm">
              Rs.
            </span>
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => onChangeAmount(e.target.value)}
              placeholder="1000"
              min="10"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono"
              required
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-2.5">
            {QUICK_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onChangeAmount(val.toString())}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  transferAmount === val.toString()
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-100/70 border-slate-200 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Rs. {val}
              </button>
            ))}
          </div>

          {/* Insufficient Balance Indicator */}
          {isInsufficient && (
            <div className="flex items-center justify-between text-xs text-rose-700 bg-rose-50 p-3 rounded-2xl border border-rose-200 mt-2.5">
              <span className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                Kam Balance: Wallet mein Rs. {currentBalanceNum.toLocaleString()} hain, Rs. {Number(transferAmount).toLocaleString()} bhej rahe hain.
              </span>
              <button
                type="button"
                onClick={onDeposit}
                className="font-black text-rose-800 underline hover:text-rose-950 ml-2 whitespace-nowrap"
              >
                + Add Cash
              </button>
            </div>
          )}
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Purpose of Transfer
          </label>
          <select
            value={transferPurpose}
            onChange={(e) => onChangePurpose(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:bg-white focus:border-emerald-500 transition-all"
          >
            <option value="Family Support">Family Support</option>
            <option value="Personal Gift">Personal Gift</option>
            <option value="Business Payment">Business Payment</option>
            <option value="Loan Repayment">Loan Repayment</option>
            <option value="Miscellaneous">Miscellaneous</option>
          </select>
        </div>

        {/* Confirmation Button */}
        <button
          type="submit"
          disabled={submitting || Number(transferAmount) <= 0}
          className="w-full bg-[#00875A] hover:bg-[#00744D] text-white font-bold py-4 rounded-2xl transition-all shadow-md hover:shadow-lg shadow-emerald-700/20 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 text-base"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sending Money...</span>
            </>
          ) : (
            <>
              <span>Transfer Rs. {Number(transferAmount).toLocaleString()} Now</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </>
  );
}

export default SendMoneyForm;

