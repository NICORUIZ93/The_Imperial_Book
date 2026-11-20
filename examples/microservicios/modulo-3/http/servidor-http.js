// Módulo 0.4 · HTTP: un servidor que muestra las piezas de HTTP (método, ruta, cabeceras, estado, cuerpo).
// Requisitos: Node.js 26.13.1 LTS (funciona desde Node 22). Usa solo 'node:http'.
// Ejecuta: node http/servidor-http.js   y en otra terminal:  curl -i http://localhost:3002/saludo

import http from 'node:http';

export function crearServidor() {
  return http.createServer(async (req, res) => {
    // LÍNEA DE PETICIÓN: método + ruta.  CABECERAS: req.headers (en minúsculas).
    const idioma = req.headers['accept-language']?.startsWith('en') ? 'en' : 'es';

    if (req.url === '/saludo') {
      if (req.method !== 'GET') {
        // 405: la ruta existe, pero no acepta ese método. La cabecera Allow dice cuáles sí.
        res.writeHead(405, { Allow: 'GET', 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Método no permitido\n');
      }
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Curso': 'microservicios' });
      return res.end(idioma === 'en' ? 'Hello\n' : 'Hola\n');
    }

    if (req.url === '/eco' && req.method === 'POST') {
      let cuerpo = '';
      for await (const trozo of req) cuerpo += trozo;
      if (!req.headers['content-type']?.startsWith('application/json')) {
        res.writeHead(415, { 'Content-Type': 'text/plain; charset=utf-8' }); // 415: formato no soportado
        return res.end('Envía Content-Type: application/json\n');
      }
      let datos;
      try {
        datos = JSON.parse(cuerpo);
      } catch {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }); // 400: petición mal formada
        return res.end('El cuerpo no es JSON válido\n');
      }
      res.writeHead(201, { 'Content-Type': 'application/json' }); // 201: se creó algo
      return res.end(JSON.stringify({ recibido: datos }));
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); // 404: no existe
    res.end('No encontrado\n');
  });
}

if (import.meta.main) {
  const puerto = Number(process.env.PORT ?? 3002);
  crearServidor().listen(puerto, () => console.log(`HTTP de práctica en http://localhost:${puerto}`));
}
