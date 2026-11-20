// Módulo 26 · F159 · NATS JetStream: persistencia, deduplicación por Nats-Msg-Id, cola de trabajo con reintentos
// limitados y KV con concurrencia optimista. Requisitos: Node.js 26.13.1 LTS, @nats-io/transport-node, jetstream y kv
// 3.5.0, NATS Server 2.15.3 con JetStream (-js).
import { connect } from '@nats-io/transport-node';
import { AckPolicy, RetentionPolicy, jetstream, jetstreamManager } from '@nats-io/jetstream';
import { Kvm } from '@nats-io/kv';
import { NATS_URL } from '../comun/config.js';

export const ms = (n) => n * 1_000_000; // JetStream mide las duraciones en nanosegundos

export async function conectar(nombre) {
  const nc = await connect({ servers: NATS_URL, name: nombre });
  return { nc, js: jetstream(nc), jsm: await jetstreamManager(nc), kvm: new Kvm(nc) };
}

// Stream = el log persistente de uno o varios subjects. Se borra y se crea para que cada ejecución empiece limpia.
export async function crearStream(jsm, config) {
  await jsm.streams.delete(config.name).catch(() => {});
  return jsm.streams.add(config);
}

// 1) Pedidos con deduplicación: dos publish con el mismo msgID dentro de la ventana guardan UN mensaje.
export const streamPedidos = (jsm, prefijo = 'F159') => crearStream(jsm, {
  name: `${prefijo}_PEDIDOS`, subjects: [`${prefijo.toLowerCase()}.pedidos.>`], duplicate_window: ms(2000),
});

// 2) Cola de trabajo: cada mensaje lo procesa UN consumidor y se borra al confirmarlo (retention: workqueue).
export async function colaDeCobros(jsm, prefijo = 'F159', { maxEntregas = 3, ackWaitMs = 1000 } = {}) {
  await crearStream(jsm, { name: `${prefijo}_COBROS`, subjects: [`${prefijo.toLowerCase()}.cobros`], retention: RetentionPolicy.Workqueue });
  await jsm.consumers.add(`${prefijo}_COBROS`, {
    durable_name: 'cobradores',
    ack_policy: AckPolicy.Explicit, // cada mensaje necesita ack; si no llega en ack_wait, se reentrega
    ack_wait: ms(ackWaitMs),
    max_deliver: maxEntregas, // tras N entregas sin ack, JetStream deja de entregarlo y emite un aviso
  });
}

// Procesa un mensaje: ack si va bien, nak con espera si falla (reintento), term si nunca podrá procesarse.
export async function procesarSiguiente(js, prefijo, procesar) {
  const consumidor = await js.consumers.get(`${prefijo}_COBROS`, 'cobradores');
  const m = await consumidor.next({ expires: 1500 });
  if (!m) return null;
  const entrega = m.info.deliveryCount;
  try {
    await procesar(m.json(), entrega);
    await m.ackAck(); // «doble ack»: espera la confirmación del servidor de que el ack quedó registrado
    return `ack (entrega ${entrega})`;
  } catch (error) {
    if (error.permanente) { m.term(error.message); return `term (entrega ${entrega}): ${error.message}`; }
    m.nak(100); // vuelve a entregarse en ~100 ms
    return `nak (entrega ${entrega}): ${error.message}`;
  }
}

// 3) KV con compare-and-set: update() solo escribe si la revisión no cambió desde que leíste.
export async function reservar(kv, sku, cantidad, { antesDeEscribir } = {}) {
  for (let intento = 1; ; intento++) {
    const entrada = await kv.get(sku);
    const stock = Number(entrada.string());
    if (stock < cantidad) throw new Error(`sin stock de ${sku}`);
    await antesDeEscribir?.(intento);
    try {
      await kv.update(sku, String(stock - cantidad), entrada.revision);
      return intento;
    } catch (error) {
      if (!/wrong last sequence/.test(error.message)) throw error;
      // Otro escribió entre nuestro get y nuestro update: se relee y se reintenta.
    }
  }
}
