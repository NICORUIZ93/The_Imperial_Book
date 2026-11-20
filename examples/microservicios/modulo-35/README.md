# Laboratorio · Módulo 31 · Migración desde monolito real

Lección: [`web/public/content/microservices/modulo-35.md`](../../../web/public/content/microservices/modulo-35.md)
(Fase 3, fichas F177–F180, specs/018). Node.js 26 **sin dependencias** (el `package-lock.json` está vacío a propósito:
`npm ci` funciona igual que en los demás módulos). SQLite va dentro de Node (`node:sqlite`, SQLite 3.54.1) y F180 usa el
`git` de tu sistema. No hace falta Docker.

| Carpeta | Ficha | Programas | Test |
|---|---|---|---|
| `comun/` | todas | `http.js`: escuchar en un puerto libre, leer cuerpos, `fetch` | — |
| `f177-strangler-fig` | Strangler Fig | `monolito.js`, `pedidos-nuevo.js`, `fachada.js`, `rutas.json`, `demo.js`, `error-comun.js` | `fachada.test.js` (5) |
| `f178-coexistencia` | Coexistencia monolito + servicios | `bd.js` (triggers de captura), `acl.js`, `relevo.js`, `conciliar.js`, `demo.js`, `error-comun.js` | `coexistencia.test.js` (4) |
| `f179-metricas-exito` | Métricas de éxito | `datos.js` (90 días sintéticos), `metricas.js` (DORA y puerta de avance), `error-comun.js` | `metricas.test.js` (3) |
| `f180-deuda-tecnica` | Deuda técnica | `generar-repo.js`, `hotspots.js`, `registro-deuda.js`, `decision.js` (ejercicio «no usar microservicios»), `error-comun.js` | `deuda.test.js` (5) |

La versión Spring Boot de la fachada Strangler Fig está en
[`../modulo-9/f045-strangler-fig/`](../modulo-9/f045-strangler-fig/) (Módulo 5).

## Versiones

Node.js **26.13.1 LTS** (SQLite 3.54.1 incluido) y Git 2.x.

## Ejecutar

```bash
cd examples/microservicios/modulo-35
npm ci
node f177-strangler-fig/demo.js
node f178-coexistencia/demo.js
node f179-metricas-exito/metricas.js
node f180-deuda-tecnica/hotspots.js            # o: node f180-deuda-tecnica/hotspots.js /ruta/a/tu/repositorio
node f180-deuda-tecnica/decision.js
```

## Verificar

```bash
./verificar.sh              # 17 tests y los scripts de las 4 fichas
./verificar.sh --compose    # igual: este módulo no usa Docker (lo dice y sigue)
```

Toda la salida queda en `logs/verificar.log`. Resultado esperado: `ℹ tests 17 · ℹ pass 17`, un `✔` por comprobación y
`RESULTADO: OK · Módulo 31 (Migración desde monolito real) verificado`. Si falta git, F180 se omite con un aviso; si
algo falla, sigue con lo demás, lista los fallos al final y termina con `RESULTADO: FALLA` y código 1.
