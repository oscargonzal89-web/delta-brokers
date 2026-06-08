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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
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
import { Edit, Trash2, Plus, Loader2, ShieldCheck, Users, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  getUsers,
  updateUserRole,
  toggleUserActive,
  updateUserProfile,
  createUser,
  deleteUser,
} from '../../lib/api/users';
import { useAuth } from '../../lib/auth';
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
  const { isAdmin, profile: currentProfile } = useAuth();

  // List state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRol, setEditRol] = useState<RolUsuario>('analista');
  const [editActivo, setEditActivo] = useState(true);
  const [saving, setSaving] = useState(false);

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRol, setNewRol] = useState<RolUsuario>('analista');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setUsers(await getUsers());
    } catch {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ── Edit ──────────────────────────────────────────────────────────────────
  const openEdit = (user: UserProfile) => {
    setSelected(user);
    setEditNombre(user.nombre);
    setEditEmail(user.email ?? '');
    setEditRol(user.rol as RolUsuario);
    setEditActivo(user.activo);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      if (editNombre !== selected.nombre || editEmail !== (selected.email ?? '')) {
        await updateUserProfile(selected.id, { nombre: editNombre, email: editEmail || undefined });
      }
      if (editRol !== selected.rol) await updateUserRole(selected.id, editRol);
      if (editActivo !== selected.activo) await toggleUserActive(selected.id, editActivo);

      toast.success('Usuario actualizado');
      setEditOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar usuario');
    } finally {
      setSaving(false);
    }
  };

  // ── Create ────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setNewNombre('');
    setNewEmail('');
    setNewRol('analista');
    setNewPassword('');
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!newNombre.trim() || !newEmail.trim() || !newPassword) {
      toast.error('Completa todos los campos requeridos');
      return;
    }
    setCreating(true);
    try {
      await createUser({ email: newEmail.trim(), nombre: newNombre.trim(), rol: newRol, password: newPassword });
      toast.success('Usuario creado exitosamente');
      setCreateOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear usuario');
    } finally {
      setCreating(false);
    }
  };

  // ── Toggle active (inline) ────────────────────────────────────────────────
  const handleToggleActive = async (user: UserProfile) => {
    try {
      await toggleUserActive(user.id, !user.activo);
      toast.success(user.activo ? 'Usuario desactivado' : 'Usuario activado');
      fetchUsers();
    } catch {
      toast.error('Error al cambiar estado del usuario');
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      toast.success('Usuario eliminado');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar usuario');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Usuarios y Roles</h2>
          <p className="text-sm text-gray-500">
            {isAdmin ? 'Gestión de accesos y permisos' : 'Vista de solo lectura'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo usuario
          </Button>
        )}
      </div>

      {/* Table */}
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
                {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} className="text-center text-gray-500 py-8">
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className={!user.activo ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">
                      {user.nombre}
                      {user.id === currentProfile?.id && (
                        <span className="ml-2 text-xs text-gray-400">(tú)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={ROL_COLORS[user.rol] ?? 'bg-gray-100 text-gray-800'}
                      >
                        {ROL_LABELS[user.rol] ?? user.rol}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <Switch
                          checked={user.activo}
                          onCheckedChange={() => handleToggleActive(user)}
                          disabled={user.id === currentProfile?.id}
                        />
                      ) : (
                        <Badge variant={user.activo ? 'default' : 'secondary'}>
                          {user.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(user)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteTarget(user)}
                            disabled={user.id === currentProfile?.id}
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Role legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" /> Analista
          </h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>Ver y actualizar clientes</li>
            <li>Subir documentos</li>
            <li>Ver reportes básicos</li>
          </ul>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Eye className="h-4 w-4" /> Coordinador
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>Todo lo de Analista</li>
            <li>Reasignar clientes</li>
            <li>Importar datos</li>
            <li>Ver todos los reportes</li>
          </ul>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Administrador
          </h4>
          <ul className="text-sm text-red-800 space-y-1">
            <li>Todo lo de Coordinador</li>
            <li>Crear, editar y eliminar usuarios</li>
            <li>Gestionar proyectos</li>
            <li>Configuración del sistema</li>
          </ul>
        </div>
      </div>

      {/* ── Edit Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre completo *</Label>
              <Input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={editRol} onValueChange={(v) => setEditRol(v as RolUsuario)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="analista">Analista</SelectItem>
                  <SelectItem value="coordinador">Coordinador</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Usuario activo</Label>
              <Switch
                checked={editActivo}
                onCheckedChange={setEditActivo}
                disabled={selected?.id === currentProfile?.id}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Guardar cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Create Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre completo *</Label>
              <Input
                placeholder="Ej: Carlos Téllez"
                value={newNombre}
                onChange={(e) => setNewNombre(e.target.value)}
                disabled={creating}
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="usuario@empresa.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={creating}
              />
            </div>
            <div className="space-y-2">
              <Label>Contraseña inicial *</Label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={creating}
              />
              <p className="text-xs text-gray-500">
                El usuario podrá cambiarla desde su perfil.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={newRol} onValueChange={(v) => setNewRol(v as RolUsuario)} disabled={creating}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="analista">Analista</SelectItem>
                  <SelectItem value="coordinador">Coordinador</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creando...</>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear usuario
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ───────────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar a <strong>{deleteTarget?.nombre}</strong> ({deleteTarget?.email}).
              Esta acción no se puede deshacer y el usuario perderá el acceso inmediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
