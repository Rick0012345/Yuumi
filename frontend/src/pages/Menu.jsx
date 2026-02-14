import { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Tag, DollarSign, Image, Package, Edit, Trash2 } from 'lucide-react';

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    categoryId: ''
  });
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.categoryId) {
      alert('Selecione uma categoria');
      return;
    }
    
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/products/${newProduct.id}`, newProduct);
        alert('Produto atualizado com sucesso!');
        setIsEditing(false);
      } else {
        await api.post('/products', newProduct);
        alert('Produto criado com sucesso!');
      }
      setNewProduct({ name: '', description: '', price: '', imageUrl: '', categoryId: '' });
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/categories', newCategory);
      setNewCategory({ name: '', description: '' });
      fetchData();
      alert('Categoria criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      alert('Erro ao criar categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setNewProduct({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      imageUrl: product.imageUrl || '',
      categoryId: product.categoryId
    });
    setIsEditing(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto');
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setNewProduct({ name: '', description: '', price: '', imageUrl: '', categoryId: '' });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Formulário de Produtos */}
        <div className="flex-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Package className="text-indigo-500" size={20} />
              {isEditing ? 'Editar Produto' : 'Novo Produto'}
            </h3>
            {isEditing && (
              <button 
                onClick={cancelEdit}
                className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Cancelar
              </button>
            )}
          </div>
          
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Produto</label>
                <input 
                  type="text" 
                  value={newProduct.name} 
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                  placeholder="Ex: X-Burger"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preço (R$)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="number" 
                    step="0.01"
                    value={newProduct.price} 
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})} 
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                    placeholder="0.00"
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                <select 
                  value={newProduct.categoryId} 
                  onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})} 
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                >
                  <option value="">Selecione...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL da Imagem</label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    value={newProduct.imageUrl} 
                    onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} 
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
              <textarea 
                value={newProduct.description} 
                onChange={e => setNewProduct({...newProduct, description: e.target.value})} 
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                rows="2"
                placeholder="Ingredientes e detalhes..."
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all shadow-md ${
                isEditing 
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
              }`}
            >
              {isEditing ? <><Edit size={18} /> Atualizar Produto</> : <><Plus size={18} /> Cadastrar Produto</>}
            </button>
          </form>
        </div>

        {/* Formulário de Categorias */}
        <div className="w-full md:w-1/3 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 h-fit transition-colors duration-300">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Tag className="text-emerald-500" size={20} />
            Nova Categoria
          </h3>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome</label>
              <input 
                type="text" 
                value={newCategory.name} 
                onChange={e => setNewCategory({...newCategory, name: e.target.value})} 
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
              <input 
                type="text" 
                value={newCategory.description} 
                onChange={e => setNewCategory({...newCategory, description: e.target.value})} 
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
            >
              <Plus size={18} /> Adicionar Categoria
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Categorias Existentes</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <span key={cat.id} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-sm border border-slate-200 dark:border-slate-600">
                  {cat.name}
                </span>
              ))}
              {categories.length === 0 && <span className="text-sm text-slate-400 italic">Nenhuma categoria</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Cardápio Atual</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Produto</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Categoria</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Preço</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.imageUrl && (
                        <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                      )}
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">{product.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                      {product.category?.name || 'Sem categoria'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-emerald-600 dark:text-emerald-400">
                    R$ {Number(product.price).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 italic">
                    Nenhum produto cadastrado no cardápio.
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
