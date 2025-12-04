import React, { useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { getStatusColorRaw } from '../utils';

const NotificationToast = ({ notif, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notif.id);
    }, 8000); 
    return () => clearTimeout(timer);
  }, [notif.id, onClose]);

  return (
    <div className={`
      pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 
      flex items-start p-4 mb-3 transition-all animate-in slide-in-from-right fade-in duration-300
      ${getStatusColorRaw(notif.status)} text-white relative z-50
    `}>
      <div className={`flex-1 text-white`}>
        <h3 className="text-sm font-bold flex items-center gap-2">
           <Bell size={16} className="animate-bounce-short" />
           {notif.title}
        </h3>
        <p className="mt-1 text-sm opacity-90">{notif.message}</p>
        <p className="text-[10px] opacity-70 mt-1">Confirmado hace instantes</p>
      </div>
      <button 
        onClick={() => onClose(notif.id)}
        className="ml-4 inline-flex shrink-0 text-white/70 hover:text-white focus:outline-none"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default NotificationToast;