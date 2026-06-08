import { Badge } from './ui/badge';
import { ETAPA_COLORS, ETAPA_LABELS } from '../../lib/etapas';
import type { EtapaMacro } from '../../lib/types';

interface StatusBadgeProps {
  etapa: EtapaMacro | string;
  subestado?: string;
}

export function StatusBadge({ etapa, subestado }: StatusBadgeProps) {
  const label = ETAPA_LABELS[etapa as EtapaMacro] ?? etapa;
  const color = ETAPA_COLORS[etapa as EtapaMacro] ?? 'bg-gray-100 text-gray-800 hover:bg-gray-100';

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
