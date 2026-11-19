# Calidad de temario: Cloud, DevOps y Control 1

**Fecha:** 2026-11-18. **Alcance:** cobertura frente a fuentes primarias, coherencia entre lo que promete el track y lo que enseña el módulo, solapamientos, progresión y carga, vigencia de versiones y servicios, y experiencia del estudiante.

**Qué no repite este informe.** Ya están documentados y no se vuelven a listar los siguientes hallazgos: errores de código y de ejecución, plantilla, soluciones, voseo, bloques `floci up`, PKCE, puertos de M8, `nodejs20.x`, App Mesh, `alpine/git`, `trivy-action`, `node:20`, Jenkins JDK17, «Cierre del track» de DevOps M13, numeración +1 de Control 1, ni contenido personal del Parcial 1. Están en [cloud.md](cloud.md), [devops-kotlin.md](devops-kotlin.md), [control1-fundamentos.md](control1-fundamentos.md) y [calidad-transversal.md](calidad-transversal.md). Si un hallazgo de aquí toca uno de esos, se indica con «(complementa …)».

**Método.**
- Los temas reales salen de los encabezados `### Tema` de los 81 archivos.
- Los `concepts` de cada `m(...)` en `course-data.ts`, `devops.track.ts` y `control-1.track.ts` se cruzaron con el texto de cada módulo con un script. Los conceptos con menos del 60 % de sus palabras clave presentes se revisaron a mano.
- Se midieron las palabras por módulo frente a las horas declaradas.
- Con `grep` se buscó cada competencia de las guías oficiales.

Todas las fuentes externas están al final con su URL.

---

## Resumen

| Curso | Horas declaradas | Temas | Diagnóstico de temario |
|---|---:|---:|---|
| Cloud | 136,5 h | 168 | El temario de M21–M30 y M34 se decidió por los servicios que emula Floci, no por un rol ni por un examen. Faltan SAM, CodePipeline, OpenTelemetry/ADOT, redes VPC a fondo, elección de almacenamiento y Azure/GCP en profundidad. Hay tres proyectos finales y muchos temas duplicados. |
| DevOps | 106,5 h | 139 | Mezcla seis disciplinas: Linux, Docker, Kubernetes, CI/CD/IaC, SRE y arquitectura/DDD. Kubernetes cubre cerca de la mitad de CKA/CKAD. Ingress-NGINX, Promtail, Vault 1.17, Loki 3.1 y el proveedor AWS 5.x están vencidos. M15 duplica seis temas. |
| Control 1 | 50,5 h | 70 | Cubre bien las unidades 1–4 del syllabus UD 7303. No tiene Nyquist, diseño en frecuencia, controlabilidad/observabilidad, observadores, método algebraico ni ON-OFF. Marca como «Experto, más allá del parcial» lo que el programa sí exige, y tiene un tercio de las horas del curso real. |

---

## 1. Cloud («Cloud Local — AWS, Azure y GCP»)

### 1.1 Tabla de hallazgos

| # | Aspecto | Hallazgo (cita) | Impacto | Propuesta |
|---|---|---|---|---|
| C1 | Cobertura (origen del temario) | El comentario del track declara que M21–M30 existen «para alcanzar paridad completa con los servicios documentados de Floci» (`web/src/app/course-data.ts:30-41`). M34 «Floci oficial completo» (12 h, 11 temas) es un manual del producto. | El temario sigue el catálogo de un emulador y no lo que pide un rol: entran Transfer Family (M30), Neptune (M28) y BCM Data Exports (M29), y quedan fuera temas que piden los exámenes (C2–C5). | Definir el curso por rol (desarrollador cloud asociado) y usar Floci solo como laboratorio. Reducir M34 a un anexo de referencia. |
| C2 | Cobertura (AWS DVA-C02) | El dominio 3 de DVA-C02 exige SAM, despliegue de stacks a otros entornos, AppConfig, Amplify/Copilot como entornos, CodePipeline y estrategias blue/green/canary. Hoy no hay ningún tema de SAM (solo `cloud/modulo-6.md:229`), y CodePipeline aparece solo en M34 (complementa cloud.md §5.9). | La mitad del dominio Deployment (24 %) del examen de desarrollador queda sin práctica. | Tema nuevo «SAM: plantilla, `sam build/deploy`, entornos» en M15 o M24. Añadir CodePipeline a M24. |
| C3 | Cobertura (AWS DVA-C02, dominio 4) | DVA-C02 pide EMF, consultas de logs, trazas y la diferencia entre logging, monitoreo y observabilidad. El curso no tiene EMF. Logs Insights aparece solo en M33. OpenTelemetry/ADOT no aparece en ningún módulo de Cloud. | El 18 % del examen sin práctica. Se enseña X-Ray sin su reemplazo (ver C14). | Rehacer M12 Tema 3 con OTel/ADOT → X-Ray, EMF y Logs Insights. |
| C4 | Cobertura (SAA-C03) | Faltan: elección EBS/EFS/FSx (solo menciones en M25/M28/M30), VPC endpoints/PrivateLink, Transit Gateway, peering, Global Accelerator, Spot/Savings Plans, Aurora y DAX. VPC solo tiene `cloud/modulo-21.md:307` (1 tema) y `modulo-32.md:8`. | Los dominios de redes, rendimiento y costo del arquitecto asociado quedan débiles. | Módulo nuevo «Redes VPC a fondo» (subredes, NAT, endpoints, peering/TGW, flujo) y un tema «Elegir almacenamiento y cómputo por costo». |
| C5 | Cobertura (Azure) | AZ-204 se retiró el 31-07-2026. Su sucesor, AI-200, pide ACR Tasks, Container Apps con KEDA, AKS, Cosmos DB (RU, change feed, vectores), PostgreSQL con pgvector, Managed Redis, Service Bus, Event Grid, Functions, Key Vault, App Configuration, OpenTelemetry y KQL. En el curso, KEDA, KQL, change feed y pgvector tienen 0 apariciones. Event Grid y App Configuration solo están en las tablas de M8 y M34. | La parte Azure es un recorrido por la superficie del emulador, no una ruta de desarrollador. | Si Azure se queda: dos módulos Azure con Functions + Service Bus/Event Grid y Container Apps/Key Vault/App Configuration/Monitor. Si no se queda, sacarlo del título del curso. |
| C6 | Cobertura (Google Cloud) | La guía Associate Cloud Engineer pide jerarquía de recursos, IAM y cuentas de servicio (impersonación), facturación y presupuestos, Shared VPC, Cloud NAT, GKE Autopilot, Cloud Run (revisiones, división de tráfico) y log routers. El curso lo concentra en `modulo-8.md:70` (1 tema) y M34. «Shared VPC» y «Spanner» tienen 0 apariciones. | GCP es nominal. | Igual que C5: un módulo GCP real (IAM y cuentas de servicio, Cloud Run, Pub/Sub, Cloud SQL) o sacarlo del título. |
| C7 | Coherencia promesa/contenido | Títulos que prometen tres nubes y no las enseñan. M10 «…Key Vault y Secret Manager» solo trae una fila de tabla (`modulo-10.md:184`). M14 «…y comparación con Cloud Run» solo menciona Cloud Run en el título. El reto del track repite `SECRETMANAGER_EMULATOR_HOST` (`course-data.ts:312`), la misma variable que cloud.md §7.4 mostró que `gcloud` ignora. | El estudiante busca un contenido que no existe. | Ajustar los títulos a lo que se enseña o escribir los temas. |
| C8 | Coherencia promesa/contenido | Conceptos del track con 0 % de presencia en el módulo: «Parameter group», «IAM Authentication» y «Connection string» (M13, `course-data.ts:370`). «Compaction» y «Backpressure» (M17, `:459`). «Parallel state» (M16, `:437`). «Feature parity» e «Interoperabilidad» (M31, `:738`). «Least privilege» (M10, `:303`). «Service Discovery» solo aparece de pasada (M14, `:392`). | La ficha del módulo promete conceptos que no se enseñan. | Quitar esos conceptos del track o añadir un subtema. |
| C9 | Coherencia promesa/contenido | M33 dice «Integra los 22 temas avanzados del itinerario» (`course-data.ts:774`), pero son 7 temas y 6.778 palabras para 20 h. El Tema 6 junta «Microservicios, Big Data, AI/ML y multi-cloud» (`modulo-33.md:342`). | Expectativa falsa de un proyecto de 20 h. | Convertir M33 en un capstone guiado con hitos y entregables, o eliminarlo y dejar M31 como único integrador. |
| C10 | Solapamiento interno | Pares de temas que cubren lo mismo: Firehose vs KDS en `modulo-17.md:126` y `modulo-26.md:66`; Pipes vs Step Functions en `modulo-16.md:148` y `modulo-26.md:185`; restauración de backup en `modulo-25.md:353` y `modulo-32.md:216`; Terraform en `modulo-15.md:152` y `modulo-33.md:6`; X-Ray en `modulo-12.md:130` y `modulo-33.md:228`; Floci en `modulo-0.md:277-365` y `modulo-34.md:19-158`. | Unas 6–8 h repetidas. | Fusionar M26 dentro de M17 y M16. Dejar un solo tema de restauración (M32). |
| C11 | Solapamiento con Fundamentos | `cloud/modulo-0.md:65` (terminal) y `:130` (redes, IP, HTTP) repiten `foundations/modulo-3.md:6` y `foundations/modulo-8.md:246`. | M0 se alarga (8 temas para «1 h»). | Declarar Fundamentos como prerrequisito y enlazarlo. |
| C12 | Progresión | Los niveles no avanzan en orden: M8–M9 son «Experto», M10 vuelve a «Fundamentos» (`course-data.ts:301`), M11–M12 son «Aplicación» y M21–M23 son «Integración» después de M17–M20 «Experto». El «Proyecto final» está en M9 de 35, y hay otro integrador en M31 y otro capstone en M33. | El mapa de etapas confunde. Hay tres finales. | Reordenar en cuatro bloques monótonos (base AWS → servicios de aplicación → plataforma y redes → arquitectura y capstone). Un solo capstone. |
| C13 | Carga | La relación entre palabras y horas va de 6.888 palabras/h (M0: 8 temas en «1 h», 8 min por tema) a 338 palabras/h (M33: 171 min por tema). M17 son 80 min por tema y M8 70 min. La metodología pide 20–45 min. | Las horas no sirven para planificar. | Recalcular la duración por tema (≈150 palabras/min de lectura + práctica) y declarar la suma. |
| C14 | Vigencia | Se enseña X-Ray sin OpenTelemetry (`modulo-12.md:143`, `modulo-33.md:231-284`). Los SDK y el daemon de X-Ray están en modo mantenimiento desde el 25-02-2026, y AWS recomienda migrar a OpenTelemetry. | Se enseña instrumentación en retiro. | Instrumentar con ADOT/OTel y usar X-Ray como backend. |
| C15 | Vigencia | M21 Tema 4 enseña `create-launch-configuration` como camino principal (`modulo-21.md:213-238`, `:388-389`). La nota de `:229` dice «solo-mantenimiento desde 2023». La documentación de AWS dice que las cuentas creadas desde el 01-10-2024 no pueden crear launch configurations por ningún método. | El estudiante no puede repetirlo en una cuenta nueva. | Usar `create-launch-template` y mencionar launch configurations solo como historia. |
| C16 | Vigencia | En M20, `invoke-model --model-id anthropic.claude-sonnet-5 --body '{"prompt":"Hola","max_tokens":100}'` (`modulo-20.md:18`) usa un cuerpo de texto plano. Para Claude, la API Messages de Bedrock exige `anthropic_version` y `messages`, y AWS recomienda la API Converse. | Funciona contra el stub local, pero falla en AWS real. | Usar `bedrock-runtime converse`, o el cuerpo Messages, y explicarlo. |
| C17 | Experiencia | La expresión «cloud local» se usa como nombre propio del producto en 25 retos del track (p. ej. «Crea un repositorio ECR en cloud local», `course-data.ts:395`) y en encabezados (`modulo-31.md:165`). Es un resto de un buscar y reemplazar de «Floci». El glosario técnico tiene solo 4 términos para Cloud (`technical-glossary.ts:73`), sin SAM, KMS, VPC, RPO/RTO ni landing zone. M0 introduce 38 siglas distintas. El 70 % de los enlaces externos va a `docs.aws.amazon.com` (140) y solo 4 a Microsoft Learn y 3 a Google Cloud. | Hay ambigüedad (¿«cloud local» es un producto?) y jerga sin apoyo. Los recursos de Azure y GCP son escasos. | Decir «Floci» o «el emulador local». Ampliar el glosario a unos 30 términos. Enlazar Microsoft Learn y Google Cloud Skills Boost en cada módulo multinube. |

### 1.2 Cambios de temario propuestos para aprobación (Cloud), por prioridad

1. **Redefinir el objetivo del curso por rol.** Ruta «desarrollador cloud en AWS» alineada con DVA-C02, más un bloque de arquitectura alineado con SAA-C03. Floci queda como herramienta de laboratorio. Decidir si Azure y GCP se quedan con profundidad (C5, C6) o salen del título.
2. **Añadir temas que faltan:** SAM (tema nuevo), CodePipeline (en M24), OTel/ADOT + EMF + Logs Insights (rehacer M12 T3), un módulo «Redes VPC a fondo» y un tema «Elegir almacenamiento y cómputo por costo» (EBS/EFS/S3/FSx, Spot/Savings Plans).
3. **Actualizar lo vencido:** launch templates (M21 T4), Converse API (M20 T1), OTel en lugar de los SDK de X-Ray (M12, M33).
4. **Fusionar lo duplicado:** M26 dentro de M17 y M16. Un solo tema de restauración (M32 T4, y quitar M25 T6). Terraform solo en DevOps/IaC (quitar M15 T3 «Terraform/CDK» y M33 T1). Un solo capstone: M31 reescrito, M9 como «proyecto intermedio» y M33 eliminado o convertido en hitos.
5. **Recortar el nicho:** pasar M28 (Neptune/OpenSearch), M29 T3 (BCM Data Exports) y M30 (Transfer Family) a «Anexos opcionales». Pasar M34 a anexo de referencia de Floci.
6. **Sacar Docker básico (M1)** al nuevo curso Docker como prerrequisito, y la terminal y las redes de M0 a Fundamentos.
7. **Corregir títulos y fichas** (C7–C9) y recalcular las duraciones (C13).

---

## 2. DevOps

### 2.1 Tabla de hallazgos

| # | Aspecto | Hallazgo (cita) | Impacto | Propuesta |
|---|---|---|---|---|
| D1 | Alcance | 23 módulos de seis disciplinas: Linux (M0), Git (M1), Docker (M2, M3), Kubernetes (M6, M7), CI/CD/IaC/observabilidad (M4–M13), SRE (M14), QA de APIs (M16), diseño de sistemas (M17), VPS (M18), arquitectura/DDD/microservicios (M19–M21) y un laboratorio con Floci (M22). Spec 013 ya aprobó crear los cursos **Docker**, **Kubernetes** y **Diseño de sistemas** (`specs/013-programa-de-cursos-y-correcciones.md:14`). | El curso no tiene un eje, y cuando nazcan esos cursos habrá contenido duplicado entre ellos. | Ver §2.2 (reparto). |
| D2 | Cobertura (CKA, vigente desde el 18-02-2025) | Faltan: kubeadm y su ciclo de vida, control plane HA, respaldo de etcd, Kustomize, CoreDNS, CNI/CSI/CRI, instalar operadores y una práctica de Gateway API. «Kustomize», «kubeadm», «CoreDNS», «CSI» y «HTTPRoute» tienen 0 apariciones. «Gateway API» solo se nombra (`modulo-7.md:794`, `modulo-14.md:466`). La resolución de problemas es el 30 % del examen y no tiene tema propio. | Kubernetes cubre cerca de la mitad del CKA. | Llevarlo al curso Kubernetes con un módulo de troubleshooting y otro de administración (kubeadm, etcd, actualizaciones). |
| D3 | Cobertura (CKAD, examen sobre K8s v1.37) | Faltan init containers y Pods multicontenedor como patrón, Kustomize, deprecaciones de API, `kubectl debug`, PodDisruptionBudget, VPA y control de admisión. CRD/operators solo aparecen como palabra (`modulo-15.md:160`). | Faltan cerca de 6 competencias del CKAD. | Igual que D2. |
| D4 | Cobertura (AZ-400, habilidades vigentes desde el 27-07-2026) | El 50–55 % del examen es pipelines. No hay gestión de paquetes ni versionado (SemVer/CalVer, GitHub Packages/Artifacts), plantillas o workflows reutilizables (`workflow_call`), entornos con aprobaciones, Dependabot/CodeQL, CODEOWNERS ni Git LFS: todos tienen 0 apariciones. Azure Pipelines/Boards: 0. | Las habilidades de «release engineering» más pedidas no están. | Tema nuevo «Versionado y publicación de artefactos» y tema nuevo «Workflows reutilizables, entornos y aprobaciones» en M4/M5. Dependabot/CodeQL en M11. Azure Pipelines como anexo comparativo. |
| D5 | Coherencia promesa/contenido | M15 promete «CRD, operators y admission controllers» (`devops.track.ts:194`). El módulo solo nombra CRD en los «conceptos clave» de un hook de Helm (`modulo-15.md:160`), y operators y admission no aparecen. M13 promete «Observabilidad integrada» y «Rollback automatizado» (`devops.track.ts:174`), y el módulo no los ejecuta (complementa devops-kotlin.md B5). | Ficha falsa. | Ajustar las fichas o escribir los temas. |
| D6 | Solapamiento interno | M15 repite seis temas: T1 `modulo-15.md:6` con M2/M3; T2 `:148` con M6/M7; T3 `:240` con M7 T6 `modulo-7.md:480`; T4 `:329` con M12 T5 `modulo-12.md:385`; T5 `:398` con M8 T6 `modulo-8.md:450`; T6 `:483` con M11 y M9 T7 `modulo-9.md:531`. También se repiten: M12 T6 `:479` con M14 T4 `modulo-14.md:336` (platform engineering), M11 T5 `modulo-11.md:403` con M14 T3 `:210` (SBOM), M9 T5 `modulo-9.md:357` con M14 T1 `:8` (SLO), y M5 T3 `modulo-5.md:197` con M7 T7 `modulo-7.md:575` (rolling). | Unas 12–15 h repetidas. M15 declara 12 h para 4.372 palabras. | Eliminar M15 y repartir lo nuevo (CRD/operators al curso K8s, mesh avanzado a K8s). Un solo tema de SLO (M14) y uno de SBOM (M14). |
| D7 | Progresión | «Cultura DevOps y el ciclo Plan→…→Monitor» es el Tema 8 de M0 (`modulo-0.md:626`), después de cron y hardening. El «para qué» llega cuando ya pasaron dos horas de comandos. M0 tiene 11 temas en 3 h (16 min por tema). Del total, 14 de 23 módulos están en «Experto» (M9–M22), así que la etapa final no tiene gradación. | El estudiante no ve el propósito al empezar. El nivel no orienta. | Abrir con cultura y flujo de valor. Repartir M0 en dos módulos (Linux y redes/NGINX). Graduar M9–M14 como Integración. |
| D8 | Carga | Hay módulos con 90–160 min por tema: M13 160 (8 h para 3 temas), M15 120, M17 120, M21–M22 105 (complementa devops-kotlin.md M10). La suma de 106,5 h no corresponde al texto (141.379 palabras ≈ 16 h de lectura más práctica). | Planificación imposible. | Recalcular con la misma fórmula de C13. |
| D9 | Vigencia | **Ingress-NGINX** se retiró en marzo de 2026: sin versiones ni parches de seguridad. M7 lo advierte (`modulo-7.md:122`), pero M6 T8 lo usa como camino principal (`minikube addons enable ingress`, `kubectl get pods -n ingress-nginx`, `ingressClassName: nginx`, `modulo-6.md:666-683`) y M7 T2 enseña una anotación propia de nginx (`modulo-7.md:152`). | Se enseña un controlador sin mantenimiento. | Enseñar primero Gateway API (HTTPRoute) con un controlador mantenido y dejar Ingress como API heredada. |
| D10 | Vigencia | M10 usa `grafana/loki:3.1.0` (`modulo-10.md:225`); la versión actual de la documentación es la 3.7.x. Promtail aparece como agente (`:221`, `:377`, `:388-389`), pero llegó a EOL el 02-03-2026 y su reemplazo es Grafana Alloy. | Agente sin soporte. | Usar Alloy y fijar Loki 3.7. |
| D11 | Vigencia | M11 usa `hashicorp/vault:1.17` (`modulo-11.md:238`), sin mantenimiento desde el 09-10-2024. La línea actual es la 2.2. | Imagen sin parches. | Fijar la versión soportada vigente y añadir una nota de revisión con fecha. |
| D12 | Vigencia | En M22, `required_version = ">= 1.6"` y `hashicorp/aws ~> 5.0` (`modulo-22.md:619-623`). El proveedor 6.0 es GA desde el 18-06-2025 y cambia el modelo de región. M8 T9 pide «Terraform 1.5 o superior» (`modulo-8.md:719`). | Al subir de versión, el estudiante encuentra cambios incompatibles que nadie le explicó. | Usar `~> 6.0` y un tema corto «Actualizar un proveedor mayor». |
| D13 | Vigencia | M15 T3 exige «Helm 3 instalado» (`modulo-15.md:151`). Helm 4 salió en noviembre de 2025. Helm 3 dejó de recibir correcciones de errores el 09-09-2026 y solo recibe parches de seguridad hasta el 10-02-2027. M14 toma como referencia «Kubernetes 1.36 — julio de 2026» (`modulo-14.md:438-442`), pero la versión actual es la 1.37 (26-08-2026) y la 1.34 ya salió de soporte. | Desfase de herramientas. | Usar Helm 4 y una sola tabla de versiones con fecha de revisión por curso. |
| D14 | Exactitud de práctica | M8 T5 presenta los workspaces de la CLI como la forma de separar entornos (`modulo-8.md:363-446`). HashiCorp advierte que no sirven para aislar despliegues que necesitan credenciales y controles de acceso distintos. | Lleva a un antipatrón en producción. | Añadir ese límite y la alternativa: directorios o backends separados por entorno. |
| D15 | Experiencia | Para DevOps el glosario tiene 4 términos (`technical-glossary.ts:67`). M0 introduce 62 siglas. Se usan dos herramientas de clúster local, kind y minikube, sin explicar por qué (M6, M7, M13). Hay cuatro carpetas raíz de proyecto (complementa devops-kotlin.md M14). | Carga cognitiva alta en la entrada. | Elegir una sola herramienta de clúster. Glosario de unos 30 términos. |

### 2.2 Qué parte de DevOps debe pasar a los cursos nuevos (para aprobación)

| Destino | Origen en DevOps (y en Cloud) | Qué falta añadir al moverlo |
|---|---|---|
| **Curso Docker** | M2 completo (9 temas), M3 completo (4), M15 T1, M11 T1 (escaneo de imágenes), **Cloud M1 completo** y la parte de imágenes de Cloud M14 T4 | BuildKit/buildx multiplataforma, Compose Watch, registros OCI, firma con cosign (hoy en DevOps M14 T3) |
| **Curso Kubernetes** | M6 completo (10 temas), M7 completo (8), M15 T2–T3, M12 T5 y M15 T4 (GitOps), **Cloud M14 T3 (EKS) y M33 T2** | Gateway API, Kustomize, kubeadm/etcd/actualizaciones, troubleshooting (30 % del CKA), init containers y multicontenedor, PDB/VPA, CRD/operators, deprecaciones de API, `kubectl debug` (D2, D3) |
| **Curso Diseño de sistemas** | M17 completo, Cloud M32 T5 (Well-Architected) | — |
| **Microservicios** (spec 013 lo completa) | M19, M20 y M21: ADR, DDD, outbox, sagas e idempotencia, que ya están en parte en `microservices/modulo-1.md:929` (ADR), `:1002` (DDD) y `microservices/modulo-0.md:640` (idempotencia) | Fusionar sin repetir |
| **Fundamentos** o un anexo Linux | M0 T1–T5 y T10–T11 (Linux base) | — |
| **Cloud** | M22 (laboratorio con Floci) y M12 T1–T3 (paso a nube real, secretos e IaC multinube), que repiten Cloud M34 T1 (`cloud/modulo-34.md:19`) y T11 (`:702`) | — |

**Qué queda en DevOps:** cultura y flujo de valor; Git y estrategia de ramas; CI (M4) y CD (M5) con lo de D4; IaC con Terraform/OpenTofu y Ansible (M8); observabilidad y logging (M9, M10); DevSecOps y cadena de suministro (M11 + M14 T3); SRE e incidentes (M14); pruebas automatizadas en el pipeline (M16, recortado); VPS propio (M18); integrador (M13) como capstone final. Son unos 12 módulos y unas 55–65 h reales.

### 2.3 Cambios de temario propuestos para aprobación (DevOps), por prioridad

1. Aprobar el reparto de §2.2 y eliminar M15 (D1, D6).
2. Actualizar lo vencido: Gateway API en lugar de Ingress-NGINX, Alloy en lugar de Promtail, Vault, Loki, proveedor AWS 6, Helm 4 y una tabla de versiones fechada (D9–D13).
3. Temas nuevos de entrega: versionado y publicación de artefactos; workflows reutilizables, entornos y aprobaciones; Dependabot/CodeQL (D4).
4. Reordenar M0 (cultura primero) y graduar los niveles (D7). Recalcular las horas (D8).
5. Corregir las fichas de M13 y M15 (D5) y el límite de los workspaces (D14).

---

## 3. Solapamientos entre Cloud y DevOps

| Tema | Cloud | DevOps | Dónde debería vivir |
|---|---|---|---|
| Docker básico/imágenes | M1 (5 temas) | M2, M3, M15 T1 | Curso Docker |
| Kubernetes/EKS/mesh | M14 T3, M33 T2 | M6, M7, M15 T2–T3 | Curso Kubernetes (Cloud solo «EKS/AKS/GKE: qué gestiona el proveedor») |
| IaC (Terraform/CDK) | M15 T3, M33 T1 | M8, M12 T3, M22 T4 | DevOps (Cloud: CloudFormation/SAM/CDK) |
| CI/CD y blue/green | M24, M31 T2, M33 T1 | M4, M5 | DevOps la práctica general. Cloud solo CodeBuild/CodeDeploy/CodePipeline |
| Observabilidad/correlation ID | M12, M33 T4 | M9, M10 T4, M21 T4 | DevOps la teoría y OTel. Cloud: CloudWatch/ADOT |
| Secretos | M10 | M11 T3, M12 T2 | Cloud los servicios gestionados. DevOps Vault/SOPS |
| FinOps | M29, M33 T5 | M12 T7 | Cloud |
| Backup y restauración | M25 T4–T6, M32 T4 | M18 T4 | Cloud (gestionado) y DevOps (VPS con restic), con referencia cruzada |
| Borde, CDN, WAF, rate limit | M22 T5–T6 | M0 T7, M17 T1, M18 T2 | Diseño de sistemas la teoría. Cloud la implementación |
| Cadena de suministro de imágenes | M14 T4 | M11 T1/T5, M14 T3 | Docker + DevSecOps |
| Floci desde cero | M0 T4–T6, M34 T1–T2 | M22 T1 | Cloud |
| Paso a nube real | M31 T3, M34 T11 | M12 T1 | Cloud |

---

## 4. Control 1

**Programa de referencia.**
- Syllabus de **Control I (7303), Ingeniería en Control y Automatización, Facultad Tecnológica UD** (versión 2026-07): 3 créditos, 9 h/semana (2 directas, 2 de cómputo o laboratorio, 5 autónomas) y 7 unidades en 15 semanas. Sus unidades son: 1) Modelado (2 sem); 2) Fundamentos de control, ISA-5.1 (3); 3) Acciones ON-OFF, P, PI, PD, PID y Ziegler-Nichols (2); 4) Lugar de las raíces (2); 5) Frecuencia: Bode, **Nyquist**, márgenes, **atraso/adelanto/atraso-adelanto**, sensibilidad (2); 6) **Espacio de estados: controlabilidad, observabilidad, ubicación de polos, observadores** (2); 7) **Métodos algebraicos: igualación de modelos, compensadores de dos parámetros** (2). Bibliografía: Ogata, Kuo, Dorf, Smith & Corripio, Chen.
- Contraste: syllabus de **Control** de Ingeniería Eléctrica UD (2 créditos, 96 h). Añade discretos, Nyquist, estado y una introducción a control óptimo.

### 4.1 Tabla de hallazgos

| # | Aspecto | Hallazgo (cita) | Impacto | Propuesta |
|---|---|---|---|---|
| K1 | Cobertura | Faltan temas que exige el programa UD 7303: **Nyquist** (0 apariciones), **controlabilidad/observabilidad, ubicación de polos y observadores** (M10 solo «De estados a G(s)», `modulo-10.md:144`), **compensadores en frecuencia y atraso-adelanto** (0), **método algebraico/igualación de modelos** (0), **ON-OFF** (0), **sensibilidad/robustez** (0) e **ISA-5.1** (0). | Faltan por completo 2 de 7 unidades (6 y 7) y la mitad de la 5. | Módulos nuevos (ver §4.2). |
| K2 | Coherencia promesa/contenido | M0 afirma que «los módulos 9, 10, 19 y 20 … van más allá de lo que suele preguntarse en los primeros parciales, pero te preparan para Control 2» (`control-1/modulo-0.md:102`), y el track los marca «Experto» (`control-1.track.ts:111, 122, 221, 232`). En el programa UD 7303, frecuencia y espacio de estados son las unidades 5 y 6 de **Control I**. | El estudiante deja para después lo que entra en el examen final. | Reetiquetar como núcleo y quitar la frase. |
| K3 | Progresión | M19 (compensadores) va antes que M20 (Bode), y los compensadores se diseñan solo con el lugar de las raíces (`modulo-19.md:3`). El programa pide diseñarlos también en frecuencia. Los niveles del track no avanzan en orden: M9–M10 «Experto» van antes de M11 «Aplicación», y M13 «Integración» antes de M14 «Aplicación». | El diseño por márgenes de fase queda imposible, y el mapa de etapas engaña. | Orden: …M18 PID → M19 Bode y márgenes → M20 Nyquist → M21 compensación en frecuencia → M22 espacio de estados con diseño → M23 método algebraico → parciales. |
| K4 | Carga | El curso suma 50,5 h. El curso real son unas 135 h (9 h × 15 semanas). M4 tiene 1 tema y declara 2 h (`modulo-4.md:13`). M21 (parciales) tiene 1 tema y 3 h. M13 son 20 min por tema y M14 60. | Las horas no corresponden ni al texto ni al curso real. | Recalcular por tema y declarar la cobertura frente al syllabus. |
| K5 | Cobertura de evaluación | Solo hay Parcial 1 y Parcial 2 (`modulo-21.md:90`). No hay simulacro del examen final (30 %) ni de los proyectos de grupo (30 % en el syllabus 2023). | No prepara el corte final. | Simulacro final con frecuencia y estado, y un proyecto guiado (p. ej., el tanque de `examples/control-1-tanque`). |
| K6 | Herramientas | El syllabus pide MATLAB/Simulink o Python para simular. El curso usa SymPy/SciPy solo para verificar cuentas (`modulo-0.md:74-95`). No usa `python-control`, que trae lugar de las raíces, Bode, Nyquist, respuestas temporales, ubicación de polos y alcanzabilidad/observabilidad. | No se practica la simulación de lazo cerrado que piden las unidades 1, 3 y 6. | Añadir `python-control` al laboratorio de M0 y un bloque «Simúlalo» por módulo de diseño. |
| K7 | Recursos externos | Los 82 enlaces externos son a Control Tutorials (UMich, 69) y MIT OCW (13). No hay ninguna referencia a Ogata, Kuo, Dorf ni Nise (0 apariciones), aunque son la bibliografía oficial. Control 1 no tiene entrada en `official-learning-paths.ts` ni en el glosario técnico. | El estudiante no puede contrastar con su texto guía. | Por módulo, «Lee en Ogata cap. X / Kuo cap. Y» (sin copiar), la entrada de ruta oficial (syllabus UD) y un glosario de unos 25 términos. |
| K8 | Solapamiento | M1–M10 (complejos, Laplace, Mason, modelado, linealización, estado) corresponden a **Sistemas Dinámicos**, el curso previo de la carrera (sus unidades 1–9 incluyen Mason, Bode, Routh y variables de estado). | Unas 21 h de repaso declaradas como parte del curso. | Agruparlos en una etapa «Repaso de Sistemas Dinámicos» opcional, con una prueba diagnóstica para saltarla. |
| K9 | Experiencia | El primer módulo propone un «Plan de dos semanas» (`modulo-0.md:9`, `:143`), atado a una fecha de examen. | El curso envejece con ese plan. | Plan genérico por semanas del semestre (1–16), alineado con las unidades del syllabus. |

### 4.2 Cambios de temario propuestos para aprobación (Control 1), por prioridad

1. **Módulo nuevo «Criterio de Nyquist y respuesta en frecuencia de lazo cerrado»** (unidad 5). Prerrequisito: Bode.
2. **Módulo nuevo «Compensación en frecuencia»:** adelanto, atraso y atraso-adelanto por margen de fase, y sensibilidad (unidad 5).
3. **Ampliar M10 a «Espacio de estados: análisis y diseño»:** matriz de transición, formas canónicas, controlabilidad/observabilidad, ubicación de polos (Ackermann) y observador (unidad 6).
4. **Módulo nuevo «Método algebraico»:** igualación de modelos, ubicación de polos por coeficientes y compensador de dos parámetros (unidad 7).
5. **Añadir a M18** el control ON-OFF y las arquitecturas PID (ideal/serie/paralelo), y a M5 la simbología ISA-5.1.
6. **Reordenar** según K3 y reetiquetar niveles (K2). Etapa de repaso opcional (K8).
7. **Simulacro del final y proyecto guiado** (K5). `python-control` en el laboratorio (K6). Referencias a la bibliografía oficial (K7).

---

## 5. Fuentes primarias consultadas (2026-11-18)

- AWS DVA-C02, guía y dominios 3–4: https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02.md · https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02-domain3.md · https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02-domain4.md
- AWS SAA-C03: https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html
- AZ-204 retirado el 31-07-2026, reemplazado por AI-200: https://dev.to/lovelacecoding/bye-az-204-hello-ai-200-what-you-need-to-know-about-the-new-azure-developer-certification-2lo (fuente secundaria). Guía oficial AI-200: https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-200
- AZ-400 (habilidades vigentes desde el 27-07-2026): https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-400
- Google Associate Cloud Engineer: https://cloud.google.com/certification/guides/cloud-engineer/
- CKA (cambios del 18-02-2025): https://training.linuxfoundation.org/certified-kubernetes-administrator-cka-program-changes/
- CKAD (examen sobre K8s v1.37): https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad/
- Versiones de Kubernetes: https://endoflife.date/kubernetes
- Retiro de Ingress-NGINX: https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/
- EOL de Promtail (02-03-2026) y Loki 3.7.x: https://grafana.com/docs/loki/latest/send-data/promtail/
- Versiones de Vault: https://endoflife.date/hashicorp-vault
- Proveedor AWS de Terraform 6.0 GA: https://www.hashicorp.com/blog/terraform-aws-provider-6-0-now-generally-available
- Workspaces de la CLI de Terraform: https://developer.hashicorp.com/terraform/cli/workspaces
- Helm 4 y fin de Helm 3: https://helm.sh/blog/helm-v3-end-of-life
- SDK y daemon de X-Ray en mantenimiento: https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-daemon-timeline.html
- Launch configurations de EC2 Auto Scaling: https://docs.aws.amazon.com/autoscaling/latest/userguide/LaunchConfiguration.html
- Claude en Bedrock (API Messages, Converse): https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-messages.html
- Syllabus UD Ing. en Control y Automatización (2026-07): https://ftecnologica.udistrital.edu.co/ingcontrol/sites/ing-control/files/syllabus/2026-07/Syllabus%20Ingenier%C3%ADa%20en%20Control%20y%20Automatizaci%C3%B3n.pdf
- Contenidos programáticos UD Ing. Control (2023): https://ftecnologica.udistrital.edu.co/ingcontrol/sites/ing-control/files/syllabus/2023-11/Contenidos%20program%C3%A1ticos%20Ing_Control.pdf
- Syllabus UD «Control», Ingeniería Eléctrica: https://aulasvirtuales.udistrital.edu.co/pluginfile.php/282039/mod_resource/content/1/234%20-Control.pdf
- python-control: https://python-control.readthedocs.io/en/latest/

**Límites.**
- No se ejecutó código.
- La fecha de retiro de AZ-204 viene de una fuente secundaria, y la guía AI-200 de Microsoft Learn la respalda indirectamente.
- La fecha exacta de marzo de 2026 para Ingress-NGINX no aparece en el extracto del blog oficial.
- Las horas reales se estimaron con una fórmula de lectura más práctica, no con estudiantes.
