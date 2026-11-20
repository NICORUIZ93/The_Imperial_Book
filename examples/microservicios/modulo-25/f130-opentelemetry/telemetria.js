// Módulo 21 · F130 · OpenTelemetry para Node: arranque del SDK. Se carga ANTES que la aplicación:
//   node --import ./f130-opentelemetry/telemetria.js f130-opentelemetry/pedidos.js
// Requisitos: Node.js 26.13.1 LTS, @opentelemetry/sdk-node 0.301.2, @opentelemetry/sdk-trace 3.1.1,
// @opentelemetry/auto-instrumentations-node 0.83.1, @opentelemetry/exporter-trace-otlp-http 0.301.2, import-in-the-middle 3.6.0.
// Variables: OTEL_SERVICE_NAME (nombre del servicio en Jaeger), TRAZAS=resumen|otlp (adónde van los spans).
import { register } from 'import-in-the-middle/register-hooks.mjs';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor, SimpleSpanProcessor } from '@opentelemetry/sdk-trace';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ExportadorResumen } from './exportador-resumen.js';

// ESM: sin este hook, los `import` de tu aplicación (node:http, amqplib…) NO se parchean y solo verías los spans
// de fetch (que se instrumenta por diagnostics_channel). Con CommonJS (require) no hace falta.
// import-in-the-middle 3.6.0 usa module.registerHooks() (síncrono, Node 26); el antiguo
// module.register('@opentelemetry/instrumentation/hook.mjs') también funciona, pero Node 26 avisa DEP0205.
register();

const destino = process.env.TRAZAS ?? 'resumen';
// sdk-trace 3.x: los procesadores reciben un OBJETO de opciones { exporter } (en 2.x era el exportador suelto).
const procesador = destino === 'otlp'
  // OTLP por HTTP al colector (o directo a Jaeger): por defecto http://localhost:4318/v1/traces.
  // Batch: agrupa spans y los envía cada pocos segundos, sin bloquear las peticiones.
  ? new BatchSpanProcessor({ exporter: new OTLPTraceExporter() })
  // Resumen en consola, una línea por span, al terminar cada span (solo para aprender: es síncrono).
  : new SimpleSpanProcessor({ exporter: new ExportadorResumen() });

// Este módulo solo exporta TRAZAS: las métricas van con el cliente de Prometheus (F134) y los logs con Pino (F132).
// Sin estas dos líneas el SDK intenta enviar métricas y logs por OTLP a localhost:4318 y, si no hay colector, falla al salir.
process.env.OTEL_METRICS_EXPORTER ??= 'none';
process.env.OTEL_LOGS_EXPORTER ??= 'none';

const sdk = new NodeSDK({
  spanProcessors: [procesador],
  instrumentations: [
    getNodeAutoInstrumentations({
      // fs genera un span por cada lectura de disco: ruido. Lo apagamos como se hace en producción.
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});
sdk.start(); // desde aquí, http, fetch (undici), amqplib, kafkajs, pino… quedan instrumentados

// Graceful shutdown: vacía el buffer de spans antes de salir (si no, se pierden los últimos).
for (const senal of ['SIGTERM', 'SIGINT']) {
  process.once(senal, () => sdk.shutdown().finally(() => process.exit(0)));
}
