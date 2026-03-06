import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
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
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getProjects, getProjectKpis, createProject } from '../../lib/api/projects';
import type { Project, DashboardKpi } from '../../lib/types';

const BANCOS = [
  'Bancolombia', 'Davivienda', 'Banco de Bogotá', 'BBVA Colombia',
  'Banco Popular', 'Banco Occidente', 'Itaú',
];

const CIUDADES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga'];

export function Proyectos() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [bancoPrincipal, setBancoPrincipal] = useState('');
  const [creating, setCreating] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [kpis, setKpis] = useState<DashboardKpi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsData, kpisData] = await Promise.all([
        getProjects(),
        getProjectKpis(),
      ]);
      setProjects(projectsData);
      setKpis(kpisData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar proyectos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getKpiForProject = (projectId: string) => {
    return kpis.find((k) => k.project_id === projectId);
  };

  const handleCreate = async () => {
    if (!nombre || !ciudad || !bancoPrincipal) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setCreating(true);
    try {
      await createProject({
        nombre,
        ciudad,
        banco_financiador_principal: bancoPrincipal,
      });
      toast.success(`Proyecto "${nombre}" creado exitosamente`);
      setOpen(false);
      setNombre('');
      setCiudad('');
      setBancoPrincipal('');
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear proyecto');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error al cargar proyectos</p>
          <p className="text-sm mt-1">{error}</p>
          <Button variant="outline" className="mt-3" onClick={fetchData}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Proyectos</h2>
          <p className="text-sm text-gray-500">Gestiona las salas de ventas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Proyecto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Proyecto</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Torres del Norte"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={creating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Select value={ciudad} onValueChange={setCiudad} disabled={creating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    {CIUDADES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="banco">Banco Financiador Principal</Label>
                <Select value={bancoPrincipal} onValueChange={setBancoPrincipal} disabled={creating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANCOS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={creating}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Proyecto'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {projects.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg font-medium">No hay proyectos</p>
            <p className="text-sm mt-1">Crea tu primer proyecto para comenzar</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ciudad</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Banco Principal</TableHead>
                <TableHead className="text-center">Total Clientes</TableHead>
                <TableHead className="text-center">Preaprobación</TableHead>
                <TableHead className="text-center">Aprobación</TableHead>
                <TableHead className="text-center">Legalización</TableHead>
                <TableHead className="text-center">Desembolsados</TableHead>
                <TableHead className="text-center">Por Vencer &lt;60</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((proyecto) => {
                const kpi = getKpiForProject(proyecto.id);
                return (
                  <TableRow
                    key={proyecto.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/proyectos/${proyecto.id}`)}
                  >
                    <TableCell>{proyecto.ciudad}</TableCell>
                    <TableCell className="font-medium">{proyecto.nombre}</TableCell>
                    <TableCell>{proyecto.banco_financiador_principal}</TableCell>
                    <TableCell className="text-center font-semibold">
                      {kpi?.total_clientes ?? 0}
                    </TableCell>
                    <TableCell className="text-center">{kpi?.preaprobacion ?? 0}</TableCell>
                    <TableCell className="text-center">{kpi?.aprobacion ?? 0}</TableCell>
                    <TableCell className="text-center">{kpi?.legalizacion ?? 0}</TableCell>
                    <TableCell className="text-center">{kpi?.desembolsado ?? 0}</TableCell>
                    <TableCell className="text-center">
                      {(kpi?.por_vencer ?? 0) > 0 ? (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                          {kpi?.por_vencer}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
