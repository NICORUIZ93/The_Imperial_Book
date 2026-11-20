// Módulo 21 · F133 · Un servidor que acepta POST /loki/api/v1/push y guarda lo recibido (solo para los tests).
// No es Loki: no indexa ni consulta. Comprueba la FORMA del payload que exige la API de push de Loki.
import http from 'node:http';

export function lokiFalso() {
  const recibidos = [];
  const servidor = http.createServer((req, res) => {
    let cuerpo = '';
    req.on('data', (d) => { cuerpo += d; });
    req.on('end', () => {
      if (req.method !== 'POST' || req.url !== '/loki/api/v1/push') { res.writeHead(404).end(); return; }
      const payload = JSON.parse(cuerpo);
      recibidos.push(payload);
      res.writeHead(204).end(); // Loki responde con un 2xx cuando acepta el push (envio-loki.js solo mira r.ok)
    });
  });
  return new Promise((resolver) => servidor.listen(0, '127.0.0.1', () => resolver({
    url: `http://127.0.0.1:${servidor.address().port}`, recibidos, cerrar: () => servidor.close(),
  })));
}
