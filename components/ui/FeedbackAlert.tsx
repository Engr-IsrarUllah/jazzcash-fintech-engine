'use client';

import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { FeedbackMessage } from '@/types';

interface FeedbackAlertProps {
  feedback: FeedbackMessage | null;
  onDismiss: () => void;
}

export function FeedbackAlert({ feedback, onDismiss }: FeedbackAlertProps) {
  if (!feedback) return null;

  const isSuccess = feedback.type === 'success';

  return (
    <div
      className={`p-4 rounded-2xl flex items-center gap-3 shadow-sm transition-all border ${
        isSuccess
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-rose-50 border-rose-200 text-rose-800'
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
      )}
      <p className="text-sm font-medium flex-1">{feedback.message}</p>
      <button
        onClick={onDismiss}
        className="text-xs font-bold opacity-60 hover:opacity-100 px-2 py-1"
      >
        Dismiss
      </button>
    </div>
  );
}

export default FeedbackAlert;

