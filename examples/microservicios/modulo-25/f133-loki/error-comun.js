// Módulo 21 · F133 · Error común: poner un id (pedidoId) como ETIQUETA. Cada valor distinto crea un stream nuevo en Loki:
// el índice crece sin control, las consultas se vuelven lentas y Loki empieza a rechazar pushes por límite de streams.
// Ejecuta: node f133-loki/error-comun.js
import { aPayloadLoki } from './envio-loki.js';

const ns = (BigInt(Date.now()) * 1_000_000n).toString();
const lineas = Array.from({ length: 1000 }, (_, i) => ({ ns, linea: JSON.stringify({ servicio: 'pedidos', level: 'info', pedidoId: `P-${i}` }) }));

const bien = aPayloadLoki(lineas, { entorno: 'lab' });
// MAL: se «promueve» pedidoId a etiqueta (lo que hace un pipeline mal configurado en Alloy o en el propio código).
const malConId = { streams: lineas.map(({ ns, linea }) => ({ stream: { entorno: 'lab', servicio: 'pedidos', level: 'info', pedidoId: JSON.parse(linea).pedidoId }, values: [[ns, linea]] })) };

console.log(`1000 líneas con etiquetas {entorno, servicio, level}        → ${bien.streams.length} stream`);
console.log(`1000 líneas con etiquetas {entorno, servicio, level, pedidoId} → ${malConId.streams.length} streams`);
