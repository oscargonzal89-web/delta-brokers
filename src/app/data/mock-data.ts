// Mock data para Delta Brokers
export type Etapa = 'Preaprobación' | 'Aprobación' | 'Legalización' | 'Desembolsado';

export type Subestado = {
  Preaprobación: 'Pendiente documentos' | 'En análisis' | 'Observaciones' | 'Completado';
  Aprobación: 'Carta enviada' | 'Pendiente firma' | 'Firmado' | 'Completado';
  Legalización: 'Escrituración' | 'Registro' | 'Avalúo' | 'Completado';
  Desembolsado: 'Completado';
};

export type Rol = 'Analista' | 'Coordinador' | 'Administrador';

export interface Proyecto {
  id: string;
  nombre: string;
  ciudad: string;
  bancoFinanciadorPrincipal: string;
  totalClientes: number;
}

export interface Cliente {
  id: string;
  proyectoId: string;
  nombre: string;
  cedula: string;
  bancoActual: string;
  etapa: Etapa;
  subestado: string;
  montoInmueble: number;
  montoFinanciar: number;
  ciudadCliente: string;
  ciudadInmueble: string;
  fechaAprobacion?: string;
  vigenciaDias?: number;
  fechaVencimiento?: string;
  diasRestantes?: number;
  analistaDelta: string;
  analistaRadicacion: string;
  analistaLegalizacion: string;
}

export interface Importacion {
  id: string;
  fecha: string;
  proyectoId: string;
  archivo: string;
  usuario: string;
  insertados: number;
  actualizados: number;
  errores: number;
  detalleErrores?: { fila: number; campo: string; error: string }[];
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
}

export interface HistorialEvento {
  id: string;
  clienteId: string;
  fecha: string;
  tipo: 'cambio_estado' | 'cambio_banco' | 'asignacion' | 'importacion' | 'documento';
  descripcion: string;
  usuario: string;
}

// Función para calcular días restantes
export function calcularDiasRestantes(fechaAprobacion: string, vigenciaDias: number): number {
  const fecha = new Date(fechaAprobacion);
  const fechaVencimiento = new Date(fecha.getTime() + vigenciaDias * 24 * 60 * 60 * 1000);
  const hoy = new Date();
  const diff = fechaVencimiento.getTime() - hoy.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

export function getFechaVencimiento(fechaAprobacion: string, vigenciaDias: number): string {
  const fecha = new Date(fechaAprobacion);
  const fechaVencimiento = new Date(fecha.getTime() + vigenciaDias * 24 * 60 * 60 * 1000);
  return fechaVencimiento.toISOString().split('T')[0];
}

export function getEstadoVencimiento(diasRestantes?: number): 'ok' | 'por-vencer' | 'vencido' {
  if (diasRestantes === undefined) return 'ok';
  if (diasRestantes <= 0) return 'vencido';
  if (diasRestantes < 60) return 'por-vencer';
  return 'ok';
}

// Proyectos mock
export const proyectos: Proyecto[] = [
  {
    id: 'p1',
    nombre: 'Bosques de Suba',
    ciudad: 'Bogotá',
    bancoFinanciadorPrincipal: 'Bancolombia',
    totalClientes: 12,
  },
  {
    id: 'p2',
    nombre: 'Parque del Río',
    ciudad: 'Medellín',
    bancoFinanciadorPrincipal: 'Davivienda',
    totalClientes: 12,
  },
];

// Clientes mock (12 por proyecto)
export const clientes: Cliente[] = [
  // Proyecto 1: Bosques de Suba
  {
    id: 'c1',
    proyectoId: 'p1',
    nombre: 'María Fernández García',
    cedula: '1234567890',
    bancoActual: 'Bancolombia',
    etapa: 'Aprobación',
    subestado: 'Carta enviada',
    montoInmueble: 350000000,
    montoFinanciar: 280000000,
    ciudadCliente: 'Bogotá',
    ciudadInmueble: 'Bogotá',
    fechaAprobacion: '2026-01-07', // 55 días restantes
    vigenciaDias: 90,
    analistaDelta: 'Carlos Rojas',
    analistaRadicacion: 'Ana López',
    analistaLegalizacion: 'Pedro Ruiz',
  },
  {
    id: 'c2',
    proyectoId: 'p1',
    nombre: 'Juan Carlos Pérez Martínez',
    cedula: '2345678901',
    bancoActual: 'Bancolombia',
    etapa: 'Aprobación',
    subestado: 'Pendiente firma',
    montoInmueble: 420000000,
    montoFinanciar: 336000000,
    ciudadCliente: 'Bogotá',
    ciudadInmueble: 'Bogotá',
    fechaAprobacion: '2026-02-10', // 20 días restantes
    vigenciaDias: 90,
    analistaDelta: 'Carlos Rojas',
    analistaRadicacion: 'Ana López',
    analistaLegalizacion: 'Pedro Ruiz',
  },
  {
    id: 'c3',
    proyectoId: 'p1',
    nombre: 'Andrea Sofía Ramírez Castro',
    cedula: '3456789012',
    bancoActual: 'Davivienda', // Cambio de banco
    etapa: 'Aprobación',
    subestado: 'Carta enviada',
    montoInmueble: 380000000,
    montoFinanciar: 304000000,
    ciudadCliente: 'Bogotá',
    ciudadInmueble: 'Bogotá',
    fechaAprobacion: '2026-02-26', // 5 días restantes
    vigenciaDias: 90,
    analistaDelta: 'Laura Méndez',
    analistaRadicacion: 'Ana López',
    analistaLegalizacion: 'Pedro Ruiz',
  },
  {
    id: 'c4',
    proyectoId: 'p1',
    nombre: 'Roberto Silva Herrera',
    cedula: '4567890123',
    bancoActual: 'Bancolombia',
    etapa: 'Aprobación',
    subestado: 'Completado',
    montoInmueble: 310000000,
    montoFinanciar: 248000000,
    ciudadCliente: 'Bogotá',
    ciudadInmueble: 'Bogotá',
    fechaAprobacion: '2025-11-30', // -3 días (vencido)
    vigenciaDias: 90,
    analistaDelta: 'Carlos Rojas',
    analistaRadicacion: 'Ana López',
    analistaLegalizacion: 'Pedro Ruiz',
  },
  {
    id: 'c5',
    proyectoId: 'p1',
    nombre: 'Camila Torres Vargas',
    cedula: '5678901234',
    bancoActual: 'Bancolombia',
    etapa: 'Legalización',
    subestado: 'Escrituración',
    montoInmueble: 395000000,
    montoFinanciar: 316000000,
    ciudadCliente: 'Bogotá',
    ciudadInmueble: 'Bogotá',
    analistaDelta: 'Laura Méndez',
    analistaRadicacion: 'Ana López',
    analistaLegalizacion: 'Pedro Ruiz',
  },
  {
    id: 'c6',
    proyectoId: 'p1',
    nombre: 'Diego Alejandro Moreno Gómez',
    cedula: '6789012345',
    bancoActual: 'Bancolombia',
    etapa: 'Legalización',
    subestado: 'Avalúo',
    montoInmueble: 340000000,
    montoFinanciar: 272000000,
    ciudadCliente: 'Bogotá',
    ciudadInmueble: 'Bogotá',
    analistaDelta: 'Carlos Rojas',
    analistaRadicacion: 'Ana López',
    analistaLegalizacion: 'Pedro Ruiz',
  },
  {
    id: 'c7',
    proyectoId: 'p1',
    nombre: 'Valentina Gómez Jiménez',
    cedula: '7890123456',
    bancoActual: 'Bancolombia',
    etapa: 'Desembolsado',
    subestado: 'Completado',
    montoInmueble: 405000000,
    montoFinanciar: 324000000,
    ciudadCliente: 'Bogotá',
    ciudadInmueble: 'Bogotá',
    analistaDelta: 'Laura Méndez',
    analistaRadicacion: 'Ana López',
    analistaLegalizacion: 'Pedro Ruiz',
  },
  {
    id: 'c8',
    proyectoId: 'p1',
    nombre: 'Santiago Martínez León',
    cedula: '8901234567',
    bancoActual: 'Bancolombia',
    etapa: 'Desembolsado',
    subestado: 'Completado',
    montoInmueble: 360000000,
    montoFinanciar: 288000000,
    ciudadCliente: 'Bogotá',
    ciudadInmueble: 'Bogotá',
    analistaDelta: 'Carlos Rojas',
    analistaRadicacion: 'Ana López',
    analistaLegalizacion: 'Pedro Ruiz',
  },
  {
    id: 'c9',
    proyectoId: 'p1',
    nombre: 'Isabella Rodríguez Parra',
    cedula: '9012345678',
    bancoActual: 'Bancolombia',
    etapa: 'Preaprobación',
    subestado: 'Pendiente documentos',
    montoInmueble: 375000000,
    montoFinanciar: 300000000,
    ciudadCliente: 'Bogotá',
    ciudadInmueble: 'Bogotá',
    analistaDelta: 'Laura Méndez',
    analistaRadicacion: 'Ana López',
    analistaLegalizacion: 'Pedro Ruiz',
  },
  {
    id: 'c10',
    proyectoId: 'p1',
    nombre: 'Mateo Sánchez Ortiz',
    cedula: '1122334455',
    bancoActual: 'Bancolombia',
    etapa: 'Preaprobación',
    subestado: 'En análisis',
    montoInmueble: 330000000,
    montoFinanciar: 264000000,
    ciudadCliente: 'Bogotá',
    ciudadInmueble: 'Bogotá',
    analistaDelta: 'Carlos Rojas',
    analistaRadicacion: 'Ana López',
    analistaLegalizacion: 'Pedro Ruiz',
  },
  {
    id: 'c11',
    proyectoId: 'p1',
    nombre: 'Sofía Daniela Castro Rincón',
    cedula: '2233445566',
    bancoActual: 'Bancolombia',
    etapa: 'Preaprobación',
    subestado: 'Observaciones',
    montoInmueble: 390000000,
    montoFinanciar: 312000000,
    ciudadCliente: 'Bogotá',
    ciudadInmueble: 'Bogotá',
    analistaDelta: 'Laura Méndez',
    analistaRadicacion: 'Ana López',
    analistaLegalizacion: 'Pedro Ruiz',
  },
  {
    id: 'c12',
    proyectoId: 'p1',
    nombre: 'Lucas Andrés Vargas Molina',
    cedula: '3344556677',
    bancoActual: 'Bancolombia',
    etapa: 'Aprobación',
    subestado: 'Firmado',
    montoInmueble: 410000000,
    montoFinanciar: 328000000,
    ciudadCliente: 'Bogotá',
    ciudadInmueble: 'Bogotá',
    analistaDelta: 'Carlos Rojas',
    analistaRadicacion: 'Ana López',
    analistaLegalizacion: 'Pedro Ruiz',
  },

  // Proyecto 2: Parque del Río
  {
    id: 'c13',
    proyectoId: 'p2',
    nombre: 'Carolina Escobar Mejía',
    cedula: '4455667788',
    bancoActual: 'Davivienda',
    etapa: 'Aprobación',
    subestado: 'Carta enviada',
    montoInmueble: 290000000,
    montoFinanciar: 232000000,
    ciudadCliente: 'Medellín',
    ciudadInmueble: 'Medellín',
    fechaAprobacion: '2026-01-15',
    vigenciaDias: 90,
    analistaDelta: 'Juliana Pérez',
    analistaRadicacion: 'Miguel Ángel',
    analistaLegalizacion: 'Sandra Díaz',
  },
  {
    id: 'c14',
    proyectoId: 'p2',
    nombre: 'Andrés Felipe Montoya Zapata',
    cedula: '5566778899',
    bancoActual: 'Bancolombia', // Cambio de banco
    etapa: 'Aprobación',
    subestado: 'Pendiente firma',
    montoInmueble: 315000000,
    montoFinanciar: 252000000,
    ciudadCliente: 'Medellín',
    ciudadInmueble: 'Medellín',
    fechaAprobacion: '2026-02-01',
    vigenciaDias: 90,
    analistaDelta: 'Juliana Pérez',
    analistaRadicacion: 'Miguel Ángel',
    analistaLegalizacion: 'Sandra Díaz',
  },
  {
    id: 'c15',
    proyectoId: 'p2',
    nombre: 'Paula Andrea Restrepo Urrego',
    cedula: '6677889900',
    bancoActual: 'Davivienda',
    etapa: 'Legalización',
    subestado: 'Registro',
    montoInmueble: 305000000,
    montoFinanciar: 244000000,
    ciudadCliente: 'Medellín',
    ciudadInmueble: 'Medellín',
    analistaDelta: 'Felipe Gómez',
    analistaRadicacion: 'Miguel Ángel',
    analistaLegalizacion: 'Sandra Díaz',
  },
  {
    id: 'c16',
    proyectoId: 'p2',
    nombre: 'Daniel Esteban Henao Ríos',
    cedula: '7788990011',
    bancoActual: 'Davivienda',
    etapa: 'Legalización',
    subestado: 'Escrituración',
    montoInmueble: 325000000,
    montoFinanciar: 260000000,
    ciudadCliente: 'Medellín',
    ciudadInmueble: 'Medellín',
    analistaDelta: 'Juliana Pérez',
    analistaRadicacion: 'Miguel Ángel',
    analistaLegalizacion: 'Sandra Díaz',
  },
  {
    id: 'c17',
    proyectoId: 'p2',
    nombre: 'Natalia González Arango',
    cedula: '8899001122',
    bancoActual: 'Davivienda',
    etapa: 'Desembolsado',
    subestado: 'Completado',
    montoInmueble: 295000000,
    montoFinanciar: 236000000,
    ciudadCliente: 'Medellín',
    ciudadInmueble: 'Medellín',
    analistaDelta: 'Felipe Gómez',
    analistaRadicacion: 'Miguel Ángel',
    analistaLegalizacion: 'Sandra Díaz',
  },
  {
    id: 'c18',
    proyectoId: 'p2',
    nombre: 'Sebastián Álvarez Cardona',
    cedula: '9900112233',
    bancoActual: 'Davivienda',
    etapa: 'Desembolsado',
    subestado: 'Completado',
    montoInmueble: 310000000,
    montoFinanciar: 248000000,
    ciudadCliente: 'Medellín',
    ciudadInmueble: 'Medellín',
    analistaDelta: 'Juliana Pérez',
    analistaRadicacion: 'Miguel Ángel',
    analistaLegalizacion: 'Sandra Díaz',
  },
  {
    id: 'c19',
    proyectoId: 'p2',
    nombre: 'Laura Catalina Vélez Ramírez',
    cedula: '1011121314',
    bancoActual: 'Davivienda',
    etapa: 'Preaprobación',
    subestado: 'Completado',
    montoInmueble: 280000000,
    montoFinanciar: 224000000,
    ciudadCliente: 'Medellín',
    ciudadInmueble: 'Medellín',
    analistaDelta: 'Felipe Gómez',
    analistaRadicacion: 'Miguel Ángel',
    analistaLegalizacion: 'Sandra Díaz',
  },
  {
    id: 'c20',
    proyectoId: 'p2',
    nombre: 'Alejandro Patiño Correa',
    cedula: '1112131415',
    bancoActual: 'Davivienda',
    etapa: 'Preaprobación',
    subestado: 'En análisis',
    montoInmueble: 320000000,
    montoFinanciar: 256000000,
    ciudadCliente: 'Medellín',
    ciudadInmueble: 'Medellín',
    analistaDelta: 'Juliana Pérez',
    analistaRadicacion: 'Miguel Ángel',
    analistaLegalizacion: 'Sandra Díaz',
  },
  {
    id: 'c21',
    proyectoId: 'p2',
    nombre: 'Mariana Ochoa Valencia',
    cedula: '1213141516',
    bancoActual: 'Davivienda',
    etapa: 'Aprobación',
    subestado: 'Firmado',
    montoInmueble: 330000000,
    montoFinanciar: 264000000,
    ciudadCliente: 'Medellín',
    ciudadInmueble: 'Medellín',
    analistaDelta: 'Felipe Gómez',
    analistaRadicacion: 'Miguel Ángel',
    analistaLegalizacion: 'Sandra Díaz',
  },
  {
    id: 'c22',
    proyectoId: 'p2',
    nombre: 'Gabriel Suárez Quintero',
    cedula: '1314151617',
    bancoActual: 'Davivienda',
    etapa: 'Preaprobación',
    subestado: 'Pendiente documentos',
    montoInmueble: 300000000,
    montoFinanciar: 240000000,
    ciudadCliente: 'Medellín',
    ciudadInmueble: 'Medellín',
    analistaDelta: 'Juliana Pérez',
    analistaRadicacion: 'Miguel Ángel',
    analistaLegalizacion: 'Sandra Díaz',
  },
  {
    id: 'c23',
    proyectoId: 'p2',
    nombre: 'Daniela Muñoz Castaño',
    cedula: '1415161718',
    bancoActual: 'Davivienda',
    etapa: 'Legalización',
    subestado: 'Avalúo',
    montoInmueble: 335000000,
    montoFinanciar: 268000000,
    ciudadCliente: 'Medellín',
    ciudadInmueble: 'Medellín',
    analistaDelta: 'Felipe Gómez',
    analistaRadicacion: 'Miguel Ángel',
    analistaLegalizacion: 'Sandra Díaz',
  },
  {
    id: 'c24',
    proyectoId: 'p2',
    nombre: 'Esteban López Giraldo',
    cedula: '1516171819',
    bancoActual: 'Davivienda',
    etapa: 'Aprobación',
    subestado: 'Completado',
    montoInmueble: 345000000,
    montoFinanciar: 276000000,
    ciudadCliente: 'Medellín',
    ciudadInmueble: 'Medellín',
    analistaDelta: 'Juliana Pérez',
    analistaRadicacion: 'Miguel Ángel',
    analistaLegalizacion: 'Sandra Díaz',
  },
];

// Calcular fechas y días restantes donde aplique
clientes.forEach((cliente) => {
  if (cliente.fechaAprobacion && cliente.vigenciaDias) {
    cliente.diasRestantes = calcularDiasRestantes(cliente.fechaAprobacion, cliente.vigenciaDias);
    cliente.fechaVencimiento = getFechaVencimiento(cliente.fechaAprobacion, cliente.vigenciaDias);
  }
});

// Importaciones mock
export const importaciones: Importacion[] = [
  {
    id: 'i1',
    fecha: '2026-02-28T10:30:00',
    proyectoId: 'p1',
    archivo: 'bosques_suba_feb_2026.xlsx',
    usuario: 'admin@deltabrokers.co',
    insertados: 8,
    actualizados: 4,
    errores: 0,
  },
  {
    id: 'i2',
    fecha: '2026-02-20T14:15:00',
    proyectoId: 'p2',
    archivo: 'parque_rio_feb_2026.xlsx',
    usuario: 'admin@deltabrokers.co',
    insertados: 10,
    actualizados: 2,
    errores: 2,
    detalleErrores: [
      { fila: 5, campo: 'cedula', error: 'Formato inválido' },
      { fila: 12, campo: 'monto_inmueble', error: 'Valor fuera de rango' },
    ],
  },
  {
    id: 'i3',
    fecha: '2026-01-15T09:00:00',
    proyectoId: 'p1',
    archivo: 'bosques_suba_ene_2026.xlsx',
    usuario: 'coordinador@deltabrokers.co',
    insertados: 12,
    actualizados: 0,
    errores: 0,
  },
];

// Usuarios mock
export const usuarios: Usuario[] = [
  {
    id: 'u1',
    nombre: 'Admin Principal',
    email: 'admin@deltabrokers.co',
    rol: 'Administrador',
    activo: true,
  },
  {
    id: 'u2',
    nombre: 'Carlos Rojas',
    email: 'carlos.rojas@deltabrokers.co',
    rol: 'Analista',
    activo: true,
  },
  {
    id: 'u3',
    nombre: 'Laura Méndez',
    email: 'laura.mendez@deltabrokers.co',
    rol: 'Analista',
    activo: true,
  },
  {
    id: 'u4',
    nombre: 'Coordinador Principal',
    email: 'coordinador@deltabrokers.co',
    rol: 'Coordinador',
    activo: true,
  },
  {
    id: 'u5',
    nombre: 'Juliana Pérez',
    email: 'juliana.perez@deltabrokers.co',
    rol: 'Analista',
    activo: true,
  },
  {
    id: 'u6',
    nombre: 'Felipe Gómez',
    email: 'felipe.gomez@deltabrokers.co',
    rol: 'Analista',
    activo: false,
  },
];

// Historial mock
export const historialEventos: HistorialEvento[] = [
  {
    id: 'h1',
    clienteId: 'c3',
    fecha: '2026-02-15T11:20:00',
    tipo: 'cambio_banco',
    descripcion: 'Cambio de banco: Bancolombia → Davivienda',
    usuario: 'Carlos Rojas',
  },
  {
    id: 'h2',
    clienteId: 'c3',
    fecha: '2026-02-26T09:15:00',
    tipo: 'cambio_estado',
    descripcion: 'Cambio de estado: Preaprobación (Completado) → Aprobación (Carta enviada)',
    usuario: 'Laura Méndez',
  },
  {
    id: 'h3',
    clienteId: 'c14',
    fecha: '2026-01-28T16:45:00',
    tipo: 'cambio_banco',
    descripcion: 'Cambio de banco: Davivienda → Bancolombia',
    usuario: 'Juliana Pérez',
  },
  {
    id: 'h4',
    clienteId: 'c1',
    fecha: '2026-01-07T10:00:00',
    tipo: 'documento',
    descripcion: 'Carta de aprobación cargada',
    usuario: 'Ana López',
  },
  {
    id: 'h5',
    clienteId: 'c1',
    fecha: '2026-01-05T14:30:00',
    tipo: 'asignacion',
    descripcion: 'Asignado analista de legalización: Pedro Ruiz',
    usuario: 'Coordinador Principal',
  },
];

// Subestados por etapa
export const subestadosPorEtapa: Record<Etapa, string[]> = {
  Preaprobación: ['Pendiente documentos', 'En análisis', 'Observaciones', 'Completado'],
  Aprobación: ['Carta enviada', 'Pendiente firma', 'Firmado', 'Completado'],
  Legalización: ['Escrituración', 'Registro', 'Avalúo', 'Completado'],
  Desembolsado: ['Completado'],
};

export const bancos = [
  'Bancolombia',
  'Davivienda',
  'Banco de Bogotá',
  'BBVA Colombia',
  'Banco Popular',
  'Banco Occidente',
  'Itaú',
];

export const ciudades = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga'];
