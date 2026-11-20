// Módulo 19 · F119 · ERROR COMÚN: sin errorFilter, los 404 de negocio abren el circuito y tumban las consultas válidas.
// Requisitos: Node.js 26.13.1 LTS, opossum 10.0.0 e infraestructura arriba. Ejecuta: node f119-circuit-breaker/error-comun.js
import CircuitBreaker from 'opossum';
import { sanar, INVENTARIO_URL } from '../comun/toxiproxy.js';
import { consultarStock, crearCircuitoDeInventario, OPCIONES_POR_DEFECTO } from './cliente-inventario.js';

await sanar();
async function probar(titulo, circuito) {
  console.log(`== ${titulo}`);
  // Un cliente con un catálogo desactualizado pregunta 5 veces por un sku que no existe (404).
  for (let i = 0; i < 5; i += 1) await circuito.fire('999').catch(() => {});
  // …y ahora otro cliente pregunta por un sku que SÍ existe, con el inventario perfectamente sano.
  const resultado = await circuito.fire('7').then((r) => `OK ${JSON.stringify(r)}`, (e) => `RECHAZADA ${e.code}`);
  console.log(`   tras cinco 404 → failures=${circuito.stats.failures} abierto=${circuito.opened} · consulta válida: ${resultado}`);
  circuito.shutdown();
}
await probar('MAL: sin errorFilter', new CircuitBreaker((sku) => consultarStock(INVENTARIO_URL, sku), OPCIONES_POR_DEFECTO));
await probar('BIEN: errorFilter descarta los errores de negocio', crearCircuitoDeInventario(INVENTARIO_URL));
