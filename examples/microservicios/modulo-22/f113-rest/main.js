// Módulo 18 · F113 · Las mismas cinco llamadas con fetch y con axios.
// Ejecuta: node f113-rest/servicio-inventario.js   y, en otra terminal,   node f113-rest/main.js
import { clienteAxios } from './cliente-axios.js';
import { clienteFetch } from './cliente-fetch.js';

const base = process.env.INVENTARIO_URL ?? 'http://localhost:3113';
const clientes = { fetch: clienteFetch(base, { timeoutMs: 500 }), axios: clienteAxios(base, { timeoutMs: 500 }) };

for (const [nombre, cliente] of Object.entries(clientes)) {
  for (const sku of ['TEC-1', 'NO-HAY', 'ROTO', 'LENTO']) {
    try {
      const { disponibles } = await cliente.existencias(sku);
      console.log(`${nombre.padEnd(5)} ${sku.padEnd(6)} → ${disponibles} disponibles`);
    } catch (error) {
      console.log(`${nombre.padEnd(5)} ${sku.padEnd(6)} → ${error.tipo}: ${error.message}`);
    }
  }
}
// Servicio apagado: un puerto donde no escucha nadie.
for (const cliente of [clienteFetch('http://localhost:39113', { timeoutMs: 500 }), clienteAxios('http://localhost:39113', { timeoutMs: 500 })]) {
  await cliente.existencias('TEC-1').catch((error) => console.log(`apagado      → ${error.tipo}: ${error.message}`));
}
