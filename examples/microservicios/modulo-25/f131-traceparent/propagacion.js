// Módulo 21 · F131 · Propagación de traceparent en mensajes AMQP (RabbitMQ) y Kafka.
// Requisitos: Node.js 26.13.1 LTS, @opentelemetry/api 1.10.0 (usa el propagador global que registra el SDK).
import { context, propagation, trace, ROOT_CONTEXT, SpanKind } from '@opentelemetry/api';

const tracer = trace.getTracer('f131-mensajeria', '1.0.0');

// PRODUCTOR: copia el contexto activo (la traza en curso) a un objeto de cabeceras del mensaje.
// Resultado: { traceparent: '00-<trace-id 32 hex>-<span-id 16 hex>-01' } (+ tracestate y baggage si los hay).
export function inyectar(cabeceras = {}) {
  propagation.inject(context.active(), cabeceras);
  return cabeceras;
}

// CONSUMIDOR AMQP: amqplib entrega las cabeceras como strings en msg.properties.headers.
export function extraerAmqp(mensaje) {
  return propagation.extract(ROOT_CONTEXT, mensaje.properties.headers ?? {});
}

// CONSUMIDOR Kafka: kafkajs entrega cada cabecera como Buffer (o arreglo de Buffers). El getter por defecto
// del propagador espera strings: hay que convertir, o la traza se corta en silencio (ver error-comun.js).
export const getterKafka = {
  keys: (cabeceras) => Object.keys(cabeceras),
  get: (cabeceras, clave) => {
    const valor = cabeceras[clave];
    if (valor === undefined) return undefined;
    return Array.isArray(valor) ? valor.map((v) => v.toString()) : valor.toString();
  },
};
export function extraerKafka(mensaje) {
  return propagation.extract(ROOT_CONTEXT, mensaje.headers ?? {}, getterKafka);
}

// Envuelve el envío en un span PRODUCER e inyecta SU contexto: el consumidor quedará colgado de este span.
export function conSpanProductor(destino, enviar) {
  return tracer.startActiveSpan(`publicar ${destino}`, { kind: SpanKind.PRODUCER,
    attributes: { 'messaging.destination.name': destino } }, async (span) => {
    try { return await enviar(inyectar({})); } finally { span.end(); }
  });
}

// Procesa un mensaje dentro de un span CONSUMER cuyo padre es el contexto que vino en las cabeceras.
export function conSpanConsumidor(destino, contextoPadre, procesar) {
  return tracer.startActiveSpan(`procesar ${destino}`, { kind: SpanKind.CONSUMER,
    attributes: { 'messaging.destination.name': destino } }, contextoPadre, async (span) => {
    try { return await procesar(span); } finally { span.end(); }
  });
}
