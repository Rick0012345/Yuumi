import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Users, Settings, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

const SidebarItem = ({ icon, label, to, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-indigo-600 text-white shadow-md' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && <h1 className="text-xl font-bold text-indigo-400">Yummi</h1>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded">
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" to="/" active={location.pathname === '/'} />
          <SidebarItem icon={<ShoppingBag size={20} />} label="Pedidos" to="/pedidos" active={location.pathname === '/pedidos'} />
          <SidebarItem icon={<UtensilsCrossed size={20} />} label="Cardápio" to="/cardapio" active={location.pathname === '/cardapio'} />
          
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
             <SidebarItem icon={<Users size={20} />} label="Usuários" to="/usuarios" active={location.pathname === '/usuarios'} />
          )}
          
          <SidebarItem icon={<Settings size={20} />} label="Configurações" to="/config" active={location.pathname === '/config'} />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                {user?.name?.[0] || 'U'}
             </div>
             {isSidebarOpen && (
                 <div className="overflow-hidden">
                     <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                     <p className="text-xs text-slate-400 truncate">{user?.role}</p>
                 </div>
             )}
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white h-16 shadow-sm flex items-center justify-between px-6 sticky top-0 z-10">
            <h2 className="text-xl font-semibold text-slate-800">
                {location.pathname === '/' ? 'Dashboard' : location.pathname.replace('/', '').charAt(0).toUpperCase() + location.pathname.slice(2)}
            </h2>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
