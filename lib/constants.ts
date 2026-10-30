import { LucideIcon, Zap, Flame, Globe } from 'lucide-react';

export const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000];
export const BILL_QUICK_AMOUNTS = [500, 1200, 2500, 5000];

export interface TelecomStyle {
  color: string;
  bg: string;
  border: string;
  badge: string;
  tag: string;
}

export const TELECOM_STYLES: Record<string, TelecomStyle> = {
  JAZZ: {
    color: 'text-red-600',
    bg: 'bg-red-50 hover:bg-red-100/80',
    border: 'border-red-500',
    badge: 'bg-red-600 text-white',
    tag: 'Super 4G',
  },
  ZONG: {
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 hover:bg-emerald-100/80',
    border: 'border-emerald-500',
    badge: 'bg-emerald-600 text-white',
    tag: '4G Data',
  },
  TELENOR: {
    color: 'text-sky-600',
    bg: 'bg-sky-50 hover:bg-sky-100/80',
    border: 'border-sky-500',
    badge: 'bg-sky-600 text-white',
    tag: '4G Digital',
  },
  UFONE: {
    color: 'text-orange-600',
    bg: 'bg-orange-50 hover:bg-orange-100/80',
    border: 'border-orange-500',
    badge: 'bg-orange-600 text-white',
    tag: '4G Super',
  },
};

export interface UtilityCompany {
  id: string;
  name: string;
  type: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export const UTILITY_COMPANIES: UtilityCompany[] = [
  { id: 'LESCO', name: 'LESCO Electricity', type: 'Electricity', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'KELECTRIC', name: 'K-Electric (Karachi)', type: 'Electricity', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { id: 'SNGPL', name: 'SNGPL Sui Gas', type: 'Gas', icon: Flame, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'PTCL', name: 'PTCL Landline/EVO', type: 'Internet', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

