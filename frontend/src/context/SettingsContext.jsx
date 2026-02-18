import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';
import { useTheme } from './ThemeContext';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    language: 'pt-BR',
    fontSize: 'medium',
    theme: 'system',
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      orderNotifications: true
    }
  });
  const [loading, setLoading] = useState(true);
  const { setTheme } = useTheme();

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
      
      // Sincronizar tema se necessário
      if (response.data.theme) {
        setTheme(response.data.theme);
      }
      
      // Aplicar configurações iniciais
      applySettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      // Otimistic update
      setSettings(prev => ({ ...prev, ...newSettings }));
      applySettings({ ...settings, ...newSettings });

      await api.put('/settings', newSettings);
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      // Revert on error could be implemented here
      return false;
    }
  };

  const applySettings = (currentSettings) => {
    // Aplicar Tamanho da Fonte
    const root = document.documentElement;
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${currentSettings.fontSize || 'medium'}`);
    
    // Configurar variável CSS para escala de fonte se preferir
    const fontScales = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.setProperty('--base-font-size', fontScales[currentSettings.fontSize || 'medium']);
  };

  // Traduções simples para demonstração
  const t = (key) => {
    const translations = {
      'pt-BR': {
        'dashboard': 'Dashboard',
        'orders': 'Pedidos',
        'menu': 'Cardápio',
        'users': 'Usuários',
        'deliveryMap': 'Mapa Entregadores',
        'deliveryMode': 'Modo Entregador',
        'settings': 'Configurações',
        'logout': 'Sair',
        'lightMode': 'Modo Claro',
        'darkMode': 'Modo Escuro',
        'welcome': 'Bem-vindo',
        'general': 'Geral',
        'notifications': 'Notificações',
        'privacy': 'Privacidade',
        'performance': 'Desempenho',
        'data': 'Dados'
      },
      'en-US': {
        'dashboard': 'Dashboard',
        'orders': 'Orders',
        'menu': 'Menu',
        'users': 'Users',
        'deliveryMap': 'Delivery Map',
        'deliveryMode': 'Delivery Mode',
        'settings': 'Settings',
        'logout': 'Logout',
        'lightMode': 'Light Mode',
        'darkMode': 'Dark Mode',
        'welcome': 'Welcome',
        'general': 'General',
        'notifications': 'Notifications',
        'privacy': 'Privacy',
        'performance': 'Performance',
        'data': 'Data'
      },
      'es-ES': {
        'dashboard': 'Panel',
        'orders': 'Pedidos',
        'menu': 'Menú',
        'users': 'Usuarios',
        'deliveryMap': 'Mapa de Reparto',
        'deliveryMode': 'Modo Repartidor',
        'settings': 'Configuración',
        'logout': 'Salir',
        'lightMode': 'Modo Claro',
        'darkMode': 'Modo Oscuro',
        'welcome': 'Bienvenido',
        'general': 'General',
        'notifications': 'Notificaciones',
        'privacy': 'Privacidad',
        'performance': 'Rendimiento',
        'data': 'Datos'
      }
    };

    const lang = settings.language || 'pt-BR';
    return translations[lang]?.[key] || key;
  };

  useEffect(() => {
    // Carregar configurações apenas se tivermos um token (usuário logado)
    const token = localStorage.getItem('token');
    if (token) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
