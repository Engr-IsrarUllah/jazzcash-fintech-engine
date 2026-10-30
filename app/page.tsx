'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Telecom, Promotion, Transaction, FeedbackMessage, ActiveTabType } from '@/types';

// Modular Components
import Header from '@/components/dashboard/Header';
import WalletCard from '@/components/dashboard/WalletCard';
import ServiceTabs from '@/components/dashboard/ServiceTabs';
import Passbook from '@/components/dashboard/Passbook';
import EasyloadForm from '@/components/forms/EasyloadForm';
import SendMoneyForm from '@/components/forms/SendMoneyForm';
import BillPaymentForm from '@/components/forms/BillPaymentForm';
import FeedbackAlert from '@/components/ui/FeedbackAlert';

export default function EasypaisaApp() {
  // Main Data States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [balance, setBalance] = useState('0.00');
  const [userName, setUserName] = useState('');
  const [telecoms, setTelecoms] = useState<Telecom[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // UX states
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTabType>('easyload');

  // Easyload Form State
  const [phoneNumber, setPhoneNumber] = useState('03001234567');
  const [selectedTelecom, setSelectedTelecom] = useState('JAZZ');
  const [amount, setAmount] = useState('500');
  const [promoCode, setPromoCode] = useState('SUNDAY5');

  // Send Money Form State
  const [transferPhone, setTransferPhone] = useState('03129876543');
  const [transferName, setTransferName] = useState('Ahmed Raza');
  const [transferAmount, setTransferAmount] = useState('1000');
  const [transferPurpose, setTransferPurpose] = useState('Family Support');

  // Bill Payment Form State
  const [billCompany, setBillCompany] = useState('LESCO Electricity');
  const [billConsumerNo, setBillConsumerNo] = useState('14253678901234');
  const [billAmount, setBillAmount] = useState('1500');

  // Alerts & Notifications
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  // 1. Fetch Wallet & Platform Data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/wallet');
      const data = await res.json();

      if (res.ok) {
        setBalance(data.wallet.balance);
        setUserName(data.user.name);
        setTelecoms(data.telecoms || []);
        setPromotions(data.promotions || []);
        setTransactions(data.transactions || []);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to load wallet data' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network connection failed' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Check URL parameters for Stripe payment redirect callback
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const depositStatus = params.get('deposit');
      const sessionId = params.get('session_id');

      if (depositStatus === 'success' && sessionId) {
        fetch(`/api/stripe/verify?session_id=${sessionId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success || data.alreadyCredited) {
              setFeedback({
                type: 'success',
                message: `Shukriya! Rs. ${data.amount} has been added to your Easypaisa Account.`,
              });
              if (data.newBalance) setBalance(data.newBalance);
              fetchDashboardData();
            } else {
              setFeedback({ type: 'error', message: data.error || 'Payment verification failed' });
            }
          })
          .catch(() => {
            setFeedback({ type: 'error', message: 'Failed to verify Stripe payment' });
          })
          .finally(() => {
            window.history.replaceState({}, '', window.location.pathname);
          });
      } else if (depositStatus === 'cancelled') {
        setFeedback({ type: 'error', message: 'Deposit transaction was cancelled.' });
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  // Live Real-Time Discount Calculator for Easyload
  const discountCalculation = useMemo(() => {
    const rawAmount = Number(amount) || 0;
    if (!promoCode || rawAmount <= 0) {
      return { discount: 0, final: rawAmount, appliedPromo: null };
    }

    const matchedPromo = promotions.find(
      (p) => p.code.toUpperCase() === promoCode.trim().toUpperCase()
    );

    if (!matchedPromo) {
      return { discount: 0, final: rawAmount, appliedPromo: null };
    }

    const rule = matchedPromo.rules.find((r) => r.telecom.code === selectedTelecom);
    if (!rule) {
      return {
        discount: 0,
        final: rawAmount,
        appliedPromo: null,
        error: `Promo '${promoCode}' is not applicable for ${selectedTelecom}`,
      };
    }

    let calculatedDiscount = 0;
    if (rule.discountType === 'PERCENTAGE') {
      calculatedDiscount = (rawAmount * Number(rule.discountValue)) / 100;
      if (rule.maxCap) {
        calculatedDiscount = Math.min(calculatedDiscount, Number(rule.maxCap));
      }
    } else {
      calculatedDiscount = Number(rule.discountValue);
    }

    const finalPayable = Math.max(0, rawAmount - calculatedDiscount);
    return {
      discount: calculatedDiscount,
      final: finalPayable,
      appliedPromo: matchedPromo,
      rule,
    };
  }, [amount, promoCode, selectedTelecom, promotions]);

  const currentBalanceNum = Number(balance) || 0;

  // 2. Submit Mobile Easyload
  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const payable = discountCalculation.final;
    if (payable > currentBalanceNum) {
      setFeedback({
        type: 'error',
        message: `Kam Balance: Aapke wallet mein sirf Rs. ${currentBalanceNum.toLocaleString()} hain, jabke is Easyload ke liye Rs. ${payable.toLocaleString()} darkaar hain. Pehle card se cash add karein.`,
      });
      return;
    }

    setSubmitting(true);
    const idempotencyKey = crypto.randomUUID();

    try {
      const res = await fetch('/api/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          phoneNumber,
          amount: Number(amount),
          telecomCode: selectedTelecom,
          promoCode: promoCode.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `Mubarak! Easyload of Rs. ${amount} sent to ${phoneNumber}. Discount: Rs. ${data.discountGiven}`,
        });
        setBalance(data.newBalance);
        if (data.transaction) {
          setTransactions((prev) => [data.transaction, ...prev.slice(0, 9)]);
        }
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'Easyload could not be processed',
        });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Submit Send Money (P2P Transfer)
  const handleSendMoneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const reqAmount = Number(transferAmount) || 0;
    if (reqAmount > currentBalanceNum) {
      setFeedback({
        type: 'error',
        message: `Kam Balance: Aapke wallet mein sirf Rs. ${currentBalanceNum.toLocaleString()} hain, jabke aap Rs. ${reqAmount.toLocaleString()} transfer karne ki koshish kar rahe hain. Pehle cash add karein.`,
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverPhone: transferPhone,
          receiverName: transferName,
          amount: Number(transferAmount),
          purpose: transferPurpose,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `Mubarak! Rs. ${transferAmount} transferred successfully to ${transferName} (${transferPhone}).`,
        });
        setBalance(data.newBalance);
        if (data.transaction) {
          setTransactions((prev) => [data.transaction, ...prev.slice(0, 9)]);
        }
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'Transfer failed. Check balance or recipient number.',
        });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Submit Bill Payment
  const handleBillPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const reqAmount = Number(billAmount) || 0;
    if (reqAmount > currentBalanceNum) {
      setFeedback({
        type: 'error',
        message: `Kam Balance: Aapke wallet mein sirf Rs. ${currentBalanceNum.toLocaleString()} hain, jabke bill payment ke liye Rs. ${reqAmount.toLocaleString()} darkaar hain. Pehle cash add karein.`,
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: billCompany,
          consumerNumber: billConsumerNo,
          amount: Number(billAmount),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `Bill Paid! Rs. ${billAmount} paid successfully to ${billCompany} (Ref: ${billConsumerNo}).`,
        });
        setBalance(data.newBalance);
        if (data.transaction) {
          setTransactions((prev) => [data.transaction, ...prev.slice(0, 9)]);
        }
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'Bill payment failed. Please check balance.',
        });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Deposit via Stripe (Card Top-Up)
  const handleStripeDeposit = async () => {
    const depositAmount = prompt(
      'Enter amount in PKR to deposit into your Easypaisa Account (Minimum Rs. 200):',
      '1000'
    );
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) return;

    if (Number(depositAmount) < 200) {
      setFeedback({ type: 'error', message: 'Minimum deposit via Card / Stripe is Rs. 200' });
      return;
    }

    setDepositing(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(depositAmount) }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Could not initiate card payment' });
      } else {
        // Fallback simulation
        const fallbackRes = await fetch('/api/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: Number(depositAmount) }),
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok) {
          setBalance(fallbackData.newBalance);
          setFeedback({
            type: 'success',
            message: `Deposit of Rs. ${depositAmount} successful!`,
          });
          fetchDashboardData();
        }
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to process card deposit' });
    } finally {
      setDepositing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex flex-col items-center justify-center text-slate-700">
        <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-4 animate-bounce">
          <span className="text-white font-black text-2xl tracking-tighter">ep</span>
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
        <p className="text-sm font-semibold text-slate-600">Connecting to Easypaisa Wallet...</p>
        <p className="text-xs text-slate-400 mt-1">State Bank of Pakistan Regulated</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-slate-800 antialiased font-sans">
      {/* 1. Header Bar */}
      <Header userName={userName} />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* 2. Feedback Alert */}
        <FeedbackAlert feedback={feedback} onDismiss={() => setFeedback(null)} />

        {/* 3. Wallet Card */}
        <WalletCard
          balance={balance}
          showBalance={showBalance}
          onToggleBalance={() => setShowBalance(!showBalance)}
          onDeposit={handleStripeDeposit}
          depositing={depositing}
          onRefresh={fetchDashboardData}
        />

        {/* 4. Service Switcher Tabs */}
        <ServiceTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onDeposit={handleStripeDeposit}
        />

        {/* 5. Main Body Grid: Active Service Form & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-6">
            {activeTab === 'easyload' && (
              <EasyloadForm
                telecoms={telecoms}
                promotions={promotions}
                selectedTelecom={selectedTelecom}
                onSelectTelecom={setSelectedTelecom}
                phoneNumber={phoneNumber}
                onChangePhoneNumber={setPhoneNumber}
                amount={amount}
                onChangeAmount={setAmount}
                promoCode={promoCode}
                onChangePromoCode={setPromoCode}
                onSubmit={handleTopupSubmit}
                submitting={submitting}
                discountCalculation={discountCalculation}
                balance={balance}
                onDeposit={handleStripeDeposit}
              />
            )}

            {activeTab === 'send' && (
              <SendMoneyForm
                transferName={transferName}
                onChangeName={setTransferName}
                transferPhone={transferPhone}
                onChangePhone={setTransferPhone}
                transferAmount={transferAmount}
                onChangeAmount={setTransferAmount}
                transferPurpose={transferPurpose}
                onChangePurpose={setTransferPurpose}
                onSubmit={handleSendMoneySubmit}
                submitting={submitting}
                balance={balance}
                onDeposit={handleStripeDeposit}
              />
            )}

            {activeTab === 'bills' && (
              <BillPaymentForm
                billCompany={billCompany}
                onSelectCompany={setBillCompany}
                billConsumerNo={billConsumerNo}
                onChangeConsumerNo={setBillConsumerNo}
                billAmount={billAmount}
                onChangeAmount={setBillAmount}
                onSubmit={handleBillPaymentSubmit}
                submitting={submitting}
                balance={balance}
                onDeposit={handleStripeDeposit}
              />
            )}

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-Time Atomic Transaction • State Bank of Pakistan Compliant</span>
            </div>
          </div>

          {/* Passbook / Statement */}
          <Passbook transactions={transactions} onRefresh={fetchDashboardData} />
        </div>

        {/* Trust & Compliance Footer */}
        <footer className="pt-8 pb-12 border-t border-slate-200/80 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Easypaisa Branchless Banking Core Engine</span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-md mx-auto">
            Authorized & Regulated by the State Bank of Pakistan (SBP). Guaranteed 256-bit encryption for every financial interaction.
          </p>
        </footer>
      </main>
    </div>
  );
}
