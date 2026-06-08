import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { StatusBadge } from './StatusBadge';
import { VencimientoBadge } from './VencimientoBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  Calendar,
  Upload,
  FileText,
  History,
  Users,
  Loader2,
  Building2,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getCaseById,
  changeCaseStatus,
  changeCaseBank,
  getCaseEventLogs,
  getSubestados,
  updateAssignment,
} from '../../lib/api/cases';
import { getDocumentsByCase, uploadDocument, downloadDocument } from '../../lib/api/documents';
import { getAnalistas, getUsers } from '../../lib/api/users';
import { useAuth } from '../../lib/auth';
import { EventLogDetails } from './EventLogDetails';
import { EVENT_TYPE_LABELS } from '../../lib/eventLogFormat';
import { ETAPAS_MACRO } from '../../lib/etapas';
import { BANCOS } from '../../lib/constants';
import type { CaseWithDetails, EtapaMacro, CatalogoSubestado, Document as DocType } from '../../lib/types';

const UNASSIGNED_VALUE = '__unassigned__';

interface ClienteDetalleProps {
  clienteId: string;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function ClienteDetalle({ clienteId, open, onClose, onUpdate }: ClienteDetalleProps) {
  const { isAdmin } = useAuth();
  const [caso, setCaso] = useState<CaseWithDetails | null>(null);
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [eventLogs, setEventLogs] = useState<any[]>([]);
  const [analistas, setAnalistas] = useState<{ id: string; nombre: string; rol: string }[]>([]);
  const [userNameMap, setUserNameMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [nuevaEtapa, setNuevaEtapa] = useState<EtapaMacro>('preaprobacion');
  const [nuevoSubestado, setNuevoSubestado] = useState('');
  const [nuevoBanco, setNuevoBanco] = useState('');
  const [comentarioEstado, setComentarioEstado] = useState('');
  const [comentarioBanco, setComentarioBanco] = useState('');
  const [subestadosList, setSubestadosList] = useState<CatalogoSubestado[]>([]);
  const [savingEstado, setSavingEstado] = useState(false);
  const [savingBanco, setSavingBanco] = useState(false);
  const [savingAsignacion, setSavingAsignacion] = useState(false);
  const [selectedAnalista, setSelectedAnalista] = useState(UNASSIGNED_VALUE);
  const [uploadTipo, setUploadTipo] = useState<'carta_preaprobacion' | 'carta_aprobacion'>('carta_aprobacion');
  const [fechaCarta, setFechaCarta] = useState('');
  const [vigenciaDias, setVigenciaDias] = useState('90');
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [caseData, docsData, logsData] = await Promise.all([
        getCaseById(clienteId),
        getDocumentsByCase(clienteId),
        getCaseEventLogs(clienteId),
      ]);
      setCaso(caseData);
      setDocuments(docsData);
      setEventLogs(logsData);
      if (caseData.etapa_macro) {
        setNuevaEtapa(caseData.etapa_macro);
        setNuevoSubestado(caseData.subestado ?? '');
      }
      setNuevoBanco(caseData.banco_actual ?? '');
      setSelectedAnalista(caseData.analista_delta_id ?? UNASSIGNED_VALUE);
    } catch {
      toast.error('Error al cargar detalle del cliente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && clienteId) {
      fetchData();
    }
  }, [open, clienteId]);

  useEffect(() => {
    if (!open) return;

    getUsers()
      .then((users) => {
        const map = Object.fromEntries(users.map((u) => [u.id, u.nombre]));
        setUserNameMap(map);
      })
      .catch(() => setUserNameMap({}));

    if (isAdmin) {
      getAnalistas()
        .then((data) => setAnalistas(data.filter((a) => a.rol === 'analista')))
        .catch(() => setAnalistas([]));
    }
  }, [isAdmin, open]);

  useEffect(() => {
    getSubestados(nuevaEtapa).then(setSubestadosList).catch(() => setSubestadosList([]));
  }, [nuevaEtapa]);

  const handleCambioEstado = async () => {
    if (!nuevoSubestado) {
      toast.error('Selecciona un subestado');
      return;
    }
    setSavingEstado(true);
    try {
      await changeCaseStatus(clienteId, nuevaEtapa, nuevoSubestado, comentarioEstado || undefined);
      toast.success('Estado actualizado exitosamente');
      setComentarioEstado('');
      await fetchData();
      onUpdate?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar estado');
    } finally {
      setSavingEstado(false);
    }
  };

  const handleCambioBanco = async () => {
    if (!nuevoBanco) {
      toast.error('Selecciona un banco');
      return;
    }
    if (nuevoBanco === caso?.banco_actual) {
      toast.error('El banco seleccionado es el mismo que el actual');
      return;
    }
    setSavingBanco(true);
    try {
      await changeCaseBank(clienteId, nuevoBanco, comentarioBanco || undefined);
      toast.success('Banco actualizado exitosamente');
      setComentarioBanco('');
      await fetchData();
      onUpdate?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar banco');
    } finally {
      setSavingBanco(false);
    }
  };

  const handleAsignarAnalista = async () => {
    const analistaId = selectedAnalista === UNASSIGNED_VALUE ? null : selectedAnalista;
    if (analistaId === (caso?.analista_delta_id ?? null)) {
      toast.error('El analista seleccionado ya está asignado');
      return;
    }
    setSavingAsignacion(true);
    try {
      await updateAssignment(clienteId, { analista_delta_id: analistaId });
      toast.success(analistaId ? 'Analista asignado exitosamente' : 'Asignación removida');
      await fetchData();
      onUpdate?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al asignar analista');
    } finally {
      setSavingAsignacion(false);
    }
  };

  const handleDownload = async (filePath: string) => {
    try {
      const url = await downloadDocument(filePath);
      window.open(url, '_blank');
    } catch {
      toast.error('Error al descargar documento');
    }
  };

  const handleUploadFile = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.webp';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const metadata = uploadTipo === 'carta_aprobacion' && fechaCarta
          ? { fecha_carta: fechaCarta, vigencia_dias: parseInt(vigenciaDias) || 90 }
          : undefined;
        await uploadDocument(clienteId, file, uploadTipo, metadata);
        toast.success('Documento cargado exitosamente');
        setFechaCarta('');
        setVigenciaDias('90');
        await fetchData();
        onUpdate?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al cargar documento');
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="flex max-h-[92vh] w-[min(960px,calc(100vw-2rem))] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none">
        {loading || !caso ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <DialogHeader className="border-b border-gray-200 px-6 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
                <div>
                  <DialogTitle className="text-xl">{caso.nombre_completo}</DialogTitle>
                  <p className="mt-1 text-sm text-gray-500">CC {caso.cedula} · {caso.proyecto_nombre}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge
                    etapa={caso.etapa_macro ?? 'preaprobacion'}
                    subestado={caso.subestado ?? undefined}
                  />
                  <VencimientoBadge diasRestantes={caso.dias_restantes ?? undefined} />
                  {caso.fecha_vencimiento && (
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      Vence: {caso.fecha_vencimiento}
                    </Badge>
                  )}
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <section className="rounded-lg border border-gray-200 bg-gray-50/60 p-4">
                  <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                    <History className="h-4 w-4" />
                    Gestionar estado
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Etapa</Label>
                      <Select
                        value={nuevaEtapa}
                        onValueChange={(v) => {
                          setNuevaEtapa(v as EtapaMacro);
                          setNuevoSubestado('');
                        }}
                      >
                        <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ETAPAS_MACRO.map((e) => (
                            <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Subestado</Label>
                      <Select value={nuevoSubestado} onValueChange={setNuevoSubestado}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Selecciona subestado" />
                        </SelectTrigger>
                        <SelectContent>
                          {subestadosList.map((sub) => (
                            <SelectItem key={sub.id} value={sub.nombre}>{sub.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Comentario (opcional)</Label>
                      <Textarea
                        value={comentarioEstado}
                        onChange={(e) => setComentarioEstado(e.target.value)}
                        placeholder="Motivo del cambio..."
                        className="bg-white"
                        rows={2}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleCambioEstado}
                      disabled={savingEstado || !nuevoSubestado}
                    >
                      {savingEstado && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Guardar estado
                    </Button>
                  </div>
                </section>

                <div className="space-y-5">
                  {isAdmin && (
                    <section className="rounded-lg border border-blue-200 bg-blue-50/40 p-4">
                      <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                        <UserCheck className="h-4 w-4 text-blue-700" />
                        Asignar analista
                      </h4>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label>Analista responsable</Label>
                          <Select value={selectedAnalista} onValueChange={setSelectedAnalista}>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Selecciona un analista" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={UNASSIGNED_VALUE}>Sin asignar</SelectItem>
                              {analistas.map((a) => (
                                <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {caso.analista_delta_nombre && (
                            <p className="text-xs text-gray-500">
                              Actual: {caso.analista_delta_nombre}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={handleAsignarAnalista}
                          disabled={savingAsignacion}
                        >
                          {savingAsignacion && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Guardar asignación
                        </Button>
                      </div>
                    </section>
                  )}

                  <section className="rounded-lg border border-gray-200 bg-gray-50/60 p-4">
                    <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                      <Building2 className="h-4 w-4" />
                      Cambiar banco
                    </h4>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Banco actual: <span className="font-medium text-gray-900">{caso.banco_actual}</span>
                      </p>
                      <div className="space-y-1.5">
                        <Label>Nuevo banco</Label>
                        <Select value={nuevoBanco} onValueChange={setNuevoBanco}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Selecciona un banco" />
                          </SelectTrigger>
                          <SelectContent>
                            {BANCOS.map((b) => (
                              <SelectItem key={b} value={b}>{b}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Comentario (opcional)</Label>
                        <Textarea
                          value={comentarioBanco}
                          onChange={(e) => setComentarioBanco(e.target.value)}
                          placeholder="Motivo del cambio..."
                          className="bg-white"
                          rows={2}
                        />
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleCambioBanco}
                        disabled={savingBanco || !nuevoBanco}
                      >
                        {savingBanco && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar banco
                      </Button>
                    </div>
                  </section>
                </div>
              </div>

              <Separator className="my-6" />

              <Tabs defaultValue="resumen" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="resumen">Resumen</TabsTrigger>
                  <TabsTrigger value="documentos">Documentos ({documents.length})</TabsTrigger>
                  <TabsTrigger value="historial">Historial ({eventLogs.length})</TabsTrigger>
                  <TabsTrigger value="asignaciones">Asignaciones</TabsTrigger>
                </TabsList>

                <TabsContent value="resumen" className="space-y-6">
                  {/* Datos del cliente */}
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <Users className="h-4 w-4" />
                      Datos del cliente
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Nombre completo</p>
                        <p className="font-medium">{caso.nombre_completo}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cédula</p>
                        <p className="font-medium">{caso.cedula}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Celular</p>
                        <p className="font-medium">{caso.celular || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Correo</p>
                        <p className="font-medium">{caso.correo || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Ciudad cliente</p>
                        <p className="font-medium">{caso.ciudad_cliente || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Ciudad inmueble</p>
                        <p className="font-medium">{caso.ciudad_inmueble || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Torre</p>
                        <p className="font-medium">{caso.torre || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Apto</p>
                        <p className="font-medium">{caso.apto || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Ocupación</p>
                        <p className="font-medium">{caso.ocupacion || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Comprador 2 */}
                  <Separator />
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <Users className="h-4 w-4" />
                      Comprador 2
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Nombre</p>
                        <p className="font-medium">{caso.nombre_cliente_comprador_2 || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cédula</p>
                        <p className="font-medium">{caso.cedula_comprador_2 || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Celular</p>
                        <p className="font-medium">{caso.celular_comprador_2 || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Correo</p>
                        <p className="font-medium">{caso.correo_comprador_2 || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Scoring / Capacidad financiera */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold">Scoring y capacidad financiera</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Calificación solicitante</p>
                        <p className="font-medium">{caso.calificacion_solicitante || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Score</p>
                        <p className="font-medium">{caso.score != null ? caso.score : '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Puntaje mínimo</p>
                        <p className="font-medium">{caso.puntaje_minimo != null ? caso.puntaje_minimo : '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Ingreso</p>
                        <p className="font-medium">
                          {caso.ingreso_automatico != null ? `$${caso.ingreso_automatico.toLocaleString('es-CO')}` : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Deudas</p>
                        <p className="font-medium">
                          {caso.deudas != null ? `$${caso.deudas.toLocaleString('es-CO')}` : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Gastos básicos</p>
                        <p className="font-medium">
                          {caso.gastos_basicos != null ? `$${caso.gastos_basicos.toLocaleString('es-CO')}` : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total egresos</p>
                        <p className="font-medium">
                          {caso.total_egresos != null ? `$${caso.total_egresos.toLocaleString('es-CO')}` : '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Proyecto */}
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <Building2 className="h-4 w-4" />
                      Proyecto
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Nombre</p>
                        <p className="font-medium">{caso.proyecto_nombre}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Ciudad</p>
                        <p className="font-medium">{caso.proyecto_ciudad || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Banco financiador</p>
                        <p className="font-medium">{caso.banco_financiador_principal || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tipo de vivienda</p>
                        <p className="font-medium">{caso.tipo_vivienda || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Etapa del proyecto</p>
                        <p className="font-medium">{caso.etapa_proyecto || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Fecha proyectada escritura</p>
                        <p className="font-medium">{caso.fecha_proyectada_escritura || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Información financiera del crédito */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold">Información del crédito</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Monto inmueble</p>
                        <p className="text-lg font-medium">
                          ${(caso.monto_inmueble ?? 0).toLocaleString('es-CO')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Monto a financiar</p>
                        <p className="text-lg font-medium">
                          ${(caso.monto_a_financiar ?? 0).toLocaleString('es-CO')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Banco actual</p>
                        <p className="font-medium">{caso.banco_actual}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Etapa</p>
                        <StatusBadge
                          etapa={caso.etapa_macro ?? 'preaprobacion'}
                          subestado={caso.subestado ?? undefined}
                        />
                      </div>
                      {caso.fecha_carta_aprobacion && (
                        <>
                          <div>
                            <p className="text-gray-600">Fecha aprobación</p>
                            <p className="font-medium">{caso.fecha_carta_aprobacion}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Vigencia</p>
                            <p className="font-medium">{caso.vigencia_dias} días</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Fecha vencimiento</p>
                            <p className="font-medium">{caso.fecha_vencimiento}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Días restantes</p>
                            <VencimientoBadge diasRestantes={caso.dias_restantes ?? undefined} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documentos" className="space-y-4">
                  <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4">
                    <h4 className="mb-3 text-sm font-semibold">Subir documento</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Tipo</Label>
                        <Select value={uploadTipo} onValueChange={(v: 'carta_preaprobacion' | 'carta_aprobacion') => setUploadTipo(v)}>
                          <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="carta_preaprobacion">Carta de preaprobación</SelectItem>
                            <SelectItem value="carta_aprobacion">Carta de aprobación</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {uploadTipo === 'carta_aprobacion' && (
                        <>
                          <div className="space-y-1.5">
                            <Label>Fecha de aprobación</Label>
                            <Input
                              type="date"
                              value={fechaCarta}
                              onChange={(e) => setFechaCarta(e.target.value)}
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Vigencia (días)</Label>
                            <Input
                              type="number"
                              value={vigenciaDias}
                              onChange={(e) => setVigenciaDias(e.target.value)}
                              min="1"
                              max="365"
                              className="bg-white"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={handleUploadFile}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Seleccionar archivo
                    </Button>
                  </div>

                  {documents.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      <FileText className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                      <p>No hay documentos cargados</p>
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">{doc.file_name}</p>
                            <p className="text-xs text-gray-500">
                              {doc.tipo === 'carta_preaprobacion' ? 'Carta preaprobación' : 'Carta aprobación'}
                              {' · '}
                              {new Date(doc.uploaded_at).toLocaleDateString('es-CO')}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleDownload(doc.file_url)}>
                          Descargar
                        </Button>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="historial">
                  {eventLogs.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-500">
                      No hay eventos en el historial
                    </p>
                  ) : (
                    <div className="relative">
                      <div className="absolute top-0 bottom-0 left-4 w-px bg-gray-200" />
                      {eventLogs.map((evento) => (
                        <div key={evento.id} className="relative flex gap-4 pb-8 last:pb-0">
                          <div className="relative z-10">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                              <History className="h-4 w-4 text-gray-600" />
                            </div>
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="text-sm font-medium">
                              {EVENT_TYPE_LABELS[evento.event_type] ?? evento.event_type}
                            </p>
                            {evento.comment && (
                              <p className="mt-1 rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                                <span className="font-medium">Comentario: </span>
                                {evento.comment}
                              </p>
                            )}
                            <EventLogDetails
                              eventType={evento.event_type}
                              payload={evento.payload as Record<string, unknown>}
                              userNameMap={userNameMap}
                            />
                            <div className="mt-2 flex items-center gap-2">
                              <p className="text-xs text-gray-500">
                                {new Date(evento.created_at).toLocaleString('es-CO', {
                                  year: 'numeric', month: 'short', day: 'numeric',
                                  hour: '2-digit', minute: '2-digit',
                                })}
                              </p>
                              {evento.actor?.nombre && (
                                <>
                                  <span className="text-xs text-gray-400">·</span>
                                  <p className="text-xs text-gray-500">{evento.actor.nombre}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="asignaciones">
                  <div className="space-y-3">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-sm font-medium">Analista Delta</p>
                      <p className="mt-1 text-sm text-gray-600">{caso.analista_delta_nombre || 'Sin asignar'}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-sm font-medium">Analista de radicación</p>
                      <p className="mt-1 text-sm text-gray-600">{caso.analista_radicacion_nombre || 'Sin asignar'}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-sm font-medium">Analista de legalización</p>
                      <p className="mt-1 text-sm text-gray-600">{caso.analista_legalizacion_nombre || 'Sin asignar'}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
