// Módulo 30 · F176 · Fitness functions: comprobaciones automáticas y objetivas de una característica de la arquitectura
// que se ejecutan en cada build (como cualquier test) y fallan si la arquitectura se degrada.
//  1. Acoplamiento: un servicio solo puede importar la carpeta api/ de otro, nunca sus internos.
//  2. Ciclos: no hay dependencias circulares entre servicios.
//  3. Latencia: el p95 de un endpoint real cabe en su presupuesto.
// Requisitos: Node.js 26.13.1 LTS. Sin dependencias de npm.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';
import { performance } from 'node:perf_hooks';

// Todas las formas de importar en Node: import/export … from, import('…') dinámico y require('…').
const COMPLETA = /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|^\s*import\s+)['"]([^'"]+)['"]/gm;
// Versión ingenua (error común): solo ve «… from '…'».
export const INGENUA = /\bfrom\s*['"]([^'"]+)['"]/gm;

// Grafo de importaciones relativas: { 'servicios/pedidos/index.js': ['servicios/pagos/api/cliente.js', …] }.
export function grafoDeImportaciones(raiz, patron = COMPLETA) {
  const grafo = {};
  const recorrer = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const ruta = join(dir, e.name);
      if (e.isDirectory()) recorrer(ruta);
      else if (e.name.endsWith('.js')) {
        const origen = relative(raiz, ruta);
        const codigo = readFileSync(ruta, 'utf8');
        grafo[origen] = [...codigo.matchAll(new RegExp(patron.source, patron.flags))]
          .map((m) => m[1])
          .filter((m) => m.startsWith('.'))
          .map((m) => normalize(join(dirname(origen), m)));
      }
    }
  };
  recorrer(raiz);
  return grafo;
}

const servicioDe = (ruta) => ruta.match(/^servicios\/([^/]+)\//)?.[1];

// Fitness function 1: nadie importa los internos de otro servicio (solo servicios/<otro>/api/).
export function sinInternosAjenos(grafo) {
  const violaciones = [];
  for (const [origen, destinos] of Object.entries(grafo))
    for (const destino of destinos) {
      const [a, b] = [servicioDe(origen), servicioDe(destino)];
      if (a && b && a !== b && !destino.startsWith(`servicios/${b}/api/`)) violaciones.push(`${origen} → ${destino}`);
    }
  return violaciones;
}

// Fitness function 2: el grafo de servicios no tiene ciclos. Devuelve los ciclos encontrados («a → b → a»).
export function ciclosEntreServicios(grafo) {
  const aristas = new Map();
  for (const [origen, destinos] of Object.entries(grafo))
    for (const destino of destinos) {
      const [a, b] = [servicioDe(origen), servicioDe(destino)];
      if (a && b && a !== b) aristas.set(a, new Set([...(aristas.get(a) ?? []), b]));
    }
  const ciclos = new Set();
  const visitar = (nodo, camino) => {
    if (camino.includes(nodo)) {
      const ciclo = camino.slice(camino.indexOf(nodo));
      const inicio = ciclo.indexOf([...ciclo].sort()[0]); // forma canónica: empieza por el menor
      ciclos.add([...ciclo.slice(inicio), ...ciclo.slice(0, inicio), ciclo[inicio]].join(' → '));
      return;
    }
    for (const sig of aristas.get(nodo) ?? []) visitar(sig, [...camino, nodo]);
  };
  for (const nodo of aristas.keys()) visitar(nodo, []);
  return [...ciclos];
}

// Fitness function 3: p95 de `n` peticiones reales a `url` frente al presupuesto.
export async function presupuestoLatencia(url, { n = 50, p95MaxMs }) {
  const tiempos = [];
  for (let i = 0; i < n; i++) {
    const t = performance.now();
    const r = await fetch(url);
    await r.arrayBuffer();
    tiempos.push(performance.now() - t);
  }
  tiempos.sort((a, b) => a - b);
  const p95 = tiempos[Math.ceil(0.95 * n) - 1];
  return { p95: Math.round(p95 * 10) / 10, p95MaxMs, cumple: p95 <= p95MaxMs };
}
