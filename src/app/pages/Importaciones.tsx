import { useState } from 'react';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { proyectos, importaciones } from '../data/mock-data';
import { toast } from 'sonner';

export function Importaciones() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [importacionSeleccionada, setImportacionSeleccionada] = useState<string | null>(null);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>('');
  const [archivo, setArchivo] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!proyectoSeleccionado || !archivo) {
      toast.error('Por favor selecciona un proyecto y un archivo');
      return;
    }

    toast.success(`Archivo "${archivo.name}" cargado exitosamente`);
    setUploadOpen(false);
    setProyectoSeleccionado('');
    setArchivo(null);
  };

  const handleVerDetalle = (id: string) => {
    setImportacionSeleccionada(id);
    setDetalleOpen(true);
  };

  const importacionDetalle = importaciones.find((i) => i.id === importacionSeleccionada);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Importaciones de Excel</h2>
          <p className="text-sm text-gray-500">Carga masiva de datos por proyecto</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Nueva Importación
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold">Historial de Importaciones</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Archivo</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead className="text-center">Insertados</TableHead>
              <TableHead className="text-center">Actualizados</TableHead>
              <TableHead className="text-center">Errores</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {importaciones
              .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
              .map((imp) => {
                const proyecto = proyectos.find((p) => p.id === imp.proyectoId);
                const tieneErrores = imp.errores > 0;

                return (
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
                    <TableCell className="font-medium">{proyecto?.nombre}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                        {imp.archivo}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{imp.usuario}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        {imp.insertados}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 text-blue-700">
                        {imp.actualizados}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {tieneErrores ? (
                        <span className="inline-flex items-center gap-1 text-red-700">
                          <AlertCircle className="h-3 w-3" />
                          {imp.errores}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {tieneErrores ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                          Con errores
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Exitoso
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {tieneErrores && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVerDetalle(imp.id)}
                        >
                          Ver Errores
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Importación de Excel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Proyecto</Label>
              <Select value={proyectoSeleccionado} onValueChange={setProyectoSeleccionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {proyectos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre} ({p.ciudad})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Archivo Excel (.xlsx)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  {archivo ? (
                    <div>
                      <p className="text-sm font-medium text-gray-700">{archivo.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(archivo.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600">
                        Haz clic para seleccionar o arrastra un archivo
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Formato: .xlsx o .xls</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-900">
                <strong>Nota:</strong> El archivo debe contener las columnas: nombre, cedula,
                banco_actual, etapa, subestado, monto_inmueble, monto_financiar, ciudad_cliente,
                ciudad_inmueble.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpload}>Validar y Cargar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={detalleOpen} onOpenChange={setDetalleOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalle de Errores - {importacionDetalle?.archivo}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {importacionDetalle?.detalleErrores && importacionDetalle.detalleErrores.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Fila</TableHead>
                      <TableHead>Campo</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importacionDetalle.detalleErrores.map((error, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-center font-medium">{error.fila}</TableCell>
                        <TableCell>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {error.campo}
                          </code>
                        </TableCell>
                        <TableCell className="text-sm text-red-700">{error.error}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Reporte
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No hay errores para mostrar</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
