import { useState } from 'react';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { UserPlus, Edit } from 'lucide-react';
import { usuarios, Rol } from '../data/mock-data';
import { toast } from 'sonner';

export function Usuarios() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState<Rol>('Analista');
  const [activo, setActivo] = useState(true);

  const handleCreate = () => {
    if (!nombre || !email || !rol) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    toast.success(`Usuario "${nombre}" creado exitosamente`);
    setCreateOpen(false);
    setNombre('');
    setEmail('');
    setRol('Analista');
    setActivo(true);
  };

  const handleEdit = () => {
    toast.success('Usuario actualizado exitosamente');
    setEditOpen(false);
  };

  const handleEditClick = (id: string) => {
    const usuario = usuarios.find((u) => u.id === id);
    if (usuario) {
      setUsuarioSeleccionado(id);
      setNombre(usuario.nombre);
      setEmail(usuario.email);
      setRol(usuario.rol);
      setActivo(usuario.activo);
      setEditOpen(true);
    }
  };

  const getRolColor = (rol: Rol) => {
    switch (rol) {
      case 'Administrador':
        return 'bg-red-100 text-red-800';
      case 'Coordinador':
        return 'bg-blue-100 text-blue-800';
      case 'Analista':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Usuarios y Roles</h2>
          <p className="text-sm text-gray-500">Gestión de accesos y permisos</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Juan Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan.perez@deltabrokers.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select value={rol} onValueChange={(value) => setRol(value as Rol)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Analista">Analista</SelectItem>
                    <SelectItem value="Coordinador">Coordinador</SelectItem>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="activo">Usuario Activo</Label>
                <Switch id="activo" checked={activo} onCheckedChange={setActivo} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>Crear Usuario</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell className="font-medium">{usuario.nombre}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getRolColor(usuario.rol)}>
                    {usuario.rol}
                  </Badge>
                </TableCell>
                <TableCell>
                  {usuario.activo ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      Inactivo
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(usuario.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre Completo</Label>
              <Input
                id="edit-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={rol} onValueChange={(value) => setRol(value as Rol)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Analista">Analista</SelectItem>
                  <SelectItem value="Coordinador">Coordinador</SelectItem>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-activo">Usuario Activo</Label>
              <Switch id="edit-activo" checked={activo} onCheckedChange={setActivo} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit}>Guardar Cambios</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Analista</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Ver y actualizar clientes</li>
            <li>• Subir documentos</li>
            <li>• Ver reportes básicos</li>
          </ul>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Coordinador</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Todo lo de Analista</li>
            <li>• Reasignar clientes</li>
            <li>• Importar datos</li>
            <li>• Ver todos los reportes</li>
          </ul>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 mb-2">Administrador</h4>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• Todo lo de Coordinador</li>
            <li>• Gestionar usuarios</li>
            <li>• Gestionar proyectos</li>
            <li>• Configuración del sistema</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
