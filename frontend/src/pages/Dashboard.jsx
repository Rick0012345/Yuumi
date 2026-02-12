import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { DollarSign, ShoppingBag, Truck, Users } from 'lucide-react';
import OrderDetailsModal from '../components/OrderDetailsModal';

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
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

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Visão Geral - Últimos Pedidos (Atualização Automática)</h3>
        {orders.length === 0 ? (
          <p className="text-slate-500">Nenhum pedido registrado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 font-medium text-slate-500">ID</th>
                  <th className="pb-3 font-medium text-slate-500">Cliente</th>
                  <th className="pb-3 font-medium text-slate-500">Total</th>
                  <th className="pb-3 font-medium text-slate-500">Status</th>
                  <th className="pb-3 font-medium text-slate-500">Data</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-3 text-slate-800">#{order.id}</td>
                    <td className="py-3 text-slate-800">{order.customer_name || 'Cliente Anônimo'}</td>
                    <td className="py-3 text-emerald-600 font-medium">R$ {Number(order.total).toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                        order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 text-sm">
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
