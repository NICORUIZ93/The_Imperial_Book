// Módulo 21 · F130 · Exportador didáctico: imprime UNA línea por span con lo que importa para entender una traza.
// Implementa la interfaz SpanExporter de @opentelemetry/sdk-trace 3.1.1: export(spans, callback) y shutdown().
import { SpanKind } from '@opentelemetry/api';

const TIPOS = { [SpanKind.INTERNAL]: 'INTERNAL', [SpanKind.SERVER]: 'SERVER', [SpanKind.CLIENT]: 'CLIENT',
  [SpanKind.PRODUCER]: 'PRODUCER', [SpanKind.CONSUMER]: 'CONSUMER' };

export function resumir(span) {
  const servicio = span.resource.attributes['service.name'];
  const padre = span.parentSpanContext?.spanId ?? '(raíz)';
  const ms = (span.duration[0] * 1e3 + span.duration[1] / 1e6).toFixed(1);
  return `[${servicio}] ${TIPOS[span.kind].padEnd(8)} ${span.name.padEnd(28)} traza=${span.spanContext().traceId} span=${span.spanContext().spanId} padre=${padre} ${ms} ms`;
}

export class ExportadorResumen {
  export(spans, alTerminar) {
    for (const span of spans) console.log(resumir(span));
    alTerminar({ code: 0 }); // 0 = ExportResultCode.SUCCESS
  }
  shutdown() { return Promise.resolve(); }
}
