import { Settings, Bell, Shield, Activity, Database } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function SettingsNavigation({ activeTab, setActiveTab }) {
  const { t } = useSettings();

  const tabs = [
    { id: 'general', label: t('general'), icon: Settings },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'privacy', label: t('privacy'), icon: Shield },
    { id: 'performance', label: t('performance'), icon: Activity },
    { id: 'data', label: t('data'), icon: Database },
  ];

  return (
    <nav className="flex space-x-2 border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto pb-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap
              ${activeTab === tab.id 
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }
            `}
          >
            <Icon size={18} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
