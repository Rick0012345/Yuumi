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
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Cadastrar Novo Usuário</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
            <input 
              type="text" 
              value={newUser.name} 
              onChange={e => setNewUser({...newUser, name: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              value={newUser.email} 
              onChange={e => setNewUser({...newUser, email: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input 
              type="password" 
              value={newUser.password} 
              onChange={e => setNewUser({...newUser, password: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Função</label>
            <select 
              value={newUser.role} 
              onChange={e => setNewUser({...newUser, role: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg"
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
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Cadastrar
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600">Nome</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Email</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Função</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Data Cadastro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4 text-slate-500">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' :
                    user.role === 'COOK' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
