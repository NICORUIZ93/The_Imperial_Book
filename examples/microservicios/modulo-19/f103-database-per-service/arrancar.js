// Módulo 15 · F103 · Levanta los dos servicios en puertos libres (puerto 0) y devuelve sus URL y una función para apagarlos.
import { once } from 'node:events';
import { crearInventario } from './inventario.js';
import { crearPedidos } from './pedidos.js';

async function escuchar(app, puerto) {
  const servidor = app.listen(puerto);
  await once(servidor, 'listening');
  return servidor;
}

export async function arrancar({ puertoInventario = 0, puertoPedidos = 0 } = {}) {
  const inventario = await crearInventario();
  const sInventario = await escuchar(inventario.app, puertoInventario);
  const inventarioUrl = `http://localhost:${sInventario.address().port}`;

  const pedidos = await crearPedidos({ inventarioUrl });
  const sPedidos = await escuchar(pedidos.app, puertoPedidos);
  const pedidosUrl = `http://localhost:${sPedidos.address().port}`;

  async function apagar() {
    sPedidos.close();
    sInventario.close();
    await pedidos.pool.end();
    await inventario.pool.end();
  }
  return { inventarioUrl, pedidosUrl, apagar };
}

// node f103-database-per-service/arrancar.js  → deja los servicios en 3103 (pedidos) y 3203 (inventario) para usar curl
if (import.meta.main) {
  const { pedidosUrl, inventarioUrl } = await arrancar({ puertoPedidos: 3103, puertoInventario: 3203 });
  console.log(`pedidos en ${pedidosUrl} (base pedidos_db) · inventario en ${inventarioUrl} (base inventario_db) · Ctrl+C para salir`);
}
