// Módulo 0.5 · «Hola Mundo» como servidor HTTP en Node.js, solo con 'node:http' (sin Express todavía).
// Requisitos: Node.js 26.13.1 LTS. Sin dependencias.
// Ejecuta (desde la carpeta node/):  node servidor.js     y prueba:  curl http://localhost:3000/hola

import http from 'node:http';

export function crearServidor() {
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/hola') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Hola Mundo desde Node.js\n');
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('No encontrado\n');
  });
}

if (import.meta.main) {
  // El puerto llega por variable de entorno (Módulo 0.4); 3000 si no existe.
  const puerto = Number(process.env.PUERTO ?? 3000);
  const servidor = crearServidor().listen(puerto, () =>
    console.log(`Servidor Node.js escuchando en http://localhost:${puerto}/hola`));
  // Docker detiene el contenedor enviando SIGTERM: cerramos ordenadamente.
  process.on('SIGTERM', () => servidor.close(() => process.exit(0)));
}
