// Módulo 26 · F160 · Event Notification vs Event-Carried State Transfer (ECST), con servidores HTTP reales (node:http).
// El «broker» es un EventEmitter para centrarnos en la forma del evento; con Kafka, RabbitMQ o NATS es igual.
// Requisitos: Node.js 26.13.1 LTS (sin dependencias).
import { EventEmitter } from 'node:events';
import { createServer } from 'node:http';

export const crearBus = () => new EventEmitter();

// Servicio dueño de los datos: catálogo. Publica DOS formas de evento por cada cambio, para comparar.
export async function crearCatalogo(bus) {
  const productos = new Map([['TEC-1', { id: 'TEC-1', nombre: 'Teclado', precio: 100, version: 1 }]]);
  let consultas = 0;
  const servidor = createServer((req, res) => {
    consultas += 1;
    const p = productos.get(req.url.split('/').pop());
    res.writeHead(p ? 200 : 404, { 'content-type': 'application/json' }).end(JSON.stringify(p ?? {}));
  });
  await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${servidor.address().port}`;
  return {
    url,
    get consultas() { return consultas; },
    cambiarPrecio(id, precio) {
      const p = productos.get(id);
      const nuevo = { ...p, precio, version: p.version + 1 };
      productos.set(id, nuevo);
      bus.emit('notificacion', { tipo: 'PrecioCambiado', id, version: nuevo.version }); // delgado: «algo cambió»
      bus.emit('ecst', { tipo: 'ProductoActualizado', ...nuevo }); // gordo: lleva el estado
    },
    cerrar: () => new Promise((r) => { servidor.closeAllConnections(); servidor.close(r); }),
  };
}

// Consumidor con Event Notification: el evento solo avisa; para saber el precio, llama al catálogo.
export function facturacionNotificacion(bus, urlCatalogo) {
  const precios = new Map();
  const errores = [];
  bus.on('notificacion', async ({ id }) => {
    try {
      const r = await fetch(`${urlCatalogo}/productos/${id}`);
      precios.set(id, (await r.json()).precio);
    } catch (error) {
      errores.push(`${id}: ${error.cause?.code ?? error.message}`);
    }
  });
  return { precio: (id) => precios.get(id), errores };
}

// Consumidor con ECST: guarda una réplica local con lo que trae el evento. Ignora versiones viejas (llegan desordenadas).
export function facturacionECST(bus, { respetarVersion = true } = {}) {
  const replica = new Map();
  bus.on('ecst', (evento) => aplicar(evento));
  function aplicar({ id, nombre, precio, version }) {
    const actual = replica.get(id);
    if (respetarVersion && actual && actual.version >= version) return false;
    replica.set(id, { nombre, precio, version });
    return true;
  }
  return { precio: (id) => replica.get(id)?.precio, aplicar };
}
