// Módulo 27 · F161 · el mismo ataque contra ANTES y DESPUÉS. Arranca los dos servidores en este proceso.
// Escenario: el atacante controla el pod de «catalogo» (tiene su certificado legítimo de la malla) y quiere cobrar.
// Ejecuta: ./pki/generar.sh && node f161-mtls/ataque.js
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { crearPagosAntes } from './antes.js';
import { crearPagosDespues } from './despues.js';
import { credenciales, DIR_CERTS } from '../comun/pki.js';
import { escuchar, llamar, resumen } from '../comun/cliente.js';

const antes = await escuchar(crearPagosAntes());
const despues = await escuchar(crearPagosDespues());
const A = `http://127.0.0.1:${antes.puerto}/cobros`;
const D = `https://127.0.0.1:${despues.puerto}/cobros`;
const ca = readFileSync(join(DIR_CERTS, 'ca.crt'));
const catalogo = credenciales('catalogo');
const pedidos = credenciales('pedidos');
const intruso = { cert: readFileSync(join(DIR_CERTS, 'intruso.crt')), key: readFileSync(join(DIR_CERTS, 'intruso.key')), ca };
const finge = { 'x-servicio': 'pedidos' };

const casos = [
  ['1. sin certificado, cabecera x-servicio: pedidos', { cabeceras: finge }, { cabeceras: finge, tls: { ca } }],
  ['2. catalogo (cert válido) + x-servicio: pedidos', { cabeceras: finge }, { cabeceras: finge, tls: catalogo }],
  ['3. intruso autofirmado que dice ser pedidos', { cabeceras: finge }, { cabeceras: finge, tls: intruso }],
  ['4. pedidos legítimo', { cabeceras: finge }, { tls: pedidos }],
];
console.log('Ataque F161: cobrar en pagos sin ser pedidos');
for (const [nombre, optA, optD] of casos) {
  const ra = await llamar(A, { metodo: 'POST', cuerpo: { importe: 10 }, ...optA });
  const rd = await llamar(D, { metodo: 'POST', cuerpo: { importe: 10 }, ...optD });
  console.log(nombre);
  console.log(`   ANTES   -> ${resumen(ra)}`);
  console.log(`   DESPUÉS -> ${resumen(rd)}`);
}
await antes.cerrar();
await despues.cerrar();
