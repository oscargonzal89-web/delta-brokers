import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Input } from '../components/ui/input';
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
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { StatusBadge } from '../components/StatusBadge';
import { VencimientoBadge } from '../components/VencimientoBadge';
import { Search } from 'lucide-react';
import { clientes, proyectos, bancos, ciudades, subestadosPorEtapa, Etapa } from '../data/mock-data';
import { ClienteDetalle } from '../components/ClienteDetalle';

export function Clientes() {
  const [searchParams] = useSearchParams();
  const [busqueda, setBusqueda] = useState('');
  const [filtroEtapa, setFiltroEtapa] = useState<string>('todas');
  const [filtroSubestado, setFiltroSubestado] = useState<string>('todos');
  const [filtroBanco, setFiltroBanco] = useState<string>('todos');
  const [filtroCiudad, setFiltroCiudad] = useState<string>('todas');
  const [filtroAnalista, setFiltroAnalista] = useState<string>('todos');
  const [soloMenor60, setSoloMenor60] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);

  useEffect(() => {
    const etapa = searchParams.get('etapa');
    const proyecto = searchParams.get('proyecto');
    const ciudad = searchParams.get('ciudad');
    const banco = searchParams.get('banco');
    const analista = searchParams.get('analista');
    const destacar = searchParams.get('destacar');

    if (etapa) setFiltroEtapa(etapa);
    if (ciudad) setFiltroCiudad(ciudad);
    if (banco) setFiltroBanco(banco);
    if (analista) setFiltroAnalista(analista);
    if (destacar) {
      setClienteSeleccionado(destacar);
    }
  }, [searchParams]);

  const analistas = useMemo(() => {
    const analistasSet = new Set<string>();
    clientes.forEach((c) => {
      analistasSet.add(c.analistaDelta);
    });
    return Array.from(analistasSet);
  }, []);

  const subestadosDisponibles = useMemo(() => {
    if (filtroEtapa === 'todas') return [];
    return subestadosPorEtapa[filtroEtapa as Etapa] || [];
  }, [filtroEtapa]);

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((cliente) => {
      if (busqueda) {
        const searchLower = busqueda.toLowerCase();
        if (
          !cliente.nombre.toLowerCase().includes(searchLower) &&
          !cliente.cedula.includes(busqueda)
        ) {
          return false;
        }
      }

      if (filtroEtapa !== 'todas' && cliente.etapa !== filtroEtapa) return false;
      if (filtroSubestado !== 'todos' && cliente.subestado !== filtroSubestado) return false;
      if (filtroBanco !== 'todos' && cliente.bancoActual !== filtroBanco) return false;
      if (filtroCiudad !== 'todas' && cliente.ciudadInmueble !== filtroCiudad) return false;
      if (filtroAnalista !== 'todos' && cliente.analistaDelta !== filtroAnalista) return false;
      if (
        soloMenor60 &&
        (cliente.diasRestantes === undefined || cliente.diasRestantes >= 60)
      ) {
        return false;
      }

      return true;
    });
  }, [busqueda, filtroEtapa, filtroSubestado, filtroBanco, filtroCiudad, filtroAnalista, soloMenor60]);

  const handleFiltroEtapaChange = (value: string) => {
    setFiltroEtapa(value);
    setFiltroSubestado('todos');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 p-4 space-y-4 sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o cédula..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div>
            <Label className="text-xs text-gray-600">Etapa</Label>
            <Select value={filtroEtapa} onValueChange={handleFiltroEtapaChange}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="Preaprobación">Preaprobación</SelectItem>
                <SelectItem value="Aprobación">Aprobación</SelectItem>
                <SelectItem value="Legalización">Legalización</SelectItem>
                <SelectItem value="Desembolsado">Desembolsado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-gray-600">Subestado</Label>
            <Select
              value={filtroSubestado}
              onValueChange={setFiltroSubestado}
              disabled={filtroEtapa === 'todas'}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {subestadosDisponibles.map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-gray-600">Banco</Label>
            <Select value={filtroBanco} onValueChange={setFiltroBanco}>
              <SelectTrigger className="mt-1">
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
            <Label className="text-xs text-gray-600">Ciudad</Label>
            <Select value={filtroCiudad} onValueChange={setFiltroCiudad}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {ciudades.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-gray-600">Analista</Label>
            <Select value={filtroAnalista} onValueChange={setFiltroAnalista}>
              <SelectTrigger className="mt-1">
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

          <div className="flex items-end">
            <div className="flex items-center space-x-2 pb-2">
              <Switch
                id="menor60"
                checked={soloMenor60}
                onCheckedChange={setSoloMenor60}
              />
              <Label htmlFor="menor60" className="text-xs">
                Solo &lt;60 días
              </Label>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Mostrando {clientesFiltrados.length} de {clientes.length} clientes
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Nombre</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Banco</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Subestado</TableHead>
                <TableHead className="text-right">Monto Inmueble</TableHead>
                <TableHead className="text-right">Monto Financiar</TableHead>
                <TableHead>Ciudad Cliente</TableHead>
                <TableHead>Fecha Aprob.</TableHead>
                <TableHead className="text-center">Vigencia</TableHead>
                <TableHead>Fecha Venc.</TableHead>
                <TableHead className="text-center">Días Rest.</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center text-gray-500 py-8">
                    No se encontraron clientes con los filtros seleccionados
                  </TableCell>
                </TableRow>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <TableRow
                    key={cliente.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onDoubleClick={() => setClienteSeleccionado(cliente.id)}
                  >
                    <TableCell className="font-medium">{cliente.nombre}</TableCell>
                    <TableCell className="text-sm">{cliente.cedula}</TableCell>
                    <TableCell className="text-sm">{cliente.bancoActual}</TableCell>
                    <TableCell>
                      <StatusBadge etapa={cliente.etapa} />
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">{cliente.subestado}</TableCell>
                    <TableCell className="text-right text-sm">
                      ${(cliente.montoInmueble / 1000000).toFixed(0)}M
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      ${(cliente.montoFinanciar / 1000000).toFixed(0)}M
                    </TableCell>
                    <TableCell className="text-sm">{cliente.ciudadCliente}</TableCell>
                    <TableCell className="text-sm">{cliente.fechaAprobacion || '-'}</TableCell>
                    <TableCell className="text-center text-sm">
                      {cliente.vigenciaDias ? `${cliente.vigenciaDias}d` : '-'}
                    </TableCell>
                    <TableCell className="text-sm">{cliente.fechaVencimiento || '-'}</TableCell>
                    <TableCell className="text-center font-semibold text-sm">
                      {cliente.diasRestantes !== undefined ? `${cliente.diasRestantes}d` : '-'}
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
