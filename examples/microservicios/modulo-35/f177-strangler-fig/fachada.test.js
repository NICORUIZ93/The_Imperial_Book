// Módulo 31 · F177 · tests: node --test f177-strangler-fig/fachada.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cerrar, escuchar, pedir } from '../comun/http.js';
import { crearMonolito } from './monolito.js';
import { crearPedidosNuevo } from './pedidos-nuevo.js';
import { coincide, crearFachada, cubo, elegirDestino } from './fachada.js';

const rutas = [{ prefijo: '/api/pedidos', destino: 'pedidos', porcentaje: 100, metodos: ['GET', 'POST'] }];

test('lo que no está en la tabla sigue yendo al monolito', () => {
  assert.equal(elegirDestino('GET', '/api/clientes/C-1', rutas, 'C-1'), 'monolito');
  assert.equal(elegirDestino('DELETE', '/api/pedidos/P-1', rutas, 'C-1'), 'monolito');
});

test('el prefijo respeta el límite del segmento: /api/pedidos-antiguos no es /api/pedidos', () => {
  assert.equal(coincide('/api/pedidos/P-1', '/api/pedidos'), true);
  assert.equal(coincide('/api/pedidos?pagina=2', '/api/pedidos'), true);
  assert.equal(coincide('/api/pedidos-antiguos', '/api/pedidos'), false);
});

test('el despliegue por porcentaje es pegajoso y se acerca al porcentaje pedido', () => {
  const al25 = [{ ...rutas[0], porcentaje: 25 }];
  let nuevos = 0;
  for (let i = 0; i < 2000; i++) if (elegirDestino('GET', '/api/pedidos/1', al25, `C-${i}`) === 'pedidos') nuevos++;
  assert.ok(nuevos > 400 && nuevos < 600, `${nuevos} de 2000`);
  assert.equal(cubo('C-42'), cubo('C-42'));
});

test('extremo a extremo: la fachada reenvía el cuerpo del POST y marca quién respondió', async () => {
  const mono = crearMonolito(); const nuevo = crearPedidosNuevo();
  const destinos = { monolito: await escuchar(mono), pedidos: await escuchar(nuevo) };
  const fachada = crearFachada({ rutas, destinos });
  const url = await escuchar(fachada);
  try {
    const post = await pedir(url + '/api/pedidos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"id":"P-9"}' });
    assert.deepEqual([post.estado, post.servidoPor, post.cuerpo.id], [201, 'pedidos-nuevo', 'P-9']);
    const cli = await pedir(url + '/api/clientes/C-1');
    assert.deepEqual([cli.estado, cli.servidoPor], [200, 'monolito']);
  } finally { await Promise.all([cerrar(fachada), cerrar(mono), cerrar(nuevo)]); }
});

test('si el servicio nuevo está caído, la fachada responde 502 (y no cuelga)', async () => {
  const mono = crearMonolito();
  const destinos = { monolito: await escuchar(mono), pedidos: 'http://127.0.0.1:9' };
  const fachada = crearFachada({ rutas, destinos });
  const url = await escuchar(fachada);
  try { assert.equal((await pedir(url + '/api/pedidos/P-1')).estado, 502); }
  finally { await Promise.all([cerrar(fachada), cerrar(mono)]); }
});
