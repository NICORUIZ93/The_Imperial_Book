# Laboratorio · Módulo 16 · Testing

Lección: [`web/public/content/microservices/modulo-20.md`](../../../web/public/content/microservices/modulo-20.md)
(Fase 2, fichas F105–F108, specs/018). Un solo `package.json` con lockfile; TypeScript 6.0.3 compilado al vuelo por
ts-jest. `jest.config.js` define un *project* por tipo de prueba.

| Carpeta | Ficha | Código | Tests (Jest) |
|---|---|---|---|
| `f105-jest` | Jest | `src/carrito.ts`, `src/cotizador.ts`, `src/notificador.ts` | `src/carrito.test.ts` (10) · `src/cotizador.test.ts` (6) · `error-comun/` (2 archivos que deben fallar) |
| `f106-supertest` | Supertest | `src/app.ts`, `src/servidor.ts` | `src/app.test.ts` (8) · `error-comun/` (app que abre el puerto 3106) |
| `f107-pact` | Contract Testing con Pact | `consumidor/cliente-inventario.ts`, `proveedor/app.ts` | `consumidor/*.pact.test.ts` (2, genera `pacts/`) · `proveedor/*.pact.test.ts` (1) |
| `f108-testcontainers` | Testcontainers para Node | `repositorio-pedidos.ts` | `repositorio.test.ts` (6, arranca `postgres:18.7`) |

## Versiones

Node.js **26.13.1 LTS** · TypeScript **6.0.3** · jest **30.5.2** · ts-jest **29.4.15** · supertest **7.3.2** ·
express **5.3.0** · @pact-foundation/pact **17.1.4** · @pact-foundation/pact-cli **18.10.9** · testcontainers y
@testcontainers/postgresql **12.2.2** · pg **8.23.1**. Docker: `pactfoundation/pact-broker:3.2.0-pactbroker2.124.0`
(puerto 9220) con `postgres:18.7`.

## Ejecutar

```bash
cd examples/microservicios/modulo-20
npm ci
npm test                          # project «unit»: 24 tests (F105 + F106)
npm run test:cobertura
npm run test:pact:consumidor      # escribe f107-pact/pacts/pedidos-inventario.json
npm run test:pact:proveedor       # verifica la API real contra ese contrato
npm run test:contenedores         # necesita Docker
npx jest sin-await --selectProjects errores      # errores comunes: DEBEN fallar (el patrón va antes de --selectProjects)
```

Con el Pact Broker: `docker compose up -d --wait`, y los comandos `npx pact broker publish …`,
`PACT_BROKER_URL=http://localhost:9220 npm run test:pact:proveedor` y `npx pact broker can-i-deploy …` de la ficha
«Contract Testing con Pact».

## Verificar

```bash
./verificar.sh --compose   # todo, incluido el Pact Broker; exige Docker para Testcontainers
./verificar.sh             # sin broker; Testcontainers solo si Docker responde
```

Resultado esperado: `✔` en cada bloque (los errores comunes aparecen como «falla como se esperaba») y
`RESULTADO: OK · Módulo 16 (Testing) verificado · logs en logs/`. Si un bloque falla, el script sigue, al final lista
todos los fallos y termina con `RESULTADO: FALLA` y código 1. La salida completa de cada bloque queda en
`logs/NN-nombre.log`.

## Qué se ejecutó al escribirlo y qué falta

Ejecutado con Node.js 26.13.1: los 24 tests unitarios, la cobertura, los tres errores comunes, el test de consumidor
de Pact y el de Testcontainers (con una imagen local de PostgreSQL 16 y Ryuk desactivado, porque ese entorno no
alcanza Docker Hub). Falta en el Mac: la verificación del proveedor con `Verifier` de pact-js (allí el entorno
imponía un proxy HTTPS por el que pact-js envía también las peticiones a 127.0.0.1; la API del proveedor sí se
verificó contra el contrato con `npx pact verifier`), el flujo con el Pact Broker y Testcontainers con
`postgres:18.7` y Ryuk. Detalle en `verificacion/microservicios/pendiente.md`.
