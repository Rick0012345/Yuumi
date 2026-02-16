import { useEffect, useState } from 'react';
import api from '../api';
import { Search, Filter, RefreshCw, Eye, Truck, CheckCircle, Clock, UserPlus } from 'lucide-react';
import OrderDetailsModal from '../components/OrderDetailsModal';
import { getStatusColor, getStatusLabel } from '../utils/status';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [assigningOrder, setAssigningOrder] = useState(null); // ID do pedido sendo atribuído

  useEffect(() => {
    fetchOrders();
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
        fetchDrivers();
    }

    const intervalId = setInterval(() => {
      fetchOrders(false); // Silent update
    }, 5000);

    return () => clearInterval(intervalId);
  }, [user]);

  async function fetchDrivers() {
      try {
          const res = await api.get('/drivers');
          setDrivers(res.data);
      } catch (e) {
          console.error("Erro ao buscar entregadores", e);
      }
  }

  async function fetchOrders(showLoading = true) {
    if (showLoading) setLoading(true);
    try {
      const response = await api.get('/orders');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      fetchOrders(false); // Refresh list immediately
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Não foi possível atualizar o status.');
    }
  }

  async function assignDriver(orderId, driverId) {
      if (!driverId) return;
      try {
          await api.patch(`/orders/${orderId}/assign`, { driverId });
          setAssigningOrder(null);
          fetchOrders(false);
      } catch (error) {
          console.error('Erro ao atribuir entregador:', error);
          alert('Erro ao atribuir entregador');
      }
  }

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'ALL' || order.status === filter;
    const matchesSearch = 
      order.id.toString().includes(searchTerm) || 
      (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gerenciamento de Pedidos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Acompanhe e atualize os pedidos em tempo real</p>
        </div>
        <button 
          onClick={() => fetchOrders(true)} 
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw size={18} />
          <span>Atualizar</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between transition-colors duration-300">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['ALL', 'PENDING', 'PREPARING', 'READY', 'DELIVERING', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === status 
                  ? 'bg-slate-800 dark:bg-indigo-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {status === 'ALL' ? 'Todos' : getStatusLabel(status)}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por ID ou Cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent placeholder-slate-400"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
        {loading && orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">Carregando pedidos...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">Nenhum pedido encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">ID</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Cliente</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Itens</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Total</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Entregador</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Data</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">#{order.id}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{order.customer_name || 'Anônimo'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {order.items?.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {order.items.map((item, idx) => (
                            <span key={idx} className="text-sm">
                              {item.quantity}x {item.product?.name || 'Produto'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Sem itens</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-emerald-600 dark:text-emerald-400">
                      R$ {Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm" onClick={(e) => e.stopPropagation()}>
                        {assigningOrder === order.id ? (
                             <select 
                                autoFocus
                                className="p-1 text-sm border rounded dark:bg-slate-700 dark:text-white"
                                onChange={(e) => assignDriver(order.id, e.target.value)}
                                onBlur={() => setAssigningOrder(null)}
                                defaultValue=""
                             >
                                 <option value="" disabled>Selecione...</option>
                                 {drivers.map(d => (
                                     <option key={d.id} value={d.id}>{d.name}</option>
                                 ))}
                             </select>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-slate-600 dark:text-slate-300">
                                    {order.driver_name || '-'}
                                </span>
                                {(order.status === 'READY' || order.status === 'PREPARING') && (
                                    <button 
                                        onClick={() => setAssigningOrder(order.id)}
                                        className="text-indigo-500 hover:text-indigo-700 p-1"
                                        title="Atribuir Entregador"
                                    >
                                        <UserPlus size={16} />
                                    </button>
                                )}
                            </div>
                        )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(order.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'PENDING' && (
                          <button 
                            onClick={() => updateStatus(order.id, 'PREPARING')}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg tooltip"
                            title="Iniciar Preparo"
                          >
                            <Clock size={18} />
                          </button>
                        )}
                        {order.status === 'PREPARING' && (
                          <button 
                            onClick={() => updateStatus(order.id, 'READY')}
                            className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
                            title="Marcar como Pronto"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {order.status === 'READY' && (
                          <button 
                            onClick={() => updateStatus(order.id, 'DELIVERING')}
                            className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg"
                            title="Enviar para Entrega"
                          >
                            <Truck size={18} />
                          </button>
                        )}
                        {order.status === 'DELIVERING' && (
                          <button 
                            onClick={() => updateStatus(order.id, 'COMPLETED')}
                            className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg"
                            title="Finalizar Pedido"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onUpdateStatus={updateStatus}
        />
      )}
    </div>
  );
}