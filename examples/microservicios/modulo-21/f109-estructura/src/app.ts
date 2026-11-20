// app.ts: arma el servidor con los módulos. No escucha en ningún puerto: eso lo hace main.ts,
// y así los tests pueden arrancarlo en un puerto libre (listen(0)).
import { createServer, type Server } from 'node:http';
import type { Config } from './config/config.ts';
import { moduloDePedidos } from './modules/pedidos/index.ts';

export function crearApp(config: Config): Server {
  const modulos = [moduloDePedidos({ montoMaximo: config.montoMaximo })];
  return createServer(async (req, res) => {
    try {
      if (req.method === 'GET' && req.url === '/salud') {
        res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ servicio: config.servicio, estado: 'ok' }));
        return;
      }
      for (const modulo of modulos) if (await modulo(req, res)) return;
      res.writeHead(404, { 'content-type': 'application/json' }).end(JSON.stringify({ detalle: `No existe ${req.method} ${req.url}` }));
    } catch (error) {
      console.error(error);
      res.writeHead(500, { 'content-type': 'application/json' }).end(JSON.stringify({ detalle: 'Error interno' }));
    }
  });
}
