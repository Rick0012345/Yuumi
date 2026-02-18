import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';

export default function GeneralSettings({ settings, handleChange, loading }) {
  const { theme, setTheme } = useTheme();
  const { t } = useSettings();

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    handleChange({ target: { name: 'theme', value: newTheme } });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Personalização de Interface</h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tema
            </label>
            <select
              name="theme"
              value={theme}
              onChange={handleThemeChange}
              disabled={loading}
              className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5"
            >
              <option value="light">{t('lightMode')}</option>
              <option value="dark">{t('darkMode')}</option>
              <option value="system">Sistema</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Idioma
            </label>
            <select
              name="language"
              value={settings.language || 'pt-BR'}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tamanho da Fonte
            </label>
            <select
              name="fontSize"
              value={settings.fontSize || 'medium'}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5"
            >
              <option value="small">Pequeno</option>
              <option value="medium">Médio</option>
              <option value="large">Grande</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
