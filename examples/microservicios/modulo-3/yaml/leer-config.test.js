// Test de YAML: estructura por sangría, tipos, error por tabulación y el "problema de Noruega".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { leerConfig } from './leer-config.js';

const config = leerConfig(readFileSync(new URL('./config.yaml', import.meta.url), 'utf8'));

test('la sangría crea objetos anidados', () => {
  assert.equal(config.servicio.nombre, 'pedidos');
  assert.equal(config.base_de_datos.pool, 10);
});

test('YAML adivina tipos: 8080 es número y false es booleano', () => {
  assert.equal(config.servicio.puerto, 8080);
  assert.equal(config.servicio.depuracion, false);
});

test('los guiones forman una lista', () => {
  assert.deepEqual(config.paises_habilitados, ['CO', 'MX', 'NO']);
});

test('una tabulación en la sangría es un error', () => {
  assert.throws(() => parse('servicio:\n\tnombre: pedidos\n'), { name: 'YAMLParseError' });
});

test('NO sin comillas: texto en YAML 1.2, falso en YAML 1.1', () => {
  assert.equal(parse('pais: NO').pais, 'NO');
  assert.equal(parse('pais: NO', { version: '1.1' }).pais, false);
});
