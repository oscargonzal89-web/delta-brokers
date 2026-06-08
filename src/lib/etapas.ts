
import type { EtapaMacro } from './types';

export interface EtapaOption {
  value: EtapaMacro;
  label: string;
}

/** All macro stages with display labels (single source of truth for the UI). */
export const ETAPAS_MACRO: EtapaOption[] = [
  { value: 'preaprobacion', label: 'Preaprobación' },
  { value: 'aprobacion', label: 'Aprobación' },
  { value: 'legalizacion', label: 'Legalización' },
  { value: 'desembolsado', label: 'Desembolsado' },
  { value: 'estado_cliente', label: 'Estado Cliente' },
  { value: 'negados', label: 'Negados' },
];

export const ETAPA_LABELS: Record<EtapaMacro, string> = Object.fromEntries(
  ETAPAS_MACRO.map((e) => [e.value, e.label]),
) as Record<EtapaMacro, string>;

export const ETAPA_COLORS: Record<EtapaMacro, string> = {
  preaprobacion: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  aprobacion: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  legalizacion: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  desembolsado: 'bg-green-100 text-green-800 hover:bg-green-100',
  estado_cliente: 'bg-slate-100 text-slate-800 hover:bg-slate-100',
  negados: 'bg-red-100 text-red-800 hover:bg-red-100',
};
