// Módulo 31 · F179 · ERROR COMÚN: medir el éxito de la migración con métricas de vanidad («cuántos microservicios
// tenemos», «% de código movido») en lugar de resultados (DORA, errores, p99). Ejecuta: node f179-metricas-exito/error-comun.js
// Datos sintéticos de 4 trimestres de un equipo que parte el monolito en servicios que se despliegan juntos.
const trimestres = [
  { t: 'T1', servicios: 1, codigoMovido: 0, leadTimeHoras: 300, despliegueCoordinado: 0 },
  { t: 'T2', servicios: 4, codigoMovido: 22, leadTimeHoras: 330, despliegueCoordinado: 0.5 },
  { t: 'T3', servicios: 9, codigoMovido: 48, leadTimeHoras: 410, despliegueCoordinado: 0.8 },
  { t: 'T4', servicios: 14, codigoMovido: 71, leadTimeHoras: 520, despliegueCoordinado: 0.9 },
];
console.log('trim  servicios  código movido  lead time (h)  despliegues que exigen coordinar');
for (const q of trimestres) {
  console.log(`${q.t}    ${String(q.servicios).padStart(9)}  ${String(q.codigoMovido + ' %').padStart(13)}  ${String(q.leadTimeHoras).padStart(13)}  ${String(Math.round(q.despliegueCoordinado * 100) + ' %').padStart(32)}`);
}
const [p, u] = [trimestres[0], trimestres.at(-1)];
console.log(`tablero de vanidad: ${p.servicios} -> ${u.servicios} servicios, ${u.codigoMovido} % del código movido => «ÉXITO»`);
console.log(`resultado real: lead time ${p.leadTimeHoras} -> ${u.leadTimeHoras} h (+${Math.round((u.leadTimeHoras / p.leadTimeHoras - 1) * 100)} %) => EMPEORA (monolito distribuido)`);
