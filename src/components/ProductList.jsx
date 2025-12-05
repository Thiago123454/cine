import React from 'react';
import { Popcorn, Beer, Candy, IceCream, Package, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

const getCategoryIcon = (cat) => {
  switch (cat) {
    case 'Snacks': return <Popcorn className="text-amber-500" />;
    case 'Bebidas': return <Beer className="text-blue-500" />;
    case 'Dulces': return <Candy className="text-pink-500" />;
    case 'Helados': return <IceCream className="text-purple-500" />;
    case 'Descartables': return <Package className="text-gray-500" />;
    default: return <Popcorn className="text-gray-400" />;
  }
};

export default function ProductList({ products, role, onCycleStatus, onDelete }) {
  if (products.length === 0) {
    return <div className="text-center py-12 text-white/80 bg-white/10 rounded-xl">Lista vacía.</div>;
  }

  const items = [];
  let lastCategory = null;

  products.forEach((p) => {
    if (p.category !== lastCategory) {
      items.push(
        <div key={`cat-${p.category}`} className="sticky top-14 z-10 bg-red-800/90 text-white px-4 py-1.5 rounded-lg shadow-sm backdrop-blur-sm mb-2 mt-4 first:mt-0 border border-red-700 flex items-center gap-2">
           {getCategoryIcon(p.category)}
           <span className="font-bold text-sm uppercase tracking-wider">{p.category || 'Varios'}</span>
        </div>
      );
      lastCategory = p.category;
    }

    items.push(
      <div key={p.id} className={`bg-white rounded-xl overflow-hidden shadow-lg flex flex-col sm:flex-row mb-3 ${(role === 'manager' && (p.pos1Status !== 'ok' || p.pos2Status !== 'ok')) ? 'ring-2 ring-yellow-400' : ''}`}>
        <div className="p-3 sm:p-4 flex items-center gap-3 flex-1 border-b sm:border-b-0 sm:border-r border-gray-100 bg-white">
          <div className="p-2 bg-gray-50 rounded-lg shrink-0 border border-gray-100">{getCategoryIcon(p.category)}</div>
          <div className="min-w-0">
            <h3 className="font-bold text-base text-gray-800 truncate pr-2 leading-tight">{p.name}</h3>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{p.category}</span>
          </div>
          {role === 'manager' && (
            <button onClick={() => onDelete(p.id)} className="ml-auto text-gray-300 hover:text-red-500 p-2"><Trash2 size={16} /></button>
          )}
        </div>
        <div className="flex divide-x divide-gray-100 h-auto sm:h-full">
          {(role === 'manager' || role === 'pos1') && (
            <div className="flex-1 p-2 sm:p-3 flex flex-col items-center justify-center min-w-[120px] bg-gray-50/50">
              <span className="text-[10px] uppercase text-gray-400 font-bold mb-1">Candy 1</span>
              <StatusBadge status={p.pos1Status || 'ok'} onClick={() => onCycleStatus(p.id, p.pos1Status || 'ok', 'pos1Status')} />
            </div>
          )}
          {(role === 'manager' || role === 'pos2') && (
            <div className="flex-1 p-2 sm:p-3 flex flex-col items-center justify-center min-w-[120px] bg-gray-50/50">
              <span className="text-[10px] uppercase text-gray-400 font-bold mb-1">Candy 2</span>
              <StatusBadge status={p.pos2Status || 'ok'} onClick={() => onCycleStatus(p.id, p.pos2Status || 'ok', 'pos2Status')} />
            </div>
          )}
        </div>
      </div>
    );
  });

  return <div className="space-y-0">{items}</div>;
}