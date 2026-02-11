import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  
  if (!user) return <Navigate to="/login" />;

  if (roles && !roles.includes(user.role)) {
    return <div className="p-8 text-center text-red-500">Acesso negado: Você não tem permissão para acessar esta página.</div>;
  }

  return <Outlet />;
}
