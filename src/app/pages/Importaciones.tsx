import { useState, useEffect } from 'react';
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
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getImports, getImportErrors, uploadExcel } from '../../lib/api/imports';
import { getProjects } from '../../lib/api/projects';
import type { Project, ImportRowError } from '../../lib/types';

export function Importaciones() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [importacionSeleccionada, setImportacionSeleccionada] = useState<string | null>(null);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [imports, setImports] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [rowErrors, setRowErrors] = useState<ImportRowError[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [imps, projs] = await Promise.all([getImports(), getProjects()]);
      setImports(imps);
      setProjects(projs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!proyectoSeleccionado || !archivo) {
      toast.error('Por favor selecciona un proyecto y un archivo');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadExcel(proyectoSeleccionado, archivo);
      const msg = `Importación completa: ${result.inserted_count} insertados, ${result.updated_count} actualizados`;
      if (result.error_count > 0) {
        toast.warning(`${msg}, ${result.error_count} errores`);
      } else {
        toast.success(msg);
      }
      setUploadOpen(false);
      setProyectoSeleccionado('');
      setArchivo(null);
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al importar');
    } finally {
      setUploading(false);
    }
  };

  const handleVerDetalle = async (id: string) => {
    setImportacionSeleccionada(id);
    setDetalleOpen(true);
    try {
      const errors = await getImportErrors(id);
      setRowErrors(errors);
    } catch {
      toast.error('Error al cargar detalle de errores');
    }
  };

  const selectedImport = imports.find((i) => i.id === importacionSeleccionada);

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

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
          <Button variant="outline" className="mt-3" onClick={fetchData}>Reintentar</Button>
        </div>
      ) : (
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
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Insertados</TableHead>
                <TableHead className="text-center">Actualizados</TableHead>
                <TableHead className="text-center">Errores</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {imports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                    No hay importaciones aún. Haz clic en "Nueva Importación" para comenzar.
                  </TableCell>
                </TableRow>
              ) : (
                imports.map((imp) => {
                  const hasErrors = imp.error_count > 0;
                  return (
                    <TableRow key={imp.id}>
                      <TableCell className="text-sm">
                        {new Date(imp.uploaded_at).toLocaleString('es-CO', {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="font-medium">{imp.project?.nombre ?? '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{imp.file_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">{imp.total_rows}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1 text-green-700 text-sm">
                          <CheckCircle className="h-3 w-3" />
                          {imp.inserted_count}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-sm text-blue-700">
                        {imp.updated_count}
                      </TableCell>
                      <TableCell className="text-center">
                        {hasErrors ? (
                          <span className="inline-flex items-center gap-1 text-red-700 text-sm">
                            <AlertCircle className="h-3 w-3" />
                            {imp.error_count}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {imp.status === 'processing' ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Procesando...
                          </span>
                        ) : hasErrors ? (
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
                        {hasErrors && (
                          <Button variant="ghost" size="sm" onClick={() => handleVerDetalle(imp.id)}>
                            Ver Errores
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Upload Dialog */}
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
                  {projects.map((p) => (
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
                banco_actual, etapa, subestado. Opcionales: monto_inmueble, monto_a_financiar,
                ciudad_cliente, ciudad_inmueble, fecha_carta_aprobacion, vigencia_dias.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setUploadOpen(false)} disabled={uploading}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Validar y Cargar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Detail Dialog */}
      <Dialog open={detalleOpen} onOpenChange={setDetalleOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalle de Errores - {selectedImport?.file_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {rowErrors.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Fila</TableHead>
                    <TableHead>Campo</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rowErrors.map((err) => (
                    <TableRow key={err.id}>
                      <TableCell className="text-center font-medium">{err.row_number}</TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {err.field}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm text-red-700">{err.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
