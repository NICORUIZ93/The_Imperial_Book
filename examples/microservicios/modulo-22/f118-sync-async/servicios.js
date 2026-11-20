// Módulo 18 · F118 · Sync vs async: el MISMO flujo (crear pedido → cobrar → notificar) con las dos formas de comunicar.
// Requisitos: Node.js 26.13.1 LTS (sin dependencias). La cola en memoria hace aquí el papel del broker
// (RabbitMQ, Kafka o NATS de las fichas anteriores) para que el experimento corra sin infraestructura.
import { createServer } from 'node:http';
import { setTimeout as dormir } from 'node:timers/promises';

// Un servicio HTTP de mentira: tarda `latenciaMs` y se puede «apagar» (responde 503).
export async function servicio(nombre, latenciaMs) {
  const estado = { nombre, caido: false, atendidas: 0 };
  const servidor = createServer(async (_req, res) => {
    await dormir(latenciaMs);
    if (estado.caido) return res.writeHead(503).end();
    estado.atendidas += 1;
    res.writeHead(200).end('ok');
  });
  await new Promise((ok) => servidor.listen(0, ok));
  estado.url = `http://localhost:${servidor.address().port}`;
  estado.cerrar = () => { servidor.closeAllConnections(); servidor.close(); };
  return estado;
}

async function llamar(destino) {
  const res = await fetch(destino.url, { method: 'POST', signal: AbortSignal.timeout(2000) });
  if (!res.ok) throw new Error(`${destino.nombre} respondió ${res.status}`);
}

// SÍNCRONO: pedidos espera a pagos y a notificaciones antes de contestar al cliente.
export function pedidosSincrono({ pagos, notificaciones }) {
  return async function crearPedido(pedidoId) {
    const inicio = performance.now();
    try {
      await llamar(pagos); // necesito la respuesta para decidir → tiene sentido esperar
      await llamar(notificaciones); // NO la necesito para decidir → aquí esperar es acoplamiento gratuito
      return { status: 201, pedidoId, ms: Math.round(performance.now() - inicio) };
    } catch (error) {
      return { status: 503, pedidoId, ms: Math.round(performance.now() - inicio), error: error.message };
    }
  };
}

// La «cola»: guarda los mensajes hasta que el consumidor los procesa con éxito (reintenta si falla).
export function cola() {
  const pendientes = [];
  return {
    pendientes,
    publicar: (mensaje) => { pendientes.push(mensaje); },
    // Procesa lo que haya; lo que falle se queda en la cola para el próximo intento.
    async procesar(manejador) {
      let procesados = 0;
      while (pendientes.length > 0) {
        try { await manejador(pendientes[0]); } catch { break; }
        pendientes.shift();
        procesados += 1;
      }
      return procesados;
    },
  };
}

// ASÍNCRONO (híbrido): el cobro sigue siendo síncrono (se necesita el resultado); la notificación se
// convierte en un evento que se publica y se procesa después. El cliente recibe la respuesta sin esperarla.
export function pedidosAsincrono({ pagos, eventos }) {
  return async function crearPedido(pedidoId) {
    const inicio = performance.now();
    try {
      await llamar(pagos);
      eventos.publicar({ tipo: 'pedido.creado', pedidoId });
      return { status: 201, pedidoId, ms: Math.round(performance.now() - inicio) };
    } catch (error) {
      return { status: 503, pedidoId, ms: Math.round(performance.now() - inicio), error: error.message };
    }
  };
}

export const notificar = (notificaciones) => () => llamar(notificaciones);
