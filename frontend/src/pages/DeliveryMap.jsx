import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correção para ícones do Leaflet que as vezes quebram no build
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const DeliveryMap = () => {
  const { user } = useAuth();
  const { drivers } = useLocation();

  if (user?.role !== 'ADMIN' && user?.role !== 'MANAGER') {
    return <div className="p-4">Acesso restrito a gerentes.</div>;
  }

  // Centro inicial (ex: São Paulo) - idealmente viria da config do restaurante
  const center = [-23.55052, -46.633308]; 

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col">
      <div className="p-4 bg-white shadow-sm border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Mapa de Entregadores em Tempo Real</h1>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
          {Object.values(drivers).filter(d => d.lat && d.lng).length} Ativos
        </span>
      </div>
      <div className="flex-1 relative z-0">
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {Object.entries(drivers)
            .filter(([_, location]) => location.lat && location.lng)
            .map(([driverId, location]) => (
            <Marker key={driverId} position={[location.lat, location.lng]}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold">{location.name || `Entregador #${driverId}`}</p>
                  <p className="text-xs text-gray-500">
                    Atualizado: {location.lastUpdate ? new Date(location.lastUpdate).toLocaleTimeString() : 'N/A'}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default DeliveryMap;
