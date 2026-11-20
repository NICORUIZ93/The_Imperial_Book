// Módulo 13 · F095 · Graceful shutdown: apagar sin cortar las peticiones en curso.
// Requisitos: Node.js 26.13.1 LTS (funciona desde Node 22). Sin dependencias.
// Ejecuta: node f095-graceful/servidor.js   y en otra terminal: curl localhost:3095/lento & kill -TERM <PID>
import http from 'node:http';
import { setTimeout as esperar } from 'node:timers/promises';

const PUERTO = Number(process.env.PORT ?? 3095);
const PLAZO_MS = Number(process.env.PLAZO_MS ?? 10_000); // menor que terminationGracePeriodSeconds (30 s en Kubernetes)
let apagando = false;

const servidor = http.createServer(async (req, res) => {
  if (req.url === '/salud') {
    // Readiness: en cuanto empieza el apagado respondemos 503 para que el balanceador deje de enviarnos tráfico.
    res.writeHead(apagando ? 503 : 200).end(apagando ? 'apagando\n' : 'ok\n');
    return;
  }
  if (req.url === '/lento') await esperar(1000); // simula una consulta de 1 s
  // Si empezó el apagado mientras trabajábamos, pedimos al cliente que no reutilice la conexión (keep-alive):
  // así server.close() no tiene que esperar a que caduque.
  if (apagando) res.setHeader('Connection', 'close');
  res.end('pedido procesado\n');
});

async function apagar(senal) {
  if (apagando) return; // una segunda señal no reinicia el proceso de apagado
  apagando = true;
  console.log(`${senal} recibida: dejo de aceptar conexiones y espero las peticiones en curso`);

  // Red de seguridad: si algo no termina en PLAZO_MS, salimos con error (unref: no mantiene vivo el proceso).
  setTimeout(() => {
    console.error(`plazo de ${PLAZO_MS} ms agotado: salida forzada`);
    process.exit(1);
  }, PLAZO_MS).unref();

  servidor.close(() => {
    // Aquí cerrarías el pool de la base de datos, el productor de Kafka, etc. (en orden inverso al arranque).
    console.log('peticiones terminadas; recursos cerrados; adiós');
    process.exit(0);
  });
  servidor.closeIdleConnections(); // cierra ya las conexiones keep-alive que no tienen petición activa
}

process.on('SIGTERM', () => apagar('SIGTERM')); // la que envían Docker, Kubernetes y systemd
process.on('SIGINT', () => apagar('SIGINT'));   // Ctrl + C en la terminal

servidor.listen(PUERTO, () => console.log(`escuchando en ${PUERTO} (PID ${process.pid})`));
