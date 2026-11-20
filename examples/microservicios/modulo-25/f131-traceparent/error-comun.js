// Módulo 21 · F131 · Error común: en Kafka la traza «se corta» entre productor y consumidor.
// Causa: kafkajs entrega las cabeceras como Buffer y el propagador W3C, con su getter por defecto, solo lee strings.
// Ejecuta: OTEL_SERVICE_NAME=demo node --import ./f131-traceparent/trazas.js f131-traceparent/error-comun.js
import { trace, propagation, ROOT_CONTEXT } from '@opentelemetry/api';
import { inyectar, getterKafka } from './propagacion.js';
import { apagarTrazas } from './trazas.js';

await trace.getTracer('demo').startActiveSpan('publicar', async (span) => {
  const { traceparent } = inyectar({});
  const cabecerasKafka = { traceparent: Buffer.from(traceparent) }; // así llega en eachMessage({ message })
  console.log('cabecera tal como llega del broker:', cabecerasKafka.traceparent);

  const mal = trace.getSpanContext(propagation.extract(ROOT_CONTEXT, cabecerasKafka));
  console.log('getter por defecto →', mal ? `traza ${mal.traceId}` : 'sin contexto: el consumidor empieza una traza NUEVA');
  const bien = trace.getSpanContext(propagation.extract(ROOT_CONTEXT, cabecerasKafka, getterKafka));
  console.log('getterKafka        →', `traza ${bien.traceId} · ¿es la del productor? ${bien.traceId === span.spanContext().traceId}`);
  span.end();
});
await apagarTrazas();
