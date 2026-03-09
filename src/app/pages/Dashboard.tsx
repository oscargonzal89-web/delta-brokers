import { useState, useEffect, useCallback } from 'react';
import { KPICard } from '../components/KPICard';
import { VencimientoBadge } from '../components/VencimientoBadge';
import { StatusBadge } from '../components/StatusBadge';
import {
  Users,
  FileText,
  CheckCircle,
  Scale,
  TrendingUp,
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-react';
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
import { useNavigate } from 'react-router';
import { getDashboardKpis, getTopPorVencer, getVencimientosCriticos } from '../../lib/api/analytics';
import { getProjects } from '../../lib/api/projects';
import { getAnalistas } from '../../lib/api/users';
import type { Project, CaseWithDetails, DashboardKpi } from '../../lib/types';

const CIUDADES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga'];
const BANCOS = ['Bancolombia', 'Davivienda', 'Banco de Bogotá', 'BBVA Colombia', 'Banco Popular', 'Banco Occidente', 'Itaú'];

export function Dashboard() {
  const navigate = useNavigate();
  const [filtroProyecto, setFiltroProyecto] = useState<string>('todos');
  const [filtroCiudad, setFiltroCiudad] = useState<string>('todos');
  const [filtroBanco, setFiltroBanco] = useState<string>('todos');
  const [filtroAnalista, setFiltroAnalista] = useState<string>('todos');

  const [projects, setProjects] = useState<Project[]>([]);
  const [analistas, setAnalistas] = useState<{ id: string; nombre: string }[]>([]);
  const [kpis, setKpis] = useState({ total: 0, preaprobacion: 0, aprobacion: 0, legalizacion: 0, desembolsados: 0, porVencer: 0, vencidos: 0 });
  const [topPorVencer, setTopPorVencer] = useState<CaseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProjects(), getAnalistas()])
      .then(([p, a]) => { setProjects(p); setAnalistas(a); })
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const projectId = filtroProyecto !== 'todos' ? filtroProyecto : undefined;

      const [kpiData, topData, criticalCount] = await Promise.all([
        getDashboardKpis(projectId),
        getTopPorVencer(10, projectId),
        getVencimientosCriticos(60),
      ]);

      const aggregated = { total: 0, preaprobacion: 0, aprobacion: 0, legalizacion: 0, desembolsados: 0, porVencer: 0, vencidos: 0 };

      for (const row of kpiData) {
        const count = (row as any).total_cases ?? 0;
        aggregated.total += count;
        const etapa = (row as any).etapa_macro;
        if (etapa === 'preaprobacion') aggregated.preaprobacion += count;
        else if (etapa === 'aprobacion') aggregated.aprobacion += count;
        else if (etapa === 'legalizacion') aggregated.legalizacion += count;
        else if (etapa === 'desembolsado') aggregated.desembolsados += count;
      }

      aggregated.porVencer = criticalCount;

      const vencidosCount = topData.filter((c) => (c.dias_restantes ?? 999) <= 0).length;
      aggregated.vencidos = vencidosCount;

      setKpis(aggregated);
      setTopPorVencer(topData.filter((c) => (c.dias_restantes ?? 999) <= 60));
    } catch {
      // silently fail, data stays at defaults
    } finally {
      setLoading(false);
    }
  }, [filtroProyecto]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleKPIClick = (etapa?: string) => {
    const params = new URLSearchParams();
    if (etapa) params.set('etapa', etapa);
    if (filtroProyecto !== 'todos') params.set('proyecto', filtroProyecto);
    if (filtroCiudad !== 'todos') params.set('ciudad', filtroCiudad);
    if (filtroBanco !== 'todos') params.set('banco', filtroBanco);
    if (filtroAnalista !== 'todos') params.set('analista', filtroAnalista);
    navigate(`/clientes?${params.toString()}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Proyecto</label>
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
            <label className="text-xs text-gray-600 mb-1 block">Ciudad</label>
            <Select value={filtroCiudad} onValueChange={setFiltroCiudad}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                {CIUDADES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Banco</label>
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
            <label className="text-xs text-gray-600 mb-1 block">Analista</label>
            <Select value={filtroAnalista} onValueChange={setFiltroAnalista}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {analistas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <KPICard title="Total Clientes" value={kpis.total} icon={Users} onClick={() => handleKPIClick()} />
            <KPICard title="Preaprobación" value={kpis.preaprobacion} icon={FileText} onClick={() => handleKPIClick('preaprobacion')} />
            <KPICard title="Aprobación" value={kpis.aprobacion} icon={CheckCircle} onClick={() => handleKPIClick('aprobacion')} />
            <KPICard title="Legalización" value={kpis.legalizacion} icon={Scale} onClick={() => handleKPIClick('legalizacion')} />
            <KPICard title="Desembolsados" value={kpis.desembolsados} icon={TrendingUp} variant="success" onClick={() => handleKPIClick('desembolsado')} />
            <KPICard title="Por Vencer (<60d)" value={kpis.porVencer} icon={Clock} variant="warning" />
            <KPICard title="Vencidos" value={kpis.vencidos} icon={AlertCircle} variant="danger" />
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold">Top Créditos por Vencer</h3>
              <p className="text-sm text-gray-500">Ordenados por días restantes</p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Días Restantes</TableHead>
                    <TableHead>Fecha Vencimiento</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPorVencer.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        No hay créditos por vencer en los próximos 60 días
                      </TableCell>
                    </TableRow>
                  ) : (
                    topPorVencer.map((c) => (
                      <TableRow
                        key={c.case_id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/clientes?destacar=${c.case_id}`)}
                      >
                        <TableCell className="font-medium">{c.nombre_completo}</TableCell>
                        <TableCell>{c.proyecto_nombre}</TableCell>
                        <TableCell>{c.banco_actual}</TableCell>
                        <TableCell>
                          <StatusBadge etapa={c.etapa_macro ?? 'preaprobacion'} />
                        </TableCell>
                        <TableCell className="font-semibold">
                          {c.dias_restantes != null ? `${c.dias_restantes} días` : '-'}
                        </TableCell>
                        <TableCell>{c.fecha_vencimiento || '-'}</TableCell>
                        <TableCell>
                          <VencimientoBadge diasRestantes={c.dias_restantes ?? undefined} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
