// Módulo 17 · F112 · Escribe la configuración inicial del servicio «pedidos» en el KV de Consul.
// Ejecuta: node f112-config-central/sembrar.js            (equivale a `consul kv put config/pedidos/... valor`)
//          node f112-config-central/sembrar.js pagos.timeoutMs 800    (cambia una sola clave)
import { clienteConsul } from '../comun/consul.js';

const consul = clienteConsul();
const [clave, valor] = process.argv.slice(2);
const pares = clave ? [[clave, valor]] : [['pagos.timeoutMs', '1500'], ['pedidos.montoMaximo', '3000000'], ['funciones.envioGratis', 'false']];
for (const [k, v] of pares) {
  await consul.kv.set({ key: `config/pedidos/${k}`, value: String(v) });
  console.log(`config/pedidos/${k} = ${v}`);
}
