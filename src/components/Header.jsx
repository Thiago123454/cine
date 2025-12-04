import React from 'react';
import { LayoutDashboard, Store, BellRing, Smartphone, LogOut } from 'lucide-react';

export default function Header({ role, managerName, totalAlerts, showNotifBtn, isIos, onReqPerm, onShowIos, onLogout }) {
  return (
    <header className="bg-red-700 text-white shadow-lg sticky top-0 z-20 border-b border-red-800">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
            {role === 'manager' ? <LayoutDashboard size={20} /> : <Store size={20} />}
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight drop-shadow-sm">
              {role === 'manager' ? `Hola ${managerName}, ¿Cómo andas hoy?` : role === 'pos1' ? 'Candy 1' : 'Candy 2'}
            </h1>
            {role === 'manager' && totalAlerts > 0 ? (
              <p className="text-xs text-yellow-200 animate-pulse font-bold">{totalAlerts} alertas</p>
            ) : (
              <p className="text-xs text-red-200">Multiplex Canning</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
           {showNotifBtn && (
             <button onClick={onReqPerm} className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-md animate-pulse">
               <BellRing size={14} /> <span className="hidden sm:inline">Activar</span>
             </button>
           )}
           {isIos && <button onClick={onShowIos} className="text-white/80 hover:text-white px-2"><Smartphone size={18} /></button>}
           <button onClick={onLogout} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full"><LogOut size={18} /></button>
        </div>
      </div>
    </header>
  );
}