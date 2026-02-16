import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import api from '../api';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [drivers, setDrivers] = useState({}); // Mapa de driverId -> { lat, lng, lastUpdate }
  const ws = useRef(null);

  useEffect(() => {
    if (loading || !user) return;

    // Buscar localizações iniciais (apenas ADMIN/MANAGER)
    if (user.role === 'ADMIN' || user.role === 'MANAGER') {
        api.get('/drivers')
            .then(res => {
                const initialDrivers = {};
                res.data.forEach(d => {
                    initialDrivers[d.id] = {
                        name: d.name,
                        lat: d.currentLat || null,
                        lng: d.currentLng || null,
                        lastUpdate: d.lastLocationUpdate
                    };
                });
                setDrivers(initialDrivers);
            })
            .catch(err => console.error("Erro ao carregar localizações iniciais", err));
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // Conectar ao WebSocket
    // Em produção, a URL deve vir de env var
    ws.current = new WebSocket(`ws://localhost:8080/ws?token=${token}`);

    ws.current.onopen = () => {
      console.log('Connected to Location Service');
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📍 WS Message received:", data); // Debug
        
        // Se for MANAGER/ADMIN, atualizar lista de drivers
        if (user.role === 'ADMIN' || user.role === 'MANAGER') {
          setDrivers(prev => {
             const newState = {
                ...prev,
                [data.driverId]: { 
                    ...prev[data.driverId],
                    lat: data.lat, 
                    lng: data.lng, 
                    lastUpdate: new Date() 
                }
             };
             console.log("Updated drivers state:", newState); // Debug
             return newState;
          });
        }
      } catch (e) {
        console.error("Erro ao processar mensagem WS:", e);
      }
    };

    ws.current.onclose = () => {
      console.log('Disconnected from Location Service');
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [user, loading]);

  // Função para enviar localização (apenas DRIVER)
  const sendLocation = (lat, lng) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ lat, lng }));
    }
  };

  return (
    <LocationContext.Provider value={{ drivers, sendLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
