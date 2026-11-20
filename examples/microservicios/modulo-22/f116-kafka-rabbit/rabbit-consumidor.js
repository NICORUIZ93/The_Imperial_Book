// Módulo 18 · F116 · Ejecuta: node f116-kafka-rabbit/rabbit-consumidor.js   (Ctrl+C para salir)
// Arráncalo ANTES que el publicador la primera vez: la cola se crea aquí y un exchange sin colas descarta lo que recibe.
import { consumir } from './rabbit.js';

const consumidor = await consumir({
  cola: 'facturacion.pedidos-creados',
  patron: 'pedido.creado', // solo le interesan los pedidos creados
  alRecibir: async (evento, { reentregado }) => {
    console.log(`facturacion ← ${evento.tipo} (${evento.datos.pedidoId})${reentregado ? ' [reentregado]' : ''}`);
  },
});
console.log('facturacion esperando mensajes en facturacion.pedidos-creados…');
for (const senal of ['SIGINT', 'SIGTERM']) process.on(senal, async () => { await consumidor.cerrar(); process.exit(0); });
