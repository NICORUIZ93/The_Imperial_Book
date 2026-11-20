# Laboratorio · Módulo 23 · Docker, Kubernetes y CI/CD (Node.js)

Lección: [`web/public/content/microservices/modulo-27.md`](../../../web/public/content/microservices/modulo-27.md)
(Fase 2, fichas F142–F147, specs/018). Un solo `package.json` con lockfile. El servicio que se empaqueta, despliega y
escala es `src/` («pedidos», Express 5 en TypeScript, compilado a `dist/` con `npm run build`).

| Carpeta | Ficha | Programas | Test |
|---|---|---|---|
| `f142-dockerfile` | Dockerfile multi-stage | `Dockerfile`, `Dockerfile.antes`, `revisar.js`, `etapas.js`, `error-comun.js` | `dockerfile.test.js` (4) |
| `f143-kubernetes` | Kubernetes | `validar.js`, `error-comun.yaml` + manifiestos de `k8s/` | `kubernetes.test.js` (4) |
| `f144-hpa` | HPA | `simulador.js`, `carga.js` + `k8s/40-hpa.yaml` | `hpa.test.js` (6) |
| `f145-github-actions` | GitHub Actions | `ci.yml`, `ci.antes.yml`, `validar.js`, `simular-ci.js` | `workflow.test.js` (5) |
| `f146-blue-green-canary` | Blue-Green y Canary | `despliegue.js`, `simulacion.js`, `error-comun.js`, `blue-green.yaml`, `rollout-canary.yaml` | `despliegue.test.js` (5) |
| `f147-gitops-argocd` | GitOps con ArgoCD | `application.yaml`, `reconciliador.js`, `demo.js`, `error-comun.js` | `gitops.test.js` (5) |

`k8s/` tiene los manifiestos que comparten F143, F144 y F147 (Namespace, ConfigMap, Deployment, Service y HPA).
`blue-green.yaml` y `rollout-canary.yaml` son **alternativas** al Deployment y al Service de `k8s/`: no los apliques a
la vez en el mismo espacio de nombres.

## Versiones

Node.js **26.13.1 LTS** · express **5.3.0** · TypeScript **6.0.3** · @types/node **26.6.6** · @types/express
**5.0.6** · yaml **2.9.1** · imagen base `node:26.13.1-alpine` · Docker Engine **29.10.0** con Compose **v5.6.1** o
posterior · Kubernetes **1.37** (kind **v0.33.0**, imagen `kindest/node:v1.37.0`) · metrics-server **v0.9.1** · Argo
CD **v3.5.6** · Argo Rollouts **v1.10.1** · `actions/checkout` **v7.0.1** y `actions/setup-node` **v7.1.0** fijadas por SHA.

## Ejecutar

```bash
cd examples/microservicios/modulo-27
npm ci && npm run build
node f142-dockerfile/revisar.js f142-dockerfile/Dockerfile.antes f142-dockerfile/Dockerfile
docker compose up -d --build --wait && curl localhost:18080/version && docker compose down
node f144-hpa/simulador.js
node f146-blue-green-canary/simulacion.js 0.2
node f147-gitops-argocd/demo.js
```

## Verificar

```bash
./verificar.sh              # 29 tests y los scripts de las 6 fichas, sin Docker (avisa de lo omitido)
./verificar.sh --compose    # además: imagen con Docker y Compose, job «imagen» del workflow y, si hay kind y
                            # kubectl, clúster «curso» con k8s/, metrics-server y el HPA escalando (lo borra al final)
```

Toda la salida queda en `logs/verificar.log` y la de cada bloque en `logs/<bloque>.log`. Resultado esperado:
`ℹ tests 29 · ℹ pass 29`, un `✔` por comprobación y `RESULTADO: OK · Módulo 23 (Docker, Kubernetes y CI/CD)
verificado`. Si algo falla, sigue con lo demás, lista los fallos al final y termina con `RESULTADO: FALLA` y código 1.
Si falta Docker, kind o kubectl, lo dice y sigue.
