// Módulo 28 · F166 · Right-sizing: recomendar requests de CPU y memoria a partir del uso medido y calcular el ahorro.
//   CPU (comprimible: si falta, el contenedor se ralentiza)   -> request = p95 × 1,15
//   memoria (no comprimible: si falta, OOMKilled)              -> request = límite = máximo × 1,2
// Precio: GKE Autopilot cobra por lo que PIDEN los pods (vCPU-hora y GiB-hora), así que el ahorro es directo.
// Uso: node f166-right-sizing/rightsizing.js
import { pathToFileURL } from 'node:url';
import { HORAS_MES, p, usd } from '../comun/precios.js';
import { generarUso, SERVICIOS } from './uso.js';

export function percentil(valores, q) {
  const v = [...valores].sort((a, b) => a - b);
  return v[Math.min(v.length - 1, Math.ceil(q * v.length) - 1)];
}
const arriba = (x, paso) => Math.ceil(x / paso - 1e-9) * paso;

export function recomendar(uso, { qCpu = 0.95, margenCpu = 1.15, margenMem = 1.2 } = {}) {
  return {
    vcpu: +arriba(percentil(uso.cpu, qCpu) * margenCpu, 0.05).toFixed(2),
    mib: arriba(Math.max(...uso.mem) * margenMem, 64),
  };
}

export const costoMes = ({ vcpu, mib }, replicas) =>
  replicas * HORAS_MES * (vcpu * p('autopilotVcpuHora') + (mib / 1024) * p('autopilotGibHora'));

export function informe(servicios = SERVICIOS) {
  let antes = 0, despues = 0;
  const filas = ['servicio  réplicas  pide hoy           p95 CPU  máx mem   recomendado        costo hoy     costo nuevo'];
  servicios.forEach((s, i) => {
    const uso = generarUso(s.perfil, 2026 + i);
    const r = recomendar(uso);
    const a = costoMes(s.pide, s.replicas), d = costoMes(r, s.replicas);
    antes += a; despues += d;
    filas.push(`${s.nombre.padEnd(9)} ${String(s.replicas).padStart(8)}  ${`${s.pide.vcpu} vCPU/${s.pide.mib} MiB`.padEnd(18)} ${percentil(uso.cpu, 0.95).toFixed(3).padStart(7)}  ${`${Math.max(...uso.mem)} MiB`.padStart(8)}  ${`${r.vcpu} vCPU/${r.mib} MiB`.padEnd(18)} ${usd(a).padStart(12)}  ${usd(d).padStart(12)}`);
  });
  filas.push(`TOTAL al mes: ${usd(antes)} -> ${usd(despues)} · ahorro ${usd(antes - despues)} (${(((antes - despues) / antes) * 100).toFixed(1)} %)`);
  return filas.join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) console.log(informe());
