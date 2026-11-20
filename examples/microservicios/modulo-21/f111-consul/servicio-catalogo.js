// Módulo 17 · F111 · Una instancia del servicio «catalogo» que se registra sola en Consul.
// Ejecuta (dos terminales): PORT=3111 node f111-consul/servicio-catalogo.js   y   PORT=3112 node f111-consul/servicio-catalogo.js
import { createServer } from 'node:http';
import { clienteConsul } from '../comun/consul.js';
import { registrar } from './registro.js';

export async function iniciarCatalogo({ consul, puerto = 0, direccion = '127.0.0.1', ttlSegundos = 3 }) {
  let id = '';
  const servidor = createServer((req, res) => {
    if (req.url === '/productos/1') {
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ id: 1, nombre: 'Teclado', atendidoPor: id }));
    }
    res.writeHead(404).end();
  });
  await new Promise((ok) => servidor.listen(puerto, ok));
  const puertoReal = servidor.address().port;
  id = `catalogo-${puertoReal}`;
  // Se registra DESPUÉS de escuchar: nadie debe descubrir una instancia que aún no atiende.
  const registro = await registrar(consul, { nombre: 'catalogo', id, direccion, puerto: puertoReal, ttlSegundos });
  return {
    id,
    puerto: puertoReal,
    // Apagado ordenado: primero se da de baja (deja de recibir tráfico nuevo) y después cierra.
    async detener() {
      await registro.darDeBaja();
      await new Promise((ok) => servidor.close(ok));
    },
    // Simula una caída brusca (kill -9): cierra sin avisar a Consul y deja de latir.
    async morir() {
      registro.detenerLatidos();
      servidor.closeAllConnections();
      await new Promise((ok) => servidor.close(ok));
    },
  };
}

if (import.meta.main) {
  const instancia = await iniciarCatalogo({ consul: clienteConsul(), puerto: Number(process.env.PORT ?? 3111) });
  console.log(`${instancia.id} registrado en Consul y escuchando en :${instancia.puerto}`);
  for (const senal of ['SIGINT', 'SIGTERM']) {
    process.on(senal, async () => {
      await instancia.detener();
      console.log(`${instancia.id} dado de baja`);
      process.exit(0);
    });
  }
}
