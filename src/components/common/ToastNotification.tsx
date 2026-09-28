import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { toast, hideToast } = useApp();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />;
      case 'error':
        return <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />;
      case 'info':
      default:
        return <Info size={16} className="text-teal-600 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full transition-all duration-200 animate-in fade-in slide-in-from-bottom-3">
      <div className="bg-white border border-stone-200/90 shadow-lg rounded-lg p-3.5 flex items-start gap-3 text-stone-900">
        {getIcon()}
        <div className="flex-1 text-xs font-medium text-stone-800 leading-snug">
          {toast.message}
        </div>
        <button
          onClick={hideToast}
          className="text-stone-400 hover:text-stone-700 transition-colors p-0.5 -mr-1"
          aria-label="Close notification"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
