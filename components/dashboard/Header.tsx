'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface HeaderProps {
  userName: string;
}

export function Header({ userName }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-[#00875A] to-[#00A859] text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Logo & User Greeting */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-sm">
              <span className="text-[#00875A] font-black text-xl tracking-tighter">ep</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                  easypaisa
                </h1>
                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                  Verified
                </span>
              </div>
              <p className="text-xs text-emerald-100 flex items-center gap-1">
                <span>Assalam-o-Alaikum, <strong>{userName || 'Israr Ullah'}</strong></span>
              </p>
            </div>
          </div>

          {/* User Badges & Security */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-emerald-100">03312724051</span>
              <span className="text-[11px] text-emerald-200 flex items-center justify-end gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> SBP Verified
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-white font-bold text-xs">
              IU
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

