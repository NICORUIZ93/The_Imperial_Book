// Módulo 18 · F116 · Ejecuta: node f116-kafka-rabbit/kafka-consumidor.js   (Ctrl+C para salir)
import { soloUnaVez } from './evento.js';
import { consumir, crearKafka } from './kafka.js';

const facturar = soloUnaVez(async (evento) => { /* aquí iría el trabajo real */ });
const consumidor = await consumir(crearKafka({ clientId: 'facturacion' }), {
  grupo: process.env.GRUPO ?? 'facturacion',
  alRecibir: async (evento, { particion, offset, clave }) => {
    console.log(`partición=${particion} offset=${offset} clave=${clave} ${evento.tipo} → ${await facturar(evento)}`);
  },
});
console.log('facturacion esperando eventos…');
for (const senal of ['SIGINT', 'SIGTERM']) process.on(senal, async () => { await consumidor.cerrar(); process.exit(0); });
