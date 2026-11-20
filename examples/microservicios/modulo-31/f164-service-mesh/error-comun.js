// Módulo 27 · F164 · ERROR COMÚN en Istio ambient: aplicar una política L7 (métodos, rutas) sin waypoint.
// ztunnel solo entiende L4 (identidad, namespace, IP, puerto): ignora las reglas con métodos o rutas, así que una
// ALLOW con ellas no coincide NUNCA y deniega también el tráfico legítimo (curl: «exit code 56», conexión cortada).
// Arreglo: desplegar un waypoint (istioctl waypoint apply -n tienda --enroll-namespace) y enlazar la política con
// targetRefs al Service; o escribir la política solo con atributos L4.
// Ejecuta: node f164-service-mesh/error-comun.js
import { arrancarDespues } from './despues.js';
import { credenciales } from '../comun/pki.js';
import { llamar, resumen } from '../comun/cliente.js';

const pedidos = credenciales('pedidos');
for (const capa of ['L4', 'L7']) {
  const d = await arrancarDespues({ capa });
  const r = await llamar(`https://127.0.0.1:${d.sidecar.puerto}/stock`, { tls: pedidos });
  console.log(`${capa === 'L4' ? 'solo ztunnel (L4), política con métodos/rutas' : 'con waypoint (L7), misma política           '} -> pedidos GET /stock: ${resumen(r)}`);
  await d.cerrar();
}
