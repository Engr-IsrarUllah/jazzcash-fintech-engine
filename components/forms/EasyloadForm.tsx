'use client';

import React from 'react';
import { Smartphone, ArrowUpRight, Loader2, Tag, Check, Sparkles, AlertCircle } from 'lucide-react';
import { Telecom, Promotion } from '@/types';
import { QUICK_AMOUNTS, TELECOM_STYLES } from '@/lib/constants';

interface EasyloadFormProps {
  telecoms: Telecom[];
  promotions: Promotion[];
  selectedTelecom: string;
  onSelectTelecom: (code: string) => void;
  phoneNumber: string;
  onChangePhoneNumber: (val: string) => void;
  amount: string;
  onChangeAmount: (val: string) => void;
  promoCode: string;
  onChangePromoCode: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  discountCalculation: {
    discount: number;
    final: number;
    appliedPromo: Promotion | null;
    error?: string;
  };
  balance: string;
  onDeposit: () => void;
}

export function EasyloadForm({
  telecoms,
  promotions,
  selectedTelecom,
  onSelectTelecom,
  phoneNumber,
  onChangePhoneNumber,
  amount,
  onChangeAmount,
  promoCode,
  onChangePromoCode,
  onSubmit,
  submitting,
  discountCalculation,
  balance,
  onDeposit,
}: EasyloadFormProps) {
  const currentBalanceNum = Number(balance) || 0;
  const isInsufficient = discountCalculation.final > currentBalanceNum;

  return (
    <>
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Mobile Easyload (موبائل ریچارج)</h2>
            <p className="text-xs text-slate-500">Recharge any prepaid/postpaid mobile number instantly</p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          0% Fee
        </span>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Select Operator */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select Mobile Network
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {telecoms.map((t) => {
              const style = TELECOM_STYLES[t.code] || {
                color: 'text-slate-700',
                bg: 'bg-slate-50',
                border: 'border-slate-400',
                tag: '4G',
              };
              const isSelected = selectedTelecom === t.code;

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTelecom(t.code)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? `${style.bg} ${style.border} ring-2 ring-offset-1 ${style.border}`
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <span className={`text-xs font-black tracking-tight ${isSelected ? style.color : 'text-slate-700'}`}>
                    {t.name}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400">
                    {style.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Mobile Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                🇵🇰 +92
              </span>
            </div>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => onChangePhoneNumber(e.target.value)}
              placeholder="03001234567"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-20 pr-4 py-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono"
              required
            />
          </div>
        </div>

        {/* Amount & Quick Chips */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Recharge Amount (Rs.)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center font-bold text-slate-400 text-sm">
              Rs.
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => onChangeAmount(e.target.value)}
              placeholder="500"
              min="1"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono"
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
                  amount === val.toString()
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
                Kam Balance: Wallet mein Rs. {currentBalanceNum.toLocaleString()} hain, Rs. {discountCalculation.final.toLocaleString()} darkaar hain.
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

        {/* Vouchers */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              Available Promo Vouchers
            </label>
            {promoCode && (
              <button
                type="button"
                onClick={() => onChangePromoCode('')}
                className="text-[11px] text-rose-500 font-semibold hover:underline"
              >
                Clear Promo
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {promotions.map((p) => {
              const isSelected = promoCode === p.code;
              const applicableRule = p.rules.find((r) => r.telecom.code === selectedTelecom);

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onChangePromoCode(p.code)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20 shadow-sm'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200">
                      {p.code}
                    </span>
                    {isSelected ? (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Applied
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 hover:text-emerald-700">
                        Tap to apply →
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium line-clamp-1">{p.description}</p>
                  {applicableRule ? (
                    <span className="text-[10px] font-semibold text-emerald-700">
                      Valid on {selectedTelecom}: <strong>{applicableRule.discountValue}% Off</strong>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">
                      (Change network to use)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Receipt Breakdown */}
        <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Easyload Amount:</span>
            <span className="font-semibold text-slate-800">Rs. {Number(amount) || 0}</span>
          </div>
          {discountCalculation.discount > 0 && (
            <div className="flex justify-between text-xs text-emerald-700 font-semibold">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Promo Savings ({promoCode}):
              </span>
              <span>- Rs. {discountCalculation.discount.toFixed(2)}</span>
            </div>
          )}
          {discountCalculation.error && (
            <p className="text-[11px] text-amber-600 font-medium">{discountCalculation.error}</p>
          )}
          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Total Payable:</span>
            <span className="text-xl font-extrabold text-emerald-700">
              Rs. {discountCalculation.final.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || Number(amount) <= 0}
          className="w-full bg-[#00875A] hover:bg-[#00744D] text-white font-bold py-4 rounded-2xl transition-all shadow-md hover:shadow-lg shadow-emerald-700/20 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 text-base"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing Easyload...</span>
            </>
          ) : (
            <>
              <span>Pay Rs. {discountCalculation.final.toFixed(0)} with Easypaisa</span>
              <ArrowUpRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </>
  );
}

export default EasyloadForm;

