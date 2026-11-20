// Verificación F098 (Zod): node --test f098-validacion/zod-express.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ClienteNuevo, crearApp } from './zod-express.js';

test('safeParse limpia, convierte y aplica defaults', () => {
  const r = ClienteNuevo.safeParse({ nombre: '  Ana ', email: 'ana@correo.co', edad: '30' });
  assert.equal(r.success, true);
  assert.deepEqual(r.data, { nombre: 'Ana', email: 'ana@correo.co', edad: 30, plan: 'basico' });
});

test('safeParse informa cada campo inválido y los campos desconocidos', () => {
  const r = ClienteNuevo.safeParse({ nombre: 'A', email: 'no-es-email', edad: 15, rol: 'admin' });
  assert.equal(r.success, false);
  assert.deepEqual(r.error.issues.map((i) => i.path.join('.') || i.code).sort(), ['edad', 'email', 'nombre', 'unrecognized_keys']);
});

test('POST /clientes inválido → 400 con errores por campo', async () => {
  const servidor = crearApp().listen(0);
  await new Promise((r) => servidor.once('listening', r));
  const base = `http://localhost:${servidor.address().port}`;
  const enviar = (cuerpo) => fetch(`${base}/clientes`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) });
  try {
    const malo = await enviar({ nombre: 'A', email: 'x', edad: 15, rol: 'admin' });
    assert.equal(malo.status, 400);
    const cuerpo = await malo.json();
    assert.deepEqual(cuerpo.errores.edad, ['debe ser mayor de edad']);
    assert.deepEqual(cuerpo.desconocidos, ['rol']);
    const bueno = await enviar({ nombre: 'Ana', email: 'ana@correo.co', edad: 30, plan: 'pro' });
    assert.equal(bueno.status, 201);
  } finally {
    servidor.close();
  }
});
