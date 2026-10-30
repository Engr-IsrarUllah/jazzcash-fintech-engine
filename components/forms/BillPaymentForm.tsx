'use client';

import React from 'react';
import { Receipt, Loader2, AlertCircle } from 'lucide-react';
import { BILL_QUICK_AMOUNTS, UTILITY_COMPANIES } from '@/lib/constants';

interface BillPaymentFormProps {
  billCompany: string;
  onSelectCompany: (company: string) => void;
  billConsumerNo: string;
  onChangeConsumerNo: (val: string) => void;
  billAmount: string;
  onChangeAmount: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  balance: string;
  onDeposit: () => void;
}

export function BillPaymentForm({
  billCompany,
  onSelectCompany,
  billConsumerNo,
  onChangeConsumerNo,
  billAmount,
  onChangeAmount,
  onSubmit,
  submitting,
  balance,
  onDeposit,
}: BillPaymentFormProps) {
  const currentBalanceNum = Number(balance) || 0;
  const isInsufficient = (Number(billAmount) || 0) > currentBalanceNum;

  return (
    <>
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Bill Payment (بلوں کی ادائیگی)</h2>
            <p className="text-xs text-slate-500">Pay Electricity, Sui Gas, and Landline/Internet bills</p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          Instant Clearance
        </span>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Select Company */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select Utility Provider
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {UTILITY_COMPANIES.map((company) => {
              const Icon = company.icon;
              const isSelected = billCompany === company.name;

              return (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => onSelectCompany(company.name)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl ${company.bg} ${company.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-slate-800">{company.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{company.type}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Consumer / Reference Number */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Consumer Reference Number (14 Digits)
          </label>
          <input
            type="text"
            value={billConsumerNo}
            onChange={(e) => onChangeConsumerNo(e.target.value)}
            placeholder="e.g. 14253678901234"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono"
            required
          />
          <p className="text-[11px] text-slate-400 mt-1">Printed on the top right corner of your physical bill</p>
        </div>

        {/* Bill Amount */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Bill Amount (Rs.)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center font-bold text-slate-400 text-sm">
              Rs.
            </span>
            <input
              type="number"
              value={billAmount}
              onChange={(e) => onChangeAmount(e.target.value)}
              placeholder="1500"
              min="1"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono"
              required
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-2.5">
            {BILL_QUICK_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onChangeAmount(val.toString())}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  billAmount === val.toString()
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
                Kam Balance: Wallet mein Rs. {currentBalanceNum.toLocaleString()} hain, bill Rs. {Number(billAmount).toLocaleString()} ka hai.
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

        {/* Bill Pay Button */}
        <button
          type="submit"
          disabled={submitting || Number(billAmount) <= 0}
          className="w-full bg-[#00875A] hover:bg-[#00744D] text-white font-bold py-4 rounded-2xl transition-all shadow-md hover:shadow-lg shadow-emerald-700/20 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 text-base"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Clearing Utility Bill...</span>
            </>
          ) : (
            <>
              <span>Pay Rs. {Number(billAmount).toLocaleString()} to {billCompany}</span>
              <Receipt className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </>
  );
}

export default BillPaymentForm;

