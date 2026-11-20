# Laboratorio · Módulo 14 · APIs REST con Express y NestJS

Lección: [`web/public/content/microservices/modulo-18.md`](../../../web/public/content/microservices/modulo-18.md)
(Fase 2, fichas F096–F100, specs/018). Un solo `package.json` con lockfile para las cinco fichas. Express y Zod son
JavaScript (módulos ES) que Node ejecuta tal cual; los proyectos NestJS son TypeScript que `npm run build` compila a
`dist/` (decoradores con `emitDecoratorMetadata`).

| Carpeta | Ficha | Programas | Test |
|---|---|---|---|
| `f096-express` | Express: routing, middleware, error handling | `app.js` (:3096), `error-comun.js` (:3196) | `app.test.js` (6) |
| `f097-nestjs` | NestJS: módulos, controllers, providers, interceptors, guards | `src/main.ts` (:3097), `src/error-comun.ts` | `src/pedidos.test.ts` (4) |
| `f098-validacion` | Validación con Zod o class-validator | `zod-express.js` (:3098), `src/main.ts` (:3198), `error-comun.js` (:3199) | `zod-express.test.js` (3) y `src/clientes.test.ts` (4) |
| `f099-dtos` | DTOs | `src/main.ts` (:3099), `src/error-comun.ts` | `src/usuarios.test.ts` (4) |
| `f100-openapi` | OpenAPI/Swagger | `src/main.ts` (:3100, Swagger UI en `/docs`), `src/exportar.ts` → `openapi.json` | `src/catalogo.test.ts` (5) |

## Versiones

Node.js **26.13.1 LTS** · TypeScript **6.0.3** · express **5.3.0** · NestJS **12.5.1** (`common`, `core`,
`platform-express`, `testing`) · @nestjs/mapped-types **12.0.1** · @nestjs/swagger **12.1.2** · zod **4.6.7** ·
class-validator **0.15.1** · class-transformer **0.5.1** · reflect-metadata **0.2.2** · rxjs **7.8.2** ·
@types/express **5.0.6** · @types/node **26.6.6**.

## Ejecutar

```bash
cd examples/microservicios/modulo-18
npm ci
node f096-express/app.js                       # curl -i localhost:3096/productos/1
npm run build
node dist/f097-nestjs/src/main.js              # curl -i localhost:3097/pedidos/1
node dist/f100-openapi/src/main.js             # http://localhost:3100/docs
```

## Verificar

```bash
./verificar.sh
```

Hace `npm ci`, compila con `tsc`, ejecuta los 26 tests (`node --test`), arranca cada API y comprueba sus respuestas con
`curl`. Toda la salida queda también en `logs/verificar.log` y la de cada API en `logs/api-<puerto>.log`. Resultado
esperado: `ℹ tests 26 · ℹ pass 26`, un `✔` por comprobación y
`RESULTADO: OK · Módulo 14 (APIs REST con Express y NestJS) verificado`. Si algo falla, sigue con lo demás, lista
todos los fallos al final y termina con `RESULTADO: FALLA` y código 1.

No usa infraestructura, así que no tiene `docker-compose.yml`.
