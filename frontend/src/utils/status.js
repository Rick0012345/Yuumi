export const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'PREPARING': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'READY': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'DELIVERING': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const getStatusLabel = (status) => {
  switch (status) {
    case 'PENDING': return 'Pendente';
    case 'PREPARING': return 'Preparando';
    case 'READY': return 'Pronto';
    case 'DELIVERING': return 'Em Entrega';
    case 'COMPLETED': return 'Concluído';
    case 'CANCELLED': return 'Cancelado';
    default: return status;
  }
};
