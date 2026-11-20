// Módulo 31 · F178 · ERROR COMÚN: «doble escritura» desde la aplicación. El monolito guarda el pedido y luego llama al
// servicio nuevo; si esa segunda escritura falla (red, despliegue, timeout), las dos bases divergen sin que nadie lo sepa.
// Ejecuta: node f178-coexistencia/error-comun.js
import { crearMonolitoBD, crearServicioBD } from './bd.js';
import { traducir } from './acl.js';
import { conciliar } from './conciliar.js';

const mono = crearMonolitoBD();
const serv = crearServicioBD();
let llamada = 0;
function escribirEnServicioNuevo(p) { // simula la llamada HTTP al servicio nuevo: la 2.ª falla por timeout
  if (++llamada === 2) throw new Error('ETIMEDOUT llamando a pedidos-nuevo');
  serv.prepare('INSERT INTO pedido VALUES (?, ?, ?, ?)').run(p.id, p.clienteId, p.estado, p.totalCentimos);
}
for (const [num, cli, est, imp] of [['P-1', 'C-1', 'P', '10'], ['P-2', 'C-2', 'P', '20'], ['P-3', 'C-3', 'P', '30']]) {
  mono.prepare('INSERT INTO PEDIDOS VALUES (?, ?, ?, ?)').run(num, cli, est, imp); // 1.ª escritura: hecha
  try { escribirEnServicioNuevo(traducir({ num_ped: num, cod_cli: cli, est, importe: imp })); } // 2.ª: puede fallar
  catch (e) { console.log(`${num}: ${e.message} (el monolito ya lo guardó; el usuario vio «OK»)`); }
}
const c = conciliar(mono, serv);
console.log(`conciliación: ${c.revisados} revisados, ${c.diferencias.length} diferencia(s): ${c.diferencias.join('; ')}`);
