import { Badge } from './ui/badge';
import type { EtapaMacro } from '../../lib/types';

interface StatusBadgeProps {
  etapa: EtapaMacro | string;
  subestado?: string;
}

const etapaLabels: Record<string, string> = {
  preaprobacion: 'Preaprobación',
  aprobacion: 'Aprobación',
  legalizacion: 'Legalización',
  desembolsado: 'Desembolsado',
  Preaprobación: 'Preaprobación',
  Aprobación: 'Aprobación',
  Legalización: 'Legalización',
  Desembolsado: 'Desembolsado',
};

const etapaColors: Record<string, string> = {
  preaprobacion: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  aprobacion: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  legalizacion: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  desembolsado: 'bg-green-100 text-green-800 hover:bg-green-100',
  Preaprobación: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  Aprobación: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  Legalización: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  Desembolsado: 'bg-green-100 text-green-800 hover:bg-green-100',
};

export function StatusBadge({ etapa, subestado }: StatusBadgeProps) {
  const label = etapaLabels[etapa] ?? etapa;
  const color = etapaColors[etapa] ?? 'bg-gray-100 text-gray-800 hover:bg-gray-100';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="secondary" className={color}>
        {label}
      </Badge>
      {subestado && (
        <Badge variant="outline" className="text-xs">
          {subestado}
        </Badge>
      )}
    </div>
  );
}
