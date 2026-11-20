// Módulo 27 · F164 · movimiento lateral: el atacante controla catalogo y quiere vaciar el stock (POST /admin/ajustes).
// Ejecuta: ./pki/generar.sh && node f164-service-mesh/ataque.js
import { arrancarAntes } from './antes.js';
import { arrancarDespues } from './despues.js';
import { credenciales } from '../comun/pki.js';
import { llamar, resumen } from '../comun/cliente.js';

const catalogo = credenciales('catalogo');
const pedidos = credenciales('pedidos');

console.log('== ANTES (vulnerable): política solo en el gateway del borde');
const a = await arrancarAntes();
console.log(`  catalogo -> gateway  POST /admin/ajustes        : ${resumen(await llamar(`http://127.0.0.1:${a.gw.puerto}/admin/ajustes`, { metodo: 'POST' }))}`);
console.log(`  catalogo -> inventario directo POST /admin/ajustes: ${resumen(await llamar(`http://127.0.0.1:${a.app.puerto}/admin/ajustes`, { metodo: 'POST' }))}`);
const puertoViejo = a.app.puerto;
await a.cerrar();

console.log('== DESPUÉS (seguro): sidecar en cada servicio, mTLS y política en el destino (denegar por defecto)');
const d = await arrancarDespues();
const S = `https://127.0.0.1:${d.sidecar.puerto}`;
console.log(`  catalogo -> sidecar  POST /admin/ajustes        : ${resumen(await llamar(`${S}/admin/ajustes`, { metodo: 'POST', tls: catalogo }))}`);
console.log(`  catalogo -> sidecar  POST /reservas             : ${resumen(await llamar(`${S}/reservas`, { metodo: 'POST', tls: catalogo }))}`);
console.log(`  catalogo -> sidecar  GET /stock                 : ${resumen(await llamar(`${S}/stock`, { tls: catalogo }))}`);
console.log(`  pedidos  -> sidecar  POST /reservas             : ${resumen(await llamar(`${S}/reservas`, { metodo: 'POST', tls: pedidos }))}`);
console.log(`  catalogo -> inventario directo (puerto de antes): ${resumen(await llamar(`http://127.0.0.1:${puertoViejo}/admin/ajustes`, { metodo: 'POST' }))}`);
console.log(`  la app solo escucha en ${d.socket.replace(/.*(pod-inventario-)[^/]+/, '$1…')} (socket local del pod)`);
await d.cerrar();
