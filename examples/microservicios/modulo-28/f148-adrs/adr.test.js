// Módulo 24 · F148 · Tests de la herramienta de ADRs. Ejecuta: node --test f148-adrs/adr.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { aceptar, indice, lint, listar, nuevo, reemplazar } from './adr.js';

const temporal = () => mkdtempSync(join(tmpdir(), 'adr-'));
const rellenar = (dir, archivo) => { // simula que el autor completó la plantilla
  const ruta = join(dir, archivo);
  writeFileSync(ruta, readFileSync(ruta, 'utf8').replace(/<[^>]+>/g, 'texto'));
};

test('los ADRs de ejemplo pasan el lint', () => {
  assert.deepEqual(lint('f148-adrs/docs/adr'), []);
});

test('nuevo numera de forma correlativa y crea el nombre del archivo sin tildes', () => {
  const dir = temporal();
  assert.equal(nuevo(dir, 'Usamos Kafka', { fecha: '2026-11-20' }), '0001-usamos-kafka.md');
  assert.equal(nuevo(dir, 'Separamos la base de datos de pagos', { fecha: '2026-11-20' }), '0002-separamos-la-base-de-datos-de-pagos.md');
  assert.equal(listar(dir)[1].estado, 'Propuesto');
  rmSync(dir, { recursive: true });
});

test('un propuesto puede tener huecos; al aceptarlo sin rellenar, el lint lo detecta', () => {
  const dir = temporal();
  nuevo(dir, 'Usamos Kafka', { fecha: '2026-11-20' });
  assert.deepEqual(lint(dir), []);
  aceptar(dir, 1);
  assert.deepEqual(lint(dir), ['0001-usamos-kafka.md: quedan huecos <…> de la plantilla']);
  rmSync(dir, { recursive: true });
});

test('reemplazar enlaza los dos ADRs y no reutiliza números', () => {
  const dir = temporal();
  rellenar(dir, nuevo(dir, 'Usamos RabbitMQ', { fecha: '2026-11-01' }));
  aceptar(dir, 1);
  const nuevoArchivo = reemplazar(dir, 1, 'Usamos Kafka', { fecha: '2026-11-20' });
  rellenar(dir, nuevoArchivo);
  const [viejo, actual] = listar(dir);
  assert.equal(viejo.estado, 'Reemplazado por ADR-0002');
  assert.equal(actual.reemplazaA, 1);
  assert.deepEqual(lint(dir), []);
  assert.match(indice(dir), /\| \[ADR-0001\]\(0001-usamos-rabbitmq\.md\) \| Usamos RabbitMQ \| Reemplazado por ADR-0002 \| 2026-11-01 \|/);
  rmSync(dir, { recursive: true });
});

test('el ADR «registro de una línea» incumple 5 reglas', () => {
  const problemas = lint('f148-adrs/error-comun');
  assert.equal(problemas.length, 5);
  assert.ok(problemas.includes('0001-usamos-mongodb.md: 0 opciones en la tabla; un ADR compara al menos 2'));
});
