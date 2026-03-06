import { Navigate } from 'react-router';
import { useAuth } from '../../lib/auth';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'administrador' | 'coordinador';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'administrador' && profile?.rol !== 'administrador') {
    return <Navigate to="/dashboard" replace />;
  }

  if (
    requiredRole === 'coordinador' &&
    profile?.rol !== 'administrador' &&
    profile?.rol !== 'coordinador'
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
