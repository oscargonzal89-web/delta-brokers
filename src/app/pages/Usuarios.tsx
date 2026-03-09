import { useState, useEffect } from 'react';
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
import { Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getUsers, updateUserRole, toggleUserActive, updateUserProfile } from '../../lib/api/users';
import type { UserProfile, RolUsuario } from '../../lib/types';

const ROL_LABELS: Record<string, string> = {
  administrador: 'Administrador',
  coordinador: 'Coordinador',
  analista: 'Analista',
};

const ROL_COLORS: Record<string, string> = {
  administrador: 'bg-red-100 text-red-800',
  coordinador: 'bg-blue-100 text-blue-800',
  analista: 'bg-green-100 text-green-800',
};

export function Usuarios() {
  const [editOpen, setEditOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UserProfile | null>(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState<RolUsuario>('analista');
  const [activo, setActivo] = useState(true);
  const [saving, setSaving] = useState(false);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user: UserProfile) => {
    setUsuarioSeleccionado(user);
    setNombre(user.nombre);
    setEmail(user.email ?? '');
    setRol(user.rol as RolUsuario);
    setActivo(user.activo);
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!usuarioSeleccionado) return;
    setSaving(true);
    try {
      const userId = usuarioSeleccionado.id;

      if (nombre !== usuarioSeleccionado.nombre || email !== (usuarioSeleccionado.email ?? '')) {
        await updateUserProfile(userId, { nombre, email: email || undefined });
      }
      if (rol !== usuarioSeleccionado.rol) {
        await updateUserRole(userId, rol);
      }
      if (activo !== usuarioSeleccionado.activo) {
        await toggleUserActive(userId, activo);
      }

      toast.success('Usuario actualizado exitosamente');
      setEditOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: UserProfile) => {
    try {
      await toggleUserActive(user.id, !user.activo);
      toast.success(user.activo ? 'Usuario desactivado' : 'Usuario activado');
      fetchUsers();
    } catch {
      toast.error('Error al cambiar estado del usuario');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Usuarios y Roles</h2>
          <p className="text-sm text-gray-500">Gestión de accesos y permisos</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
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
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nombre}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={ROL_COLORS[user.rol] ?? 'bg-gray-100 text-gray-800'}>
                        {ROL_LABELS[user.rol] ?? user.rol}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={user.activo}
                        onCheckedChange={() => handleToggleActive(user)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre Completo</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={rol} onValueChange={(v) => setRol(v as RolUsuario)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="analista">Analista</SelectItem>
                  <SelectItem value="coordinador">Coordinador</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Usuario Activo</Label>
              <Switch checked={activo} onCheckedChange={setActivo} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Analista</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>Ver y actualizar clientes</li>
            <li>Subir documentos</li>
            <li>Ver reportes básicos</li>
          </ul>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Coordinador</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>Todo lo de Analista</li>
            <li>Reasignar clientes</li>
            <li>Importar datos</li>
            <li>Ver todos los reportes</li>
          </ul>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 mb-2">Administrador</h4>
          <ul className="text-sm text-red-800 space-y-1">
            <li>Todo lo de Coordinador</li>
            <li>Gestionar usuarios</li>
            <li>Gestionar proyectos</li>
            <li>Configuración del sistema</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
