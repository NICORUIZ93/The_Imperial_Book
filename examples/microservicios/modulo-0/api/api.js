// Módulo 0.1 · Qué es una API
// Una API es el "menú" de un servidor: una lista fija de pedidos que acepta
// (rutas + métodos), con la forma exacta de lo que devuelve (JSON).
// Requisitos: Node.js 26.13.1 LTS (funciona desde Node 22). Usa solo 'node:http'.
// Ejecuta: node api/api.js  y prueba:
//   curl http://localhost:3001/api/menu
//   curl http://localhost:3001/api/menu/2
//   curl -X POST http://localhost:3001/api/pedidos -H 'Content-Type: application/json' -d '{"platoId":2,"cantidad":3}'

import http from 'node:http';

const menu = [
  { id: 1, nombre: 'Arepa', precio: 5000 },
  { id: 2, nombre: 'Empanada', precio: 3000 },
  { id: 3, nombre: 'Limonada', precio: 4000 },
];

// Ayudante: toda respuesta de esta API es JSON, con un código de estado.
function responderJson(respuesta, estado, cuerpo) {
  respuesta.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8' });
  respuesta.end(JSON.stringify(cuerpo));
}

// Lee el cuerpo del pedido (llega en trozos) y lo convierte de texto JSON a objeto.
async function leerJson(pedido) {
  let texto = '';
  for await (const trozo of pedido) texto += trozo;
  return JSON.parse(texto);
}

export function crearApi() {
  return http.createServer(async (pedido, respuesta) => {
    const { method, url } = pedido;

    // Contrato 1: GET /api/menu -> lista completa
    if (method === 'GET' && url === '/api/menu') {
      return responderJson(respuesta, 200, menu);
    }

    // Contrato 2: GET /api/menu/{id} -> un plato o 404
    const coincide = url.match(/^\/api\/menu\/(\d+)$/);
    if (method === 'GET' && coincide) {
      const plato = menu.find((p) => p.id === Number(coincide[1]));
      return plato
        ? responderJson(respuesta, 200, plato)
        : responderJson(respuesta, 404, { error: 'No existe ese plato' });
    }

    // Contrato 3: POST /api/pedidos {platoId, cantidad} -> 201 con el total, o 400 si el pedido está mal hecho
    if (method === 'POST' && url === '/api/pedidos') {
      let datos;
      try {
        datos = await leerJson(pedido);
      } catch {
        return responderJson(respuesta, 400, { error: 'El cuerpo no es JSON válido' });
      }
      const plato = menu.find((p) => p.id === datos.platoId);
      if (!plato || !Number.isInteger(datos.cantidad) || datos.cantidad < 1) {
        return responderJson(respuesta, 400, { error: 'Necesito platoId existente y cantidad entera mayor que 0' });
      }
      return responderJson(respuesta, 201, { plato: plato.nombre, cantidad: datos.cantidad, total: plato.precio * datos.cantidad });
    }

    // Cualquier otra cosa no está en el menú de la API.
    return responderJson(respuesta, 404, { error: `La API no ofrece ${method} ${url}` });
  });
}

if (import.meta.main) {
  const puerto = Number(process.env.PORT ?? 3001);
  crearApi().listen(puerto, () => console.log(`API escuchando en http://localhost:${puerto}/api/menu`));
}
