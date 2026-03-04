import { useState } from 'react';
import { useNavigate } from 'react-router';
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
  DialogTrigger,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Plus } from 'lucide-react';
import { proyectos, clientes, bancos, ciudades } from '../data/mock-data';
import { toast } from 'sonner';

export function Proyectos() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [bancoPrincipal, setBancoPrincipal] = useState('');

  const handleCreate = () => {
    if (!nombre || !ciudad || !bancoPrincipal) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    toast.success(`Proyecto "${nombre}" creado exitosamente`);
    setOpen(false);
    setNombre('');
    setCiudad('');
    setBancoPrincipal('');
  };

  const getProyectoStats = (proyectoId: string) => {
    const clientesProyecto = clientes.filter((c) => c.proyectoId === proyectoId);
    return {
      total: clientesProyecto.length,
      preaprobacion: clientesProyecto.filter((c) => c.etapa === 'Preaprobación').length,
      aprobacion: clientesProyecto.filter((c) => c.etapa === 'Aprobación').length,
      legalizacion: clientesProyecto.filter((c) => c.etapa === 'Legalización').length,
      desembolsados: clientesProyecto.filter((c) => c.etapa === 'Desembolsado').length,
      porVencer: clientesProyecto.filter(
        (c) => c.diasRestantes !== undefined && c.diasRestantes < 60 && c.diasRestantes > 0
      ).length,
    };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Proyectos</h2>
          <p className="text-sm text-gray-500">Gestiona las salas de ventas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Proyecto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Proyecto</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Torres del Norte"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Select value={ciudad} onValueChange={setCiudad}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    {ciudades.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="banco">Banco Financiador Principal</Label>
                <Select value={bancoPrincipal} onValueChange={setBancoPrincipal}>
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
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>Crear Proyecto</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ciudad</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Banco Principal</TableHead>
              <TableHead className="text-center">Total Clientes</TableHead>
              <TableHead className="text-center">Preaprobación</TableHead>
              <TableHead className="text-center">Aprobación</TableHead>
              <TableHead className="text-center">Legalización</TableHead>
              <TableHead className="text-center">Desembolsados</TableHead>
              <TableHead className="text-center">Por Vencer &lt;60</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proyectos.map((proyecto) => {
              const stats = getProyectoStats(proyecto.id);
              return (
                <TableRow
                  key={proyecto.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/proyectos/${proyecto.id}`)}
                >
                  <TableCell>{proyecto.ciudad}</TableCell>
                  <TableCell className="font-medium">{proyecto.nombre}</TableCell>
                  <TableCell>{proyecto.bancoFinanciadorPrincipal}</TableCell>
                  <TableCell className="text-center font-semibold">{stats.total}</TableCell>
                  <TableCell className="text-center">{stats.preaprobacion}</TableCell>
                  <TableCell className="text-center">{stats.aprobacion}</TableCell>
                  <TableCell className="text-center">{stats.legalizacion}</TableCell>
                  <TableCell className="text-center">{stats.desembolsados}</TableCell>
                  <TableCell className="text-center">
                    {stats.porVencer > 0 ? (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                        {stats.porVencer}
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
