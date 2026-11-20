// Crea el cliente de Consul a partir de CONSUL_HTTP_ADDR (la misma variable que usa la CLI `consul`).
// Requisitos: consul 2.0.1 (cliente npm) contra un agente Consul 2.1.0 (docker-compose.yml del laboratorio).
import Consul from 'consul';

export function clienteConsul(direccion = process.env.CONSUL_HTTP_ADDR ?? '127.0.0.1:8500') {
  const [host, port] = direccion.replace(/^https?:\/\//, '').split(':');
  return new Consul({ host, port: Number(port ?? 8500) });
}

// Para los tests: usa el Consul real si CONSUL_REAL=1 y, si no, el doble en memoria.
export async function consulParaTests() {
  if (process.env.CONSUL_REAL === '1') return { consul: clienteConsul(), detener: async () => {}, real: true };
  const { crearConsulDePrueba } = await import('./consul-de-prueba.js');
  const doble = crearConsulDePrueba();
  const { host, port } = await doble.iniciar();
  return { consul: new Consul({ host, port }), detener: () => doble.detener(), real: false };
}
