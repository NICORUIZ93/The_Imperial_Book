// Módulo 18 · F113 · Cliente REST con fetch (nativo en Node.js 26: no se instala nada).
// Requisitos: Node.js 26.13.1 LTS.
import { randomUUID } from 'node:crypto';
import { ErrorDeInventario } from './errores.js';

export function clienteFetch(baseUrl, { timeoutMs = 1000 } = {}) {
  return {
    async existencias(sku) {
      let res;
      try {
        res = await fetch(new URL(`/existencias/${encodeURIComponent(sku)}`, baseUrl), {
          headers: { accept: 'application/json', 'x-request-id': randomUUID() },
          // fetch NO tiene timeout por defecto: sin esta línea, una llamada colgada espera indefinidamente.
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (error) {
        // Aquí solo llegan fallos de RED o el timeout: fetch no rechaza por un 404 o un 500.
        if (error.name === 'TimeoutError') throw new ErrorDeInventario('TIEMPO_AGOTADO', `inventario no respondió en ${timeoutMs} ms`, { cause: error });
        throw new ErrorDeInventario('NO_DISPONIBLE', `no se pudo conectar con inventario: ${error.cause?.code ?? error.message}`, { cause: error });
      }
      // fetch resuelve con cualquier código HTTP: hay que mirar res.ok (true solo para 200–299).
      if (res.status === 404) throw new ErrorDeInventario('NO_ENCONTRADO', `inventario no conoce el SKU ${sku}`);
      if (!res.ok) throw new ErrorDeInventario('NO_DISPONIBLE', `inventario respondió ${res.status}`);
      return res.json();
    },
  };
}
