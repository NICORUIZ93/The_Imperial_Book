// Test de variables de entorno: lanza config.js como proceso hijo con distintos entornos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { leerConfig } from './config.js';

const ejecutar = (env, args = []) =>
  spawnSync(process.execPath, [...args, 'config.js'], {
    cwd: import.meta.dirname,
    env: { PATH: process.env.PATH, ...env }, // entorno limpio: solo lo que pasamos
    encoding: 'utf8',
  });

test('sin variables usa los valores por defecto', () => {
  assert.equal(ejecutar({}).stdout.trim(), 'puerto=8080 modo=desarrollo claveApi=(sin definir)');
});

test('las variables cambian el comportamiento sin tocar el código', () => {
  assert.equal(ejecutar({ PUERTO: '9000' }).stdout.trim(), 'puerto=9000 modo=desarrollo claveApi=(sin definir)');
});

test('--env-file lee el archivo .env.example y oculta el secreto', () => {
  assert.equal(ejecutar({}, ['--env-file=.env.example']).stdout.trim(), 'puerto=8081 modo=produccion claveApi=abc***');
});

test('un valor inválido detiene el programa con código 1', () => {
  const r = ejecutar({ PUERTO: 'ochenta' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /PUERTO inválido/);
});

test('produccion sin CLAVE_API es un error', () => {
  assert.throws(() => leerConfig({ MODO: 'produccion' }), /CLAVE_API es obligatoria/);
});
