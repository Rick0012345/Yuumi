import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Users, Settings, LogOut, Menu, Moon, Sun, Map, Bike } from 'lucide-react';
import { useState } from 'react';

const SidebarItem = ({ icon, label, to, active, isOpen }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-indigo-600 text-white shadow-md' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    } ${!isOpen ? 'justify-center' : ''}`}
    title={!isOpen ? label : ''}
  >
    {icon}
    {isOpen && <span className="font-medium animate-in fade-in duration-200">{label}</span>}
  </Link>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { t } = useSettings();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return t('dashboard');
      case '/pedidos': return t('orders');
      case '/cardapio': return t('menu');
      case '/usuarios': return t('users');
      case '/mapa-entregadores': return t('deliveryMap');
      case '/entregador': return t('deliveryMode');
      case '/config': return t('settings');
      default: return 'Yummi';
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 dark:bg-slate-950 text-white transition-all duration-300 flex flex-col`}
      >
        <div className={`p-4 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {isSidebarOpen && <h1 className="text-xl font-bold text-indigo-400 animate-in fade-in duration-200">Yummi</h1>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
          <SidebarItem icon={<LayoutDashboard size={20} />} label={t('dashboard')} to="/" active={location.pathname === '/'} isOpen={isSidebarOpen} />
          <SidebarItem icon={<ShoppingBag size={20} />} label={t('orders')} to="/pedidos" active={location.pathname === '/pedidos'} isOpen={isSidebarOpen} />
          <SidebarItem icon={<UtensilsCrossed size={20} />} label={t('menu')} to="/cardapio" active={location.pathname === '/cardapio'} isOpen={isSidebarOpen} />
          
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <>
              <SidebarItem icon={<Users size={20} />} label={t('users')} to="/usuarios" active={location.pathname === '/usuarios'} isOpen={isSidebarOpen} />
              <SidebarItem icon={<Map size={20} />} label={t('deliveryMap')} to="/mapa-entregadores" active={location.pathname === '/mapa-entregadores'} isOpen={isSidebarOpen} />
            </>
          )}

          {(user?.role === 'ADMIN' || user?.role === 'DRIVER') && (
            <SidebarItem icon={<Bike size={20} />} label={t('deliveryMode')} to="/entregador" active={location.pathname === '/entregador'} isOpen={isSidebarOpen} />
          )}
          
          <SidebarItem icon={<Settings size={20} />} label={t('settings')} to="/config" active={location.pathname === '/config'} isOpen={isSidebarOpen} />
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className={`flex items-center gap-3 w-full px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors ${!isSidebarOpen ? 'justify-center' : ''}`}
            title={isDarkMode ? t('lightMode') : t('darkMode')}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            {isSidebarOpen && <span className="font-medium animate-in fade-in duration-200">{isDarkMode ? t('lightMode') : t('darkMode')}</span>}
          </button>

          <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center' : ''}`}>
             <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                {user?.name?.[0] || 'U'}
             </div>
             {isSidebarOpen && (
                 <div className="overflow-hidden animate-in fade-in duration-200">
                     <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                     <p className="text-xs text-slate-400 truncate">{user?.role}</p>
                 </div>
             )}
          </div>
          <button 
            onClick={logout}
            className={`flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ${!isSidebarOpen ? 'justify-center' : ''}`}
            title={t('logout')}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium animate-in fade-in duration-200">{t('logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
        <header className="bg-white dark:bg-slate-800 h-16 shadow-sm flex items-center justify-between px-6 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                {getPageTitle()}
            </h2>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
