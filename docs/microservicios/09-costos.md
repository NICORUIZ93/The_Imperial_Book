# 9 · Estimación de costo de infraestructura

> Entregable 9 del prompt del dueño. **Precios consultados el 2026-11-19** en las fuentes oficiales de cada
> proveedor, en dólares estadounidenses (USD), bajo demanda (sin descuentos por compromiso), sin impuestos.
> Los precios cambian: antes de encender algo, vuelve a mirar la fuente y la calculadora del proveedor.

## La respuesta corta

**Puedes hacer el curso entero gratis.** Todos los laboratorios arrancan con Docker Compose o con un clúster
local (kind) en tu computadora. La nube solo es necesaria si quieres practicar un clúster gestionado real, y aun
así cuesta **unos 8–16 USD por 40 horas de práctica** si apagas el clúster al terminar cada sesión.

## Precios unitarios usados

| Proveedor | Concepto | Precio | Fuente oficial |
|---|---|---|---|
| AWS | Plano de control de EKS (soporte estándar) | 0.10 USD por clúster y hora | https://aws.amazon.com/eks/pricing/ |
| AWS | Plano de control de EKS (soporte extendido) | 0.60 USD por clúster y hora | https://aws.amazon.com/eks/pricing/ |
| AWS | EC2 `t4g.medium` (2 vCPU, 4 GiB, Graviton), Linux, us-east-1 | 0.0336 USD/h | Lista de precios de EC2 (`b0.p.awsstatic.com/.../ec2-ondemand-without-sec-sel/US East (N. Virginia)/Linux/index.json`, publicada 2026-11-19T22:09:53Z) |
| AWS | EC2 `t4g.large` (2 vCPU, 8 GiB), Linux, us-east-1 | 0.0672 USD/h | ídem |
| AWS | EC2 `m8g.large` (2 vCPU), Linux, us-east-1 | 0.08976 USD/h | ídem |
| Google Cloud | Tarifa de gestión de clúster GKE | 0.10 USD por clúster y hora | https://cloud.google.com/kubernetes-engine/pricing |
| Google Cloud | Crédito gratuito de GKE | 74.40 USD al mes por cuenta de facturación (cubre la tarifa de **un** clúster zonal o Autopilot; no cubre cómputo) | ídem |
| Google Cloud | GKE Autopilot, uso general, us-central1 | 0.0445 USD por vCPU-hora · 0.0049225 USD por GiB-hora (se cobra lo que **piden** los pods) | ídem |
| Azure | AKS, nivel Free (plano de control) | 0 USD; sin SLA | https://azure.microsoft.com/en-us/pricing/details/kubernetes-service/ |
| Azure | AKS, nivel Standard (Uptime SLA) | 0.10 USD/h | API oficial de precios: `https://prices.azure.com/api/retail/prices` (eastus) |
| Azure | AKS, Long Term Support | 0.60 USD/h | ídem |
| Azure | AKS Automatic, plano de control | 0.16 USD/h | ídem |
| Azure | VM `Standard_B2s` (2 vCPU, 4 GiB), Linux, eastus | 0.0416 USD/h | ídem |
| Azure | VM `Standard_D2s_v5` (2 vCPU, 8 GiB), Linux, eastus | 0.096 USD/h (Spot: 0.020266 USD/h) | ídem |

> **Ojo con Azure:** la API de precios también lista un medidor «FreeTierInfrastructureCost Uptime SLA» de
> 0.05 USD/h vigente desde 2026-10-01 para AKS. La página de precios no explica a qué clústeres se aplica;
> antes de usar el nivel Free, revisa la factura de prueba de tu primer día.

## Escenarios del curso

Supuesto común: un clúster con **3 nodos de 2 vCPU y 8 GiB** (lo justo para el sistema de reservas del Módulo
32 con Kafka, PostgreSQL, Redis, Temporal y observabilidad dentro del clúster). En GKE Autopilot se supone que
los pods piden en total **3 vCPU y 12 GiB**, porque Autopilot cobra por lo pedido y no por nodos.

| Escenario | Horas | AWS (EKS + 3 × t4g.large) | Azure (AKS Free + 3 × D2s v5) | Azure (AKS Standard + 3 × D2s v5) | GCP (Autopilot, tarifa cubierta por el crédito) |
|---|---|---|---|---|---|
| Coste por hora | 1 | 0.3016 USD | 0.288 USD | 0.388 USD | 0.1926 USD |
| **Práctica por sesiones** (Módulos 12, 23, 27, 28) | 40 h | **12.06 USD** | **11.52 USD** | 15.52 USD | **7.70 USD** |
| **Proyecto Final** encendido 3 semanas seguidas | 504 h | 152.01 USD | 145.15 USD | 195.55 USD | 97.06 USD |
| Un mes completo encendido | 730 h | 220.17 USD | 210.24 USD | 283.24 USD | 140.58 USD |

Cálculo: horas × (plano de control + 3 × precio del nodo). GCP: horas × (3 × 0.0445 + 12 × 0.0049225); la
tarifa de 0.10 USD/h la cubre el crédito de 74.40 USD si es tu único clúster.

**No incluido** (y en la nube real suele sumar): discos persistentes, balanceadores de carga, IP públicas,
NAT gateways, tráfico de salida, registros de contenedores y logs gestionados. El Módulo 28 te enseña a medirlos.

**Más barato todavía:** con nodos Spot (por ejemplo `D2s v5` Spot a 0.020266 USD/h en Azure) el escenario de
40 h baja a unos 2.43 USD de cómputo, a cambio de que el proveedor pueda quitarte el nodo en cualquier momento,
lo que además es un buen laboratorio de resiliencia.

## Alternativas gratuitas o locales

| Necesidad | Alternativa gratuita | Notas |
|---|---|---|
| Kafka, RabbitMQ, NATS, Redis, PostgreSQL, MySQL, MongoDB, Keycloak, Vault, Temporal, Toxiproxy, observabilidad | **Docker Compose** en tu computadora | Es lo que usan los laboratorios (el laboratorio del módulo (retirado; usa los ejemplos de la lección)). Versiones en [08-herramientas-y-versiones.md](08-herramientas-y-versiones.md). |
| Kubernetes | **kind** (https://kind.sigs.k8s.io) o k3d / minikube | Clúster de varios nodos dentro de Docker; suficiente para Deployments, probes, HPA (con metrics-server), Helm, Argo CD e Istio. |
| Servicios de AWS, Azure y GCP | **Floci** (emulador local del repositorio, `docker-compose.yml` de la raíz) | Línea definida en `docs/VERSIONES.md`: Floci 2.2.0 (AWS), floci-az 0.14.0, floci-gcp 0.10.0. |
| Calidad de código | **SonarQube Community Build** | Gratuita; corre en Docker. |
| Escaneo de vulnerabilidades | **Trivy** | Open source; sin cuenta. |
| CI/CD | **GitHub Actions** en repositorios públicos | Consulta los minutos incluidos en https://docs.github.com/billing. |
| Diagramas | Mermaid, Excalidraw | Ver [01-portada.md](01-portada.md). |

### Requisitos de la computadora para ir en local

| Recurso | Mínimo | Recomendado |
|---|---|---|
| RAM | 16 GB (Fases 0–2 con un servicio de infraestructura a la vez) | 32 GB (Proyecto Final completo en kind) |
| CPU | 4 núcleos | 8 núcleos |
| Disco libre | 40 GB | 80 GB (imágenes de Kafka, Elasticsearch, GraalVM) |

## Reglas para no llevarte sustos

1. Crea una **alerta de presupuesto** (AWS Budgets, Google Cloud Budgets, Azure Cost Management) en 10 USD antes
   de crear el clúster.
2. Borra el clúster al terminar la sesión (`eksctl delete cluster`, `gcloud container clusters delete`,
   `az aks delete`), no basta con escalar a cero los Deployments: el plano de control sigue cobrando.
3. Etiqueta todo con `curso=microservicios` para filtrar la factura.
4. Revisa los recursos huérfanos (discos, balanceadores, IP) después de borrar el clúster.
