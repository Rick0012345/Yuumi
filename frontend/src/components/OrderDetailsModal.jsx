import { X, Clock, Truck, CheckCircle, Package } from 'lucide-react';
import { getStatusColor, getStatusLabel } from '../utils/status';

export default function OrderDetailsModal({ order, onClose, onUpdateStatus }) {
  if (!order) return null;

  const handleUpdateStatus = (newStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(order.id, newStatus);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10 transition-colors duration-300">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Pedido #{order.id}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {new Date(order.created_at).toLocaleString('pt-BR')}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status e Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Status do Pedido</p>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border inline-flex items-center gap-2 ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Cliente</p>
              <p className="font-semibold text-slate-800 dark:text-white">{order.customer_name || 'Cliente Anônimo'}</p>
            </div>
          </div>

          {/* Itens do Pedido */}
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              <Package size={18} className="text-slate-500 dark:text-slate-400" />
              Itens do Pedido
            </h3>
            <div className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Produto</th>
                    <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-center">Qtd</th>
                    <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-right">Preço Un.</th>
                    <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {order.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-medium">
                        {item.product?.name || `Produto #${item.productId}`}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-right">
                        R$ {Number(item.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-medium text-right">
                        R$ {(Number(item.price) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {(!order.items || order.items.length === 0) && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 italic">
                        Nenhum item registrado neste pedido.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700">
                  <tr>
                    <td colSpan="3" className="px-4 py-3 font-bold text-slate-800 dark:text-white text-right">Total do Pedido:</td>
                    <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400 text-right text-lg">
                      R$ {Number(order.total).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Ações Rápidas</h3>
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