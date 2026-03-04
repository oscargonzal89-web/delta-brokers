import { useState, useMemo } from 'react';
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
import { clientes, proyectos, ciudades } from '../data/mock-data';
import { ClienteDetalle } from '../components/ClienteDetalle';

export function SeguimientoAnalistas() {
  const [filtroAnalista, setFiltroAnalista] = useState<string>('todos');
  const [filtroProyecto, setFiltroProyecto] = useState<string>('todos');
  const [filtroCiudad, setFiltroCiudad] = useState<string>('todas');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);

  const analistas = useMemo(() => {
    const set = new Set<string>();
    clientes.forEach((c) => set.add(c.analistaDelta));
    return Array.from(set).sort();
  }, []);

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((cliente) => {
      if (filtroAnalista !== 'todos' && cliente.analistaDelta !== filtroAnalista) return false;
      if (filtroProyecto !== 'todos' && cliente.proyectoId !== filtroProyecto) return false;
      if (filtroCiudad !== 'todas' && cliente.ciudadInmueble !== filtroCiudad) return false;
      return true;
    });
  }, [filtroAnalista, filtroProyecto, filtroCiudad]);

  const resumenPorAnalista = useMemo(() => {
    const resumen: Record<string, { total: number; porVencer: number; vencidos: number }> = {};
    clientesFiltrados.forEach((c) => {
      if (!resumen[c.analistaDelta]) {
        resumen[c.analistaDelta] = { total: 0, porVencer: 0, vencidos: 0 };
      }
      resumen[c.analistaDelta].total++;
      if (c.diasRestantes !== undefined && c.diasRestantes > 0 && c.diasRestantes < 60) {
        resumen[c.analistaDelta].porVencer++;
      }
      if (c.diasRestantes !== undefined && c.diasRestantes <= 0) {
        resumen[c.analistaDelta].vencidos++;
      }
    });
    return resumen;
  }, [clientesFiltrados]);

  const getTimpoCartaLabel = (cliente: typeof clientes[0]) => {
    if (!cliente.fechaAprobacion || !cliente.vigenciaDias) return null;
    return {
      fechaVencimiento: cliente.fechaVencimiento || '-',
      diasRestantes: cliente.diasRestantes,
      vigenciaDias: cliente.vigenciaDias,
    };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Analista</Label>
            <Select value={filtroAnalista} onValueChange={setFiltroAnalista}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los analistas</SelectItem>
                {analistas.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Proyecto</Label>
            <Select value={filtroProyecto} onValueChange={setFiltroProyecto}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los proyectos</SelectItem>
                {proyectos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Ciudad</Label>
            <Select value={filtroCiudad} onValueChange={setFiltroCiudad}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las ciudades</SelectItem>
                {ciudades.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Resumen por analista */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(resumenPorAnalista).map(([analista, data]) => (
          <div
            key={analista}
            className={`bg-white p-4 rounded-lg border cursor-pointer transition-colors ${
              filtroAnalista === analista
                ? 'border-gray-900 ring-1 ring-gray-900'
                : 'border-gray-200 hover:border-gray-400'
            }`}
            onClick={() =>
              setFiltroAnalista(filtroAnalista === analista ? 'todos' : analista)
            }
          >
            <p className="text-sm font-semibold text-gray-900">{analista}</p>
            <div className="mt-2 flex items-center gap-4">
              <div>
                <p className="text-2xl font-bold">{data.total}</p>
                <p className="text-xs text-gray-500">créditos</p>
              </div>
              {data.porVencer > 0 && (
                <div className="text-center">
                  <p className="text-lg font-semibold text-amber-600">{data.porVencer}</p>
                  <p className="text-xs text-amber-600">por vencer</p>
                </div>
              )}
              {data.vencidos > 0 && (
                <div className="text-center">
                  <p className="text-lg font-semibold text-red-600">{data.vencidos}</p>
                  <p className="text-xs text-red-600">vencidos</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tabla de créditos */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold">Créditos por Analista</h3>
          <p className="text-sm text-gray-500">
            Mostrando {clientesFiltrados.length} de {clientes.length} créditos
          </p>
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
              {clientesFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                    No se encontraron créditos con los filtros seleccionados
                  </TableCell>
                </TableRow>
              ) : (
                clientesFiltrados.map((cliente) => {
                  const carta = getTimpoCartaLabel(cliente);
                  return (
                    <TableRow
                      key={cliente.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setClienteSeleccionado(cliente.id)}
                    >
                      <TableCell className="text-sm font-medium">
                        {cliente.analistaDelta}
                      </TableCell>
                      <TableCell className="text-sm">{cliente.cedula}</TableCell>
                      <TableCell className="font-medium">{cliente.nombre}</TableCell>
                      <TableCell className="text-sm">
                        {proyectos.find((p) => p.id === cliente.proyectoId)?.nombre}
                      </TableCell>
                      <TableCell>
                        <StatusBadge etapa={cliente.etapa} />
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {carta ? `${carta.vigenciaDias}d` : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {cliente.fechaAprobacion || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {carta ? carta.fechaVencimiento : '-'}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-sm">
                        {carta?.diasRestantes !== undefined
                          ? `${carta.diasRestantes}d`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <VencimientoBadge diasRestantes={cliente.diasRestantes} />
                      </TableCell>
                    </TableRow>
                  );
                })
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
