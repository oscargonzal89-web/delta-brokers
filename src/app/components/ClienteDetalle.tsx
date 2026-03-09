import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Calendar, Upload, FileText, History, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getCaseById, changeCaseStatus, changeCaseBank, getCaseEventLogs, getSubestados } from '../../lib/api/cases';
import { getDocumentsByCase, uploadDocument, downloadDocument } from '../../lib/api/documents';
import { getAnalistas } from '../../lib/api/users';
import type { CaseWithDetails, EtapaMacro, CatalogoSubestado, Document as DocType } from '../../lib/types';

const ETAPAS: { value: EtapaMacro; label: string }[] = [
  { value: 'preaprobacion', label: 'Preaprobación' },
  { value: 'aprobacion', label: 'Aprobación' },
  { value: 'legalizacion', label: 'Legalización' },
  { value: 'desembolsado', label: 'Desembolsado' },
];

const BANCOS = [
  'Bancolombia', 'Davivienda', 'Banco de Bogotá', 'BBVA Colombia',
  'Banco Popular', 'Banco Occidente', 'Itaú',
];

interface ClienteDetalleProps {
  clienteId: string;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function ClienteDetalle({ clienteId, open, onClose, onUpdate }: ClienteDetalleProps) {
  const [caso, setCaso] = useState<CaseWithDetails | null>(null);
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [eventLogs, setEventLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [cambioEstadoOpen, setCambioEstadoOpen] = useState(false);
  const [cambioBancoOpen, setCambioBancoOpen] = useState(false);
  const [nuevaEtapa, setNuevaEtapa] = useState<EtapaMacro>('preaprobacion');
  const [nuevoSubestado, setNuevoSubestado] = useState('');
  const [nuevoBanco, setNuevoBanco] = useState('');
  const [comentario, setComentario] = useState('');
  const [subestadosList, setSubestadosList] = useState<CatalogoSubestado[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTipo, setUploadTipo] = useState<'carta_preaprobacion' | 'carta_aprobacion'>('carta_aprobacion');
  const [fechaCarta, setFechaCarta] = useState('');
  const [vigenciaDias, setVigenciaDias] = useState('90');

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
      }
    } catch (err) {
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
    getSubestados(nuevaEtapa).then(setSubestadosList).catch(() => setSubestadosList([]));
  }, [nuevaEtapa]);

  const handleCambioEstado = async () => {
    if (!nuevoSubestado) {
      toast.error('Selecciona un subestado');
      return;
    }
    setSaving(true);
    try {
      await changeCaseStatus(clienteId, nuevaEtapa, nuevoSubestado, comentario || undefined);
      toast.success('Estado actualizado exitosamente');
      setCambioEstadoOpen(false);
      setComentario('');
      fetchData();
      onUpdate?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar estado');
    } finally {
      setSaving(false);
    }
  };

  const handleCambioBanco = async () => {
    if (!nuevoBanco) {
      toast.error('Selecciona un banco');
      return;
    }
    setSaving(true);
    try {
      await changeCaseBank(clienteId, nuevoBanco, comentario || undefined);
      toast.success('Banco actualizado exitosamente');
      setCambioBancoOpen(false);
      setNuevoBanco('');
      setComentario('');
      fetchData();
      onUpdate?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar banco');
    } finally {
      setSaving(false);
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
      setSaving(true);
      try {
        const metadata = uploadTipo === 'carta_aprobacion' && fechaCarta
          ? { fecha_carta: fechaCarta, vigencia_dias: parseInt(vigenciaDias) || 90 }
          : undefined;
        await uploadDocument(clienteId, file, uploadTipo, metadata);
        toast.success('Documento cargado exitosamente');
        setUploadOpen(false);
        setFechaCarta('');
        setVigenciaDias('90');
        fetchData();
        onUpdate?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al cargar documento');
      } finally {
        setSaving(false);
      }
    };
    input.click();
  };

  const eventTypeLabels: Record<string, string> = {
    STATUS_CHANGED: 'Cambio de estado',
    BANK_CHANGED: 'Cambio de banco',
    ASSIGNMENT_CHANGED: 'Cambio de asignación',
    DOC_UPLOADED: 'Documento cargado',
    IMPORTED_CREATED: 'Creado por importación',
    IMPORTED_UPDATED: 'Actualizado por importación',
    COMMENT_ADDED: 'Comentario',
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[600px] lg:w-[800px] overflow-y-auto">
        {loading || !caso ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{caso.nombre_completo}</h3>
                  <p className="text-sm text-gray-500 mt-1">CC {caso.cedula}</p>
                </div>
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div className="flex flex-wrap gap-3">
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

              <div className="flex flex-wrap gap-2">
                <Dialog open={cambioEstadoOpen} onOpenChange={setCambioEstadoOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Cambiar Estado</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cambiar Estado</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Nueva Etapa</Label>
                        <Select value={nuevaEtapa} onValueChange={(v) => { setNuevaEtapa(v as EtapaMacro); setNuevoSubestado(''); }}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ETAPAS.map((e) => (
                              <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Nuevo Subestado</Label>
                        <Select value={nuevoSubestado} onValueChange={setNuevoSubestado}>
                          <SelectTrigger><SelectValue placeholder="Selecciona subestado" /></SelectTrigger>
                          <SelectContent>
                            {subestadosList.map((sub) => (
                              <SelectItem key={sub.id} value={sub.nombre}>{sub.nombre}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Comentario (opcional)</Label>
                        <Textarea value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Motivo del cambio..." />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setCambioEstadoOpen(false)} disabled={saving}>Cancelar</Button>
                      <Button onClick={handleCambioEstado} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Guardar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={cambioBancoOpen} onOpenChange={setCambioBancoOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Cambiar Banco</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cambiar Banco</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label className="text-sm text-gray-600">Banco Actual</Label>
                        <p className="text-sm font-medium mt-1">{caso.banco_actual}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Nuevo Banco</Label>
                        <Select value={nuevoBanco} onValueChange={setNuevoBanco}>
                          <SelectTrigger><SelectValue placeholder="Selecciona un banco" /></SelectTrigger>
                          <SelectContent>
                            {BANCOS.map((b) => (
                              <SelectItem key={b} value={b}>{b}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Comentario (opcional)</Label>
                        <Textarea value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Motivo del cambio..." />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setCambioBancoOpen(false)} disabled={saving}>Cancelar</Button>
                      <Button onClick={handleCambioBanco} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Cambiar Banco
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Subir Documento
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Subir Documento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Tipo de Documento</Label>
                        <Select value={uploadTipo} onValueChange={(v: any) => setUploadTipo(v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="carta_preaprobacion">Carta de Preaprobación</SelectItem>
                            <SelectItem value="carta_aprobacion">Carta de Aprobación</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {uploadTipo === 'carta_aprobacion' && (
                        <>
                          <div className="space-y-2">
                            <Label>Fecha de Aprobación</Label>
                            <Input type="date" value={fechaCarta} onChange={(e) => setFechaCarta(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Vigencia (días)</Label>
                            <Input type="number" value={vigenciaDias} onChange={(e) => setVigenciaDias(e.target.value)} min="1" max="365" />
                          </div>
                          <p className="text-xs text-gray-500">
                            Al subir la carta de aprobación se actualizará automáticamente la fecha y vigencia del caso.
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setUploadOpen(false)} disabled={saving}>Cancelar</Button>
                      <Button onClick={handleUploadFile} disabled={saving}>
                        {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Seleccionar Archivo
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Separator />

              <Tabs defaultValue="resumen" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="resumen">Resumen</TabsTrigger>
                  <TabsTrigger value="documentos">Documentos ({documents.length})</TabsTrigger>
                  <TabsTrigger value="historial">Historial ({eventLogs.length})</TabsTrigger>
                  <TabsTrigger value="asignaciones">Asignaciones</TabsTrigger>
                </TabsList>

                <TabsContent value="resumen" className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Datos del Cliente
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Nombre Completo</p>
                        <p className="font-medium">{caso.nombre_completo}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cédula</p>
                        <p className="font-medium">{caso.cedula}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Ciudad</p>
                        <p className="font-medium">{caso.ciudad_cliente || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Proyecto</p>
                        <p className="font-medium">{caso.proyecto_nombre}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-semibold mb-3">Información Financiera</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Monto Inmueble</p>
                        <p className="font-medium text-lg">
                          ${(caso.monto_inmueble ?? 0).toLocaleString('es-CO')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Monto a Financiar</p>
                        <p className="font-medium text-lg">
                          ${(caso.monto_a_financiar ?? 0).toLocaleString('es-CO')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Banco Actual</p>
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
                            <p className="text-gray-600">Fecha Aprobación</p>
                            <p className="font-medium">{caso.fecha_carta_aprobacion}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Vigencia</p>
                            <p className="font-medium">{caso.vigencia_dias} días</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Fecha Vencimiento</p>
                            <p className="font-medium">{caso.fecha_vencimiento}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Días Restantes</p>
                            <VencimientoBadge diasRestantes={caso.dias_restantes ?? undefined} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documentos" className="space-y-4">
                  {documents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No hay documentos cargados</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => setUploadOpen(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Subir primer documento
                      </Button>
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">{doc.file_name}</p>
                            <p className="text-xs text-gray-500">
                              {doc.tipo === 'carta_preaprobacion' ? 'Carta Preaprobación' : 'Carta Aprobación'}
                              {' • '}
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
                    <p className="text-sm text-gray-500 text-center py-8">
                      No hay eventos en el historial
                    </p>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
                      {eventLogs.map((evento) => (
                        <div key={evento.id} className="relative flex gap-4 pb-8 last:pb-0">
                          <div className="relative z-10">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-gray-300">
                              <History className="h-4 w-4 text-gray-600" />
                            </div>
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="text-sm font-medium">
                              {eventTypeLabels[evento.event_type] ?? evento.event_type}
                            </p>
                            {evento.comment && (
                              <p className="text-sm text-gray-600 mt-0.5">{evento.comment}</p>
                            )}
                            {evento.payload && typeof evento.payload === 'object' && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {evento.payload.from && evento.payload.to
                                  ? `${evento.payload.from} → ${evento.payload.to}`
                                  : JSON.stringify(evento.payload)}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500">
                                {new Date(evento.created_at).toLocaleString('es-CO', {
                                  year: 'numeric', month: 'short', day: 'numeric',
                                  hour: '2-digit', minute: '2-digit',
                                })}
                              </p>
                              {evento.actor?.nombre && (
                                <>
                                  <span className="text-xs text-gray-400">•</span>
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
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <p className="text-sm font-medium">Analista Delta</p>
                      <p className="text-sm text-gray-600 mt-1">{caso.analista_delta_nombre || 'Sin asignar'}</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <p className="text-sm font-medium">Analista de Radicación</p>
                      <p className="text-sm text-gray-600 mt-1">{caso.analista_radicacion_nombre || 'Sin asignar'}</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <p className="text-sm font-medium">Analista de Legalización</p>
                      <p className="text-sm text-gray-600 mt-1">{caso.analista_legalizacion_nombre || 'Sin asignar'}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
