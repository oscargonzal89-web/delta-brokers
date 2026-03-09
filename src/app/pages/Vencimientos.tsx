import { useState, useEffect, useCallback } from 'react';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { VencimientoBadge } from '../components/VencimientoBadge';
import { AlertCircle, Clock, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import { ClienteDetalle } from '../components/ClienteDetalle';
import { getVencimientosPorRango } from '../../lib/api/analytics';
import { getProjects } from '../../lib/api/projects';
import type { Project, VencimientoPorRango } from '../../lib/types';

const BANCOS = ['Bancolombia', 'Davivienda', 'Banco de Bogotá', 'BBVA Colombia', 'Banco Popular', 'Banco Occidente', 'Itaú'];

export function Vencimientos() {
  const [filtroProyecto, setFiltroProyecto] = useState<string>('todos');
  const [filtroBanco, setFiltroBanco] = useState<string>('todos');
  const [filtroRango, setFiltroRango] = useState<string>('todos');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [data, setData] = useState<VencimientoPorRango[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects().then(setProjects).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filtroProyecto !== 'todos') filters.projectId = filtroProyecto;
      if (filtroRango !== 'todos') filters.rango = filtroRango;
      const result = await getVencimientosPorRango(filters);
      setData(result);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filtroProyecto, filtroRango]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = filtroBanco !== 'todos'
    ? data.filter((d) => (d as any).banco_actual === filtroBanco)
    : data;

  const kpis = {
    vencidos: filteredData.filter((d) => (d as any).rango_vencimiento === 'vencido' || (d.dias_restantes ?? 999) <= 0).length,
    rango1_15: filteredData.filter((d) => (d.dias_restantes ?? 999) >= 1 && (d.dias_restantes ?? 999) <= 15).length,
    rango16_30: filteredData.filter((d) => (d.dias_restantes ?? 999) >= 16 && (d.dias_restantes ?? 999) <= 30).length,
    rango31_60: filteredData.filter((d) => (d.dias_restantes ?? 999) >= 31 && (d.dias_restantes ?? 999) <= 60).length,
    porVencer: filteredData.filter((d) => (d.dias_restantes ?? 999) > 0 && (d.dias_restantes ?? 999) <= 60).length,
  };

  return (
    <div className="p-6 space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <KPICard title="Vencidos (≤0)" value={kpis.vencidos} icon={AlertCircle} variant="danger" />
            <KPICard title="1-15 días" value={kpis.rango1_15} icon={AlertCircle} variant="danger" />
            <KPICard title="16-30 días" value={kpis.rango16_30} icon={Clock} variant="warning" />
            <KPICard title="31-60 días" value={kpis.rango31_60} icon={Clock} variant="warning" />
            <KPICard title="Por Vencer Total" value={kpis.porVencer} icon={Clock} variant="warning" />
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">Proyecto</Label>
                <Select value={filtroProyecto} onValueChange={setFiltroProyecto}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">Banco</Label>
                <Select value={filtroBanco} onValueChange={setFiltroBanco}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {BANCOS.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">Rango de Días</Label>
                <Select value={filtroRango} onValueChange={setFiltroRango}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="vencido">Vencidos (≤0)</SelectItem>
                    <SelectItem value="critico">1-15 días</SelectItem>
                    <SelectItem value="proximo">16-30 días</SelectItem>
                    <SelectItem value="moderado">31-60 días</SelectItem>
                    <SelectItem value="holgado">&gt;60 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold">Vencimientos Globales</h3>
              <p className="text-sm text-gray-500">
                Mostrando {filteredData.length} créditos con vencimiento
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Cédula</TableHead>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Fecha Aprobación</TableHead>
                    <TableHead className="text-center">Vigencia</TableHead>
                    <TableHead>Fecha Vencimiento</TableHead>
                    <TableHead className="text-center">Días Restantes</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                        No se encontraron créditos con los filtros seleccionados
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((row) => (
                      <TableRow
                        key={(row as any).case_id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => setClienteSeleccionado((row as any).case_id)}
                      >
                        <TableCell className="font-medium">{(row as any).nombre_completo}</TableCell>
                        <TableCell>{(row as any).cedula}</TableCell>
                        <TableCell>{(row as any).proyecto_nombre}</TableCell>
                        <TableCell>{(row as any).banco_actual}</TableCell>
                        <TableCell>
                          <StatusBadge etapa={(row as any).etapa_macro ?? 'preaprobacion'} />
                        </TableCell>
                        <TableCell>{(row as any).fecha_carta_aprobacion || '-'}</TableCell>
                        <TableCell className="text-center">{(row as any).vigencia_dias}d</TableCell>
                        <TableCell>{(row as any).fecha_vencimiento || '-'}</TableCell>
                        <TableCell className="text-center font-semibold">
                          {row.dias_restantes != null ? `${row.dias_restantes}d` : '-'}
                        </TableCell>
                        <TableCell>
                          <VencimientoBadge diasRestantes={row.dias_restantes ?? undefined} />
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
