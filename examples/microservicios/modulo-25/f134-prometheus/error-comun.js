// Módulo 21 · F134 · Dos errores comunes con el cliente de Prometheus.
// 1) Usar la URL real como etiqueta: una serie temporal NUEVA por cada id → explosión de cardinalidad.
// 2) Declarar la métrica dentro de una función que se llama más de una vez (o recargar el módulo) con el registro global.
// Ejecuta: node f134-prometheus/error-comun.js
import client from '@prometheus-io/client';

const registro = new client.Registry();
const mal = new client.Counter({ name: 'mal_peticiones_total', help: 'MAL', labelNames: ['ruta'], registers: [registro] });
const bien = new client.Counter({ name: 'bien_peticiones_total', help: 'BIEN', labelNames: ['ruta'], registers: [registro] });
for (let id = 1; id <= 1000; id++) {
  mal.inc({ ruta: `/pedidos/${id}` });   // MAL: req.url
  bien.inc({ ruta: '/pedidos/:id' });    // BIEN: la plantilla de la ruta
}
const series = async (m) => (await m.get()).values.length;
console.log(`1000 peticiones con ruta=req.url      → ${await series(mal)} series`);
console.log(`1000 peticiones con ruta=/pedidos/:id → ${await series(bien)} serie`);

function registrarContador() { return new client.Counter({ name: 'pedidos_creados_total', help: 'Pedidos creados' }); }
registrarContador();
try { registrarContador(); } catch (error) { console.log('Segunda declaración →', error.message); }
