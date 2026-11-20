// Módulo 28 · F165 · Modelo de costo cloud de una arquitectura: cómputo + red + observabilidad, y costo por unidad.
// Proveedor del ejemplo: AWS con ECS sobre Fargate (se paga vCPU y GB pedidos por cada tarea, por segundo).
// Uso: node f165-modelo-costo/modelo.js f165-modelo-costo/microservicios.json [--solo-computo]
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { HORAS_MES, p, usd } from '../comun/precios.js';

const SEG_MES = HORAS_MES * 3600;
const GB = 1024 ** 3;
const SENTIDOS_COBRADOS = 2;

/** Devuelve las partidas mensuales en USD y el costo por cada 1000 pedidos. */
export function costear(arq, { soloComputo = false } = {}) {
  const partidas = {};
  partidas['cómputo (Fargate)'] = arq.servicios.reduce((s, sv) =>
    s + sv.tareas * SEG_MES * (sv.vcpu * p('fargateVcpuSegundo') + sv.gb * p('fargateGbSegundo')), 0);
  if (!soloComputo) {
    const r = arq.red;
    partidas['NAT gateway (horas)'] = r.natGateways * HORAS_MES * p('natHora');
    partidas['NAT gateway (GB)'] = r.gbSalientesMes * p('natGb');
    const gbInternos = arq.pedidosMes * r.llamadasInternasPorPedido * r.kbPorLlamada * 1024 / GB;
    // AWS cobra el GB que cruza de zona dos veces: al que lo envía (salida) y al que lo recibe (entrada).
    partidas['tráfico entre zonas'] = gbInternos * r.fraccionEntreZonas * p('entreZonasGb') * SENTIDOS_COBRADOS;
    const gbLogs = arq.pedidosMes * arq.logs.lineasPorPedido * arq.logs.bytesPorLinea / GB;
    partidas['logs (ingesta)'] = gbLogs * p('logsIngestaGb');
  }
  const total = Object.values(partidas).reduce((a, b) => a + b, 0);
  return { partidas, total, por1000: total / (arq.pedidosMes / 1000) };
}

export function informe(arq, opciones) {
  const { partidas, total, por1000 } = costear(arq, opciones);
  const lineas = [`${arq.nombre} · ${arq.pedidosMes.toLocaleString('en-US')} pedidos/mes`];
  for (const [k, v] of Object.entries(partidas)) {
    lineas.push(`  ${k.padEnd(22)} ${usd(v).padStart(14)}  ${((v / total) * 100).toFixed(1).padStart(5)} %`);
  }
  lineas.push(`  ${'TOTAL'.padEnd(22)} ${usd(total).padStart(14)}`);
  lineas.push(`  costo unitario: ${usd(por1000, 4)} por cada 1000 pedidos`);
  return lineas.join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arq = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  console.log(informe(arq, { soloComputo: process.argv.includes('--solo-computo') }));
}
