// Módulo 31 · F178 · Demo de coexistencia: el monolito sigue escribiendo; el servicio nuevo se alimenta de sus cambios.
// Ejecuta: node f178-coexistencia/demo.js
import { crearMonolitoBD, crearServicioBD } from './bd.js';
import { sincronizar } from './relevo.js';
import { conciliar } from './conciliar.js';

const mono = crearMonolitoBD();
const serv = crearServicioBD();
const ins = mono.prepare('INSERT INTO PEDIDOS VALUES (?, ?, ?, ?)');
ins.run('P-1', 'C-1', 'P', '120,50');
ins.run('P-2', 'C-2', 'P', '75');
ins.run('P-3', 'C-1', 'P', '9,9');
mono.prepare("UPDATE PEDIDOS SET EST = 'F' WHERE NUM_PED = 'P-1'").run();
mono.prepare("DELETE FROM PEDIDOS WHERE NUM_PED = 'P-3'").run();

console.log(`cambios aplicados: ${sincronizar(mono, serv)}`);
console.log(`segunda pasada (nada nuevo): ${sincronizar(mono, serv)}`);
for (const f of serv.prepare('SELECT * FROM pedido ORDER BY id').all()) console.log(`servicio nuevo: ${JSON.stringify({ ...f })}`);
let c = conciliar(mono, serv);
console.log(`conciliación: ${c.revisados} pedidos revisados, ${c.diferencias.length} diferencias`);

// Alguien «arregla a mano» un dato en la base nueva: la conciliación lo detecta.
serv.prepare("UPDATE pedido SET total_centimos = 12000 WHERE id = 'P-1'").run();
c = conciliar(mono, serv);
console.log(`tras un cambio manual en la base nueva: ${c.diferencias.join('; ')}`);
