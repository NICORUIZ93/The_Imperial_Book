// Módulo 31 · F177 · Demo: monolito + servicio nuevo + fachada. Ejecuta: node f177-strangler-fig/demo.js
import { readFileSync } from 'node:fs';
import { cerrar, escuchar, pedir } from '../comun/http.js';
import { crearMonolito } from './monolito.js';
import { crearPedidosNuevo } from './pedidos-nuevo.js';
import { crearFachada, elegirDestino } from './fachada.js';

const rutas = JSON.parse(readFileSync(new URL('./rutas.json', import.meta.url)));
const mono = crearMonolito();
const nuevo = crearPedidosNuevo();
const destinos = { monolito: await escuchar(mono), pedidos: await escuchar(nuevo) };
const fachada = crearFachada({ rutas, destinos });
const url = await escuchar(fachada);

const casos = [
  ['GET', '/api/pedidos/P-7'],
  ['POST', '/api/pedidos'],
  ['GET', '/api/clientes/C-1'],
  ['GET', '/api/pedidos-antiguos'],
];
console.log('fase 2 de la migración: /api/pedidos al 100 % en el servicio nuevo');
for (const [metodo, ruta] of casos) {
  const r = await pedir(url + ruta, metodo === 'POST'
    ? { method: 'POST', headers: { 'content-type': 'application/json', 'x-cliente-id': 'C-1' }, body: JSON.stringify({ id: 'P-8' }) }
    : { headers: { 'x-cliente-id': 'C-1' } });
  console.log(`${metodo.padEnd(4)} ${ruta.padEnd(22)} -> ${r.estado} servido por ${r.servidoPor}`);
}

// Despliegue gradual: con el 10 % de los clientes, ¿cuántos de 1000 van al servicio nuevo?
const al10 = [{ ...rutas[0], porcentaje: 10 }];
let nuevos = 0;
for (let i = 0; i < 1000; i++) if (elegirDestino('GET', '/api/pedidos/P-1', al10, `C-${i}`) === 'pedidos') nuevos++;
console.log(`fase 1 (10 %): ${nuevos} de 1000 clientes van a pedidos-nuevo; el mismo cliente siempre al mismo sitio`);

await Promise.all([cerrar(fachada), cerrar(mono), cerrar(nuevo)]);
