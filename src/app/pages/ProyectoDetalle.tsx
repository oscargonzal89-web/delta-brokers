import { useMemo } from 'react';
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
import { ArrowLeft, Users, CheckCircle, TrendingUp } from 'lucide-react';
import { proyectos, clientes, importaciones } from '../data/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ProyectoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const proyecto = proyectos.find((p) => p.id === id);
  const clientesProyecto = clientes.filter((c) => c.proyectoId === id);
  const importacionesProyecto = importaciones.filter((i) => i.proyectoId === id);

  if (!proyecto) {
    return (
      <div className="p-6">
        <p>Proyecto no encontrado</p>
      </div>
    );
  }

  const stats = useMemo(() => {
    const preaprobacion = clientesProyecto.filter((c) => c.etapa === 'Preaprobación').length;
    const aprobacion = clientesProyecto.filter((c) => c.etapa === 'Aprobación').length;
    const legalizacion = clientesProyecto.filter((c) => c.etapa === 'Legalización').length;
    const desembolsados = clientesProyecto.filter((c) => c.etapa === 'Desembolsado').length;

    return { preaprobacion, aprobacion, legalizacion, desembolsados };
  }, [clientesProyecto]);

  const subestados = useMemo(() => {
    const counts: Record<string, number> = {};
    clientesProyecto.forEach((c) => {
      const key = `${c.etapa} - ${c.subestado}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [clientesProyecto]);

  const vencimientos = useMemo(() => {
    const rangos = {
      vencidos: clientesProyecto.filter((c) => c.diasRestantes !== undefined && c.diasRestantes <= 0),
      '1-15': clientesProyecto.filter(
        (c) => c.diasRestantes !== undefined && c.diasRestantes >= 1 && c.diasRestantes <= 15
      ),
      '16-30': clientesProyecto.filter(
        (c) => c.diasRestantes !== undefined && c.diasRestantes >= 16 && c.diasRestantes <= 30
      ),
      '31-60': clientesProyecto.filter(
        (c) => c.diasRestantes !== undefined && c.diasRestantes >= 31 && c.diasRestantes <= 60
      ),
      'mas-60': clientesProyecto.filter(
        (c) => c.diasRestantes !== undefined && c.diasRestantes > 60
      ),
    };
    return rangos;
  }, [clientesProyecto]);

  const funnelData = [
    { etapa: 'Preaprobación', cantidad: stats.preaprobacion },
    { etapa: 'Aprobación', cantidad: stats.aprobacion },
    { etapa: 'Legalización', cantidad: stats.legalizacion },
    { etapa: 'Desembolsado', cantidad: stats.desembolsados },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/proyectos')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">{proyecto.nombre}</h2>
          <p className="text-sm text-gray-500">
            {proyecto.ciudad} • {proyecto.bancoFinanciadorPrincipal}
          </p>
        </div>
      </div>

      <Tabs defaultValue="seguimiento" className="space-y-6">
        <TabsList>
          <TabsTrigger value="seguimiento">Seguimiento</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="vencimientos">Vencimientos</TabsTrigger>
          <TabsTrigger value="importaciones">Importaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="seguimiento" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard title="Preaprobación" value={stats.preaprobacion} icon={Users} />
            <KPICard title="Aprobación" value={stats.aprobacion} icon={CheckCircle} />
            <KPICard title="Legalización" value={stats.legalizacion} icon={TrendingUp} />
            <KPICard
              title="Desembolsados"
              value={stats.desembolsados}
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {subestados.map((sub) => (
                <div
                  key={sub.name}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <p className="text-xs text-gray-600 mb-1">{sub.name}</p>
                  <p className="text-xl font-semibold">{sub.value}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="clientes">
          <div className="bg-white rounded-lg border border-gray-200">
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
                {clientesProyecto.map((cliente) => (
                  <TableRow
                    key={cliente.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/clientes?destacar=${cliente.id}`)}
                  >
                    <TableCell className="font-medium">{cliente.nombre}</TableCell>
                    <TableCell>{cliente.cedula}</TableCell>
                    <TableCell>{cliente.bancoActual}</TableCell>
                    <TableCell>
                      <StatusBadge etapa={cliente.etapa} subestado={cliente.subestado} />
                    </TableCell>
                    <TableCell>
                      ${cliente.montoInmueble.toLocaleString('es-CO')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="vencimientos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <KPICard title="Vencidos (≤0)" value={vencimientos.vencidos.length} variant="danger" />
            <KPICard title="1-15 días" value={vencimientos['1-15'].length} variant="danger" />
            <KPICard title="16-30 días" value={vencimientos['16-30'].length} variant="warning" />
            <KPICard title="31-60 días" value={vencimientos['31-60'].length} variant="warning" />
            <KPICard title=">60 días" value={vencimientos['mas-60'].length} />
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold">Detalle de Vencimientos</h3>
            </div>
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
                {clientesProyecto
                  .filter((c) => c.diasRestantes !== undefined)
                  .sort((a, b) => (a.diasRestantes || 0) - (b.diasRestantes || 0))
                  .map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nombre}</TableCell>
                      <TableCell>
                        <StatusBadge etapa={cliente.etapa} />
                      </TableCell>
                      <TableCell>{cliente.diasRestantes} días</TableCell>
                      <TableCell>{cliente.fechaVencimiento}</TableCell>
                      <TableCell>
                        <VencimientoBadge diasRestantes={cliente.diasRestantes} />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="importaciones">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold">Historial de Importaciones</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="text-center">Insertados</TableHead>
                  <TableHead className="text-center">Actualizados</TableHead>
                  <TableHead className="text-center">Errores</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importacionesProyecto.map((imp) => (
                  <TableRow key={imp.id}>
                    <TableCell>
                      {new Date(imp.fecha).toLocaleString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="font-medium">{imp.archivo}</TableCell>
                    <TableCell>{imp.usuario}</TableCell>
                    <TableCell className="text-center">{imp.insertados}</TableCell>
                    <TableCell className="text-center">{imp.actualizados}</TableCell>
                    <TableCell className="text-center">
                      {imp.errores > 0 ? (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          {imp.errores}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
