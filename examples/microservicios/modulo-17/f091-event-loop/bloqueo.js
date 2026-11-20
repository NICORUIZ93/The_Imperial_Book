// F091 · Error común: un cálculo síncrono en un handler congela TODAS las peticiones del proceso.
// Ejecuta: node f091-event-loop/bloqueo.js
// El servidor corre en un proceso hijo (fork) para que el cliente tenga su propio Event Loop.
import http from 'node:http';
import { fork } from 'node:child_process';

if (process.argv[2] === '--servidor') {
  const servidor = http.createServer((req, res) => {
    if (req.url === '/reporte') {
      const fin = Date.now() + 1000;
      while (Date.now() < fin); // 1 s de CPU sin soltar el hilo (un JSON enorme, un bucle, un hash…)
      return res.end('reporte listo\n');
    }
    res.end('ok\n'); // /salud: debería responder en 1 ms
  });
  servidor.listen(0, () => process.send(servidor.address().port));
} else {
  const hijo = fork(import.meta.filename, ['--servidor']);
  const puerto = await new Promise((r) => hijo.once('message', r));
  const base = `http://localhost:${puerto}`;
  const reporte = fetch(`${base}/reporte`); // lo lanzamos sin esperar
  await new Promise((r) => setTimeout(r, 100));
  const inicio = performance.now();
  try {
    await fetch(`${base}/salud`, { signal: AbortSignal.timeout(300) }); // el health check de Kubernetes
    console.log('salud: ok');
  } catch (error) {
    console.log(`salud: ${error.name}: ${error.message} (tras ${Math.round(performance.now() - inicio)} ms)`);
  }
  console.log((await (await reporte).text()).trim());
  hijo.kill();
}
