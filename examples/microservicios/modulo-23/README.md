# Laboratorio · Módulo 19 · Resiliencia (Node.js)

Lección: [`web/public/content/microservices/modulo-23.md`](../../../web/public/content/microservices/modulo-23.md)
(Fase 2, fichas F119–F123, specs/018). Un solo `package.json` con lockfile para las cinco fichas. Todo es JavaScript
(módulos ES) que Node ejecuta tal cual, salvo `f119-circuit-breaker/cockatiel.ts`, que Node 26 ejecuta quitando los
tipos y `npm run tipos` comprueba con `tsc --noEmit`.

| Carpeta | Ficha | Programas | Simulación del fallo | Test |
|---|---|---|---|---|
| `f119-circuit-breaker` | Circuit Breaker con opossum o cockatiel | `servicio.js` (:3119), `cockatiel.ts`, `error-comun.js` | `simulacion.js` (proxy apagado) | `circuito.test.js` (5) |
| `f120-retry` | Retry con jitter | `reintentar.js`, `con-cockatiel.js`, `error-comun.js` | `simulacion.js` (corte de 350 ms + tormenta de 200 clientes) | `reintentar.test.js` (6) |
| `f121-rate-limiting` | Rate Limiting con Redis | `servicio.js` (:3121), `error-comun.js`, `anti-patron.js` | `simulacion.js` (Redis apagado) | `limitadores.test.js` (4, usa Redis) |
| `f122-timeouts` | Timeouts | `cadena.js` (:3122 → :3222), `error-comun.js` | `simulacion.js` (latencia y conexión colgada) | `con-timeout.test.js` (5) |
| `f123-fallbacks` | Fallback strategies | `catalogo.js` (:3123), `error-comun.js` | `simulacion.js` (proxy apagado) | `catalogo.test.js` (5) |

`comun/inventario.js` es la dependencia a la que se le provocan fallos; `comun/toxiproxy.js` y `simular-fallo.sh` le
hablan a la API de Toxiproxy (`:8474`). El inventario se llama siempre a través de Toxiproxy (`:21212`) y Redis también
(`:26379`); los puertos directos (`:9000`, `:6379`) son para control.

## Versiones

Node.js **26.13.1 LTS** · TypeScript **6.0.3** · opossum **10.0.0** · cockatiel **4.0.0** · redis (node-redis)
**6.3.1** · rate-limiter-flexible **11.5.0** · express **5.3.0** · @types/node **26.6.6** · Redis **8.10.2** ·
Toxiproxy **2.13.0** · imagen `node:26-alpine` para el inventario.

## Ejecutar

```bash
cd examples/microservicios/modulo-23
npm ci
docker compose up -d --wait                  # o ./infra.sh up (sin Docker: toxiproxy-server y redis-server del PATH)
node f119-circuit-breaker/simulacion.js      # y las demás simulacion.js
./simular-fallo.sh lento 2000                # caido [proxy] | cuelga [proxy] | sano | estado
docker compose down
```

## Verificar

```bash
./verificar.sh --compose
```

Instala con `npm ci`, comprueba tipos, levanta la infraestructura, ejecuta los 25 tests, las cinco simulaciones de
fallo, los scripts de error común y prueba el servicio de F119 con `curl` mientras Toxiproxy tumba el inventario. Toda
la salida queda en `logs/verificar.log` y la de cada script en `logs/<carpeta>-<script>.log`. Resultado esperado:
`ℹ tests 25 · ℹ pass 25`, un `✔` por comprobación y `RESULTADO: OK · Módulo 19 (Resiliencia en Node.js) verificado`.
Si algo falla, sigue con lo demás, lista los fallos al final y termina con `RESULTADO: FALLA` y código 1. Sin
`--compose` usa Docker si hay daemon y, si no, los binarios locales (`MODO=local`).
