import { useState, useEffect } from 'react';
import SettingsNavigation from '../components/settings/SettingsNavigation';
import GeneralSettings from '../components/settings/GeneralSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import { Save, Loader2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Use global settings instead of local state
  const { settings, updateSettings, loading, t } = useSettings();
  const [localSettings, setLocalSettings] = useState({});

  // Sync local state with global settings when loaded
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNotificationChange = (e) => {
     handleChange(e);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      const success = await updateSettings(localSettings);
      
      if (success) {
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      } else {
        setMessage({ type: 'error', text: 'Erro ao salvar configurações.' });
      }
      
      // Hide message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar configurações.' });
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    if (loading && !localSettings.userId) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      );
    }

    switch (activeTab) {
      case 'general':
        return <GeneralSettings settings={localSettings} handleChange={handleChange} loading={saving} />;
      case 'notifications':
        return <NotificationSettings settings={localSettings} handleNotificationChange={handleNotificationChange} loading={saving} />;
      case 'privacy':
        return <div className="text-slate-500 dark:text-slate-400 p-4">{t('privacy')} em breve (Fase 3)</div>;
      case 'performance':
        return <div className="text-slate-500 dark:text-slate-400 p-4">{t('performance')} em breve (Fase 4)</div>;
      case 'data':
        return <div className="text-slate-500 dark:text-slate-400 p-4">{t('data')} em breve (Fase 4)</div>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('settings')}</h1>
            <p className="text-slate-500 dark:text-slate-400">Gerencie suas preferências e configurações do sistema</p>
        </div>
        <button
            onClick={handleSave}
            disabled={loading || saving}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto min-h-[44px] font-medium"
        >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-lg ${message.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
          {message.text}
        </div>
      )}

      <SettingsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="min-h-[400px]">
        {renderContent()}
      </div>
    </div>
  );
}
