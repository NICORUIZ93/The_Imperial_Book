// http/: traduce HTTP ⇄ casos de uso. Aquí viven los códigos de estado; no hay reglas de negocio.
import type { IncomingMessage, ServerResponse } from 'node:http';
import { ErrorDeDominio, NoEncontrado } from '../../../shared/errores.ts';
import type { CasosDeUsoDePedidos } from '../aplicacion/casos-de-uso.ts';

function responder(res: ServerResponse, status: number, cuerpo: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(cuerpo));
}

async function leerJson(req: IncomingMessage): Promise<any> {
  let texto = '';
  for await (const trozo of req) texto += trozo;
  return JSON.parse(texto || '{}');
}

// Devuelve true si la ruta era de este módulo (así app.ts puede probar con el siguiente módulo).
export function rutasDePedidos(casos: CasosDeUsoDePedidos) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<boolean> => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    try {
      if (req.method === 'POST' && url.pathname === '/pedidos') {
        const cuerpo = await leerJson(req);
        const pedido = await casos.crear({ cliente: String(cuerpo.cliente ?? ''), lineas: cuerpo.lineas ?? [] });
        responder(res, 201, pedido);
        return true;
      }
      const m = /^\/pedidos\/([\w-]+)$/.exec(url.pathname);
      if (req.method === 'GET' && m) {
        responder(res, 200, await casos.consultar(m[1]!));
        return true;
      }
      return false;
    } catch (error) {
      if (error instanceof ErrorDeDominio) responder(res, 422, { codigo: error.codigo, detalle: error.message });
      else if (error instanceof NoEncontrado) responder(res, 404, { detalle: error.message });
      else if (error instanceof SyntaxError) responder(res, 400, { detalle: 'JSON inválido' });
      else throw error;
      return true;
    }
  };
}
