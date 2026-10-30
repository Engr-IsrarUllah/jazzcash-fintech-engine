'use client';

import React from 'react';
import { Clock, RefreshCw, Receipt, Smartphone, ArrowDownLeft, Send } from 'lucide-react';
import { Transaction } from '@/types';
import { TELECOM_STYLES } from '@/lib/constants';

interface PassbookProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

export function Passbook({ transactions, onRefresh }: PassbookProps) {
  return (
    <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">Recent Activity (لین دین)</h3>
          </div>
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"
            title="Refresh Activity"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-2 text-slate-400">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-600">No transactions recorded yet</p>
            <p className="text-[11px] text-slate-400 mt-1">Send your first mobile easyload or deposit cash above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 8).map((tx) => {
              const isDeposit = tx.promoCode === 'STRIPE_DEPOSIT';
              const isTransfer = tx.promoCode?.startsWith('TRANSFER');
              const isBill = tx.promoCode?.startsWith('BILL');

              const operatorStyle = TELECOM_STYLES[tx.telecom?.code] || {
                color: 'text-emerald-700',
                bg: 'bg-emerald-50',
              };

              let title = `${tx.telecom?.name || 'Mobile'} Easyload`;
              let IconComponent = Smartphone;
              let iconBg = operatorStyle.bg;
              let iconColor = operatorStyle.color;

              if (isDeposit) {
                title = 'Stripe Card Deposit';
                IconComponent = ArrowDownLeft;
                iconBg = 'bg-indigo-50';
                iconColor = 'text-indigo-600';
              } else if (isTransfer) {
                title = tx.promoCode?.replace('TRANSFER: ', '') || 'Money Transfer';
                IconComponent = Send;
                iconBg = 'bg-emerald-50';
                iconColor = 'text-emerald-700';
              } else if (isBill) {
                title = tx.promoCode?.replace('BILL: ', '') || 'Bill Payment';
                IconComponent = Receipt;
                iconBg = 'bg-amber-50';
                iconColor = 'text-amber-600';
              }

              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
                    >
                      <IconComponent className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {title}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {tx.phoneNumber}
                      </p>
                      {tx.promoCode && !isDeposit && !isTransfer && !isBill && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Voucher: {tx.promoCode}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-xs font-black ${
                        isDeposit ? 'text-emerald-600' : 'text-slate-800'
                      }`}
                    >
                      {isDeposit ? '+' : '-'} Rs. {Number(tx.finalAmount).toFixed(0)}
                    </p>
                    <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-4 mt-6 border-t border-slate-100 text-center">
        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <span>All transactions recorded in Real-Time Neon DB</span>
        </p>
      </div>
    </div>
  );
}

export default Passbook;

