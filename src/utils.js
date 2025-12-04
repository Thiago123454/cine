export const getStatusLabel = (s) => {
  switch (s) {
    case 'ok': return 'Stock OK';
    case 'low': return 'Queda Poco';
    case 'out': return 'FALTA';
    default: return '---';
  }
};

export const getStatusColorRaw = (s) => {
  switch (s) {
    case 'ok': return 'bg-emerald-500';
    case 'low': return 'bg-amber-500';
    case 'out': return 'bg-red-600';
    default: return 'bg-slate-500';
  }
};