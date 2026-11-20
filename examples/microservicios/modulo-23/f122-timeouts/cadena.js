// Módulo 19 · F122 · Cadena bff -> pedidos -> inventario con presupuesto de latencia (Express 5.3.0).
// Requisitos: Node.js 26.13.1 LTS e infraestructura arriba.
// Ejecuta: node f122-timeouts/cadena.js     (bff en :3122, pedidos en :3222; PROPAGAR=no para ver la versión mala)
import express from 'express';
import { once } from 'node:events';
import { CABECERA, esTimeout, fetchConTimeout, presupuestoDe } from './con-timeout.js';

const INVENTARIO_URL = process.env.INVENTARIO_URL ?? 'http://127.0.0.1:21212';

/** Timeouts del SERVIDOR HTTP: protegen de clientes lentos o que dejan conexiones abiertas. */
function protegerServidor(servidor) {
  servidor.headersTimeout = 10_000;   // máx. para recibir las cabeceras completas (defecto 60 000)
  servidor.requestTimeout = 30_000;   // máx. para recibir la petición entera, cuerpo incluido (defecto 300 000)
  servidor.keepAliveTimeout = 65_000; // conexión inactiva; MAYOR que el idle timeout del balanceador (60 s típico)
  return servidor;
}

export async function arrancarCadena({ propagar = true, puertoBff = 3122, puertoPedidos = 3222, log = console.log } = {}) {
  // ---------- pedidos: llama al inventario ----------
  const pedidos = express();
  pedidos.get('/pedidos/:sku', async (req, res) => {
    const inicio = performance.now();
    // Con propagación: lo que diga el llamador. Sin propagación: un timeout fijo de 3 s «por si acaso».
    const limite = propagar ? presupuestoDe(req.headers).paraLlamar() : 3000;
    try {
      const { cuerpo } = await fetchConTimeout(`${INVENTARIO_URL}/stock/${req.params.sku}`, { timeoutMs: limite });
      log(`   [pedidos] respondió a los ${Math.round(performance.now() - inicio)} ms (límite ${limite} ms)`);
      res.json({ pedido: 1, ...cuerpo });
    } catch (error) {
      log(`   [pedidos] ${esTimeout(error) ? 'canceló la llamada al inventario' : error.name} a los ${Math.round(performance.now() - inicio)} ms (límite ${limite} ms)`);
      res.status(esTimeout(error) ? 504 : 502).json({ error: 'inventario no respondió a tiempo' });
    }
  });

  // ---------- bff: tiene 1000 ms para responder al usuario ----------
  const bff = express();
  bff.get('/resumen/:sku', async (req, res) => {
    const inicio = performance.now();
    const presupuesto = presupuestoDe(req.headers, { porDefectoMs: 1000 });
    try {
      const r = await fetchConTimeout(`http://127.0.0.1:${puertoPedidos}/pedidos/${req.params.sku}`, {
        timeoutMs: presupuesto.restante(),
        headers: propagar ? { [CABECERA]: String(presupuesto.paraLlamar()) } : {}, // el presupuesto viaja río abajo
      });
      log(`   [bff] respondió ${r.status} a los ${Math.round(performance.now() - inicio)} ms`);
      res.status(r.status).json(r.cuerpo);
    } catch (error) {
      log(`   [bff] ${esTimeout(error) ? 'agotó su presupuesto' : error.name} a los ${Math.round(performance.now() - inicio)} ms`);
      res.status(504).json({ error: 'tiempo agotado' });
    }
  });

  const servidores = [protegerServidor(pedidos.listen(puertoPedidos)), protegerServidor(bff.listen(puertoBff))];
  await Promise.all(servidores.map((s) => once(s, 'listening')));
  return { cerrar: () => servidores.forEach((s) => { s.close(); s.closeAllConnections(); }) };
}

if (import.meta.main) {
  await arrancarCadena({ propagar: process.env.PROPAGAR !== 'no' });
  console.log(`bff en :3122 -> pedidos en :3222 -> inventario ${INVENTARIO_URL} (propagar=${process.env.PROPAGAR !== 'no'})`);
}
