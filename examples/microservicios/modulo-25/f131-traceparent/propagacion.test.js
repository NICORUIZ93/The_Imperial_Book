// Módulo 21 · F131 · Verificación sin broker: el traceparent sobrevive al viaje por cabeceras AMQP y Kafka.
// Ejecuta: node --import ./f131-traceparent/trazas.js --test f131-traceparent/propagacion.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trace, propagation, ROOT_CONTEXT } from '@opentelemetry/api';
import { inyectar, extraerAmqp, extraerKafka } from './propagacion.js';

const tracer = trace.getTracer('test');
const enSpan = (fn) => tracer.startActiveSpan('origen', (span) => { try { return fn(span); } finally { span.end(); } });

test('inyectar escribe traceparent con el formato W3C 00-traceid-spanid-flags del span activo', () => {
  enSpan((span) => {
    const { traceparent } = inyectar({});
    const { traceId, spanId } = span.spanContext();
    assert.match(traceparent, /^00-[0-9a-f]{32}-[0-9a-f]{16}-0[01]$/);
    assert.equal(traceparent, `00-${traceId}-${spanId}-01`);
  });
});

test('sin span activo no se inyecta nada (no hay traza que continuar)', () => {
  assert.deepEqual(inyectar({}), {});
});

test('AMQP: lo que el consumidor extrae de properties.headers es el span del productor', () => {
  enSpan((span) => {
    const mensaje = { properties: { headers: inyectar({ 'x-otra': 'cabecera' }) } }; // como lo entrega amqplib
    const remoto = trace.getSpanContext(extraerAmqp(mensaje));
    assert.equal(remoto.traceId, span.spanContext().traceId);
    assert.equal(remoto.spanId, span.spanContext().spanId);
    assert.equal(remoto.isRemote, true);
  });
});

test('Kafka: con cabeceras Buffer, extraerKafka recupera la traza y el getter por defecto la pierde', () => {
  enSpan((span) => {
    const cabeceras = Object.fromEntries(Object.entries(inyectar({})).map(([k, v]) => [k, Buffer.from(v)]));
    const mensaje = { headers: cabeceras }; // así entrega kafkajs 2.2.4 cada mensaje en eachMessage
    assert.equal(trace.getSpanContext(extraerKafka(mensaje)).traceId, span.spanContext().traceId);
    // Error común: extraer con el getter por defecto → no hay contexto → el consumidor empieza OTRA traza.
    assert.equal(trace.getSpanContext(propagation.extract(ROOT_CONTEXT, mensaje.headers)), undefined);
  });
});

test('un traceparent corrupto se ignora sin lanzar: el consumidor arranca una traza nueva', () => {
  const contexto = extraerAmqp({ properties: { headers: { traceparent: '00-xyz-1-01' } } });
  assert.equal(trace.getSpanContext(contexto), undefined);
});
