import { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', 
    phone_id: '', 
    token_meta: '', 
    status_stripe: 'inativo', 
    stripe_cust_id: '' 
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchRestaurants = () => {
    api.get('/restaurants').then(res => setRestaurants(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/restaurants/${editingId}`, formData);
      } else {
        await api.post('/restaurants', formData);
      }
      setFormData({ name: '', phone_id: '', token_meta: '', status_stripe: 'inativo', stripe_cust_id: '' });
      setEditingId(null);
      fetchRestaurants();
    } catch (error) {
      alert('Erro ao salvar restaurante');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (restaurant) => {
    setFormData({
      name: restaurant.name,
      phone_id: restaurant.phone_id,
      token_meta: restaurant.token_meta,
      status_stripe: restaurant.status_stripe,
      stripe_cust_id: restaurant.stripe_cust_id || ''
    });
    setEditingId(restaurant.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este restaurante?')) return;
    try {
      await api.delete(`/restaurants/${id}`);
      fetchRestaurants();
    } catch (error) {
      alert('Erro ao excluir restaurante');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', phone_id: '', token_meta: '', status_stripe: 'inativo', stripe_cust_id: '' });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          {editingId ? 'Editar Restaurante' : 'Cadastrar Novo Restaurante'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors text-base" 
              required 
              placeholder="Nome da Lanchonete"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone ID (Meta)</label>
            <input 
              type="text" 
              value={formData.phone_id} 
              onChange={e => setFormData({...formData, phone_id: e.target.value})} 
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors text-base" 
              required 
              placeholder="ID do Telefone"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Token Meta</label>
            <input 
              type="text" 
              value={formData.token_meta} 
              onChange={e => setFormData({...formData, token_meta: e.target.value})} 
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors text-base" 
              required 
              placeholder="Token de Acesso"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status Stripe</label>
            <select 
              value={formData.status_stripe} 
              onChange={e => setFormData({...formData, status_stripe: e.target.value})} 
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors text-base appearance-none"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="pendente">Pendente</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stripe Customer ID</label>
            <input 
              type="text" 
              value={formData.stripe_cust_id} 
              onChange={e => setFormData({...formData, stripe_cust_id: e.target.value})} 
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors text-base" 
              placeholder="cus_..."
            />
          </div>
          <div className="flex gap-2">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors flex-1 font-medium min-h-[48px]"
            >
              <Plus size={20} /> {editingId ? 'Salvar' : 'Cadastrar'}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={handleCancel}
                className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-4 py-3 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px] md:min-w-0">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-4 md:px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">ID</th>
                <th className="px-4 md:px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Nome</th>
                <th className="px-4 md:px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Phone ID</th>
                <th className="px-4 md:px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-4 md:px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {restaurants.map(restaurant => (
                <tr key={restaurant.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 md:px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">#{restaurant.id}</td>
                  <td className="px-4 md:px-6 py-4 text-slate-900 dark:text-slate-100 whitespace-nowrap font-medium">{restaurant.name}</td>
                  <td className="px-4 md:px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{restaurant.phone_id}</td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      restaurant.status_stripe === 'ativo' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {restaurant.status_stripe}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-slate-400 dark:text-slate-500 text-sm whitespace-nowrap flex gap-2">
                    <button 
                      onClick={() => handleEdit(restaurant)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(restaurant.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {restaurants.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400 dark:text-slate-500 italic">
                    Nenhum restaurante cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}