// Módulo 20 · F129 · Tests sin Docker: la caché con un proveedor en memoria, y cada adaptador contra un DOBLE local
// que habla el protocolo HTTP de su servicio (los emuladores de verdad se prueban en secretos.integracion.js).
// Ejecuta: node --test f129-secretos/secretos.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { crearBaseDeDatos, SECRETO_BD } from './comun.js';
import { crearApp } from './despues.js';
import { proveedorAws, proveedorAzure, proveedorVault, SecretosConCache } from './secretos.js';

const SECRETO = { usuario: 'app', clave: 'Cl4ve-Pr0d-2026' };

function gestorEnMemoria() {
  const g = { nombre: 'memoria', lecturas: 0, version: 1, valor: { ...SECRETO }, async leer() { g.lecturas += 1; return { valor: g.valor, version: String(g.version) }; } };
  return g;
}
/** Levanta un servidor HTTP de usar y tirar; `responder(req, cuerpo)` devuelve [status, json]. */
async function doble(responder) {
  const vistas = [];
  const servidor = http.createServer(async (req, res) => {
    let cuerpo = ''; for await (const trozo of req) cuerpo += trozo;
    vistas.push({ metodo: req.method, ruta: req.url, cabeceras: req.headers, cuerpo });
    const [status, json, tipo = 'application/json'] = responder(req, cuerpo);
    res.writeHead(status, { 'content-type': tipo }); res.end(JSON.stringify(json));
  }).listen(0, '127.0.0.1');
  await once(servidor, 'listening');
  return { url: `http://127.0.0.1:${servidor.address().port}`, vistas, cerrar: () => { servidor.close(); servidor.closeAllConnections(); } };
}

test('caché: dentro del TTL no vuelve a llamar al gestor; al vencer, sí', async () => {
  let reloj = 0;
  const gestor = gestorEnMemoria();
  const secretos = new SecretosConCache(gestor, { ttlMs: 1000, ahora: () => reloj });
  await secretos.obtener(SECRETO_BD); await secretos.obtener(SECRETO_BD); reloj = 999; await secretos.obtener(SECRETO_BD);
  assert.equal(gestor.lecturas, 1);
  reloj = 1000;
  await secretos.obtener(SECRETO_BD);
  assert.equal(gestor.lecturas, 2);
});

test('caché: estado() informa nombre, proveedor, versión y edad, pero nunca el valor', async () => {
  const secretos = new SecretosConCache(gestorEnMemoria());
  await secretos.obtener(SECRETO_BD);
  assert.deepEqual(secretos.estado(), [{ nombre: 'tienda/bd', proveedor: 'memoria', version: '1', edadS: 0 }]);
  assert.doesNotMatch(JSON.stringify(secretos.estado()), /Cl4ve/);
});

test('API: tras una rotación, la primera petición recarga el secreto y responde 200', async () => {
  const gestor = gestorEnMemoria();
  const baseDeDatos = crearBaseDeDatos(SECRETO.clave);
  const registros = [];
  const servidor = (await crearApp(baseDeDatos, new SecretosConCache(gestor), { log: (l) => registros.push(l) })).listen(0);
  await once(servidor, 'listening');
  const base = `http://127.0.0.1:${servidor.address().port}`;
  assert.equal((await fetch(`${base}/pedidos`)).status, 200);
  baseDeDatos.rotar('Rotada-2026-11'); gestor.valor = { usuario: 'app', clave: 'Rotada-2026-11' }; gestor.version = 2;
  assert.equal((await fetch(`${base}/pedidos`)).status, 200);
  assert.equal((await fetch(`${base}/salud/secretos`).then((r) => r.json()))[0].version, '2');
  assert.doesNotMatch(registros.join('\n'), /Cl4ve|Rotada/, 'ninguna clave en los logs');
  assert.equal((await fetch(`${base}/debug/config`)).status, 404);
  servidor.close(); servidor.closeAllConnections();
});

test('adaptador AWS: envía GetSecretValue firmado y lee SecretString y VersionId', async (t) => {
  const aws = await doble(() => [200, { Name: 'tienda/bd', SecretString: JSON.stringify(SECRETO), VersionId: 'v-aws-1' }, 'application/x-amz-json-1.1']);
  t.after(aws.cerrar);
  assert.deepEqual(await proveedorAws({ endpoint: aws.url }).leer('tienda/bd'), { valor: SECRETO, version: 'v-aws-1' });
  assert.equal(aws.vistas[0].cabeceras['x-amz-target'], 'secretsmanager.GetSecretValue');
  assert.deepEqual(JSON.parse(aws.vistas[0].cuerpo), { SecretId: 'tienda/bd' });
  assert.match(aws.vistas[0].cabeceras.authorization, /^AWS4-HMAC-SHA256 Credential=test\//);
});

test('adaptador Vault: lee secret/data/<nombre> con X-Vault-Token y devuelve data.data', async (t) => {
  const servidorVault = await doble(() => [200, { data: { data: SECRETO, metadata: { version: 3 } } }]);
  t.after(servidorVault.cerrar);
  assert.deepEqual(await proveedorVault({ endpoint: servidorVault.url, token: 'root' }).leer('tienda/bd'), { valor: SECRETO, version: '3' });
  assert.equal(servidorVault.vistas[0].ruta, '/v1/secret/data/tienda/bd');
  assert.equal(servidorVault.vistas[0].cabeceras['x-vault-token'], 'root');
});

test('adaptador Azure (modo emulador): pide /secrets/tienda-bd por http y lee value y la versión del id', async (t) => {
  const azure = await doble((req) => [200, { value: JSON.stringify(SECRETO), id: `https://${req.headers.host}/secrets/tienda-bd/0123456789abcdef0123456789abcdef`, attributes: { enabled: true } }]);
  t.after(azure.cerrar);
  assert.deepEqual(await proveedorAzure({ url: azure.url, emulador: true }).leer('tienda/bd'), { valor: SECRETO, version: '0123456789abcdef0123456789abcdef' });
  assert.match(azure.vistas.at(-1).ruta, /^\/secrets\/tienda-bd\/?\?api(-|%2D)version=/);
});
