import type { TipoEvento, EtapaMacro } from './types';

import { ETAPA_LABELS } from './etapas';

export { ETAPA_LABELS };

const DOC_TIPO_LABELS: Record<string, string> = {
  carta_preaprobacion: 'Carta de preaprobación',
  carta_aprobacion: 'Carta de aprobación',
};

export interface EventLogDetailLine {
  label: string;
  from?: string;
  to?: string;
  value?: string;
}

/**
 * Resolves a user id to a display name for assignment history entries.
 */
export function resolveUserName(
  id: string | null | undefined,
  userNameMap: Record<string, string>,
): string {
  if (!id) return 'Sin asignar';
  return userNameMap[id] ?? 'Usuario no disponible';
}

function asString(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  return String(value);
}

/**
 * Converts a raw event_logs payload into human-readable detail lines.
 */
export function parseEventLogDetails(
  eventType: TipoEvento | string,
  payload: Record<string, unknown> | null | undefined,
  userNameMap: Record<string, string> = {},
): EventLogDetailLine[] {
  if (!payload || typeof payload !== 'object') return [];

  switch (eventType) {
    case 'STATUS_CHANGED': {
      const lines: EventLogDetailLine[] = [];
      const fromEtapa = asString(payload.from_etapa);
      const toEtapa = asString(payload.to_etapa);
      const fromSubestado = asString(payload.from_subestado);
      const toSubestado = asString(payload.to_subestado);

      const labelOf = (etapa: string) =>
        ETAPA_LABELS[etapa as EtapaMacro] ?? etapa;

      if (fromEtapa && toEtapa && fromEtapa !== toEtapa) {
        lines.push({
          label: 'Etapa',
          from: labelOf(fromEtapa),
          to: labelOf(toEtapa),
        });
      }

      if (fromSubestado && toSubestado && fromSubestado !== toSubestado) {
        lines.push({
          label: 'Subestado',
          from: fromSubestado,
          to: toSubestado,
        });
      }

      if (lines.length === 0 && toEtapa) {
        lines.push({
          label: 'Estado actual',
          value: `${labelOf(toEtapa)}${toSubestado ? ` · ${toSubestado}` : ''}`,
        });
      }

      return lines;
    }

    case 'BANK_CHANGED': {
      const from = asString(payload.from_banco);
      const to = asString(payload.to_banco);
      if (!from && !to) return [];
      return [{ label: 'Banco', from: from ?? '—', to: to ?? '—' }];
    }

    case 'ASSIGNMENT_CHANGED': {
      const lines: EventLogDetailLine[] = [];
      const assignmentFields = [
        { fromKey: 'analista_delta_from', toKey: 'analista_delta_to', label: 'Analista Delta' },
        { fromKey: 'analista_radicacion_from', toKey: 'analista_radicacion_to', label: 'Analista de radicación' },
        { fromKey: 'analista_legalizacion_from', toKey: 'analista_legalizacion_to', label: 'Analista de legalización' },
      ] as const;

      for (const field of assignmentFields) {
        const fromId = asString(payload[field.fromKey]);
        const toId = asString(payload[field.toKey]);
        if (fromId !== toId) {
          lines.push({
            label: field.label,
            from: resolveUserName(fromId, userNameMap),
            to: resolveUserName(toId, userNameMap),
          });
        }
      }

      return lines;
    }

    case 'DOC_UPLOADED': {
      const fileName = asString(payload.file_name);
      const tipo = asString(payload.tipo);
      const tipoLabel = tipo ? (DOC_TIPO_LABELS[tipo] ?? tipo) : undefined;

      if (fileName && tipoLabel) {
        return [{ label: 'Documento', value: `${fileName} (${tipoLabel})` }];
      }
      if (fileName) {
        return [{ label: 'Documento', value: fileName }];
      }
      if (tipoLabel) {
        return [{ label: 'Tipo', value: tipoLabel }];
      }
      return [];
    }

    case 'IMPORTED_CREATED':
      return [{ label: 'Origen', value: 'Cliente creado desde importación de Excel' }];

    case 'IMPORTED_UPDATED':
      return [{ label: 'Origen', value: 'Cliente actualizado desde importación de Excel' }];

    case 'COMMENT_ADDED':
      return [];

    default:
      return [];
  }
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  STATUS_CHANGED: 'Cambio de estado',
  BANK_CHANGED: 'Cambio de banco',
  ASSIGNMENT_CHANGED: 'Cambio de asignación',
  DOC_UPLOADED: 'Documento cargado',
  IMPORTED_CREATED: 'Creado por importación',
  IMPORTED_UPDATED: 'Actualizado por importación',
  COMMENT_ADDED: 'Comentario agregado',
};
