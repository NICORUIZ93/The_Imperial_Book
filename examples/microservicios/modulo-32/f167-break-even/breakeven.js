// Módulo 28 · F167 · Break-even Serverless (AWS Lambda) vs Contenedores (ECS sobre Fargate) para la API de catálogo.
// Lambda: paga por petición + GB-segundo de ejecución (con capa gratuita mensual).
// Fargate: paga por tarea encendida (vCPU y GB por segundo), haya tráfico o no; mínimo 2 tareas para alta disponibilidad
// y más tareas cuando el pico supera la capacidad de cada una.
// Uso: node f167-break-even/breakeven.js
import { pathToFileURL } from 'node:url';
import { HORAS_MES, PRECIOS, p, usd } from '../comun/precios.js';

export const CARGA = { duracionMs: 120, memoriaMb: 512, factorPico: 3 };
export const TAREA = { vcpu: 0.5, gb: 1, rpsPorTarea: 60, minimo: 2 };
const SEG_MES = HORAS_MES * 3600;

export function costoLambda(peticiones, { duracionMs, memoriaMb } = CARGA, { capaGratuita = false } = {}) {
  let pet = peticiones, gbs = peticiones * (duracionMs / 1000) * (memoriaMb / 1024);
  if (capaGratuita) { pet = Math.max(0, pet - PRECIOS.lambdaGratisPeticiones.cantidad); gbs = Math.max(0, gbs - PRECIOS.lambdaGratisGbSegundo.cantidad); }
  return (pet / 1e6) * p('lambdaMillonPeticiones') + gbs * p('lambdaGbSegundo');
}

export function tareasNecesarias(peticiones, carga = CARGA, tarea = TAREA) {
  const rpsPico = (peticiones / SEG_MES) * carga.factorPico;
  return Math.max(tarea.minimo, Math.ceil(rpsPico / tarea.rpsPorTarea));
}

export function costoFargate(peticiones, carga = CARGA, tarea = TAREA) {
  return tareasNecesarias(peticiones, carga, tarea) * SEG_MES * (tarea.vcpu * p('fargateVcpuSegundo') + tarea.gb * p('fargateGbSegundo'));
}

/** Volumen mensual a partir del cual Fargate (mínimo de tareas) sale más barato que Lambda. */
export function breakEven(carga = CARGA, tarea = TAREA) {
  const porPeticion = costoLambda(1, carga);
  const fijo = tarea.minimo * SEG_MES * (tarea.vcpu * p('fargateVcpuSegundo') + tarea.gb * p('fargateGbSegundo'));
  return fijo / porPeticion;
}

export function tabla(volumenes = [1e5, 1e6, 1e7, 3e7, 1e8, 3e8, 1e9]) {
  const filas = ['peticiones/mes   Lambda        Fargate (tareas)      más barato'];
  for (const n of volumenes) {
    const l = costoLambda(n), f = costoFargate(n);
    filas.push(`${n.toExponential(0).padStart(14)}  ${usd(l).padStart(12)}  ${usd(f).padStart(12)} (${String(tareasNecesarias(n)).padStart(2)})   ${l < f ? 'Lambda' : 'Fargate'}`);
  }
  const be = breakEven();
  filas.push(`break-even: ${Math.round(be).toLocaleString('en-US')} peticiones/mes (${(be / SEG_MES).toFixed(1)} peticiones/s de media)`);
  return filas.join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(`Carga: ${CARGA.duracionMs} ms y ${CARGA.memoriaMb} MB por petición en Lambda · Fargate: tareas de ${TAREA.vcpu} vCPU/${TAREA.gb} GB, ${TAREA.rpsPorTarea} pet/s cada una, mínimo ${TAREA.minimo}, pico = media × ${CARGA.factorPico}`);
  console.log(tabla());
}
