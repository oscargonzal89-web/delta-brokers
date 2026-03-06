import { useState, useEffect, useCallback } from 'react';
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
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { StatusBadge } from '../components/StatusBadge';
import { VencimientoBadge } from '../components/VencimientoBadge';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCases, getSubestados, type CaseFilters } from '../../lib/api/cases';
import { getAnalistas } from '../../lib/api/users';
import { ClienteDetalle } from '../components/ClienteDetalle';
import type { CaseWithDetails, EtapaMacro, CatalogoSubestado } from '../../lib/types';

const BANCOS = [
  'Bancolombia', 'Davivienda', 'Banco de Bogotá', 'BBVA Colombia',
  'Banco Popular', 'Banco Occidente', 'Itaú',
];
const CIUDADES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga'];
const ETAPAS: { value: EtapaMacro; label: string }[] = [
  { value: 'preaprobacion', label: 'Preaprobación' },
  { value: 'aprobacion', label: 'Aprobación' },
  { value: 'legalizacion', label: 'Legalización' },
  { value: 'desembolsado', label: 'Desembolsado' },
];

const PAGE_SIZE = 50;

export function Clientes() {
  const [searchParams] = useSearchParams();
  const [busqueda, setBusqueda] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filtroEtapa, setFiltroEtapa] = useState<string>('todas');
  const [filtroSubestado, setFiltroSubestado] = useState<string>('todos');
  const [filtroBanco, setFiltroBanco] = useState<string>('todos');
  const [filtroCiudad, setFiltroCiudad] = useState<string>('todas');
  const [filtroAnalista, setFiltroAnalista] = useState<string>('todos');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [cases, setCases] = useState<CaseWithDetails[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [analistas, setAnalistas] = useState<{ id: string; nombre: string }[]>([]);
  const [subestadosList, setSubestadosList] = useState<CatalogoSubestado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(busqueda), 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  useEffect(() => {
    const etapa = searchParams.get('etapa');
    const ciudad = searchParams.get('ciudad');
    const banco = searchParams.get('banco');
    const analista = searchParams.get('analista');
    const destacar = searchParams.get('destacar');

    if (etapa) setFiltroEtapa(etapa);
    if (ciudad) setFiltroCiudad(ciudad);
    if (banco) setFiltroBanco(banco);
    if (analista) setFiltroAnalista(analista);
    if (destacar) setClienteSeleccionado(destacar);
  }, [searchParams]);

  useEffect(() => {
    getAnalistas().then(setAnalistas).catch(() => {});
  }, []);

  useEffect(() => {
    if (filtroEtapa !== 'todas') {
      getSubestados(filtroEtapa as EtapaMacro)
        .then(setSubestadosList)
        .catch(() => setSubestadosList([]));
    } else {
      setSubestadosList([]);
    }
    setFiltroSubestado('todos');
  }, [filtroEtapa]);

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      const filters: CaseFilters = { page, pageSize: PAGE_SIZE };

      if (filtroEtapa !== 'todas') filters.etapaMacro = filtroEtapa as EtapaMacro;
      if (filtroSubestado !== 'todos') filters.subestado = filtroSubestado;
      if (filtroBanco !== 'todos') filters.bancoActual = filtroBanco;
      if (filtroCiudad !== 'todas') filters.ciudadInmueble = filtroCiudad;
      if (filtroAnalista !== 'todos') filters.analistaId = filtroAnalista;
      if (debouncedSearch) filters.search = debouncedSearch;

      const result = await getCases(filters);
      setCases(result.data);
      setTotalCount(result.count);
      setTotalPages(result.totalPages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, [page, filtroEtapa, filtroSubestado, filtroBanco, filtroCiudad, filtroAnalista, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [filtroEtapa, filtroSubestado, filtroBanco, filtroCiudad, filtroAnalista, debouncedSearch]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

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

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <Label className="text-xs text-gray-600">Etapa</Label>
            <Select value={filtroEtapa} onValueChange={setFiltroEtapa}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {ETAPAS.map((e) => (
                  <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                ))}
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
                {subestadosList.map((sub) => (
                  <SelectItem key={sub.id} value={sub.nombre}>{sub.nombre}</SelectItem>
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
                {BANCOS.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
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
                {CIUDADES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
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
                  <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Mostrando {cases.length} de {totalCount} clientes
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
            <Button variant="outline" className="mt-3" onClick={fetchCases}>Reintentar</Button>
          </div>
        ) : (
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
                  <TableHead>Fecha Aprob.</TableHead>
                  <TableHead className="text-center">Días Rest.</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                      No se encontraron clientes con los filtros seleccionados
                    </TableCell>
                  </TableRow>
                ) : (
                  cases.map((c) => (
                    <TableRow
                      key={c.case_id}
                      className="cursor-pointer hover:bg-gray-50"
                      onDoubleClick={() => setClienteSeleccionado(c.case_id!)}
                    >
                      <TableCell className="font-medium">{c.nombre_completo}</TableCell>
                      <TableCell className="text-sm">{c.cedula}</TableCell>
                      <TableCell className="text-sm">{c.banco_actual}</TableCell>
                      <TableCell>
                        <StatusBadge etapa={c.etapa_macro ?? 'preaprobacion'} />
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">{c.subestado}</TableCell>
                      <TableCell className="text-right text-sm">
                        {c.monto_inmueble ? `$${(c.monto_inmueble / 1000000).toFixed(0)}M` : '-'}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {c.monto_a_financiar ? `$${(c.monto_a_financiar / 1000000).toFixed(0)}M` : '-'}
                      </TableCell>
                      <TableCell className="text-sm">{c.fecha_carta_aprobacion || '-'}</TableCell>
                      <TableCell className="text-center font-semibold text-sm">
                        {c.dias_restantes != null ? `${c.dias_restantes}d` : '-'}
                      </TableCell>
                      <TableCell>
                        <VencimientoBadge diasRestantes={c.dias_restantes ?? undefined} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {clienteSeleccionado && (
        <ClienteDetalle
          clienteId={clienteSeleccionado}
          open={!!clienteSeleccionado}
          onClose={() => setClienteSeleccionado(null)}
          onUpdate={fetchCases}
        />
      )}
    </div>
  );
}
