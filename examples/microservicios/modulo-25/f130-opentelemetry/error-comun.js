// Módulo 21 · F130 · Error común: copiar el arranque de un tutorial de sdk-trace 2.x en sdk-trace 3.1.1.
// En 2.x se escribía new SimpleSpanProcessor(exportador); en 3.x el constructor recibe { exporter }.
// El SDK NO falla al arrancar: el span se crea y la aplicación funciona, pero cada exportación revienta y no ves trazas.
// Por defecto el error es SILENCIOSO (va al logger de diagnóstico de OpenTelemetry, que está apagado).
// Ejecuta: node f130-opentelemetry/error-comun.js                       → 0 spans, ningún mensaje
//          OTEL_LOG_LEVEL=error node f130-opentelemetry/error-comun.js  → aparece el TypeError
import { trace } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor, InMemorySpanExporter } from '@opentelemetry/sdk-trace';

process.env.OTEL_METRICS_EXPORTER = 'none'; process.env.OTEL_LOGS_EXPORTER = 'none';
const exportador = new InMemorySpanExporter();
const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(exportador)], // MAL en 3.x: debe ser { exporter: exportador }
  autoDetectResources: false,
});
sdk.start();

const span = trace.getTracer('demo').startSpan('operacion');
console.log('span grabando:', span.isRecording());
span.end();
await new Promise((r) => setTimeout(r, 100));
console.log('spans exportados:', exportador.getFinishedSpans().length);
await sdk.shutdown().catch(() => {});
