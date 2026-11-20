// Módulo 26 · F157 · Ejecuta (sin infraestructura): node f157-kafka-schema/demo.js
import { codificar, decodificar } from './formato.js';
import { compatible, tipos } from './esquemas.js';

for (const [nombre, nuevo] of [['v2', tipos.v2], ['v2SinDefault', tipos.v2SinDefault], ['v3SinTotal', tipos.v3SinTotal]]) {
  const fila = ['BACKWARD', 'FORWARD', 'FULL'].map((m) => `${m}=${compatible(m, nuevo, tipos.v1) ? 'sí' : 'no'}`).join(' ');
  console.log(`v1 → ${nombre.padEnd(12)} ${fila}`);
}

// Un productor viejo escribe con v1 (id 1); un consumidor nuevo lee con v2 y recibe el valor por defecto.
const mensaje = codificar(1, tipos.v1, { id: 'P-1', total: 120000 });
console.log(`bytes: ${mensaje.subarray(0, 5).toString('hex')} | ${mensaje.subarray(5).toString('hex')} (${mensaje.length} en total)`);
const registro = new Map([[1, tipos.v1], [2, tipos.v2]]);
console.log('consumidor v2 lee un mensaje v1:', JSON.stringify(decodificar(mensaje, (id) => registro.get(id), tipos.v2)));
