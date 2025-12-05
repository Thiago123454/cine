import React, { useState } from 'react';
import { ClipboardList, Store, Plus, CheckCircle2 } from 'lucide-react';

export default function ManagerControls({ products, onAddProduct }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Pochoclos');

  const pos1Needs = products.filter(p => p.pos1Status !== 'ok');
  const pos2Needs = products.filter(p => p.pos2Status !== 'ok');
  const totalAlerts = pos1Needs.length + pos2Needs.length;

  const handleAdd = (e) => {
    e.preventDefault();
    onAddProduct(name, category);
    setName('');
  };

  const NeedItem = ({ p, status }) => (
    <li className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded border border-gray-200">
      <span className="font-medium text-gray-700">{p.name}</span>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status === 'out' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-amber-100 text-amber-600 border-amber-200'}`}>
        {status === 'out' ? 'FALTA' : 'POCO'}
      </span>
    </li>
  );

  return (
    <div className="space-y-4">
      {totalAlerts > 0 ? (
        <div className="bg-white rounded-xl overflow-hidden shadow-xl border-l-4 border-red-500">
          <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center gap-2">
            <ClipboardList className="text-red-600" size={20} />
            <h2 className="font-bold text-red-800">Reposición Urgente</h2>
          </div>
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="flex-1 p-4">
              <h3 className="text-xs uppercase tracking-wider text-blue-600 font-bold mb-3 flex items-center gap-2"><Store size={14} /> Candy 1</h3>
              {pos1Needs.length === 0 ? <p className="text-gray-400 text-sm italic">Sin pendientes ✅</p> : 
                <ul className="space-y-2">{pos1Needs.map(p => <NeedItem key={p.id} p={p} status={p.pos1Status} />)}</ul>
              }
            </div>
            <div className="flex-1 p-4">
              <h3 className="text-xs uppercase tracking-wider text-indigo-600 font-bold mb-3 flex items-center gap-2"><Store size={14} /> Candy 2</h3>
              {pos2Needs.length === 0 ? <p className="text-gray-400 text-sm italic">Sin pendientes ✅</p> : 
                <ul className="space-y-2">{pos2Needs.map(p => <NeedItem key={p.id} p={p} status={p.pos2Status} />)}</ul>
              }
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur border-l-4 border-emerald-500 p-4 rounded-xl flex items-center justify-center gap-3 text-emerald-700 shadow-lg">
          <CheckCircle2 /> <span className="font-bold">¡Todo perfecto! Stock al 100%.</span>
        </div>
      )}

      <div className="bg-white/95 backdrop-blur p-4 rounded-xl shadow-lg border border-white/20">
         <h2 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Plus size={14} /> Nuevo Producto</h2>
         <form onSubmit={handleAdd} className="flex gap-2">
            <input type="text" placeholder="Nombre..." value={name} onChange={e => setName(e.target.value)} className="flex-1 bg-gray-100 border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500" />
            <select value={category} onChange={e => setCategory(e.target.value)} className="bg-gray-100 border border-gray-200 rounded px-2 py-2 text-sm cursor-pointer">
              <option>Pochoclos</option>
              <option>Papas</option>
              <option>Nachos</option>
              <option>Bebidas</option>
              <option>Botellas</option>
              <option>Jarabes</option>
              <option>Snacks</option>
              <option>Dulces</option>
              <option>Helados</option>
              <option>Descartables</option>
            </select>
            <button type="submit" disabled={!name.trim()} className="bg-pink-600 hover:bg-pink-700 text-white px-4 rounded shadow-sm"><Plus size={18} /></button>
         </form>
      </div>
    </div>
  );
}