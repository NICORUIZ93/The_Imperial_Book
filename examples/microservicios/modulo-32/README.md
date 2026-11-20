# Laboratorio · Módulo 28 · FinOps y costo de arquitectura

Lección: [`web/public/content/microservices/modulo-32.md`](../../../web/public/content/microservices/modulo-32.md)
(Fase 3, fichas F165–F168, specs/018). Node.js 26 **sin dependencias** (el `package-lock.json` está vacío a propósito:
`npm ci` funciona igual que en los demás módulos). No hace falta cuenta en ninguna nube: todo se calcula con los precios
oficiales de `comun/precios.js`, cada uno con su fuente y su fecha de consulta.

| Carpeta | Ficha | Programas | Test |
|---|---|---|---|
| `comun/` | todas | `precios.js`: precios unitarios de AWS y GKE Autopilot con su URL | — |
| `f165-modelo-costo` | Modelo de costo cloud | `modelo.js`, `monolito.json`, `microservicios.json`, `error-comun.js` | `modelo.test.js` (4) |
| `f166-right-sizing` | Right-sizing | `uso.js` (7 días de uso con semilla fija), `rightsizing.js`, `error-comun.js` | `rightsizing.test.js` (5) |
| `f167-break-even` | Break-even Serverless vs Contenedores | `breakeven.js`, `error-comun.js` | `breakeven.test.js` (4) |
| `f168-observability-tax` | Observability tax | `observabilidad.js`, `error-comun.js` | `observabilidad.test.js` (5) |

## Versiones

Node.js **26.13.1 LTS**. Precios consultados el **2026-11-19** (EKS, GKE Autopilot) y el **2026-11-20** (Lambda,
Fargate, NAT gateway, tráfico entre zonas, CloudWatch y X-Ray). Antes de decidir con ellos, vuelve a mirar la fuente.

## Ejecutar

```bash
cd examples/microservicios/modulo-32
npm ci
node f165-modelo-costo/modelo.js f165-modelo-costo/microservicios.json
node f166-right-sizing/rightsizing.js
node f167-break-even/breakeven.js
node f168-observability-tax/observabilidad.js
```

Para costear tu propia arquitectura, copia `f165-modelo-costo/microservicios.json`, cambia servicios, tareas, tráfico
y logs, y ejecuta `node f165-modelo-costo/modelo.js tu-arquitectura.json`.

## Verificar

```bash
./verificar.sh              # 18 tests y los scripts de las 4 fichas
./verificar.sh --compose    # igual: este módulo no usa Docker (lo dice y sigue)
```

Toda la salida queda en `logs/verificar.log`. Resultado esperado: `ℹ tests 18 · ℹ pass 18`, un `✔` por comprobación y
`RESULTADO: OK · Módulo 28 (FinOps y costo de arquitectura) verificado`. Si algo falla, sigue con lo demás, lista los
fallos al final y termina con `RESULTADO: FALLA` y código 1.
