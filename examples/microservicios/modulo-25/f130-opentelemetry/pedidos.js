// Módulo 21 · F130 · Servicio «pedidos»: POST /pedidos/:sku consulta el stock en inventario y responde.
// Las llamadas HTTP entrantes y el fetch saliente los instrumenta telemetria.js; el span «validar-pedido» es MANUAL.
// Ejecuta: OTEL_SERVICE_NAME=pedidos node --import ./f130-opentelemetry/telemetria.js f130-opentelemetry/pedidos.js
import http from 'node:http';
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('pedidos', '1.0.0'); // nombre y versión de TU código (instrumentation scope)
const puerto = Number(process.env.PORT ?? 3130);
const INVENTARIO = process.env.INVENTARIO_URL ?? 'http://localhost:3131';

// Span manual: un trozo de lógica de negocio que quieres ver como un bloque propio en la traza.
function validarPedido(sku, disponibles) {
  return tracer.startActiveSpan('validar-pedido', (span) => {
    span.setAttribute('pedido.sku', sku);
    span.setAttribute('inventario.disponibles', disponibles);
    const ok = disponibles > 0;
    if (!ok) span.setStatus({ code: SpanStatusCode.ERROR, message: 'sin stock' });
    span.end(); // un span sin end() nunca se exporta
    return ok;
  });
}

http.createServer(async (req, res) => {
  const sku = req.url.split('/')[2];
  // fetch está instrumentado (undici): crea un span CLIENT e inyecta la cabecera traceparent.
  const r = await fetch(`${INVENTARIO}/stock/${sku}`);
  const datos = await r.json();
  const ok = r.ok && validarPedido(sku, datos.disponibles);
  res.writeHead(ok ? 201 : 409, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ sku, aceptado: ok }));
}).listen(puerto, () => console.log(`pedidos escuchando en ${puerto}`));
