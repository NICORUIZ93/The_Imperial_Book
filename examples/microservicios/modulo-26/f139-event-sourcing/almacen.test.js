// Módulo 22 · F139 · Verificación: el MISMO contrato contra el almacén en memoria y contra MongoDB (MONGO_URL).
// Ejecuta: node --test f139-event-sourcing/almacen.test.js   (MongoDB se OMITE si no responde, salvo EXIGIR_INFRA=1)
import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { MONGO_URL } from '../comun/config.js';
import { omitirSinInfra } from '../comun/infra.js';
import { abrirAlmacen } from './almacen.js';
import { ejecutar, reconstruir, decidir, INICIAL, ReglaDeNegocio } from './pedido.js';

const sinMongo = await omitirSinInfra('MongoDB', MONGO_URL, 27017);

for (const tipo of ['memoria', 'mongo']) {
  describe(`almacén ${tipo}`, { skip: tipo === 'mongo' && sinMongo }, () => {
    let almacen, cerrar;
    const stream = () => `t${process.pid}x${Math.random().toString(36).slice(2, 8)}`;
    before(async () => ({ almacen, cerrar } = await abrirAlmacen({ tipo, basedatos: 'modulo26_test' })));
    after(async () => { await cerrar?.(); });

    test('anexar y leer: el estado se reconstruye de los eventos en orden', async () => {
      const id = stream();
      await ejecutar(almacen, id, { tipo: 'Crear', cliente: 'ana' });
      await ejecutar(almacen, id, { tipo: 'AgregarLinea', sku: 'A', cantidad: 2, precio: 10 });
      const v = await ejecutar(almacen, id, { tipo: 'Confirmar' });
      const { eventos, version } = await almacen.leerStream(`pedido-${id}`);
      assert.equal(v, 3); assert.equal(version, 3);
      assert.deepEqual(eventos.map((e) => e.tipo), ['PedidoCreado', 'LineaAgregada', 'PedidoConfirmado']);
      assert.deepEqual({ ...reconstruir(eventos), lineas: undefined }, { existe: true, estado: 'CONFIRMADO', cliente: 'ana', lineas: undefined, total: 20 });
    });

    test('versión esperada vieja → ConflictoDeConcurrencia (y no se escribe nada)', async () => {
      const s = `pedido-${stream()}`;
      await almacen.anexar(s, 0, [{ tipo: 'PedidoCreado', datos: { cliente: 'ana' } }]);
      await assert.rejects(almacen.anexar(s, 0, [{ tipo: 'PedidoCreado', datos: { cliente: 'eva' } }]), { name: 'ConflictoDeConcurrencia' });
      assert.equal((await almacen.leerStream(s)).eventos.length, 1);
    });

    test('dos escritores A LA VEZ con la misma versión: exactamente uno gana', async () => {
      const s = `pedido-${stream()}`;
      const r = await Promise.allSettled([1, 2, 3].map((n) => almacen.anexar(s, 0, [{ tipo: 'PedidoCreado', datos: { cliente: `c${n}` } }])));
      assert.equal(r.filter((x) => x.status === 'fulfilled').length, 1);
      assert.ok(r.filter((x) => x.status === 'rejected').every((x) => x.reason.name === 'ConflictoDeConcurrencia'));
    });

    test('un commit con varios eventos se guarda entero y avanza la versión en N', async () => {
      const s = `pedido-${stream()}`;
      const v = await almacen.anexar(s, 0, [{ tipo: 'PedidoCreado', datos: {} }, { tipo: 'LineaAgregada', datos: { cantidad: 1, precio: 5 } }]);
      assert.equal(v, 2);
      const commits = await almacen.leerDesde(0, 100_000);
      const mio = commits.filter((c) => c.stream === s);
      assert.equal(mio.length, 1); assert.equal(mio[0].eventos.length, 2);
    });
  });
}

test('las reglas viven en decidir(): no se agregan líneas a un pedido confirmado', () => {
  assert.throws(() => decidir({ ...INICIAL, existe: true, estado: 'CONFIRMADO' }, { tipo: 'AgregarLinea', sku: 'A', cantidad: 1, precio: 1 }), ReglaDeNegocio);
  assert.deepEqual(decidir({ ...INICIAL, estado: 'CANCELADO' }, { tipo: 'Cancelar' }), [], 'cancelar dos veces no genera eventos');
});
