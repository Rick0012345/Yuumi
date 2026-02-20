import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { useSettings } from '../context/SettingsContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Bike, Store, Navigation, Search, MapPin, Clock, Signal, Battery, X, List } from 'lucide-react';
import api from '../api';

// Componente para controlar o mapa (FlyTo)
const MapController = ({ selectedLocation }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedLocation) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 16, {
        animate: true,
        duration: 1.5
      });
    }
  }, [selectedLocation, map]);
  return null;
};

// Ícones Customizados
const createCustomIcon = (icon, color) => {
  const iconMarkup = renderToStaticMarkup(
    <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-white shadow-lg ${color}`}>
      {icon}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div>
    </div>
  );

  return L.divIcon({
    html: iconMarkup,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 48], // Ajustado para a ponta do balão
    popupAnchor: [0, -48]
  });
};

const storeIcon = createCustomIcon(<Store size={20} className="text-white" />, 'bg-indigo-600');
const driverFreeIcon = createCustomIcon(<Bike size={20} className="text-white" />, 'bg-emerald-500');
const driverBusyIcon = createCustomIcon(<Bike size={20} className="text-white" />, 'bg-amber-500');
const driverOfflineIcon = createCustomIcon(<Bike size={20} className="text-white" />, 'bg-slate-400');

export default function DeliveryMap() {
  const { user } = useAuth();
  const { drivers } = useLocation();
  const { settings } = useSettings();
  const [activeOrders, setActiveOrders] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  // Centro inicial configurável
  const RESTAURANT_LOCATION = settings?.restaurantLocation || { 
    lat: -23.55052, 
    lng: -46.633308, 
    name: "Yummi Lanchonete" 
  };

  useEffect(() => {
    if (user?.role !== 'ADMIN' && user?.role !== 'MANAGER') return;

    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        // Filtra pedidos em andamento
        const active = res.data.filter(o => ['DELIVERING', 'PREPARING', 'READY'].includes(o.status));
        setActiveOrders(active);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // Processar dados dos motoristas
  const processedDrivers = useMemo(() => {
    return Object.entries(drivers)
      .filter(([_, d]) => d.lat && d.lng) // Apenas com localização válida
      .map(([id, driver]) => {
        // Verifica se tem pedido ativo atribuído
        const currentOrder = activeOrders.find(o => o.driverId === id && o.status === 'DELIVERING');
        
        // Verifica tempo desde última atualização (ex: 5 min)
        const lastUpdateDate = new Date(driver.lastUpdate);
        const isOffline = (new Date() - lastUpdateDate) > 5 * 60 * 1000;

        let status = 'FREE';
        if (isOffline) status = 'OFFLINE';
        else if (currentOrder) status = 'BUSY';

        return {
          id,
          ...driver,
          status,
          currentOrder,
          lastUpdateDate
        };
      })
      .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [drivers, activeOrders, searchTerm]);

  if (user?.role !== 'ADMIN' && user?.role !== 'MANAGER') {
    return <div className="p-8 text-center text-slate-500">Acesso restrito a gerentes.</div>;
  }

  return (
    <div className="flex h-[calc(100vh-64px)] w-full relative overflow-hidden bg-slate-100 dark:bg-slate-900">
      {/* Sidebar de Lista */}
      <div 
        className={`absolute z-[1000] top-4 left-4 bottom-4 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl transform transition-transform duration-300 flex flex-col border border-slate-200 dark:border-slate-700 ${
          showSidebar ? 'translate-x-0' : '-translate-x-[110%]'
        } md:translate-x-0 md:static md:h-full md:rounded-none md:border-y-0 md:border-l-0 md:border-r md:w-96 md:shadow-none`}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0 rounded-t-xl md:rounded-none">
          <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Entregadores</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{processedDrivers.length} ativos agora</p>
            </div>
            <button 
                onClick={() => setShowSidebar(false)}
                className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
            >
                <X size={20} className="text-slate-500" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar entregador..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {processedDrivers.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
              Nenhum entregador encontrado.
            </div>
          ) : (
            processedDrivers.map(driver => (
              <div 
                key={driver.id}
                onClick={() => {
                    setSelectedDriver(driver);
                    if (window.innerWidth < 768) setShowSidebar(false);
                }}
                className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                  selectedDriver?.id === driver.id 
                    ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 ring-1 ring-indigo-500' 
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                        driver.status === 'FREE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                        driver.status === 'BUSY' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                        'bg-slate-400'
                    }`} />
                    <h3 className="font-semibold text-slate-800 dark:text-white">{driver.name}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      driver.status === 'FREE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      driver.status === 'BUSY' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {driver.status === 'FREE' ? 'LIVRE' : driver.status === 'BUSY' ? 'EM ROTA' : 'OFFLINE'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <div className="flex items-center gap-1">
                        <Signal size={12} />
                        <span>{new Date(driver.lastUpdateDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {/* Simulação de bateria - futuramente virá do app */}
                    <div className="flex items-center gap-1">
                        <Battery size={12} />
                        <span>85%</span>
                    </div>
                </div>

                {driver.currentOrder && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                            <Navigation size={12} className="text-indigo-500" />
                            Entregando Pedido #{driver.currentOrder.id}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate pl-4">
                            {driver.currentOrder.address || 'Endereço não informado'}
                        </p>
                    </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Botão flutuante para abrir sidebar em mobile */}
      {!showSidebar && (
        <button 
            onClick={() => setShowSidebar(true)}
            className="absolute top-4 left-4 z-[900] bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg text-indigo-600 dark:text-indigo-400 md:hidden"
        >
            <List size={24} />
        </button>
      )}

      {/* Mapa */}
      <div className="flex-1 relative h-full w-full z-0">
        <MapContainer center={[RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController selectedLocation={selectedDriver} />

          {/* Marcador do Restaurante */}
          <Marker position={[RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng]} icon={storeIcon}>
            <Popup>
                <div className="text-center p-1">
                    <h3 className="font-bold text-indigo-600">{RESTAURANT_LOCATION.name}</h3>
                    <p className="text-xs text-slate-500">Ponto de Partida</p>
                </div>
            </Popup>
          </Marker>

          {/* Marcadores dos Entregadores */}
          {processedDrivers.map(driver => (
            <Marker 
                key={driver.id} 
                position={[driver.lat, driver.lng]}
                icon={
                    driver.status === 'FREE' ? driverFreeIcon :
                    driver.status === 'BUSY' ? driverBusyIcon :
                    driverOfflineIcon
                }
                eventHandlers={{
                    click: () => {
                        setSelectedDriver(driver);
                        if (window.innerWidth < 768) setShowSidebar(false);
                    }
                }}
            >
              <Popup>
                <div className="min-w-[200px] p-1">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                    <div className={`w-2 h-2 rounded-full ${
                        driver.status === 'FREE' ? 'bg-emerald-500' :
                        driver.status === 'BUSY' ? 'bg-amber-500' : 'bg-slate-400'
                    }`} />
                    <h3 className="font-bold text-slate-800">{driver.name}</h3>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1"><Signal size={12}/> Sinal:</span>
                        <span className="font-medium">{new Date(driver.lastUpdateDate).toLocaleTimeString()}</span>
                    </p>
                    <p className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1"><Battery size={12}/> Bateria:</span>
                        <span className="font-medium">85%</span>
                    </p>
                    
                    {driver.currentOrder ? (
                        <div className="mt-3 bg-slate-50 p-2 rounded border border-slate-100">
                            <p className="text-xs font-bold text-indigo-600 mb-1">EM ROTA DE ENTREGA</p>
                            <p className="text-xs text-slate-700 flex items-start gap-1">
                                <MapPin size={12} className="mt-0.5 shrink-0" />
                                {driver.currentOrder.address || 'Destino não informado'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 pl-4">
                                Pedido #{driver.currentOrder.id} • {driver.currentOrder.customer_name}
                            </p>
                        </div>
                    ) : (
                        <p className="mt-2 text-xs text-emerald-600 font-medium bg-emerald-50 p-1 rounded text-center">
                            Aguardando Pedidos
                        </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}