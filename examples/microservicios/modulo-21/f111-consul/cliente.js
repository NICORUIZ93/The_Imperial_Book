// Módulo 17 · F111 · Cliente que NO conoce direcciones: pregunta a Consul por «catalogo» y reparte por turnos.
// Ejecuta: node f111-consul/cliente.js
import { clienteConsul } from '../comun/consul.js';
import { crearLocalizador } from './descubrir.js';

const localizador = crearLocalizador(clienteConsul());
for (let i = 1; i <= 4; i++) {
  const { url } = await localizador.siguiente('catalogo');
  const producto = await (await fetch(`${url}/productos/1`, { signal: AbortSignal.timeout(2000) })).json();
  console.log(`petición ${i} → ${url} → atendida por ${producto.atendidoPor}`);
}
