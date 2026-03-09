import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Label } from '../components/ui/label';
import { StatusBadge } from '../components/StatusBadge';
import { VencimientoBadge } from '../components/VencimientoBadge';
import { Loader2 } from 'lucide-react';
import { ClienteDetalle } from '../components/ClienteDetalle';
import { getSeguimientoAnalistas } from '../../lib/api/analytics';
import { getProjects } from '../../lib/api/projects';
import { getAnalistas } from '../../lib/api/users';
import type { Project, SeguimientoAnalista } from '../../lib/types';

const CIUDADES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga'];

export function SeguimientoAnalistas() {
  const [filtroAnalista, setFiltroAnalista] = useState<string>('todos');
  const [filtroProyecto, setFiltroProyecto] = useState<string>('todos');
  const [filtroCiudad, setFiltroCiudad] = useState<string>('todas');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);

  const [data, setData] = useState<SeguimientoAnalista[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [analistas, setAnalistas] = useState<{ id: string; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProjects(), getAnalistas()])
      .then(([p, a]) => { setProjects(p); setAnalistas(a); })
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filtroAnalista !== 'todos') filters.analistaId = filtroAnalista;
      if (filtroProyecto !== 'todos') filters.projectId = filtroProyecto;
      if (filtroCiudad !== 'todas') filters.ciudad = filtroCiudad;
      const result = await getSeguimientoAnalistas(filters);
      setData(result);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filtroAnalista, filtroProyecto, filtroCiudad]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resumenPorAnalista = useMemo(() => {
    const resumen: Record<string, { nombre: string; total: number; porVencer: number; vencidos: number }> = {};
    data.forEach((row) => {
      const id = (row as any).analista_id ?? 'sin-asignar';
      const nombre = (row as any).analista_nombre ?? 'Sin asignar';
      if (!resumen[id]) resumen[id] = { nombre, total: 0, porVencer: 0, vencidos: 0 };
      resumen[id].total++;
      const dias = (row as any).dias_restantes;
      if (dias != null && dias > 0 && dias < 60) resumen[id].porVencer++;
      if (dias != null && dias <= 0) resumen[id].vencidos++;
    });
    return resumen;
  }, [data]);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Analista</Label>
            <Select value={filtroAnalista} onValueChange={setFiltroAnalista}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los analistas</SelectItem>
                {analistas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Proyecto</Label>
            <Select value={filtroProyecto} onValueChange={setFiltroProyecto}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los proyectos</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Ciudad</Label>
            <Select value={filtroCiudad} onValueChange={setFiltroCiudad}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las ciudades</SelectItem>
                {CIUDADES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(resumenPorAnalista).map(([id, info]) => (
              <div
                key={id}
                className={`bg-white p-4 rounded-lg border cursor-pointer transition-colors ${
                  filtroAnalista === id
                    ? 'border-gray-900 ring-1 ring-gray-900'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                onClick={() => setFiltroAnalista(filtroAnalista === id ? 'todos' : id)}
              >
                <p className="text-sm font-semibold text-gray-900">{info.nombre}</p>
                <div className="mt-2 flex items-center gap-4">
                  <div>
                    <p className="text-2xl font-bold">{info.total}</p>
                    <p className="text-xs text-gray-500">créditos</p>
                  </div>
                  {info.porVencer > 0 && (
                    <div className="text-center">
                      <p className="text-lg font-semibold text-amber-600">{info.porVencer}</p>
                      <p className="text-xs text-amber-600">por vencer</p>
                    </div>
                  )}
                  {info.vencidos > 0 && (
                    <div className="text-center">
                      <p className="text-lg font-semibold text-red-600">{info.vencidos}</p>
                      <p className="text-xs text-red-600">vencidos</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold">Créditos por Analista</h3>
              <p className="text-sm text-gray-500">Mostrando {data.length} créditos</p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Analista</TableHead>
                    <TableHead>Cédula</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Vigencia (días)</TableHead>
                    <TableHead>Fecha Aprobación</TableHead>
                    <TableHead>Fecha Vencimiento</TableHead>
                    <TableHead className="text-center">Días Restantes</TableHead>
                    <TableHead>Alerta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                        No se encontraron créditos con los filtros seleccionados
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((row, idx) => (
                      <TableRow
                        key={(row as any).case_id ?? idx}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => setClienteSeleccionado((row as any).case_id)}
                      >
                        <TableCell className="text-sm font-medium">
                          {(row as any).analista_nombre ?? 'Sin asignar'}
                        </TableCell>
                        <TableCell className="text-sm">{(row as any).cedula}</TableCell>
                        <TableCell className="font-medium">{(row as any).nombre_completo}</TableCell>
                        <TableCell className="text-sm">{(row as any).proyecto_nombre}</TableCell>
                        <TableCell>
                          <StatusBadge etapa={(row as any).etapa_macro ?? 'preaprobacion'} />
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {(row as any).vigencia_dias ? `${(row as any).vigencia_dias}d` : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {(row as any).fecha_carta_aprobacion || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {(row as any).fecha_vencimiento || '-'}
                        </TableCell>
                        <TableCell className="text-center font-semibold text-sm">
                          {(row as any).dias_restantes != null ? `${(row as any).dias_restantes}d` : '-'}
                        </TableCell>
                        <TableCell>
                          <VencimientoBadge diasRestantes={(row as any).dias_restantes ?? undefined} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {clienteSeleccionado && (
            <ClienteDetalle
              clienteId={clienteSeleccionado}
              open={!!clienteSeleccionado}
              onClose={() => setClienteSeleccionado(null)}
              onUpdate={fetchData}
            />
          )}
        </>
      )}
    </div>
  );
}
