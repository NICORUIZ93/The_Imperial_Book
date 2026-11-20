// F095 · Anti-patrón: el mismo servidor SIN manejar SIGTERM. Node muere al instante y corta lo que estaba en curso.
import http from 'node:http';
import { setTimeout as esperar } from 'node:timers/promises';

const servidor = http.createServer(async (req, res) => {
  if (req.url === '/lento') await esperar(1000);
  res.end('pedido procesado\n');
});
servidor.listen(Number(process.env.PORT ?? 3096), () => console.log(`escuchando (PID ${process.pid})`));
