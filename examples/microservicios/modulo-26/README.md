# Laboratorio · Módulo 22 · Mensajería y patrones de datos (Node.js)

Lección: [`web/public/content/microservices/modulo-26.md`](../../../web/public/content/microservices/modulo-26.md)
(Fase 2, fichas F135–F141, specs/018). Un solo `package.json` con lockfile. F135, F136, F138, F139 y F140 son
JavaScript (módulos ES) que Node 26 ejecuta tal cual; F137 y F141 son TypeScript con NestJS y se compilan a `dist/`
con `npm run build` (NestJS necesita decoradores, que Node no sabe quitar por sí solo).

| Carpeta | Ficha | Programas | Test | Infraestructura |
|---|---|---|---|---|
| `f135-rabbitmq-confirms` | RabbitMQ: publisher confirms, consumer acknowledgments | `topologia.js`, `publicador.js`, `consumidor.js`, `demo.js`, `error-comun.js` | `confirms.test.js` (5) | RabbitMQ |
| `f136-dedup-redis` | Deduplicación con Redis | `dedup.js`, `demo.js`, `error-comun.js` | `dedup.test.js` (5) | Redis |
| `f137-sagas-nestjs/src` | Sagas con NestJS CQRS | `mensajes.ts`, `servicios.ts`, `manejadores.ts`, `pedido.saga.ts`, `app.module.ts`, `main.ts`, `error-comun.ts` | `saga.test.ts` (4) | — |
| `f138-compensaciones` | Compensaciones idempotentes | `pagos.js`, `red.js`, `demo.js`, `error-comun.js` | `compensaciones.test.js` (6) | — |
| `f139-event-sourcing` | Event Sourcing con EventStoreDB o MongoDB | `pedido.js`, `almacen-mongo.js`, `almacen-memoria.js`, `almacen.js`, `demo.js`, `error-comun.js` | `almacen.test.js` (5 en memoria + 4 con MongoDB) | MongoDB (opcional) |
| `f140-proyecciones` | Proyecciones materializadas | `proyeccion.js` (node:sqlite), `demo.js`, `error-comun.js` | `proyeccion.test.js` (5) | MongoDB (opcional) |
| `f141-cqrs/src` | CQRS | `escritura.ts`, `lectura.ts`, `app.module.ts`, `main.ts`, `error-comun.ts` | `cqrs.test.ts` (5) | — |

`comun/config.js` tiene las direcciones (`AMQP_URL`, `REDIS_URL`, `MONGO_URL`) y `comun/infra.js` decide si un test
que necesita infraestructura se omite (servicio caído) o falla (`EXIGIR_INFRA=1`, lo que hace `--compose`).

## Versiones

Node.js **26.13.1 LTS** · TypeScript **6.0.3** · @nestjs/common y @nestjs/core **12.5.1** · @nestjs/cqrs **12.1.3** ·
@nestjs/testing **12.5.1** · rxjs **7.8.2** · reflect-metadata **0.2.2** · amqplib **2.4.0** · redis (node-redis)
**6.3.1** · mongodb **7.9.1** · @types/node **26.6.6** · `node:sqlite` integrado en Node 26 (SQLite 3.54.1).
Imágenes: `rabbitmq:4.4.1-management`, `redis:8.10.2-alpine`, `mongo:9.0.8`.

## Ejecutar

```bash
cd examples/microservicios/modulo-26
npm ci && npm run build
docker compose up -d --wait                    # RabbitMQ :5672 (consola :15672), Redis :6379, MongoDB :27017
node f135-rabbitmq-confirms/demo.js
node f136-dedup-redis/demo.js
node dist/f137-sagas-nestjs/src/main.js
node f138-compensaciones/demo.js
node f139-event-sourcing/demo.js               # ALMACEN=memoria para correrlo sin MongoDB
node f140-proyecciones/demo.js                 # ídem
node dist/f141-cqrs/src/main.js
docker compose down -v
```

## Verificar

```bash
./verificar.sh              # npm ci, tsc y todo lo que no necesita infraestructura; F135/F136/F139-Mongo si responden
./verificar.sh --compose    # levanta RabbitMQ, Redis y MongoDB con Docker y lo exige todo
```

Cada paso guarda su salida en `logs/NN-*.log` y toda la ejecución en `logs/verificar.log`. Si algo falla, sigue con
lo demás, lista los fallos y termina con `RESULTADO: FALLA` y código 1; si todo va bien termina con
`RESULTADO: OK · Módulo 22 (Mensajería y patrones de datos) verificado`.
