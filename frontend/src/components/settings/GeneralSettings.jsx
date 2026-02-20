import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Store } from 'lucide-react';

// Ícone personalizado para o mapa de configurações
const createSettingsStoreIcon = () => {
  const iconMarkup = renderToStaticMarkup(
    <div className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg bg-indigo-600">
      <Store size={16} className="text-white" />
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white"></div>
    </div>
  );

  return L.divIcon({
    html: iconMarkup,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 38],
  });
};

const LocationPicker = ({ position, onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });

  return position ? (
    <Marker position={position} icon={createSettingsStoreIcon()} />
  ) : null;
};

export default function GeneralSettings({ settings, handleChange, loading }) {
  const { theme, setTheme } = useTheme();
  const { t } = useSettings();

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    handleChange({ target: { name: 'theme', value: newTheme } });
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    // Atualiza apenas a parte específica da localização
    const newLocation = { 
        ...settings.restaurantLocation, 
        [name]: name === 'lat' || name === 'lng' ? parseFloat(value) : value 
    };
    
    // Propaga a mudança como se fosse um evento normal, mas com o objeto completo
    handleChange({ 
        target: { 
            name: 'restaurantLocation', 
            value: newLocation 
        } 
    });
  };

  const handleMapClick = (latlng) => {
    // Atualiza lat e lng simultaneamente
    const newLocation = { 
        ...settings.restaurantLocation, 
        lat: latlng.lat,
        lng: latlng.lng
    };
    
    handleChange({ 
        target: { 
            name: 'restaurantLocation', 
            value: newLocation 
        } 
    });
  };

  const initialCenter = settings.restaurantLocation?.lat && settings.restaurantLocation?.lng 
    ? [settings.restaurantLocation.lat, settings.restaurantLocation.lng]
    : [-23.55052, -46.633308];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Localização do Restaurante</h3>
        <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nome do Estabelecimento
                </label>
                <input
                    type="text"
                    name="name"
                    value={settings.restaurantLocation?.name || ''}
                    onChange={handleLocationChange}
                    disabled={loading}
                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-base py-3 px-3"
                    placeholder="Ex: Minha Lanchonete"
                />
            </div>
            
            <div className="md:col-span-2 h-[300px] rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 z-0">
                <MapContainer center={initialCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationPicker 
                        position={settings.restaurantLocation?.lat && settings.restaurantLocation?.lng ? [settings.restaurantLocation.lat, settings.restaurantLocation.lng] : null}
                        onLocationSelect={handleMapClick}
                    />
                </MapContainer>
            </div>
            <div className="md:col-span-2 text-xs text-slate-500 dark:text-slate-400 -mt-4">
                * Clique no mapa para definir a localização exata
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Latitude
                </label>
                <input
                    type="number"
                    name="lat"
                    step="any"
                    value={settings.restaurantLocation?.lat || ''}
                    onChange={handleLocationChange}
                    disabled={loading}
                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-base py-3 px-3"
                    placeholder="-23.55052"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Longitude
                </label>
                <input
                    type="number"
                    name="lng"
                    step="any"
                    value={settings.restaurantLocation?.lng || ''}
                    onChange={handleLocationChange}
                    disabled={loading}
                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-base py-3 px-3"
                    placeholder="-46.633308"
                />
            </div>
        </div>
      </div>

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
              className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-base py-3 px-3"
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
              className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-base py-3 px-3"
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
              className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-base py-3 px-3"
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
