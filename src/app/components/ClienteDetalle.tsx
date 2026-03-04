import { useMemo, useState } from 'react';
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
import { Calendar, Upload, FileText, History, Users } from 'lucide-react';
import { clientes, proyectos, historialEventos, bancos, subestadosPorEtapa } from '../data/mock-data';
import { toast } from 'sonner';

interface ClienteDetalleProps {
  clienteId: string;
  open: boolean;
  onClose: () => void;
}

export function ClienteDetalle({ clienteId, open, onClose }: ClienteDetalleProps) {
  const [cambioEstadoOpen, setCambioEstadoOpen] = useState(false);
  const [cambioBancoOpen, setCambioBancoOpen] = useState(false);

  const cliente = clientes.find((c) => c.id === clienteId);
  const proyecto = cliente ? proyectos.find((p) => p.id === cliente.proyectoId) : null;
  const historial = historialEventos.filter((h) => h.clienteId === clienteId);

  if (!cliente || !proyecto) {
    return null;
  }

  const handleCambioEstado = () => {
    toast.success('Estado actualizado exitosamente');
    setCambioEstadoOpen(false);
  };

  const handleCambioBanco = () => {
    toast.success('Banco actualizado exitosamente');
    setCambioBancoOpen(false);
  };

  const handleSubirDocumento = () => {
    toast.success('Documento cargado exitosamente');
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[600px] lg:w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold">{cliente.nombre}</h3>
              <p className="text-sm text-gray-500 mt-1">CC {cliente.cedula}</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Header con badges y alertas */}
          <div className="flex flex-wrap gap-3">
            <StatusBadge etapa={cliente.etapa} subestado={cliente.subestado} />
            <VencimientoBadge diasRestantes={cliente.diasRestantes} />
            {cliente.fechaVencimiento && (
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                Vence: {cliente.fechaVencimiento}
              </Badge>
            )}
          </div>

          {/* Acciones Rápidas */}
          <div className="flex flex-wrap gap-2">
            <Dialog open={cambioEstadoOpen} onOpenChange={setCambioEstadoOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Cambiar Estado
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cambiar Estado</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nueva Etapa</Label>
                    <Select defaultValue={cliente.etapa}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Preaprobación">Preaprobación</SelectItem>
                        <SelectItem value="Aprobación">Aprobación</SelectItem>
                        <SelectItem value="Legalización">Legalización</SelectItem>
                        <SelectItem value="Desembolsado">Desembolsado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nuevo Subestado</Label>
                    <Select defaultValue={cliente.subestado}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {subestadosPorEtapa[cliente.etapa].map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCambioEstadoOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCambioEstado}>Guardar</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={cambioBancoOpen} onOpenChange={setCambioBancoOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Cambiar Banco
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cambiar Banco</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label className="text-sm text-gray-600">Banco Actual</Label>
                    <p className="text-sm font-medium mt-1">{cliente.bancoActual}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Nuevo Banco</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un banco" />
                      </SelectTrigger>
                      <SelectContent>
                        {bancos.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCambioBancoOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCambioBanco}>Cambiar Banco</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={handleSubirDocumento}>
              <Upload className="h-4 w-4 mr-2" />
              Subir Documento
            </Button>

            <Button variant="outline" size="sm">
              Reasignar
            </Button>
          </div>

          <Separator />

          {/* Tabs */}
          <Tabs defaultValue="resumen" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
              <TabsTrigger value="historial">Historial</TabsTrigger>
              <TabsTrigger value="asignaciones">Asignaciones</TabsTrigger>
            </TabsList>

            {/* Tab: Resumen */}
            <TabsContent value="resumen" className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Datos del Cliente
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Nombre Completo</p>
                    <p className="font-medium">{cliente.nombre}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cédula</p>
                    <p className="font-medium">{cliente.cedula}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ciudad</p>
                    <p className="font-medium">{cliente.ciudadCliente}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Proyecto</p>
                    <p className="font-medium">{proyecto.nombre}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-semibold mb-3">Datos del Inmueble</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Ciudad Inmueble</p>
                    <p className="font-medium">{cliente.ciudadInmueble}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Monto Inmueble</p>
                    <p className="font-medium text-lg">
                      ${cliente.montoInmueble.toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-semibold mb-3">Información Financiera</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Monto a Financiar</p>
                    <p className="font-medium text-lg">
                      ${cliente.montoFinanciar.toLocaleString('es-CO')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Porcentaje</p>
                    <p className="font-medium">
                      {((cliente.montoFinanciar / cliente.montoInmueble) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Banco Actual</p>
                    <p className="font-medium">{cliente.bancoActual}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Etapa</p>
                    <StatusBadge etapa={cliente.etapa} subestado={cliente.subestado} />
                  </div>
                  {cliente.fechaAprobacion && (
                    <>
                      <div>
                        <p className="text-gray-600">Fecha Aprobación</p>
                        <p className="font-medium">{cliente.fechaAprobacion}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Vigencia</p>
                        <p className="font-medium">{cliente.vigenciaDias} días</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Fecha Vencimiento</p>
                        <p className="font-medium">{cliente.fechaVencimiento}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Días Restantes</p>
                        <VencimientoBadge diasRestantes={cliente.diasRestantes} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Tab: Documentos */}
            <TabsContent value="documentos" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Carta de Preaprobación</p>
                      <p className="text-xs text-gray-500">Última actualización: 15 ene 2026</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Descargar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Carta de Aprobación</p>
                      <p className="text-xs text-gray-500">
                        {cliente.fechaAprobacion
                          ? `Cargada el ${cliente.fechaAprobacion}`
                          : 'No cargada'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {cliente.fechaAprobacion ? (
                      <Button variant="outline" size="sm">
                        Descargar
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab: Historial */}
            <TabsContent value="historial">
              <div className="space-y-4">
                {historial.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No hay eventos en el historial
                  </p>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
                    {historial
                      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                      .map((evento, index) => (
                        <div key={evento.id} className="relative flex gap-4 pb-8 last:pb-0">
                          <div className="relative z-10">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-gray-300">
                              <History className="h-4 w-4 text-gray-600" />
                            </div>
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="text-sm font-medium">{evento.descripcion}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500">
                                {new Date(evento.fecha).toLocaleString('es-CO', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              <span className="text-xs text-gray-400">•</span>
                              <p className="text-xs text-gray-500">{evento.usuario}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab: Asignaciones */}
            <TabsContent value="asignaciones">
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Analista Delta</p>
                      <p className="text-sm text-gray-600 mt-1">{cliente.analistaDelta}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Reasignar
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Analista de Radicación</p>
                      <p className="text-sm text-gray-600 mt-1">{cliente.analistaRadicacion}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Reasignar
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Analista de Legalización</p>
                      <p className="text-sm text-gray-600 mt-1">{cliente.analistaLegalizacion}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Reasignar
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
