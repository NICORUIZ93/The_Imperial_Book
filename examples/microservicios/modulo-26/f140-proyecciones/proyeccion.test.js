// Módulo 22 · F140 · Verificación: la proyección coincide con el agregado, se puede repetir, sobrevive a caídas y
// se reconstruye igual. Ejecuta: node --test f140-proyecciones/proyeccion.test.js   (sin infraestructura)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AlmacenEventosMemoria } from '../f139-event-sourcing/almacen-memoria.js';
import { ejecutar, reconstruir } from '../f139-event-sourcing/pedido.js';
import { ProyeccionResumenPedidos } from './proyeccion.js';
import { escenario, ProyeccionIngenua } from './error-comun.js';

async function almacenConPedidos() {
  const a = new AlmacenEventosMemoria();
  for (const [id, cliente, n] of [['P-1', 'ana', 2], ['P-2', 'luis', 1], ['P-3', 'ana', 3]]) {
    await ejecutar(a, id, { tipo: 'Crear', cliente });
    for (let i = 0; i < n; i++) await ejecutar(a, id, { tipo: 'AgregarLinea', sku: `S${i}`, cantidad: 1, precio: 10 });
  }
  await ejecutar(a, 'P-1', { tipo: 'Confirmar' });
  return a;
}

test('la tabla coincide con reconstruir() de cada stream', async () => {
  const almacen = await almacenConPedidos();
  const vista = new ProyeccionResumenPedidos(almacen);
  await vista.ponerseAlDia();
  for (const fila of vista.consultar('SELECT * FROM resumen_pedidos')) {
    const estado = reconstruir((await almacen.leerStream(`pedido-${fila.id}`)).eventos);
    assert.deepEqual([fila.estado, fila.total, fila.lineas], [estado.estado, estado.total, estado.lineas.length]);
  }
});

test('ponerseAlDia() dos veces no duplica nada (el checkpoint manda)', async () => {
  const vista = new ProyeccionResumenPedidos(await almacenConPedidos());
  const primera = await vista.ponerseAlDia();
  assert.equal(await vista.ponerseAlDia(), 0);
  assert.equal(vista.checkpoint(), primera);
  assert.equal(vista.consultar('SELECT SUM(total) AS t FROM resumen_pedidos')[0].t, 60);
});

test('caída a mitad de un commit: ROLLBACK y al reintentar el total es correcto', async () => {
  assert.equal(await escenario(ProyeccionResumenPedidos), 150);
});

test('reconstruir() desde cero da exactamente la misma tabla', async () => {
  const vista = new ProyeccionResumenPedidos(await almacenConPedidos());
  await vista.ponerseAlDia();
  const antes = vista.consultar('SELECT * FROM resumen_pedidos ORDER BY id');
  await vista.reconstruir();
  assert.deepEqual(vista.consultar('SELECT * FROM resumen_pedidos ORDER BY id'), antes);
});

test('error común: con el checkpoint fuera de la transacción, la caída duplica importes', async () => {
  assert.equal(await escenario(ProyeccionIngenua), 250);
});
