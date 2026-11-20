// Módulo 26 · F157 · Tests contra Confluent Schema Registry 8.4.1 (solo con ./verificar.sh --compose).
// Ejecuta: node --test f157-kafka-schema/registry.infra.js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SchemaRegistry, SchemaType } from '@kafkajs/confluent-schema-registry';
import { SCHEMA_REGISTRY_URL } from '../comun/config.js';
import { codificar } from './formato.js';
import { crudos, tipos } from './esquemas.js';

const registry = new SchemaRegistry({ host: SCHEMA_REGISTRY_URL });
const subject = `f157.pedidos-${Date.now()}-value`; // TopicNameStrategy: <topic>-value
const json = { 'content-type': 'application/vnd.schemaregistry.v1+json' };
const registrar = (esquema) => registry.register({ type: SchemaType.AVRO, schema: JSON.stringify(esquema) }, { subject });

test('el formato de cable de la librería coincide con formato.js', async () => {
  const { id } = await registrar(crudos.v1);
  const valor = { id: 'P-1', total: 120000 };
  assert.deepEqual(await registry.encode(id, valor), codificar(id, tipos.v1, valor));
});

test('con BACKWARD, el registry acepta v2 (con default) y rechaza v2SinDefault', async () => {
  await fetch(`${SCHEMA_REGISTRY_URL}/config/${subject}`, { method: 'PUT', headers: json, body: JSON.stringify({ compatibility: 'BACKWARD' }) });
  const prueba = async (esquema) => (await (await fetch(`${SCHEMA_REGISTRY_URL}/compatibility/subjects/${subject}/versions/latest`, {
    method: 'POST', headers: json, body: JSON.stringify({ schema: JSON.stringify(esquema) }),
  })).json()).is_compatible;
  assert.equal(await prueba(crudos.v2SinDefault), false);
  assert.equal(await prueba(crudos.v2), true);
  await assert.rejects(registrar(crudos.v2SinDefault));
  await registrar(crudos.v2);
});
