# Laboratorio · Módulo 13 · JavaScript/TypeScript moderno y Node.js esencial

Lección: [`web/public/content/microservices/modulo-17.md`](../../../web/public/content/microservices/modulo-17.md)
(Fase 2, fichas F089–F095, specs/018). Un solo `package.json` con lockfile para las siete fichas; cada carpeta
`fNNN-*` tiene el código, los programas de demostración y el test de una ficha.

| Carpeta | Ficha | Programas | Test |
|---|---|---|---|
| `f089-es6` | ES6+: async/await, Promises, destructuring, modules | `demo.js`, `sin-await.js` (error común) | `pedidos.test.js` (5) |
| `f090-typescript` | TypeScript: tipos, interfaces, generics, strict mode | `src/demo.ts` (Node lo ejecuta sin compilar), `tsconfig.json` estricto | `npx tsc -p f090-typescript` + `src/inventario.test.ts` (4) |
| `f091-event-loop` | Event Loop: fases, microtasks, macrotasks | `orden.js`, `bloqueo.js` (error común) | `orden.test.js` (2) |
| `f092-perf` | perf_hooks y clinic.js | `medir.js`, `servidor-lento.js`, `resumir-perfil.js` | `medir.test.js` (4) |
| `f093-workers` | Worker Threads vs Child Processes | `comparar.js`, `worker-fib.js`, `hijo-fib.js` | `comparar.test.js` (4) |
| `f094-backpressure` | Backpressure en Streams | `backpressure.js`, `sin-freno.js` (error común) | `backpressure.test.js` (3) |
| `f095-graceful` | Graceful shutdown | `servidor.js`, `sin-graceful.js` (anti-patrón) | `servidor.test.js` (2) |

## Versiones

Node.js **26.13.1 LTS** · TypeScript **6.0.3** · `@types/node` **26.6.6** (únicas dependencias, de desarrollo) ·
clinic **13.0.0** solo por `npx` con `--clinic`. Se verificó también con Node 22.23.5 (24 tests en verde).

## Ejecutar

```bash
cd examples/microservicios/modulo-17
npm ci
node f089-es6/demo.js
node f090-typescript/src/demo.ts
node f091-event-loop/orden.js
node f092-perf/medir.js
node f093-workers/comparar.js
node f094-backpressure/backpressure.js
node f095-graceful/servidor.js          # y en otra terminal: curl localhost:3095/lento & kill -TERM <PID>
```

## Verificar

```bash
./verificar.sh            # npm ci, tsc, 24 tests (node --test), programas de cada ficha
./verificar.sh --clinic   # además clinic doctor 13.0.0 (NO_INSIGHT=1; ver la ficha «perf_hooks y clinic.js»)
```

Toda la salida queda también en `logs/verificar.log`. Resultado esperado: `✔` en cada bloque, `ℹ tests 24 · ℹ pass 24` y
`RESULTADO: OK · Módulo 13 (JavaScript/TypeScript moderno y Node.js esencial) verificado`. Si un bloque falla, el
script sigue con los demás y al final lista todos los fallos y termina con `RESULTADO: FALLA` y código 1.

No usa infraestructura, así que no tiene `docker-compose.yml`. El paso opcional de Docker de la ficha «Graceful
shutdown» usa `node:26-alpine`.
