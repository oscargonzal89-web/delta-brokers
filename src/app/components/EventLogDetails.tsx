import { ArrowRight } from 'lucide-react';
import { parseEventLogDetails } from '../../lib/eventLogFormat';
import type { TipoEvento } from '../../lib/types';

interface EventLogDetailsProps {
  eventType: TipoEvento | string;
  payload: Record<string, unknown> | null | undefined;
  userNameMap?: Record<string, string>;
}

export function EventLogDetails({ eventType, payload, userNameMap = {} }: EventLogDetailsProps) {
  const lines = parseEventLogDetails(eventType, payload, userNameMap);

  if (lines.length === 0) return null;

  return (
    <div className="mt-2 space-y-2 rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
      {lines.map((line) => (
        <div key={`${line.label}-${line.from ?? ''}-${line.to ?? ''}-${line.value ?? ''}`}>
          <p className="text-xs font-medium text-gray-500">{line.label}</p>
          {line.value ? (
            <p className="mt-0.5 text-sm text-gray-800">{line.value}</p>
          ) : (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-md bg-white px-2 py-0.5 text-gray-700 ring-1 ring-gray-200">
                {line.from}
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span className="rounded-md bg-white px-2 py-0.5 font-medium text-gray-900 ring-1 ring-gray-200">
                {line.to}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
