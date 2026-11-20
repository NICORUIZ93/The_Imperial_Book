// Módulo 18 · F116 · El «sobre» común de los eventos y un consumidor idempotente.
// Requisitos: Node.js 26.13.1 LTS (sin dependencias). Lo usan los ejemplos de Kafka y de RabbitMQ.
import { randomUUID } from 'node:crypto';

// Todo evento lleva un id único (para deduplicar), un tipo en pasado y la fecha en que ocurrió.
export function crearEvento(tipo, datos) {
  return { id: randomUUID(), tipo, ocurridoEn: new Date().toISOString(), datos };
}

export const serializar = (evento) => Buffer.from(JSON.stringify(evento));

export function deserializar(buffer) {
  const evento = JSON.parse(buffer.toString());
  if (typeof evento.id !== 'string' || typeof evento.tipo !== 'string') throw new Error('evento sin id o sin tipo');
  return evento;
}

// Los brokers entregan «al menos una vez»: tras un fallo o un rebalanceo el mismo mensaje puede llegar dos
// veces. Este envoltorio recuerda los id ya procesados y descarta las repeticiones.
// (En producción «vistos» vive en Redis o en la base de datos: Módulo 22.)
export function soloUnaVez(manejador, vistos = new Set()) {
  return async (evento) => {
    if (vistos.has(evento.id)) return 'duplicado';
    await manejador(evento); // si lanza, NO se marca como visto: el broker lo reentregará
    vistos.add(evento.id);
    return 'procesado';
  };
}
