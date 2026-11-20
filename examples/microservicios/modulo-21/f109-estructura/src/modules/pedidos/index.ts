// index.ts: la API PÚBLICA del módulo. Otros módulos y app.ts solo pueden importar desde aquí;
// lo demás (dominio/, aplicacion/, infraestructura/, http/) es privado del módulo.
import type { IncomingMessage, ServerResponse } from 'node:http';
import { crearCasosDeUso } from './aplicacion/casos-de-uso.ts';
import { rutasDePedidos } from './http/pedidos.rutas.ts';
import { idsSecuenciales, repositorioEnMemoria } from './infraestructura/repositorio-en-memoria.ts';

export type { Pedido } from './dominio/pedido.ts';

export function moduloDePedidos(opciones: { montoMaximo: number }): (req: IncomingMessage, res: ServerResponse) => Promise<boolean> {
  // Raíz de composición del módulo: aquí (y solo aquí) se eligen las implementaciones concretas.
  const casos = crearCasosDeUso({
    repositorio: repositorioEnMemoria(),
    ids: idsSecuenciales(),
    montoMaximo: opciones.montoMaximo,
  });
  return rutasDePedidos(casos);
}
