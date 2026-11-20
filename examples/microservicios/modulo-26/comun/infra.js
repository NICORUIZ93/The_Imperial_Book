// Módulo 22 · ¿Responde la infraestructura? Los tests que la necesitan se OMITEN si no responde
// (o FALLAN si EXIGIR_INFRA=1, como hace ./verificar.sh --compose).
import net from 'node:net';

export function responde(url, puertoPorDefecto) {
  const { hostname, port } = new URL(url);
  return new Promise((r) => net.connect(Number(port || puertoPorDefecto), hostname)
    .on('connect', function () { this.destroy(); r(true); })
    .on('error', () => r(false)));
}

export async function omitirSinInfra(nombre, url, puerto) {
  if (await responde(url, puerto)) return false;
  return process.env.EXIGIR_INFRA === '1' ? false : `sin ${nombre} en ${url}`;
}
