# Laboratorio · Módulo 24 · Gobernanza arquitectónica

Lección: [`web/public/content/microservices/modulo-28.md`](../../../web/public/content/microservices/modulo-28.md)
(Fase 3, fichas F148–F151, specs/018). Un solo `package.json` con lockfile (solo `prom-client`); todo lo demás es
Node.js sin dependencias, para que puedas llevar estas herramientas a cualquier repositorio.

| Carpeta | Ficha | Programas | Test |
|---|---|---|---|
| `f148-adrs` | ADRs | `adr.js` (nuevo, aceptar, reemplazar, lint, índice), `plantilla.md`, `docs/adr/` (3 ADRs), `error-comun/` | `adr.test.js` (5) |
| `f149-c4` | Modelo C4 | `modelo.json`, `c4.js` (validar, contexto, contenedores), `workspace.dsl`, `error-comun.json` | `c4.test.js` (4) |
| `f150-atam` | ATAM ligero | `atam.json`, `atam.js` (árbol de utilidad, prioridad, temas de riesgo), `error-comun.json` | `atam.test.js` (5) |
| `f151-fitness` | Fitness functions en producción | `servicio.js` (:3151, prom-client), `fitness.js`, `simulacion.js`, `error-comun.js`, `carga.js`, `prometheus/` | `fitness.test.js` (7) |

La plantilla de ADR es la de [`docs/microservicios/07-plantillas.md`](../../../docs/microservicios/07-plantillas.md)
con una línea añadida, «Reemplaza a», para enlazar los reemplazos en los dos sentidos.

## Versiones

Node.js **26.13.1 LTS** · prom-client **15.1.3**. Infraestructura de `docker-compose.yml` (solo F151): imagen
`node:26.13.1-alpine` para las dos versiones del servicio (montan este laboratorio de solo lectura) y Prometheus
**v3.15.1** (`prom/prometheus:v3.15.1`, :19090). Alternativa a `c4.js`: Structurizr DSL (`workspace.dsl`).

## Ejecutar

```bash
cd examples/microservicios/modulo-28
npm ci
node f148-adrs/adr.js f148-adrs/docs/adr lint
node f149-c4/c4.js f149-c4/modelo.json contenedores
node f150-atam/atam.js f150-atam/atam.json
node f151-fitness/simulacion.js
docker compose up -d --wait && node f151-fitness/carga.js 2 && \
  node f151-fitness/fitness.js --prometheus http://127.0.0.1:19090 --job pedidos-v2; docker compose down
```

## Verificar

```bash
./verificar.sh              # 21 tests y los scripts de las 4 fichas (sin Docker)
./verificar.sh --compose    # además Prometheus: v1 cumple y v2 suspende con PromQL
```

Toda la salida queda en `logs/verificar.log`. Resultado esperado: `ℹ tests 21 · ℹ pass 21`, un `✔` por comprobación y
`RESULTADO: OK · Módulo 24 (Gobernanza arquitectónica) verificado`. Si algo falla, sigue con lo demás, lista los fallos
al final y termina con `RESULTADO: FALLA` y código 1. Si falta Docker, lo dice y sigue.
