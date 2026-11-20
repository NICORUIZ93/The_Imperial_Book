// Módulo 21 · F132 · Lee el span activo de OpenTelemetry para pegar trace_id y span_id en cada línea de log.
// Así, desde una línea de log saltas a su traza en Jaeger (y al revés). Requiere @opentelemetry/api 1.10.0.
import { trace } from '@opentelemetry/api';

export function camposDeTraza() {
  const span = trace.getActiveSpan();
  if (!span) return {}; // fuera de una petición (arranque, tareas programadas): no hay traza
  const { traceId, spanId } = span.spanContext();
  return { trace_id: traceId, span_id: spanId };
}
