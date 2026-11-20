// Módulo 18 · F115 · Mide el problema N+1: la MISMA consulta con resolvers ingenuos y con DataLoader.
// Ejecuta: node f115-graphql/n-mas-1.js
import { crearServicios } from './datos.js';
import { crearContexto, crearServidor } from './esquema.js';

const query = '{ pedidos { id total cliente { nombre } } }';
for (const ingenuo of [true, false]) {
  const servicios = crearServicios();
  const servidor = crearServidor({ ingenuo });
  const { body } = await servidor.executeOperation({ query }, { contextValue: crearContexto(servicios) });
  const pedidos = body.singleResult.data.pedidos.length;
  console.log(`${ingenuo ? 'ingenuo   ' : 'DataLoader'} → ${pedidos} pedidos · llamadas a pedidos: ${servicios.llamadas.pedidos} · llamadas a clientes: ${servicios.llamadas.clientes}`);
  await servidor.stop();
}
