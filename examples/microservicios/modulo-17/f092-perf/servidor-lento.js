// F092 · Servidor con un endpoint que bloquea el Event Loop, para perfilarlo con clinic.js o con --cpu-prof.
// Hace 200 peticiones a sí mismo y se cierra, así el perfil se genera sin herramientas de carga.
// Ejecuta: node --cpu-prof --cpu-prof-dir=perfiles f092-perf/servidor-lento.js
//      o:  NO_INSIGHT=1 npx clinic doctor -- node f092-perf/servidor-lento.js
import http from 'node:http';
import { createHash } from 'node:crypto';

function hashCaro(texto) {
  let h = texto;
  for (let i = 0; i < 20_000; i++) h = createHash('sha256').update(h).digest('hex'); // CPU síncrona
  return h;
}

const servidor = http.createServer((req, res) => res.end(hashCaro(req.url).slice(0, 8) + '\n'));
servidor.listen(0, async () => {
  const url = `http://localhost:${servidor.address().port}/pedido`;
  const inicio = performance.now();
  for (let lote = 0; lote < 20; lote++) await Promise.all(Array.from({ length: 10 }, () => fetch(url).then((r) => r.text())));
  console.log(`200 peticiones en ${Math.round(performance.now() - inicio)} ms`);
  servidor.close();
});
