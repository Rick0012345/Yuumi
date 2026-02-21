import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { DollarSign, ShoppingBag, Truck, Users, Store, TrendingUp } from 'lucide-react';
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
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [saasStats, setSaasStats] = useState({
    totalRestaurants: 0,
    activeManagers: 0,
    monthlyRevenue: 0,
    growth: 0
  });

  // Stats for Restaurant Manager/Staff
  const restaurantStats = useMemo(() => {
    const total = orders.length;
    const revenue = orders.reduce((acc, order) => acc + (Number(order.total) || 0), 0);
    const pending = orders.filter(o => o.status === 'PENDING').length;
    return {
      totalOrders: total,
      totalRevenue: revenue,
      pendingOrders: pending,
      activeDrivers: 3 // Mocked for now
    };
  }, [orders]);

  async function fetchDashboardData() {
    try {
      if (user?.role === 'ADMIN') {
        // Fetch SaaS Stats
        const response = await api.get('/dashboard/saas-stats');
        setSaasStats(response.data || {});
      } else {
        // Fetch Restaurant Orders
        const response = await api.get('/orders');
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    }
  }

  useEffect(() => {
    const initialFetch = setTimeout(() => {
      fetchDashboardData();
    }, 0);

    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 10000); // 10s refresh

    return () => {
      clearInterval(intervalId);
      clearTimeout(initialFetch);
    };
  }, [user]);

  if (user?.role === 'ADMIN') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">SaaS Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Receita Mensal (SaaS)" 
            value={`R$ ${Number(saasStats.monthlyRevenue).toFixed(2)}`} 
            icon={<DollarSign className="text-white" size={24} />} 
            color="bg-emerald-600" 
          />
          <StatCard 
            title="Lanchonetes Ativas" 
            value={saasStats.totalRestaurants} 
            icon={<Store className="text-white" size={24} />} 
            color="bg-blue-600" 
          />
          <StatCard 
            title="Gerentes Cadastrados" 
            value={saasStats.activeManagers} 
            icon={<Users className="text-white" size={24} />} 
            color="bg-indigo-600" 
          />
          <StatCard 
            title="Crescimento Mensal" 
            value={`${saasStats.growth}%`} 
            icon={<TrendingUp className="text-white" size={24} />} 
            color="bg-purple-600" 
          />
        </div>
        
        {/* Aqui poderia entrar um gráfico de crescimento ou lista de últimas lanchonetes cadastradas */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
           <p className="text-slate-500 dark:text-slate-400">Bem-vindo ao painel administrativo do SaaS. Gerencie as lanchonetes e usuários através do menu lateral.</p>
        </div>
      </div>
    );
  }

  // Restaurant Dashboard (Original)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Faturamento Total" 
          value={`R$ ${restaurantStats.totalRevenue.toFixed(2)}`} 
          icon={<DollarSign className="text-white" size={24} />} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Total de Pedidos" 
          value={restaurantStats.totalOrders} 
          icon={<ShoppingBag className="text-white" size={24} />} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Pedidos Pendentes" 
          value={restaurantStats.pendingOrders} 
          icon={<Truck className="text-white" size={24} />} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Entregadores Ativos" 
          value={restaurantStats.activeDrivers} 
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
