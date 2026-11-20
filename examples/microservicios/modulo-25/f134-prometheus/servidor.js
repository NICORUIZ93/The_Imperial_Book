// Módulo 21 · F134 · Servicio «pedidos» que expone /metrics para que Prometheus lo raspe (scrape).
// Ejecuta: node f134-prometheus/servidor.js   →   curl localhost:9464/metrics
import http from 'node:http';
import { crearMetricas, medir } from './metricas.js';

export function crearServidor(metricas = crearMetricas()) {
  const verPedido = medir(metricas, '/pedidos/:id', async (req, res) => {
    const id = req.url.split('/')[2];
    await new Promise((r) => setTimeout(r, Number(id) % 2 ? 30 : 5)); // impares «lentos» para ver el histograma
    res.writeHead(id === '404' ? 404 : 200, { 'content-type': 'application/json' }).end(JSON.stringify({ id }));
  });
  return http.createServer(async (req, res) => {
    if (req.url === '/metrics') {
      res.writeHead(200, { 'content-type': metricas.registro.contentType });
      res.end(await metricas.registro.metrics()); // texto en el formato de exposición de Prometheus
    } else if (req.url.startsWith('/pedidos/')) {
      await verPedido(req, res);
    } else {
      res.writeHead(404).end();
    }
  });
}

if (import.meta.main) { // solo al ejecutarlo directamente (Node 26), no al importarlo desde el test
  const puerto = Number(process.env.PORT ?? 9464);
  crearServidor().listen(puerto, () => console.log(`pedidos con /metrics en http://localhost:${puerto}/metrics`));
}
