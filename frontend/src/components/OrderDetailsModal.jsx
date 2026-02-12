import { X, Clock, Truck, CheckCircle, Package } from 'lucide-react';

export default function OrderDetailsModal({ order, onClose, onUpdateStatus }) {
  if (!order) return null;

  const getStatusColor = (status) => {
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

  const getStatusLabel = (status) => {
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

  const handleUpdateStatus = (newStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(order.id, newStatus);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Pedido #{order.id}</h2>
            <p className="text-sm text-slate-500">
              {new Date(order.created_at).toLocaleString('pt-BR')}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status e Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm font-medium text-slate-500 mb-1">Status do Pedido</p>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border inline-flex items-center gap-2 ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm font-medium text-slate-500 mb-1">Cliente</p>
              <p className="font-semibold text-slate-800">{order.customer_name || 'Cliente Anônimo'}</p>
            </div>
          </div>

          {/* Itens do Pedido */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Package size={18} className="text-slate-500" />
              Itens do Pedido
            </h3>
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-500">Produto</th>
                    <th className="px-4 py-3 font-medium text-slate-500 text-center">Qtd</th>
                    <th className="px-4 py-3 font-medium text-slate-500 text-right">Preço Un.</th>
                    <th className="px-4 py-3 font-medium text-slate-500 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-slate-800 font-medium">
                        {item.product?.name || `Produto #${item.productId}`}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-slate-600 text-right">
                        R$ {Number(item.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-800 font-medium text-right">
                        R$ {(Number(item.price) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {(!order.items || order.items.length === 0) && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-slate-400 italic">
                        Nenhum item registrado neste pedido.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-100">
                  <tr>
                    <td colSpan="3" className="px-4 py-3 font-bold text-slate-800 text-right">Total do Pedido:</td>
                    <td className="px-4 py-3 font-bold text-emerald-600 text-right text-lg">
                      R$ {Number(order.total).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-3">Ações Rápidas</h3>
            <div className="flex flex-wrap gap-2">
              {order.status === 'PENDING' && (
                <button 
                  onClick={() => handleUpdateStatus('PREPARING')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                >
                  <Clock size={18} /> Iniciar Preparo
                </button>
              )}
              {order.status === 'PREPARING' && (
                <button 
                  onClick={() => handleUpdateStatus('READY')}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
                >
                  <CheckCircle size={18} /> Marcar como Pronto
                </button>
              )}
              {order.status === 'READY' && (
                <button 
                  onClick={() => handleUpdateStatus('DELIVERING')}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm shadow-purple-200"
                >
                  <Truck size={18} /> Enviar para Entrega
                </button>
              )}
              {order.status === 'DELIVERING' && (
                <button 
                  onClick={() => handleUpdateStatus('COMPLETED')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
                >
                  <CheckCircle size={18} /> Finalizar Pedido
                </button>
              )}
              {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                <button 
                  onClick={() => handleUpdateStatus('CANCELLED')}
                  className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors ml-auto"
                >
                  Cancelar Pedido
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}