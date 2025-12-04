import React from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { getStatusLabel } from '../utils';

const StatusBadge = ({ status, onClick, readonly = false }) => {
  const getStatusStyle = (s) => {
    switch (s) {
      case 'ok': return 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200';
      case 'low': return 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse-slow hover:bg-amber-200';
      case 'out': return 'bg-red-100 text-red-700 border-red-200 font-bold hover:bg-red-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getIcon = (s) => {
    switch (s) {
      case 'ok': return <CheckCircle2 size={18} />;
      case 'low': return <AlertCircle size={18} />;
      case 'out': return <XCircle size={18} />;
      default: return null;
    }
  };

  return (
    <button
      onClick={readonly ? undefined : onClick}
      disabled={readonly}
      className={`
        w-full flex items-center justify-center gap-2 px-2 py-3 rounded-lg border transition-all shadow-sm
        ${getStatusStyle(status)}
        ${readonly ? 'cursor-default opacity-80' : 'cursor-pointer active:scale-95 hover:shadow-md'}
      `}
    >
      {getIcon(status)}
      <span className="text-sm sm:text-base font-bold whitespace-nowrap">{getStatusLabel(status)}</span>
    </button>
  );
};

export default StatusBadge;