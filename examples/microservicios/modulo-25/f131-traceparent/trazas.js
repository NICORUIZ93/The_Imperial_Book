// Módulo 21 · F131 · Arranque mínimo de OpenTelemetry SIN instrumentaciones automáticas: aquí la propagación
// por mensajería la haces TÚ, a mano, para ver qué viaja. (En producción, instrumentation-amqplib y
// instrumentation-kafkajs hacen lo mismo por ti; ver la explicación intermedia.)
// Uso: node --import ./f131-traceparent/trazas.js f131-traceparent/consumidor-rabbit.js
// Requisitos: Node.js 26.13.1 LTS, @opentelemetry/sdk-node 0.301.2, @opentelemetry/sdk-trace 3.1.1.
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace';
import { ExportadorResumen } from '../f130-opentelemetry/exportador-resumen.js';

process.env.OTEL_METRICS_EXPORTER ??= 'none';
process.env.OTEL_LOGS_EXPORTER ??= 'none';
// Propagador por defecto del SDK: W3C Trace Context (cabecera traceparent/tracestate) + W3C Baggage.
const sdk = new NodeSDK({ spanProcessors: [new SimpleSpanProcessor({ exporter: new ExportadorResumen() })] });
sdk.start();
export const apagarTrazas = () => sdk.shutdown();
