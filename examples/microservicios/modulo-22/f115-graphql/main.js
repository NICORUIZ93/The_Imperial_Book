// Módulo 18 · F115 · Arranca el servidor GraphQL sobre HTTP. Ejecuta: node f115-graphql/main.js
import { startStandaloneServer } from '@apollo/server/standalone';
import { crearServicios } from './datos.js';
import { crearContexto, crearServidor } from './esquema.js';

const servicios = crearServicios(); // en un servicio real: los clientes REST/gRPC de las fichas anteriores
const { url } = await startStandaloneServer(crearServidor(), {
  listen: { host: '127.0.0.1', port: Number(process.env.PORT ?? 4115) },
  context: async () => crearContexto(servicios),
});
console.log(`GraphQL listo en ${url}`);
