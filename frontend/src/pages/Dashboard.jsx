import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { DollarSign, ShoppingBag, Truck, Users } from 'lucide-react';
import OrderDetailsModal from '../components/OrderDetailsModal';
import { getStatusColor, getStatusLabel } from '../utils/status';

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between transition-colors duration-300">
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      {icon}
    </div>
  </div>
);

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const stats = useMemo(() => {
    const total = orders.length;
    const revenue = orders.reduce((acc, order) => acc + (Number(order.total) || 0), 0);
    const pending = orders.filter(o => o.status === 'PENDING').length;
    return {
      totalOrders: total,
      totalRevenue: revenue,
      pendingOrders: pending,
      activeDrivers: 3
    };
  }, [orders]);

  async function fetchOrders() {
    try {
      const response = await api.get('/orders');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    }
  }

  useEffect(() => {
    const initialFetch = setTimeout(() => {
      fetchOrders();
    }, 0);

    const intervalId = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(initialFetch);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Faturamento Total" 
          value={`R$ ${stats.totalRevenue.toFixed(2)}`} 
          icon={<DollarSign className="text-white" size={24} />} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Total de Pedidos" 
          value={stats.totalOrders} 
          icon={<ShoppingBag className="text-white" size={24} />} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Pedidos Pendentes" 
          value={stats.pendingOrders} 
          icon={<Truck className="text-white" size={24} />} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Entregadores Ativos" 
          value={stats.activeDrivers} 
          icon={<Users className="text-white" size={24} />} 
          color="bg-cyan-500" 
        />
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Visão Geral - Últimos Pedidos (Atualização Automática)</h3>
        {orders.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">Nenhum pedido registrado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">ID</th>
                  <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Cliente</th>
                  <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Total</th>
                  <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Status</th>
                  <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Data</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-4 px-2 text-slate-800 dark:text-slate-200">#{order.id}</td>
                    <td className="py-4 px-2 text-slate-800 dark:text-slate-200">{order.customer_name || 'Cliente Anônimo'}</td>
                    <td className="py-4 px-2 text-emerald-600 font-medium">R$ {Number(order.total).toFixed(2)}</td>
                    <td className="py-4 px-2">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)} whitespace-nowrap`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">
                      {new Date(order.created_at).toLocaleString('pt-BR')}
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
          onUpdateStatus={(id, status) => {
             setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
             api.patch(`/orders/${id}/status`, { status });
          }}
        />
      )}
    </div>
  );
}
