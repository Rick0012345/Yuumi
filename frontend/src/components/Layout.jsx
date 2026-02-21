import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Users, Settings, LogOut, Menu, Moon, Sun, Map, Bike, Store } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fecha o menu mobile ao navegar
  const handleNavigation = () => {
    setIsMobileMenuOpen(false);
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return t('dashboard');
      case '/pedidos': return t('orders');
      case '/cardapio': return t('menu');
      case '/usuarios': return t('users');
      case '/mapa-entregadores': return t('deliveryMap');
      case '/entregador': return t('deliveryMode');
      case '/restaurantes': return 'Restaurantes';
      case '/config': return t('settings');
      default: return 'Yummi';
    }
  };

  const SidebarContent = ({ isCollapsed }) => (
    <>
      <div className={`p-4 flex items-center ${!isCollapsed ? 'justify-between' : 'justify-center'} h-16`}>
        {!isCollapsed && <h1 className="text-xl font-bold text-indigo-400 animate-in fade-in duration-200">Yummi</h1>}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="hidden md:block p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
        >
          <Menu size={20} />
        </button>
        <button 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="md:hidden p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
        <div onClick={handleNavigation}>
          <SidebarItem icon={<LayoutDashboard size={20} />} label={user?.role === 'ADMIN' ? 'SaaS Dashboard' : t('dashboard')} to="/" active={location.pathname === '/'} isOpen={!isCollapsed} />
        </div>

        {/* Itens visíveis apenas para NÃO-ADMIN (Gerentes e Funcionários) */}
        {user?.role !== 'ADMIN' && (
          <>
            <div onClick={handleNavigation}>
              <SidebarItem icon={<ShoppingBag size={20} />} label={t('orders')} to="/pedidos" active={location.pathname === '/pedidos'} isOpen={!isCollapsed} />
            </div>
            <div onClick={handleNavigation}>
              <SidebarItem icon={<UtensilsCrossed size={20} />} label={t('menu')} to="/cardapio" active={location.pathname === '/cardapio'} isOpen={!isCollapsed} />
            </div>
          </>
        )}
        
        {/* Gestão de Usuários: ADMIN (cria gerentes) e MANAGER (cria equipe) */}
        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
          <>
            <div onClick={handleNavigation}>
              <SidebarItem icon={<Users size={20} />} label={t('users')} to="/usuarios" active={location.pathname === '/usuarios'} isOpen={!isCollapsed} />
            </div>
            {/* Restaurantes: Apenas ADMIN */}
            {user?.role === 'ADMIN' && (
              <div onClick={handleNavigation}>
                <SidebarItem icon={<Store size={20} />} label="Restaurantes" to="/restaurantes" active={location.pathname === '/restaurantes'} isOpen={!isCollapsed} />
              </div>
            )}
            {/* Mapa: Apenas MANAGER */}
            {user?.role === 'MANAGER' && (
              <div onClick={handleNavigation}>
                <SidebarItem icon={<Map size={20} />} label={t('deliveryMap')} to="/mapa-entregadores" active={location.pathname === '/mapa-entregadores'} isOpen={!isCollapsed} />
              </div>
            )}
          </>
        )}

        {(user?.role === 'ADMIN' || user?.role === 'DRIVER') && (
          <div onClick={handleNavigation}>
            <SidebarItem icon={<Bike size={20} />} label={t('deliveryMode')} to="/entregador" active={location.pathname === '/entregador'} isOpen={!isCollapsed} />
          </div>
        )}
        
        <div onClick={handleNavigation}>
          <SidebarItem icon={<Settings size={20} />} label={t('settings')} to="/config" active={location.pathname === '/config'} isOpen={!isCollapsed} />
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className={`flex items-center gap-3 w-full px-4 py-3 min-h-[44px] text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          title={isDarkMode ? t('lightMode') : t('darkMode')}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          {!isCollapsed && <span className="font-medium animate-in fade-in duration-200">{isDarkMode ? t('lightMode') : t('darkMode')}</span>}
        </button>

        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
           <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
              {user?.name?.[0] || 'U'}
           </div>
           {!isCollapsed && (
               <div className="overflow-hidden animate-in fade-in duration-200">
                   <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                   <p className="text-xs text-slate-400 truncate">{user?.role}</p>
               </div>
           )}
        </div>
        <button 
          onClick={logout}
          className={`flex items-center gap-3 w-full px-4 py-3 min-h-[44px] text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          title={t('logout')}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-medium animate-in fade-in duration-200">{t('logout')}</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar for Desktop */}
      <aside 
        className={`hidden md:flex flex-col bg-slate-900 dark:bg-slate-950 text-white transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <SidebarContent isCollapsed={!isSidebarOpen} />
      </aside>

      {/* Sidebar for Mobile (Drawer) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 dark:bg-slate-950 text-white transform transition-transform duration-300 md:hidden flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent isCollapsed={false} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full w-full overflow-hidden bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
        <header className="bg-white dark:bg-slate-800 h-16 min-h-[64px] shadow-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Abrir menu"
              >
                <Menu size={24} />
              </button>
              <h2 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-white truncate">
                  {getPageTitle()}
              </h2>
            </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6 scroll-smooth">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
