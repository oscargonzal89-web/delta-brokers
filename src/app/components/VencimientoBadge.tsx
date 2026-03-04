import { Badge } from './ui/badge';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface VencimientoBadgeProps {
  diasRestantes?: number;
}

export function VencimientoBadge({ diasRestantes }: VencimientoBadgeProps) {
  if (diasRestantes === undefined) {
    return null;
  }

  if (diasRestantes <= 0) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        Vencido ({Math.abs(diasRestantes)}d)
      </Badge>
    );
  }

  if (diasRestantes < 60) {
    return (
      <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 gap-1">
        <Clock className="h-3 w-3" />
        Por vencer ({diasRestantes}d)
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
      <CheckCircle className="h-3 w-3" />
      OK ({diasRestantes}d)
    </Badge>
  );
}
