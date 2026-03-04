import { Badge } from './ui/badge';
import { Etapa } from '../data/mock-data';

interface StatusBadgeProps {
  etapa: Etapa;
  subestado?: string;
}

const etapaColors: Record<Etapa, string> = {
  Preaprobación: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  Aprobación: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  Legalización: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  Desembolsado: 'bg-green-100 text-green-800 hover:bg-green-100',
};

export function StatusBadge({ etapa, subestado }: StatusBadgeProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="secondary" className={etapaColors[etapa]}>
        {etapa}
      </Badge>
      {subestado && (
        <Badge variant="outline" className="text-xs">
          {subestado}
        </Badge>
      )}
    </div>
  );
}
