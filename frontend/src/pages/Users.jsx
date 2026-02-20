import { useEffect, useState } from 'react';
import api from '../api';
import { Plus } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'COOK' });
  const [loading, setLoading] = useState(false);

  const fetchUsers = () => {
    api.get('/users').then(res => setUsers(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users', newUser);
      setNewUser({ name: '', email: '', password: '', role: 'COOK' });
      fetchUsers();
    } catch {
      alert('Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Cadastrar Novo Usuário</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome</label>
            <input 
              type="text" 
              value={newUser.name} 
              onChange={e => setNewUser({...newUser, name: e.target.value})} 
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors text-base" 
              required 
              placeholder="Nome completo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input 
              type="email" 
              value={newUser.email} 
              onChange={e => setNewUser({...newUser, email: e.target.value})} 
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors text-base" 
              required 
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Senha</label>
            <input 
              type="password" 
              value={newUser.password} 
              onChange={e => setNewUser({...newUser, password: e.target.value})} 
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors text-base" 
              required 
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Função</label>
            <select 
              value={newUser.role} 
              onChange={e => setNewUser({...newUser, role: e.target.value})} 
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors text-base appearance-none"
            >
              <option value="COOK">Cozinheiro</option>
              <option value="DRIVER">Motoboy</option>
              <option value="MANAGER">Gerente</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors w-full font-medium min-h-[48px]"
          >
            <Plus size={20} /> Cadastrar
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px] md:min-w-0">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-4 md:px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Nome</th>
                <th className="px-4 md:px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Email</th>
                <th className="px-4 md:px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Função</th>
                <th className="px-4 md:px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Data Cadastro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 md:px-6 py-4 text-slate-900 dark:text-slate-100 whitespace-nowrap">{user.name}</td>
                  <td className="px-4 md:px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{user.email}</td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                      user.role === 'MANAGER' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                      user.role === 'COOK' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-slate-400 dark:text-slate-500 text-sm whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-400 dark:text-slate-500 italic">
                    Nenhum usuário cadastrado.
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
