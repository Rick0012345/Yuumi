import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Users from './pages/Users';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<Layout />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pedidos" element={<Orders />} />
          <Route path="/cardapio" element={<div className="text-slate-500">Página de Cardápio em construção</div>} />
          <Route path="/config" element={<div className="text-slate-500">Configurações em construção</div>} />
        </Route>

        <Route element={<ProtectedRoute roles={['ADMIN', 'MANAGER']} />}>
          <Route path="/usuarios" element={<Users />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
