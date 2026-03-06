import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  FolderKanban,
  Upload,
  Users,
  AlertCircle,
  Settings,
  LogOut,
  ClipboardList,
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuth } from '../../lib/auth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Proyectos', href: '/proyectos', icon: FolderKanban },
  { name: 'Importaciones', href: '/importaciones', icon: Upload, coordinatorOnly: true },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Vencimientos', href: '/vencimientos', icon: AlertCircle },
  { name: 'Seguimiento Analistas', href: '/seguimiento-analistas', icon: ClipboardList },
  { name: 'Usuarios y Roles', href: '/usuarios', icon: Settings, adminOnly: true },
];

const rolLabels: Record<string, string> = {
  admin: 'Administrador',
  coordinador: 'Coordinador',
  analista: 'Analista',
};

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut, isAdmin, isCoordinatorOrAdmin } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const initials = profile?.nombre
    ? profile.nombre
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  const visibleNavigation = navigation.filter((item) => {
    if (item.adminOnly) return isAdmin;
    if (item.coordinatorOnly) return isCoordinatorOrAdmin;
    return true;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">Delta Brokers</h1>
          <p className="text-xs text-gray-500 mt-1">Gestión Hipotecaria B2B</p>
        </div>

        <Separator />

        <nav className="flex-1 p-4 space-y-1">
          {visibleNavigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <Separator />

        <div className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 px-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{profile?.nombre ?? 'Cargando...'}</p>
                  <p className="text-xs text-gray-500">
                    {profile?.rol ? rolLabels[profile.rol] ?? profile.rol : ''}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {navigation.find((item) => location.pathname.startsWith(item.href))?.name ||
                  'Dashboard'}
              </h2>
            </div>
            <div className="text-sm text-gray-500">
              Hoy: {new Date().toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
