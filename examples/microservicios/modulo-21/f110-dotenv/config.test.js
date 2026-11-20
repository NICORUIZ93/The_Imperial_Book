// Módulo 17 · F110 · Ejecuta: node --test f110-dotenv/config.test.js
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, test } from 'node:test';
import { cargarConfig, sinSecretos, validar } from './config.js';

let carpeta;
beforeEach(() => { carpeta = mkdtempSync(join(tmpdir(), 'dotenv-')); });
afterEach(() => rmSync(carpeta, { recursive: true, force: true }));

const ENV_VALIDO = 'PORT=4000\nDATABASE_URL=postgres://u:secreto@db:5432/pedidos\nPAGOS_URL=http://pagos:3200\nMENSAJE_BIENVENIDA="Hola desde el archivo"\n';

test('carga .env, convierte tipos y aplica valores por defecto', () => {
  writeFileSync(join(carpeta, '.env'), ENV_VALIDO);
  const { config, origen } = cargarConfig({ carpeta, env: {} });
  assert.equal(origen, '.env + entorno');
  assert.deepEqual(config, {
    PORT: 4000, // número, no texto
    NODE_ENV: 'development', // por defecto
    DATABASE_URL: 'postgres://u:secreto@db:5432/pedidos',
    PAGOS_URL: 'http://pagos:3200',
    PAGOS_TIMEOUT_MS: 2000, // por defecto
    MENSAJE_BIENVENIDA: 'Hola desde el archivo', // sin las comillas
  });
});

test('una variable del entorno real le gana al archivo .env', () => {
  writeFileSync(join(carpeta, '.env'), ENV_VALIDO);
  const { config } = cargarConfig({ carpeta, env: { PORT: '9999' } });
  assert.equal(config.PORT, 9999);
});

test('sin archivo .env funciona solo con el entorno (así corre en producción)', () => {
  const { config, origen } = cargarConfig({ carpeta, env: { DATABASE_URL: 'postgres://a:b@c/d', PAGOS_URL: 'http://pagos' } });
  assert.equal(origen, 'solo entorno (no hay .env)');
  assert.equal(config.PORT, 3110);
});

test('falla al arrancar con TODOS los errores juntos', () => {
  assert.throws(() => validar({ PORT: 'tres mil', NODE_ENV: 'prod', PAGOS_URL: 'pagos sin esquema' }), {
    message: 'Configuración inválida:\n  - PORT debe ser un entero y llegó "tres mil"\n  - NODE_ENV debe ser uno de development, test, production y llegó "prod"\n  - DATABASE_URL es obligatoria y no está definida\n  - PAGOS_URL debe ser una URL y llegó "pagos sin esquema"',
  });
});

test('la configuración es inmutable y los secretos no llegan al log', () => {
  const config = validar({ DATABASE_URL: 'postgres://u:secreto@db/p', PAGOS_URL: 'http://pagos' });
  assert.throws(() => { config.PORT = 1; }, TypeError);
  assert.equal(sinSecretos(config).DATABASE_URL, '***');
  assert.ok(!JSON.stringify(sinSecretos(config)).includes('secreto'));
});
