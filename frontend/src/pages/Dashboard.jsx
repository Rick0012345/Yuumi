import { useEffect, useState } from 'react';
import api from '../api';
import { DollarSign, ShoppingBag, Truck, Users } from 'lucide-react';

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
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeDrivers: 0
  });

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
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
        <h3 className="text-lg font-bold text-slate-800 mb-4">Visão Geral</h3>
        <p className="text-slate-500">Bem-vindo ao painel administrativo da Yummi Lanchonete.</p>
      </div>
    </div>
  );
}
