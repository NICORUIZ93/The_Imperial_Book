// Módulo 23 · F146 · Simulación de despliegue Canary y Blue-Green con procesos reales del servicio «pedidos».
// Arranca v1 (estable) y v2 (nueva) con dist/servidor.js, pone delante un enrutador HTTP y envía tráfico de 400 usuarios.
// Requisitos: Node.js 26.13.1 LTS y npm run build. Uso: node f146-blue-green-canary/simulacion.js [tasaErrorV2=0.2]
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { BlueGreen, Canary, analizar } from './despliegue.js';

const tasaErrorV2 = process.argv[2] ?? '0.2';
const PASOS = [10, 25, 50, 100];

async function arrancar(version, puerto, tasaError) {
  const p = spawn(process.execPath, ['dist/servidor.js'], { env: { ...process.env, PORT: String(puerto), VERSION: version, TASA_ERROR: tasaError, ESPERA_DRENADO_MS: '0' }, stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((ok) => p.stdout.on('data', (t) => String(t).includes('escuchando') && ok()));
  return p;
}
const v1 = await arrancar('v1', 18461, '0');
const v2 = await arrancar('v2', 18462, tasaErrorV2);
const destinos = { estable: 18461, canary: 18462, blue: 18461, green: 18462 };

let politica = new Canary(0);
const metricas = { estable: { total: 0, errores: 0 }, canary: { total: 0, errores: 0 } };
const enrutador = createServer(async (req, res) => {
  const destino = politica.elegir(req.headers['x-usuario']);
  const r = await fetch(`http://127.0.0.1:${destinos[destino]}${req.url}`);
  if (metricas[destino]) { metricas[destino].total++; if (r.status >= 500) metricas[destino].errores++; }
  res.writeHead(r.status, { 'content-type': 'application/json' }).end(await r.text());
}).listen(0);
await once(enrutador, 'listening');
const base = `http://127.0.0.1:${enrutador.address().port}`;

async function trafico(n, desde = 0) { // n peticiones de usuarios distintos; devuelve {v1: x, v2: y, errores: z}
  const cuenta = { v1: 0, v2: 0, errores: 0 };
  for (let i = desde; i < desde + n; i++) {
    const r = await fetch(`${base}/pedidos/p${i}`, { headers: { 'x-usuario': `u${i % 400}` } });
    const { version } = await r.json();
    cuenta[version]++;
    if (r.status >= 500) cuenta.errores++;
  }
  return cuenta;
}

console.log(`== CANARY: v2 con tasa de error ${tasaErrorV2}`);
let resultado = 'promovida';
for (const peso of PASOS) {
  politica.peso = peso;
  metricas.estable = { total: 0, errores: 0 }; metricas.canary = { total: 0, errores: 0 };
  const c = await trafico(200, peso * 1000);
  const decision = peso === 100 ? (analizar(metricas) === 'abortar' ? 'abortar' : 'fin') : analizar(metricas);
  console.log(`   peso ${String(peso).padStart(3)} % -> v1=${String(c.v1).padStart(3)} v2=${String(c.v2).padStart(3)} errores v2=${metricas.canary.errores}/${metricas.canary.total} -> ${decision}`);
  if (decision === 'abortar') { politica.peso = 0; resultado = 'abortada: todo el tráfico vuelve a v1'; break; }
}
console.log(`   resultado: ${resultado}`);
const tras = await trafico(100, 90_000);
console.log(`   después: v1=${tras.v1} v2=${tras.v2} errores=${tras.errores}`);

console.log('== BLUE-GREEN: blue=v1 activo, green=v2 desplegado y probado aparte');
politica = new BlueGreen('blue');
const antes = await trafico(100, 95_000);
politica.cambiar();
const despues = await trafico(100, 96_000);
politica.cambiar();
const vuelta = await trafico(100, 97_000);
console.log(`   blue activo  -> v1=${antes.v1} v2=${antes.v2}`);
console.log(`   cambio a green -> v1=${despues.v1} v2=${despues.v2} errores=${despues.errores}`);
console.log(`   rollback a blue -> v1=${vuelta.v1} v2=${vuelta.v2}`);

enrutador.close(); v1.kill(); v2.kill();
