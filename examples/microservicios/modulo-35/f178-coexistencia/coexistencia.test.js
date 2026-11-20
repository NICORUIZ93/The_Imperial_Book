// Módulo 31 · F178 · tests: node --test f178-coexistencia/coexistencia.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearMonolitoBD, crearServicioBD } from './bd.js';
import { traducir } from './acl.js';
import { sincronizar } from './relevo.js';
import { conciliar } from './conciliar.js';

test('la ACL traduce estados y convierte el importe con coma a céntimos enteros', () => {
  assert.deepEqual(traducir({ num_ped: 'P-1', cod_cli: 'C-1', est: 'F', importe: '1234,5' }),
    { id: 'P-1', clienteId: 'C-1', estado: 'FACTURADO', totalCentimos: 123450 });
  assert.throws(() => traducir({ num_ped: 'P-1', cod_cli: 'C-1', est: 'X', importe: '1' }), /desconocido: X/);
});

test('el relevo aplica altas, cambios y bajas en orden y es idempotente', () => {
  const m = crearMonolitoBD(); const s = crearServicioBD();
  m.prepare("INSERT INTO PEDIDOS VALUES ('P-1','C-1','P','10')").run();
  m.prepare("UPDATE PEDIDOS SET EST='A' WHERE NUM_PED='P-1'").run();
  m.prepare("INSERT INTO PEDIDOS VALUES ('P-2','C-1','P','5')").run();
  m.prepare("DELETE FROM PEDIDOS WHERE NUM_PED='P-2'").run();
  assert.equal(sincronizar(m, s), 4);
  assert.equal(sincronizar(m, s), 0);
  assert.deepEqual(s.prepare('SELECT id, estado FROM pedido').all().map((f) => ({ ...f })), [{ id: 'P-1', estado: 'ANULADO' }]);
});

test('si un cambio no se puede traducir, no avanza la posición (se reintenta, no se pierde)', () => {
  const m = crearMonolitoBD(); const s = crearServicioBD();
  m.prepare("INSERT INTO PEDIDOS VALUES ('P-1','C-1','P','10')").run();
  m.prepare("INSERT INTO PEDIDOS VALUES ('P-2','C-1','Z','10')").run();
  assert.throws(() => sincronizar(m, s), /desconocido: Z/);
  assert.equal(s.prepare("SELECT pos FROM posicion").get().pos, 0);
  assert.equal(s.prepare('SELECT count(*) AS n FROM pedido').get().n, 0);
});

test('la conciliación detecta faltantes, sobrantes y campos distintos', () => {
  const m = crearMonolitoBD(); const s = crearServicioBD();
  m.prepare("INSERT INTO PEDIDOS VALUES ('P-1','C-1','P','10')").run();
  sincronizar(m, s);
  assert.deepEqual(conciliar(m, s).diferencias, []);
  m.prepare("INSERT INTO PEDIDOS VALUES ('P-2','C-1','P','10')").run(); // aún no sincronizado
  s.prepare("INSERT INTO pedido VALUES ('P-9','C-9','PENDIENTE',1)").run();
  s.prepare("UPDATE pedido SET estado='FACTURADO' WHERE id='P-1'").run();
  assert.deepEqual(conciliar(m, s).diferencias.sort(), [
    'P-1.estado: monolito=PENDIENTE servicio=FACTURADO', 'P-2: falta en el servicio nuevo', 'P-9: sobra en el servicio nuevo']);
});
