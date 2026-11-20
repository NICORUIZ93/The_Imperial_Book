// Módulo 30 · F173 · Error común: desplegar UN servicio que comparte el DTO con otros.
// precios v2 renombra `precio` → `valor`; pedidos (aún en v1) no falla: devuelve total null y sigue. Solo «funciona»
// si se despliegan juntos, que es justo lo que define a un monolito distribuido. Ejecuta: node f173-monolito-distribuido/error-comun.js
import { obtener } from '../comun/http.js';
import { crearSistema } from './sistema.js';

const ruta = '/pedidos/simular?sku=TEC-1&cantidad=2';
const mal = await crearSistema({ versionPrecios: 2 });
console.log(`MAL  → precios v2 + pedidos v1: ${JSON.stringify(await obtener(mal.pedidos.url + ruta))}`);
await mal.cerrar();

// Arreglo: cambio compatible (expandir y contraer): v2 publica `valor` Y `precio` hasta que nadie lea `precio`.
const bien = await crearSistema({ versionPrecios: 'compatible' });
console.log(`BIEN → contrato compatible (expandir y contraer): ${JSON.stringify(await obtener(bien.pedidos.url + ruta))}`);
await bien.cerrar();
