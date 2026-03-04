import { useMemo, useState } from 'react';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { VencimientoBadge } from '../components/VencimientoBadge';
import { AlertCircle, Clock } from 'lucide-react';
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
import { clientes, proyectos, bancos } from '../data/mock-data';
import { ClienteDetalle } from '../components/ClienteDetalle';

export function Vencimientos() {
  const [filtroProyecto, setFiltroProyecto] = useState<string>('todos');
  const [filtroBanco, setFiltroBanco] = useState<string>('todos');
  const [filtroRango, setFiltroRango] = useState<string>('todos');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);

  const clientesConVencimiento = useMemo(() => {
    return clientes.filter((c) => c.diasRestantes !== undefined);
  }, []);

  const clientesFiltrados = useMemo(() => {
    return clientesConVencimiento.filter((cliente) => {
      if (filtroProyecto !== 'todos' && cliente.proyectoId !== filtroProyecto) return false;
      if (filtroBanco !== 'todos' && cliente.bancoActual !== filtroBanco) return false;

      if (filtroRango !== 'todos') {
        const dias = cliente.diasRestantes!;
        switch (filtroRango) {
          case 'vencidos':
            if (dias > 0) return false;
            break;
          case '1-15':
            if (dias < 1 || dias > 15) return false;
            break;
          case '16-30':
            if (dias < 16 || dias > 30) return false;
            break;
          case '31-60':
            if (dias < 31 || dias > 60) return false;
            break;
          case 'mas-60':
            if (dias <= 60) return false;
            break;
        }
      }

      return true;
    });
  }, [clientesConVencimiento, filtroProyecto, filtroBanco, filtroRango]);

  const kpis = useMemo(() => {
    const vencidos = clientesConVencimiento.filter((c) => c.diasRestantes! <= 0).length;
    const rango1_15 = clientesConVencimiento.filter(
      (c) => c.diasRestantes! >= 1 && c.diasRestantes! <= 15
    ).length;
    const rango16_30 = clientesConVencimiento.filter(
      (c) => c.diasRestantes! >= 16 && c.diasRestantes! <= 30
    ).length;
    const rango31_60 = clientesConVencimiento.filter(
      (c) => c.diasRestantes! >= 31 && c.diasRestantes! <= 60
    ).length;
    const porVencer = rango1_15 + rango16_30 + rango31_60;

    return { vencidos, rango1_15, rango16_30, rango31_60, porVencer };
  }, [clientesConVencimiento]);

  const clientesOrdenados = useMemo(() => {
    return [...clientesFiltrados].sort((a, b) => (a.diasRestantes || 0) - (b.diasRestantes || 0));
  }, [clientesFiltrados]);

  return (
    <div className="p-6 space-y-6">
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
            <Label className="text-xs text-gray-600 mb-1 block">Banco</Label>
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
            <Label className="text-xs text-gray-600 mb-1 block">Rango de Días</Label>
            <Select value={filtroRango} onValueChange={setFiltroRango}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="vencidos">Vencidos (≤0)</SelectItem>
                <SelectItem value="1-15">1-15 días</SelectItem>
                <SelectItem value="16-30">16-30 días</SelectItem>
                <SelectItem value="31-60">31-60 días</SelectItem>
                <SelectItem value="mas-60">&gt;60 días</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold">Vencimientos Globales</h3>
          <p className="text-sm text-gray-500">
            Mostrando {clientesOrdenados.length} de {clientesConVencimiento.length} créditos
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
              {clientesOrdenados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                    No se encontraron créditos con los filtros seleccionados
                  </TableCell>
                </TableRow>
              ) : (
                clientesOrdenados.map((cliente) => (
                  <TableRow
                    key={cliente.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setClienteSeleccionado(cliente.id)}
                  >
                    <TableCell className="font-medium">{cliente.nombre}</TableCell>
                    <TableCell>{cliente.cedula}</TableCell>
                    <TableCell>
                      {proyectos.find((p) => p.id === cliente.proyectoId)?.nombre}
                    </TableCell>
                    <TableCell>{cliente.bancoActual}</TableCell>
                    <TableCell>
                      <StatusBadge etapa={cliente.etapa} />
                    </TableCell>
                    <TableCell>{cliente.fechaAprobacion}</TableCell>
                    <TableCell className="text-center">{cliente.vigenciaDias}d</TableCell>
                    <TableCell>{cliente.fechaVencimiento}</TableCell>
                    <TableCell className="text-center font-semibold">
                      {cliente.diasRestantes}d
                    </TableCell>
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

      {clienteSeleccionado && (
        <ClienteDetalle
          clienteId={clienteSeleccionado}
          open={!!clienteSeleccionado}
          onClose={() => setClienteSeleccionado(null)}
        />
      )}
    </div>
  );
}
