// Módulo 30 · F174 · Sobre-descomposición: el mismo cálculo de un pedido como funciones en un proceso y como
// cuatro «nanoservicios» HTTP (uno por paso), y una métrica de granularidad a partir del historial de cambios.
// Requisitos: Node.js 26.13.1 LTS. Sin dependencias de npm.
import { performance } from 'node:perf_hooks';
import { enviar, leerJson, servicio } from '../comun/http.js';

// Los cuatro pasos del cálculo (pesos colombianos, enteros).
export const pasos = {
  subtotal: (p) => ({ ...p, subtotal: p.lineas.reduce((s, l) => s + l.precio * l.cantidad, 0) }),
  descuento: (p) => ({ ...p, descuento: p.subtotal >= 200000 ? Math.round(p.subtotal * 0.1) : 0 }),
  impuesto: (p) => ({ ...p, iva: Math.round((p.subtotal - p.descuento) * 0.19) }),
  envio: (p) => ({ ...p, envio: p.subtotal >= 150000 ? 0 : 12000 }),
};
const total = (p) => ({ ...p, total: p.subtotal - p.descuento + p.iva + p.envio });

// Opción A: un módulo, cuatro funciones, cero red.
export const totalEnProceso = (pedido) => total(pasos.envio(pasos.impuesto(pasos.descuento(pasos.subtotal(pedido)))));

// Opción B: un servicio HTTP por paso y un orquestador que los llama en orden.
export async function crearNanoservicios() {
  let llamadas = 0;
  const svcs = {};
  for (const [nombre, fn] of Object.entries(pasos))
    svcs[nombre] = await servicio(nombre, async (req) => { llamadas += 1; return { estado: 200, cuerpo: fn(await leerJson(req)) }; });
  return {
    get llamadas() { return llamadas; },
    async total(pedido) {
      let p = pedido;
      for (const nombre of Object.keys(pasos)) p = await enviar(`${svcs[nombre].url}/${nombre}`, p);
      return total(p);
    },
    cerrar: () => Promise.all(Object.values(svcs).map((s) => s.cerrar())),
  };
}

// Mediana (p50) en milisegundos de `n` ejecuciones de fn.
export async function p50(fn, n = 200) {
  const tiempos = [];
  for (let i = 0; i < n; i++) {
    const t = performance.now();
    await fn();
    tiempos.push(performance.now() - t);
  }
  return tiempos.sort((a, b) => a - b)[Math.floor(n / 2)];
}

// Granularidad: servicios por persona y pares de servicios que casi siempre cambian juntos (candidatos a fusionar).
// `cambios` es una lista de funcionalidades entregadas, cada una con los servicios que tocó.
// Solo se compara un par si los dos servicios aparecen al menos `minimo` veces (con 1 cambio no hay patrón).
export function granularidad({ servicios, desarrolladores, cambios: lista }, { umbral = 0.8, minimo = 2 } = {}) {
  const cambios = lista.map((c) => [...new Set(c)]); // un servicio cuenta una vez por cambio
  const multi = cambios.filter((c) => c.length > 1).length;
  const veces = new Map(servicios.map((s) => [s, 0]));
  for (const c of cambios) for (const s of c) veces.set(s, veces.get(s) + 1);
  const fusionar = [];
  for (let i = 0; i < servicios.length; i++)
    for (let j = i + 1; j < servicios.length; j++) {
      const [a, b] = [servicios[i], servicios[j]];
      const juntos = cambios.filter((c) => c.includes(a) && c.includes(b)).length;
      const base = Math.min(veces.get(a), veces.get(b));
      if (base >= minimo && juntos / base >= umbral) fusionar.push(`${a}+${b}`);
    }
  return {
    serviciosPorPersona: Math.round((servicios.length / desarrolladores) * 10) / 10,
    cambiosMultiServicio: `${Math.round((100 * multi) / cambios.length)} %`,
    fusionar,
  };
}
