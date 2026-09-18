import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  if (!message) return null;

  const styles = {
    success: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600'
    },
    error: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: AlertCircle,
      iconColor: 'text-rose-600'
    },
    warning: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: AlertCircle,
      iconColor: 'text-amber-600'
    },
    info: {
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: Info,
      iconColor: 'text-blue-600'
    }
  };

  const current = styles[type] || styles.info;
  const IconComponent = current.icon;

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-xl border ${current.bg} text-sm shadow-xs transition-all ${className}`}
      role="alert"
    >
      <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${current.iconColor}`} />
      <div className="flex-1 font-medium">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="shrink-0 p-1 hover:bg-black/5 rounded-md transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4 opacity-70 hover:opacity-100" />
        </button>
      )}
    </div>
  );
};
