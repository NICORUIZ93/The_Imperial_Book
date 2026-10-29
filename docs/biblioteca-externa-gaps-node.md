# Huecos del track Node frente a la biblioteca externa


## Estado (2026-10-28)
Resuelto: **M1 T5** (publicar paquete npm), **M1 T6** (ESM y CommonJS), **M7 T6** (TDD con node:test), **M10 T5** (CVE, CWE y npm audit). Ejemplos ejecutados con Node 22.

**Fecha:** 2026-10-28 · **Método:** índice del libro (sin outline; se leyó la sección "Lo que este libro cubre") cruzado con los temas del track `node` y búsqueda de palabras clave en `web/public/content/node/*.md`.

## Libro cotejado
- **Node.js.pdf** (Web_Frontend_Backend/NodeJS) — 17 capítulos, 631 págs.: runtime, entorno, JS, asincronía, librerías core, npm, eventos, testing, HTTP/REST, Express, proyecto, MongoDB, auth, errores, seguridad, despliegue, Docker.

## Veredicto
El track ya cubre casi todo el libro y va más allá (Fastify, Prisma, BullMQ, OpenTelemetry, GraphQL Federation). Los huecos son puntuales.

| Tema del libro | Capítulo | Estado en el track | Prioridad |
|---|---|---|---|
| **Publicar un paquete npm** (`npm publish`, scope, `files`, versionado, registro privado) | cap. 6 | Ausente (0 menciones) | **Alta**: patrón diario en equipos con librerías compartidas |
| **Interoperabilidad ESM ↔ CommonJS** (`require(esm)`, `createRequire`, dual packages) | cap. 5 | Solo 1 mención de CommonJS | Media |
| **Código isomórfico** (mismo módulo en Node y navegador) | cap. 6 | Ausente | Baja |
| **TDD práctico** (rojo-verde-refactor sobre la API) | cap. 8 | Ausente como práctica (sí hay Vitest/node:test) | Media |
| **CWE / CVE y modelo de amenazas de Node** | cap. 15 | OWASP sí; CWE/CVE 0 menciones | Media |
| **Gestión de versiones de Node** (nvm/fnm, calendario LTS) | cap. 1-2 | nvm aparece de pasada (2) | Baja |

## Fuera de alcance
- Fundamentos de JavaScript (cap. 3): ya los cubre el track `javascript`.
- DigitalOcean como proveedor: el track usa Docker/Nginx/serverless, que es el nivel correcto.

## Propuesta
1. Tema nuevo en M1: "Publicar y versionar un paquete npm (público y privado)".
2. Tema nuevo en M1 o M14: "ESM y CommonJS en el mismo proyecto".
3. Tema nuevo en M7: "TDD sobre un endpoint real".
4. Ampliar M10 T4 con CWE/CVE y el modelo de amenazas oficial de Node.
