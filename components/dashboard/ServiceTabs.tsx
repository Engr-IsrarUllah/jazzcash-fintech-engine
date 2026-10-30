'use client';

import React from 'react';
import { Smartphone, Send, Receipt, Gift } from 'lucide-react';
import { ActiveTabType } from '@/types';

interface ServiceTabsProps {
  activeTab: ActiveTabType;
  onTabChange: (tab: ActiveTabType) => void;
  onDeposit: () => void;
}

export function ServiceTabs({ activeTab, onTabChange, onDeposit }: ServiceTabsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* 1. Easyload */}
      <button
        onClick={() => onTabChange('easyload')}
        className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 shadow-sm ${
          activeTab === 'easyload'
            ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-700'
            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
        }`}
      >
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
            activeTab === 'easyload' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-bold block">Easyload</span>
          <span className="text-[10px] text-slate-400">Mobile Top-Up</span>
        </div>
      </button>

      {/* 2. Send Money */}
      <button
        onClick={() => onTabChange('send')}
        className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 shadow-sm ${
          activeTab === 'send'
            ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-700'
            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
        }`}
      >
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
            activeTab === 'send' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <Send className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-bold block">Send Money</span>
          <span className="text-[10px] text-slate-400">To Mobile / CNIC</span>
        </div>
      </button>

      {/* 3. Bill Payment */}
      <button
        onClick={() => onTabChange('bills')}
        className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 shadow-sm ${
          activeTab === 'bills'
            ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-700'
            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
        }`}
      >
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
            activeTab === 'bills' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <Receipt className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-bold block">Bill Payment</span>
          <span className="text-[10px] text-slate-400">Electricity, Gas</span>
        </div>
      </button>

      {/* 4. Cashback & Cards */}
      <button
        onClick={onDeposit}
        className="p-4 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:border-slate-300 text-center transition-all flex flex-col items-center gap-2 shadow-sm"
      >
        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <Gift className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-bold block">Cashback & Cards</span>
          <span className="text-[10px] text-amber-600 font-semibold">+ Add via Stripe</span>
        </div>
      </button>
    </div>
  );
}

export default ServiceTabs;

