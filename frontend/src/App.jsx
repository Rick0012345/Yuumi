import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import Users from './pages/Users';
import DeliveryMode from './pages/DeliveryMode';
import DeliveryMap from './pages/DeliveryMap';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<Layout />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pedidos" element={<Orders />} />
          <Route path="/cardapio" element={<Menu />} />
          <Route path="/config" element={<div className="text-slate-500">Configurações em construção</div>} />
        </Route>

        <Route element={<ProtectedRoute roles={['ADMIN', 'MANAGER']} />}>
          <Route path="/usuarios" element={<Users />} />
          <Route path="/mapa-entregadores" element={<DeliveryMap />} />
        </Route>

        <Route element={<ProtectedRoute roles={['DRIVER', 'ADMIN']} />}>
          <Route path="/entregador" element={<DeliveryMode />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
