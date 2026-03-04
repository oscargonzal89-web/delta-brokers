import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from './components/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Proyectos } from './pages/Proyectos';
import { ProyectoDetalle } from './pages/ProyectoDetalle';
import { Clientes } from './pages/Clientes';
import { Vencimientos } from './pages/Vencimientos';
import { Importaciones } from './pages/Importaciones';
import { Usuarios } from './pages/Usuarios';
import { SeguimientoAnalistas } from './pages/SeguimientoAnalistas';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'proyectos',
        element: <Proyectos />,
      },
      {
        path: 'proyectos/:id',
        element: <ProyectoDetalle />,
      },
      {
        path: 'clientes',
        element: <Clientes />,
      },
      {
        path: 'vencimientos',
        element: <Vencimientos />,
      },
      {
        path: 'importaciones',
        element: <Importaciones />,
      },
      {
        path: 'seguimiento-analistas',
        element: <SeguimientoAnalistas />,
      },
      {
        path: 'usuarios',
        element: <Usuarios />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
