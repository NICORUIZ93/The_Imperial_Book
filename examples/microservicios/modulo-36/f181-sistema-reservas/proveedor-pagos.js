// Módulo 32 · F181 · Simulador del PROVEEDOR DE PAGOS EXTERNO (no es nuestro: no podemos cambiar su código ni su límite).
// POST /cobros     {reservaId, importe, tarjeta}  + cabecera Idempotency-Key  -> 201 APROBADO | 402 RECHAZADO | 429
// POST /reembolsos {cobroId}                      + cabecera Idempotency-Key  -> 201 REEMBOLSADO
// Opciones: limiteRps (la «restricción sobrevenida» de F185: 429 con Retry-After), latenciaMs.
// Ejecuta solo: node f181-sistema-reservas/proveedor-pagos.js   (puerto 8090; LIMITE_RPS=20 para activar el límite)
import { pathToFileURL } from 'node:url';
import { http, json, leerCuerpo } from '../comun/http.js';
import { espera } from '../comun/estadistica.js';

export function crearProveedor({ limiteRps = Infinity, latenciaMs = 5 } = {}) {
  const stats = { peticiones: 0, cobros: 0, reembolsos: 0, rechazados429: 0, porSegundo: new Map() };
  const porClave = new Map(); // Idempotency-Key -> respuesta ya dada (se repite tal cual, sin cobrar dos veces)
  let ventana = 0; let enVentana = 0;
  const servidor = http.createServer(async (req, res) => {
    stats.peticiones++;
    const ahora = Math.floor(Date.now() / 1000);
    if (ahora !== ventana) { ventana = ahora; enVentana = 0; }
    if (++enVentana > limiteRps) { // ventana fija de 1 s, como anuncian muchos proveedores
      stats.rechazados429++;
      return json(res, 429, { error: `límite de ${limiteRps} peticiones/s superado` }, { 'retry-after': '1' });
    }
    stats.porSegundo.set(ahora, (stats.porSegundo.get(ahora) ?? 0) + 1);
    const cuerpo = JSON.parse((await leerCuerpo(req)) || '{}');
    await espera(latenciaMs);
    const clave = req.headers['idempotency-key'];
    if (clave && porClave.has(`${req.url}:${clave}`)) { const [e, c] = porClave.get(`${req.url}:${clave}`); return json(res, e, c); }
    let estado; let respuesta;
    if (req.url === '/cobros') {
      if (cuerpo.tarjeta === '4000-RECHAZAR') { estado = 402; respuesta = { estado: 'RECHAZADO', motivo: 'fondos insuficientes' }; }
      else { stats.cobros++; estado = 201; respuesta = { cobroId: `CB-${cuerpo.reservaId}`, estado: 'APROBADO', importe: cuerpo.importe }; }
    } else if (req.url === '/reembolsos') {
      stats.reembolsos++; estado = 201; respuesta = { cobroId: cuerpo.cobroId, estado: 'REEMBOLSADO' };
    } else { return json(res, 404, { error: 'no existe' }); }
    if (clave) porClave.set(`${req.url}:${clave}`, [estado, respuesta]);
    json(res, estado, respuesta);
  });
  return { servidor, stats };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { servidor } = crearProveedor({ limiteRps: Number(process.env.LIMITE_RPS ?? Infinity) });
  servidor.listen(Number(process.env.PORT ?? 8090), () => console.log(`proveedor de pagos en :${servidor.address().port}`));
}
