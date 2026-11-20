// Módulo 32 · F187 · Lista de comprobación ANTES de la defensa: ¿el proyecto tiene todo lo que pide el Comité?
// Revisa el propio laboratorio (o la carpeta que pases). Uso: node f187-defensa-arb/entregables.js [carpeta]
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export function revisar(raiz) {
  const leer = (r) => (existsSync(join(raiz, r)) ? readFileSync(join(raiz, r), 'utf8') : '');
  const hay = (r) => existsSync(join(raiz, r));
  return [
    ['Diagrama C4 (contexto y contenedores) en el README', /```mermaid[\s\S]*C4/.test(leer('README.md'))],
    ['Saga con compensaciones y sus tests', hay('f182-saga-temporal/workflows.js') && hay('f182-saga-temporal/saga.test.js')],
    ['Gateway con rate limiting y su test', hay('f183-gateway-rate-limit/limitador.js') && hay('f183-gateway-rate-limit/gateway.test.js')],
    ['Simulación de Gatling con aserciones (SLO)', /assertions\(/.test(leer('f184-carga-gatling/src/reservas.gatling.js'))],
    ['Medición antes/después de la restricción', hay('f185-restriccion-sobrevenida/antes.js') && hay('f185-restriccion-sobrevenida/despues.js')],
    ['2 ADR o más, con fitness function ejecutable', hay('f186-adr/adr') && readdirSync(join(raiz, 'f186-adr/adr')).length >= 2 && hay('f186-adr/fitness.test.js')],
    ['Estimación de costo con precios reales', /USD/.test(leer('COSTO.md'))],
    ['Versión Spring Boot (Fase 1) del sistema', hay('spring/settings.gradle.kts')],
  ];
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const filas = revisar(process.argv[2] ?? new URL('..', import.meta.url).pathname);
  for (const [que, ok] of filas) console.log(`${ok ? '✔' : '✘'} ${que}`);
  const faltan = filas.filter(([, ok]) => !ok).length;
  console.log(faltan ? `faltan ${faltan} entregable(s): no pidas fecha de defensa todavía` : 'listo para la defensa');
}
