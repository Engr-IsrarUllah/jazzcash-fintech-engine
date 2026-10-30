export interface Telecom {
  id: string;
  name: string;
  code: string;
}

export interface PromotionRule {
  telecom: Telecom;
  discountType: string;
  discountValue: string;
  maxCap?: string | null;
}

export interface Promotion {
  id: string;
  code: string;
  description: string;
  rules: PromotionRule[];
}

export interface Transaction {
  id: string;
  phoneNumber: string;
  amount: string;
  discountAmount: string;
  finalAmount: string;
  status: string;
  promoCode: string | null;
  createdAt: string;
  telecom: Telecom;
}

export interface User {
  name: string;
  phone: string;
}

export interface Wallet {
  balance: string;
  currency: string;
}

export interface FeedbackMessage {
  type: 'success' | 'error';
  message: string;
}

export type ActiveTabType = 'easyload' | 'send' | 'bills' | 'cards';

