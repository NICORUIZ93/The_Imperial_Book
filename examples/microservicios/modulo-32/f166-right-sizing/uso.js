// Módulo 28 · F166 · uso medido de 7 días, minuto a minuto (10 080 muestras por servicio), generado con una semilla fija
// para que la salida sea idéntica en cada máquina. Imita lo que darían `container_cpu_usage_seconds_total` (rate) y
// `container_memory_working_set_bytes` de Prometheus: ciclo diario, ruido y algún pico.
function mulberry32(semilla) {
  let a = semilla;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** perfil: { cpuBase, cpuDia, memBase, memDia, picos } -> { cpu: [vCPU], mem: [MiB] } */
export function generarUso(perfil, semilla = 2026) {
  const azar = mulberry32(semilla);
  const cpu = [], mem = [];
  for (let m = 0; m < 7 * 1440; m++) {
    const dia = Math.max(0, Math.sin(((m % 1440) / 1440) * 2 * Math.PI - Math.PI / 2)); // 0 de noche, 1 a mediodía
    const pico = azar() < perfil.picos ? 1.8 : 1;
    cpu.push(+(Math.max(0.01, (perfil.cpuBase + perfil.cpuDia * dia) * pico * (0.9 + azar() * 0.2))).toFixed(4));
    mem.push(Math.round((perfil.memBase + perfil.memDia * dia) * (0.97 + azar() * 0.06) + (pico > 1 ? perfil.memDia * 0.5 : 0)));
  }
  return { cpu, mem };
}

/** Los tres servicios del ejemplo, con lo que piden hoy (requests) y cómo se comportan de verdad. */
export const SERVICIOS = [
  { nombre: 'pedidos', replicas: 3, pide: { vcpu: 1, mib: 2048 }, perfil: { cpuBase: 0.05, cpuDia: 0.18, memBase: 380, memDia: 120, picos: 0.004 } },
  { nombre: 'catalogo', replicas: 3, pide: { vcpu: 0.5, mib: 1024 }, perfil: { cpuBase: 0.03, cpuDia: 0.06, memBase: 210, memDia: 40, picos: 0.002 } },
  { nombre: 'pagos', replicas: 2, pide: { vcpu: 0.25, mib: 512 }, perfil: { cpuBase: 0.08, cpuDia: 0.14, memBase: 300, memDia: 90, picos: 0.004 } },
];
