import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import api from '../api';
import { CheckCircle, MapPin, Navigation } from 'lucide-react';

const DeliveryMode = () => {
  const { user } = useAuth();
  const { sendLocation } = useLocation();
  const [isTracking, setIsTracking] = useState(false);
  const [position, setPosition] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [orders, setOrders] = useState([]);

  console.log("User role:", user?.role); // Debug
  console.log("Token:", localStorage.getItem('token')); // Debug

  useEffect(() => {
    if (user?.role === 'DRIVER') {
      fetchMyDeliveries();
      const interval = setInterval(fetchMyDeliveries, 10000);
      return () => clearInterval(interval);
    }
  }, [user?.role]);

  async function fetchMyDeliveries() {
      try {
          const res = await api.get('/orders/my-deliveries');
          setOrders(res.data);
      } catch (e) {
          console.error("Erro ao buscar minhas entregas", e);
      }
  }

  async function completeDelivery(id) {
      try {
          await api.patch(`/orders/${id}/status`, { status: 'COMPLETED' });
          fetchMyDeliveries();
          alert('Entrega finalizada com sucesso!');
      } catch (e) {
          console.error("Erro ao finalizar entrega", e);
      }
  }

  useEffect(() => {
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [watchId]);

  const toggleTracking = () => {
    if (isTracking) {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
      setWatchId(null);
    } else {
      if (!navigator.geolocation) {
        alert("Geolocalização não suportada neste navegador.");
        return;
      }

      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition({ lat: latitude, lng: longitude });
          // Verificar se user existe e é DRIVER
          if (user?.role === 'DRIVER') {
             try {
                // Verificar se sendLocation é uma função antes de chamar
                if (typeof sendLocation === 'function') {
                    sendLocation(latitude, longitude);
                } else {
                    console.warn("sendLocation não está disponível ou não é uma função");
                }
             } catch (e) {
                console.error("Erro ao enviar localização:", e);
             }
          }
        },
        (err) => console.error("Erro de geolocalização:", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      setWatchId(id);
      setIsTracking(true);
    }
  };
  
  // Efeito para enviar localização quando position mudar
  useEffect(() => {
    if (position && isTracking) {
        sendLocation(position.lat, position.lng);
    }
  }, [position, isTracking, sendLocation]);


  if (user?.role !== 'DRIVER') {
    return <div className="p-4">Acesso restrito a entregadores.</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Modo Entregador</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-medium">Status do Rastreamento:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${isTracking ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isTracking ? 'ATIVO' : 'INATIVO'}
          </span>
        </div>
        
        {position && (
          <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded">
            <p>Lat: {position.lat.toFixed(6)}</p>
            <p>Lng: {position.lng.toFixed(6)}</p>
          </div>
        )}

        <button
          onClick={toggleTracking}
          className={`w-full py-3 rounded-lg font-bold text-white transition-colors shadow-sm ${
            isTracking ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isTracking ? 'Parar Rastreamento' : 'Iniciar Entrega'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Pedidos em Entrega ({orders.length})</h2>
        
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>Nenhum pedido atribuído no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
                <div key={order.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-lg">#{order.id}</span>
                        <span className="text-sm text-gray-500">{new Date(order.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div className="mb-3">
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-gray-600 text-sm flex items-center gap-1">
                            <MapPin size={14} /> {order.address || 'Endereço não informado'}
                        </p>
                    </div>
                    <div className="mb-4">
                        <ul className="text-sm text-gray-600">
                            {order.items?.map((item, idx) => (
                                <li key={idx}>- {item.quantity}x {item.product?.name}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex gap-2">
                        {order.address && (
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold"
                            >
                                <Navigation size={16} /> Navegar
                            </a>
                        )}
                        <button 
                            onClick={() => completeDelivery(order.id)}
                            className="flex-1 bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold"
                        >
                            <CheckCircle size={16} /> Finalizar
                        </button>
                    </div>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryMode;
