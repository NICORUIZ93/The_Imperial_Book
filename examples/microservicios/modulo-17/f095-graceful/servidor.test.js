// Verificación F095: node --test f095-graceful/servidor.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as esperar } from 'node:timers/promises';

function arrancar(archivo, puerto) {
  const proceso = spawn(process.execPath, [new URL(archivo, import.meta.url).pathname], { env: { ...process.env, PORT: String(puerto) } });
  let salida = '';
  proceso.stdout.on('data', (d) => (salida += d));
  proceso.stderr.on('data', (d) => (salida += d));
  return { proceso, salida: () => salida };
}

async function listo(puerto) {
  for (let i = 0; i < 50; i++) {
    try { return await fetch(`http://localhost:${puerto}/salud`); } catch { await esperar(100); }
  }
  throw new Error('el servidor no arrancó');
}

test('con graceful shutdown, la petición en curso termina y el proceso sale con 0', async () => {
  const { proceso, salida } = arrancar('./servidor.js', 3195);
  await listo(3195);
  const enCurso = fetch('http://localhost:3195/lento');
  await esperar(200);
  proceso.kill('SIGTERM');
  const respuesta = await enCurso;
  assert.equal(respuesta.status, 200);
  assert.equal(await respuesta.text(), 'pedido procesado\n');
  const [codigo] = await once(proceso, 'exit');
  assert.equal(codigo, 0);
  assert.match(salida(), /SIGTERM recibida/);
  assert.match(salida(), /adiós/);
  await assert.rejects(fetch('http://localhost:3195/salud'), /fetch failed/); // ya no acepta conexiones
});

test('sin manejador, SIGTERM corta la petición en curso', async () => {
  const { proceso } = arrancar('./sin-graceful.js', 3196);
  await listo(3196);
  const enCurso = fetch('http://localhost:3196/lento');
  await esperar(200);
  proceso.kill('SIGTERM');
  await assert.rejects(enCurso, /fetch failed/);
  const [codigo, senal] = await once(proceso, 'exit');
  assert.equal(codigo, null);
  assert.equal(senal, 'SIGTERM');
});
