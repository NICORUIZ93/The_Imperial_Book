// Módulo 32 · Estimación de costo mensual del proyecto en AWS (ECS sobre Fargate), con el método del Módulo 28.
// Ejecuta: node costo.js   (escribe también COSTO.md, que el Comité revisa en el criterio 8)
import { writeFileSync } from 'node:fs';
import { HORAS_MES, PRECIOS, p } from './comun/precios.js';

const SEG = HORAS_MES * 3600;
const reservasMes = 1_000_000;
const tareas = [ // [contenedor, tareas, vCPU, GB]
  ['gateway', 2, 0.5, 1], ['reservas (API)', 2, 0.5, 1], ['worker «reservas»', 2, 0.5, 1], ['worker «cobros»', 1, 0.25, 0.5],
  ['Temporal (autoalojado, sin su base de datos)', 1, 1, 2], ['Redis (limitador)', 1, 0.25, 0.5],
];
const partidas = tareas.map(([n, t, v, g]) => [n, t * SEG * (v * p('fargateVcpuSegundo') + g * p('fargateGbSegundo'))]);
partidas.push(['NAT gateway (1, horas)', HORAS_MES * p('natHora')]);
partidas.push(['NAT gateway (GB al proveedor: 2 KB por cobro)', (reservasMes * 2 * 1024) / 1024 ** 3 * p('natGb')]);
partidas.push(['logs (12 líneas de 300 B por reserva)', (reservasMes * 12 * 300) / 1024 ** 3 * p('logsIngestaGb')]);
const total = partidas.reduce((s, [, v]) => s + v, 0);
const lineas = partidas.map(([n, v]) => `| ${n} | ${v.toFixed(2)} |`);
const md = `# Costo estimado del proyecto (generado por \`node costo.js\`)

Supuestos: ${reservasMes.toLocaleString('en-US')} reservas al mes, ECS sobre Fargate en US East (N. Virginia), ${HORAS_MES} h/mes,
sin descuentos. Precios (USD) de \`comun/precios.js\`, consultados el 2026-11-19 y el 2026-11-20:
${Object.values(PRECIOS).map((x) => `- ${x.usd} · ${x.fuente}`).join('\n')}

| Partida | USD/mes |
|---|---|
${lineas.join('\n')}
| **TOTAL** | **${total.toFixed(2)}** |

Costo unitario: **${(total / (reservasMes / 1000)).toFixed(4)} USD por cada 1000 reservas**. No incluye la base de datos de
Temporal ni la de reservas (PostgreSQL), ni el balanceador: añádelos con los precios de su página antes de la defensa.
`;
writeFileSync(new URL('./COSTO.md', import.meta.url), md);
console.log(md);
