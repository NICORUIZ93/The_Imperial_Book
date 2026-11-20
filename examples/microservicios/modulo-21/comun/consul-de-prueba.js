// Doble de pruebas de Consul: implementa EN MEMORIA la parte de la API HTTP v1 que usa este módulo
// (registro de servicios con check TTL, salud y KV con consultas bloqueantes). Sirve para ejecutar los
// tests sin Docker. No es Consul: los laboratorios se hacen contra el Consul real de docker-compose.yml.
import { createServer } from 'node:http';

function segundos(duracion) { // «3s», «500ms», «1m»
  const m = /^(\d+)(ms|s|m)$/.exec(duracion ?? '');
  if (!m) return 0;
  return Number(m[1]) * { ms: 1, s: 1000, m: 60000 }[m[2]];
}

export function crearConsulDePrueba() {
  const servicios = new Map(); // id → { def, estado, venceEn, ttl }
  const kv = new Map(); // clave → { Value(Buffer), CreateIndex, ModifyIndex }
  let indice = 10;
  let esperando = []; // consultas bloqueantes pendientes
  const cambio = () => { indice += 1; for (const f of esperando) f(); esperando = []; };

  const estadoDe = (s) => (s.ttl > 0 && Date.now() > s.venceEn ? 'critical' : s.estado);

  const servidor = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://consul');
    const ruta = decodeURIComponent(url.pathname);
    let cuerpo = Buffer.alloc(0);
    for await (const t of req) cuerpo = Buffer.concat([cuerpo, t]);
    const json = (status, dato) => res.writeHead(status, { 'content-type': 'application/json', 'x-consul-index': String(indice) }).end(JSON.stringify(dato));
    const texto = (status, t) => res.writeHead(status, { 'content-type': 'text/plain' }).end(t);

    if (req.method === 'PUT' && ruta === '/v1/agent/service/register') {
      const def = JSON.parse(cuerpo.toString());
      const id = def.ID ?? def.Name;
      const ttl = segundos(def.Check?.TTL);
      servicios.set(id, { def: { ...def, ID: id }, estado: def.Check?.Status ?? (def.Check ? 'critical' : 'passing'), ttl, venceEn: Date.now() + ttl });
      cambio();
      return res.writeHead(200).end();
    }
    let m = /^\/v1\/agent\/service\/deregister\/(.+)$/.exec(ruta);
    if (req.method === 'PUT' && m) {
      if (!servicios.delete(m[1])) return texto(404, `Unknown service ID "${m[1]}". Ensure that the service ID is passed, not the service name.`);
      cambio();
      return res.writeHead(200).end();
    }
    m = /^\/v1\/agent\/check\/(pass|fail)\/service:(.+)$/.exec(ruta);
    if (req.method === 'PUT' && m) {
      const s = servicios.get(m[2]);
      if (!s) return texto(404, `Unknown check ID "service:${m[2]}". Ensure that the check ID is passed, not the check name.`);
      const antes = estadoDe(s);
      s.estado = m[1] === 'pass' ? 'passing' : 'critical';
      s.venceEn = Date.now() + s.ttl;
      if (antes !== s.estado) cambio();
      return res.writeHead(200).end();
    }
    m = /^\/v1\/health\/service\/(.+)$/.exec(ruta);
    if (req.method === 'GET' && m) {
      const soloSanos = url.searchParams.has('passing');
      const lista = [...servicios.values()]
        .filter((s) => s.def.Name === m[1] && (!soloSanos || estadoDe(s) === 'passing'))
        .map((s) => ({
          Node: { Node: 'consul-de-prueba', Address: '127.0.0.1' },
          Service: { ID: s.def.ID, Service: s.def.Name, Address: s.def.Address ?? '', Port: s.def.Port ?? 0, Tags: s.def.Tags ?? [], Meta: s.def.Meta ?? {} },
          Checks: [{ CheckID: `service:${s.def.ID}`, Status: estadoDe(s) }],
        }));
      return json(200, lista);
    }
    m = /^\/v1\/kv\/(.*)$/.exec(ruta);
    if (m) {
      const clave = m[1];
      if (req.method === 'PUT') {
        const previo = kv.get(clave);
        indice += 1;
        kv.set(clave, { Value: cuerpo, CreateIndex: previo?.CreateIndex ?? indice, ModifyIndex: indice });
        indice -= 1; cambio();
        return json(200, true);
      }
      if (req.method === 'DELETE') {
        kv.delete(clave); cambio();
        return json(200, true);
      }
      if (req.method === 'GET') {
        // Consulta bloqueante: si ?index=N coincide con el índice actual, espera a que algo cambie (o a ?wait).
        const visto = Number(url.searchParams.get('index') ?? 0);
        if (visto >= indice) {
          const espera = Math.min(segundos(url.searchParams.get('wait') ?? '5s') || 5000, 5000);
          await new Promise((ok) => { const t = setTimeout(ok, espera); esperando.push(() => { clearTimeout(t); ok(); }); });
        }
        const claves = [...kv.keys()].filter((k) => (url.searchParams.has('recurse') ? k.startsWith(clave) : k === clave)).sort();
        if (claves.length === 0) return json(404, null);
        return json(200, claves.map((k) => ({ Key: k, Flags: 0, LockIndex: 0, Value: kv.get(k).Value.toString('base64'), CreateIndex: kv.get(k).CreateIndex, ModifyIndex: kv.get(k).ModifyIndex })));
      }
    }
    texto(404, `consul-de-prueba no implementa ${req.method} ${ruta}`);
  });

  return {
    async iniciar(puerto = 0) {
      await new Promise((ok) => servidor.listen(puerto, '127.0.0.1', ok));
      return { host: '127.0.0.1', port: servidor.address().port };
    },
    async detener() {
      for (const f of esperando) f();
      servidor.closeAllConnections();
      await new Promise((ok) => servidor.close(ok));
    },
  };
}

// Sin Docker: `node comun/consul-de-prueba.js` deja el doble escuchando en 127.0.0.1:8500 para practicar.
if (import.meta.main) {
  const { port } = await crearConsulDePrueba().iniciar(Number(process.env.PORT ?? 8500));
  console.log(`consul-de-prueba (doble en memoria, NO es Consul) en http://127.0.0.1:${port}`);
}
