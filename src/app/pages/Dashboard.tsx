import { useState, useMemo } from 'react';
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
import { clientes, proyectos, bancos, ciudades, Cliente } from '../data/mock-data';
import { useNavigate } from 'react-router';

export function Dashboard() {
  const navigate = useNavigate();
  const [filtroProyecto, setFiltroProyecto] = useState<string>('todos');
  const [filtroCiudad, setFiltroCiudad] = useState<string>('todos');
  const [filtroBanco, setFiltroBanco] = useState<string>('todos');
  const [filtroAnalista, setFiltroAnalista] = useState<string>('todos');

  const analistas = useMemo(() => {
    const analistasSet = new Set<string>();
    clientes.forEach((c) => {
      analistasSet.add(c.analistaDelta);
    });
    return Array.from(analistasSet);
  }, []);

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((cliente) => {
      if (filtroProyecto !== 'todos' && cliente.proyectoId !== filtroProyecto) return false;
      if (filtroCiudad !== 'todos' && cliente.ciudadInmueble !== filtroCiudad) return false;
      if (filtroBanco !== 'todos' && cliente.bancoActual !== filtroBanco) return false;
      if (filtroAnalista !== 'todos' && cliente.analistaDelta !== filtroAnalista) return false;
      return true;
    });
  }, [filtroProyecto, filtroCiudad, filtroBanco, filtroAnalista]);

  const kpis = useMemo(() => {
    const total = clientesFiltrados.length;
    const preaprobacion = clientesFiltrados.filter((c) => c.etapa === 'Preaprobación').length;
    const aprobacion = clientesFiltrados.filter((c) => c.etapa === 'Aprobación').length;
    const legalizacion = clientesFiltrados.filter((c) => c.etapa === 'Legalización').length;
    const desembolsados = clientesFiltrados.filter((c) => c.etapa === 'Desembolsado').length;
    const porVencer = clientesFiltrados.filter(
      (c) => c.diasRestantes !== undefined && c.diasRestantes < 60 && c.diasRestantes > 0
    ).length;
    const vencidos = clientesFiltrados.filter(
      (c) => c.diasRestantes !== undefined && c.diasRestantes <= 0
    ).length;

    return {
      total,
      preaprobacion,
      aprobacion,
      legalizacion,
      desembolsados,
      porVencer,
      vencidos,
    };
  }, [clientesFiltrados]);

  const topPorVencer = useMemo(() => {
    return clientesFiltrados
      .filter((c) => c.diasRestantes !== undefined && c.diasRestantes < 60)
      .sort((a, b) => (a.diasRestantes || 0) - (b.diasRestantes || 0))
      .slice(0, 10);
  }, [clientesFiltrados]);

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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {proyectos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Ciudad</label>
            <Select value={filtroCiudad} onValueChange={setFiltroCiudad}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                {ciudades.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Banco</label>
            <Select value={filtroBanco} onValueChange={setFiltroBanco}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {bancos.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Analista</label>
            <Select value={filtroAnalista} onValueChange={setFiltroAnalista}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {analistas.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <KPICard
          title="Total Clientes"
          value={kpis.total}
          icon={Users}
          onClick={() => handleKPIClick()}
        />
        <KPICard
          title="Preaprobación"
          value={kpis.preaprobacion}
          icon={FileText}
          onClick={() => handleKPIClick('Preaprobación')}
        />
        <KPICard
          title="Aprobación"
          value={kpis.aprobacion}
          icon={CheckCircle}
          onClick={() => handleKPIClick('Aprobación')}
        />
        <KPICard
          title="Legalización"
          value={kpis.legalizacion}
          icon={Scale}
          onClick={() => handleKPIClick('Legalización')}
        />
        <KPICard
          title="Desembolsados"
          value={kpis.desembolsados}
          icon={TrendingUp}
          variant="success"
          onClick={() => handleKPIClick('Desembolsado')}
        />
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
                topPorVencer.map((cliente) => (
                  <TableRow
                    key={cliente.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/clientes?destacar=${cliente.id}`)}
                  >
                    <TableCell className="font-medium">{cliente.nombre}</TableCell>
                    <TableCell>
                      {proyectos.find((p) => p.id === cliente.proyectoId)?.nombre}
                    </TableCell>
                    <TableCell>{cliente.bancoActual}</TableCell>
                    <TableCell>
                      <StatusBadge etapa={cliente.etapa} />
                    </TableCell>
                    <TableCell className="font-semibold">
                      {cliente.diasRestantes !== undefined ? `${cliente.diasRestantes} días` : '-'}
                    </TableCell>
                    <TableCell>{cliente.fechaVencimiento || '-'}</TableCell>
                    <TableCell>
                      <VencimientoBadge diasRestantes={cliente.diasRestantes} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
