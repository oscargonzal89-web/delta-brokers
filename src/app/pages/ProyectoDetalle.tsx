import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { VencimientoBadge } from '../components/VencimientoBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { ArrowLeft, Users, CheckCircle, TrendingUp, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getProjectById, getProjectKpis, getSubestadosPorProyecto } from '../../lib/api/projects';
import { getCases } from '../../lib/api/cases';
import { getImports } from '../../lib/api/imports';
import { getVencimientosPorRango } from '../../lib/api/analytics';
import type { Project, DashboardKpi, CaseWithDetails, SubestadoPorProyecto, VencimientoPorRango } from '../../lib/types';

const etapaLabels: Record<string, string> = {
  preaprobacion: 'Preaprobación',
  aprobacion: 'Aprobación',
  legalizacion: 'Legalización',
  desembolsado: 'Desembolsado',
};

export function ProyectoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [kpi, setKpi] = useState<DashboardKpi | null>(null);
  const [clients, setClients] = useState<CaseWithDetails[]>([]);
  const [subestados, setSubestados] = useState<SubestadoPorProyecto[]>([]);
  const [vencimientos, setVencimientos] = useState<VencimientoPorRango[]>([]);
  const [importaciones, setImportaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectData, kpisData, casesResult, subestadosData, vencimientosData, importsData] =
          await Promise.all([
            getProjectById(id),
            getProjectKpis(id),
            getCases({ projectId: id, pageSize: 500 }),
            getSubestadosPorProyecto(id),
            getVencimientosPorRango({ projectId: id }),
            getImports(id),
          ]);

        setProject(projectData);
        setKpi(kpisData[0] ?? null);
        setClients(casesResult.data);
        setSubestados(subestadosData);
        setVencimientos(vencimientosData);
        setImportaciones(importsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar proyecto');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">
            {error ?? 'Proyecto no encontrado'}
          </p>
          <Button variant="outline" className="mt-3" onClick={() => navigate('/proyectos')}>
            Volver a Proyectos
          </Button>
        </div>
      </div>
    );
  }

  const funnelData = [
    { etapa: 'Preaprobación', cantidad: kpi?.preaprobacion ?? 0 },
    { etapa: 'Aprobación', cantidad: kpi?.aprobacion ?? 0 },
    { etapa: 'Legalización', cantidad: kpi?.legalizacion ?? 0 },
    { etapa: 'Desembolsado', cantidad: kpi?.desembolsado ?? 0 },
  ];

  const vencimientoRangos = {
    vencidos: vencimientos.filter((v) => v.rango_vencimiento === 'vencido'),
    '1-15': vencimientos.filter((v) => v.rango_vencimiento === '1-15'),
    '16-30': vencimientos.filter((v) => v.rango_vencimiento === '16-30'),
    '31-60': vencimientos.filter((v) => v.rango_vencimiento === '31-60'),
    'mas-60': vencimientos.filter((v) => v.rango_vencimiento === 'mas-60'),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/proyectos')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">{project.nombre}</h2>
          <p className="text-sm text-gray-500">
            {project.ciudad} • {project.banco_financiador_principal}
          </p>
        </div>
      </div>

      <Tabs defaultValue="seguimiento" className="space-y-6">
        <TabsList>
          <TabsTrigger value="seguimiento">Seguimiento</TabsTrigger>
          <TabsTrigger value="clientes">Clientes ({clients.length})</TabsTrigger>
          <TabsTrigger value="vencimientos">Vencimientos</TabsTrigger>
          <TabsTrigger value="importaciones">Importaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="seguimiento" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard title="Preaprobación" value={kpi?.preaprobacion ?? 0} icon={Users} />
            <KPICard title="Aprobación" value={kpi?.aprobacion ?? 0} icon={CheckCircle} />
            <KPICard title="Legalización" value={kpi?.legalizacion ?? 0} icon={TrendingUp} />
            <KPICard
              title="Desembolsados"
              value={kpi?.desembolsado ?? 0}
              icon={CheckCircle}
              variant="success"
            />
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-4">Embudo de Conversión</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="etapa" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-4">Distribución por Subestado</h3>
            {subestados.length === 0 ? (
              <p className="text-sm text-gray-500">Sin datos de subestados</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {subestados.map((sub) => (
                  <div
                    key={`${sub.etapa_macro}-${sub.subestado}`}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <p className="text-xs text-gray-600 mb-1">
                      {etapaLabels[sub.etapa_macro ?? ''] ?? sub.etapa_macro} - {sub.subestado}
                    </p>
                    <p className="text-xl font-semibold">{sub.cantidad}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="clientes">
          <div className="bg-white rounded-lg border border-gray-200">
            {clients.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay clientes en este proyecto
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Cédula</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Monto Inmueble</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((cliente) => (
                    <TableRow
                      key={cliente.case_id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/clientes?destacar=${cliente.case_id}`)}
                    >
                      <TableCell className="font-medium">{cliente.nombre_completo}</TableCell>
                      <TableCell>{cliente.cedula}</TableCell>
                      <TableCell>{cliente.banco_actual}</TableCell>
                      <TableCell>
                        <StatusBadge
                          etapa={cliente.etapa_macro ?? 'preaprobacion'}
                          subestado={cliente.subestado ?? undefined}
                        />
                      </TableCell>
                      <TableCell>
                        ${(cliente.monto_inmueble ?? 0).toLocaleString('es-CO')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="vencimientos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <KPICard title="Vencidos (≤0)" value={vencimientoRangos.vencidos.length} variant="danger" />
            <KPICard title="1-15 días" value={vencimientoRangos['1-15'].length} variant="danger" />
            <KPICard title="16-30 días" value={vencimientoRangos['16-30'].length} variant="warning" />
            <KPICard title="31-60 días" value={vencimientoRangos['31-60'].length} variant="warning" />
            <KPICard title=">60 días" value={vencimientoRangos['mas-60'].length} />
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold">Detalle de Vencimientos</h3>
            </div>
            {vencimientos.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay vencimientos registrados
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Días Restantes</TableHead>
                    <TableHead>Fecha Vencimiento</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vencimientos
                    .sort((a, b) => (a.dias_restantes ?? 0) - (b.dias_restantes ?? 0))
                    .map((v) => (
                      <TableRow key={v.case_id}>
                        <TableCell className="font-medium">{v.nombre_completo}</TableCell>
                        <TableCell>
                          <StatusBadge etapa={v.etapa_macro ?? 'preaprobacion'} />
                        </TableCell>
                        <TableCell>{v.dias_restantes} días</TableCell>
                        <TableCell>{v.fecha_vencimiento}</TableCell>
                        <TableCell>
                          <VencimientoBadge diasRestantes={v.dias_restantes ?? undefined} />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="importaciones">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold">Historial de Importaciones</h3>
            </div>
            {importaciones.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay importaciones para este proyecto
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Insertados</TableHead>
                    <TableHead className="text-center">Actualizados</TableHead>
                    <TableHead className="text-center">Errores</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importaciones.map((imp) => (
                    <TableRow key={imp.id}>
                      <TableCell>
                        {new Date(imp.uploaded_at).toLocaleString('es-CO', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="font-medium">{imp.file_name}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            imp.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : imp.status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {imp.status === 'completed' ? 'Completado' : imp.status === 'failed' ? 'Fallido' : 'Procesando'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{imp.inserted_count}</TableCell>
                      <TableCell className="text-center">{imp.updated_count}</TableCell>
                      <TableCell className="text-center">
                        {imp.error_count > 0 ? (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            {imp.error_count}
                          </span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
