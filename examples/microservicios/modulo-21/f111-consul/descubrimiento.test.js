// Módulo 17 · F111 · Ejecuta: node --test f111-consul/descubrimiento.test.js
// Por defecto usa el doble en memoria (comun/consul-de-prueba.js). Contra el Consul real:
//   docker compose up -d --wait && CONSUL_REAL=1 node --test f111-consul/descubrimiento.test.js
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { setTimeout as dormir } from 'node:timers/promises';
import { consulParaTests } from '../comun/consul.js';
import { crearLocalizador, instanciasSanas, SinInstancias } from './descubrir.js';
import { iniciarCatalogo } from './servicio-catalogo.js';

let entorno;
before(async () => { entorno = await consulParaTests(); });
after(async () => { await entorno.detener(); });

test('dos instancias se registran y el cliente reparte las peticiones por turnos', async () => {
  const a = await iniciarCatalogo({ consul: entorno.consul });
  const b = await iniciarCatalogo({ consul: entorno.consul });
  try {
    const sanas = await instanciasSanas(entorno.consul, 'catalogo');
    assert.deepEqual(sanas.map((i) => i.id).sort(), [a.id, b.id].sort());

    const localizador = crearLocalizador(entorno.consul);
    const atendidas = [];
    for (let i = 0; i < 4; i++) {
      const { url } = await localizador.siguiente('catalogo');
      atendidas.push((await (await fetch(`${url}/productos/1`)).json()).atendidoPor);
    }
    assert.equal(atendidas.filter((id) => id === a.id).length, 2);
    assert.equal(atendidas.filter((id) => id === b.id).length, 2);
  } finally {
    await a.detener();
    await b.detener();
  }
});

test('la baja voluntaria saca a la instancia del catálogo al instante', async () => {
  const a = await iniciarCatalogo({ consul: entorno.consul });
  await a.detener();
  assert.deepEqual(await instanciasSanas(entorno.consul, 'catalogo'), []);
  await assert.rejects(crearLocalizador(entorno.consul).siguiente('catalogo'), SinInstancias);
});

test('una instancia que muere sin avisar deja de estar sana cuando vence su TTL', async () => {
  const a = await iniciarCatalogo({ consul: entorno.consul, ttlSegundos: 1 });
  try {
    assert.equal((await instanciasSanas(entorno.consul, 'catalogo')).length, 1);
    await a.morir(); // sin deregister y sin más latidos
    await dormir(2500); // TTL de 1 s + margen (Consul revisa los TTL con cierta holgura)
    assert.deepEqual(await instanciasSanas(entorno.consul, 'catalogo'), []);
  } finally {
    await entorno.consul.agent.service.deregister(a.id);
  }
});

test('con Consul caído el localizador sirve la última lista conocida', async () => {
  const a = await iniciarCatalogo({ consul: entorno.consul });
  try {
    let caido = false;
    const consulIntermitente = {
      health: { service: (o) => (caido ? Promise.reject(new Error('connect ECONNREFUSED')) : entorno.consul.health.service(o)) },
    };
    const localizador = crearLocalizador(consulIntermitente, { cacheMs: 0 });
    const antes = await localizador.siguiente('catalogo');
    caido = true;
    assert.deepEqual(await localizador.siguiente('catalogo'), antes);
  } finally {
    await a.detener();
  }
});
