// Módulo 18 · F117 · NATS: publicar/suscribir, grupos de cola y petición/respuesta.
// Requisitos: Node.js 26.13.1 LTS, @nats-io/transport-node 3.5.0 y NATS Server 2.15.3 (docker-compose.yml).
import { connect } from '@nats-io/transport-node';

export const URL_NATS = process.env.NATS_URL ?? 'nats://localhost:4222';

export function conectar(nombre, servidores = URL_NATS) {
  // name aparece en el monitoreo del servidor (/connz); el cliente reconecta solo si se cae la conexión.
  return connect({ servers: servidores, name: nombre });
}

// PUBLICAR: se envía a un «subject» (un texto con puntos). No hay cola ni topic que crear antes.
export function publicar(nc, subject, dato) {
  nc.publish(subject, JSON.stringify(dato));
}

// SUSCRIBIR: recibe todo lo que coincida. «*» vale por UN tramo y «>» por uno o más al final.
// Con `grupo`, las suscripciones del mismo grupo se reparten los mensajes (cada mensaje, a una sola).
export function suscribir(nc, subject, alRecibir, { grupo } = {}) {
  return nc.subscribe(subject, {
    queue: grupo,
    callback: (error, msg) => {
      if (error) return console.error(`suscripción ${subject}: ${error.message}`);
      alRecibir(msg.json(), msg.subject);
    },
  });
}

// RESPONDER: un servicio atiende peticiones en un subject. msg.respond() contesta al buzón temporal del que pregunta.
export function responder(nc, subject, manejador, { grupo } = {}) {
  return nc.subscribe(subject, {
    queue: grupo,
    callback: async (_error, msg) => msg.respond(JSON.stringify(await manejador(msg.json()))),
  });
}

// PEDIR: publica y espera UNA respuesta. Sin nadie escuchando falla al instante (no espera al timeout).
export async function pedir(nc, subject, dato, { timeoutMs = 1000 } = {}) {
  const respuesta = await nc.request(subject, JSON.stringify(dato), { timeout: timeoutMs });
  return respuesta.json();
}
