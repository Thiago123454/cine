import React, { useState } from 'react';
import { UserCircle2, KeyRound, AlertCircle, Store, ArrowRight, Popcorn } from 'lucide-react';
import IosInstallPrompt from './IosInstallPrompt';

export default function LoginScreen({ onRoleSelect, onLoginManager, isIos, showIosPrompt, onCloseIosPrompt }) {
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLoginManager(username, password)) {
      setError('');
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-600 via-rose-600 to-red-700 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl overflow-hidden relative">
        <div className="bg-red-600 p-6 flex flex-col items-center justify-center text-white shadow-inner">
          <Popcorn size={48} className="mb-2 drop-shadow-sm" />
          <h1 className="text-2xl font-black uppercase tracking-wider text-center drop-shadow-md">Multiplex Canning</h1>
          <p className="text-red-100 text-xs mt-1 font-medium">Sistema de Stock Interno</p>
        </div>
        
        <div className="p-8 space-y-4">
          {!showForm ? (
            <>
              <p className="text-center text-gray-500 mb-4 font-medium">Seleccione su perfil:</p>
              <button onClick={() => onRoleSelect('pos1')} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 p-4 rounded-lg border border-gray-200 flex items-center justify-between font-bold group shadow-sm transition-all">
                <span className="flex items-center gap-3 text-blue-600"><Store size={20}/> Candy 1</span>
                <span className="text-gray-400 group-hover:translate-x-1 transition-transform"><ArrowRight size={20} /></span>
              </button>
              <button onClick={() => onRoleSelect('pos2')} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 p-4 rounded-lg border border-gray-200 flex items-center justify-between font-bold group shadow-sm transition-all">
                <span className="flex items-center gap-3 text-indigo-600"><Store size={20}/> Candy 2</span>
                <span className="text-gray-400 group-hover:translate-x-1 transition-transform"><ArrowRight size={20} /></span>
              </button>
              <div className="border-t border-gray-100 my-4"></div>
              <button onClick={() => setShowForm(true)} className="w-full bg-red-50 hover:bg-red-100 text-red-700 p-3 rounded-lg border border-red-100 flex items-center justify-center gap-2 font-semibold text-sm">
                <UserCircle2 size={18} /> Acceso Administrativo
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">Gerencia</h2>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <UserCircle2 className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input type="text" placeholder="Usuario" value={username} onChange={e => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                </div>
              </div>
              {error && <div className="p-2 bg-red-50 text-red-600 text-xs rounded flex items-center justify-center gap-1"><AlertCircle size={12} /> {error}</div>}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium">Volver</button>
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-bold shadow-md">Ingresar</button>
              </div>
            </form>
          )}
        </div>
      </div>
      {showIosPrompt && <IosInstallPrompt onClose={onCloseIosPrompt} />}
      <p className="mt-8 text-white/60 text-xs">Multiplex &copy; {new Date().getFullYear()}</p>
    </div>
  );
}