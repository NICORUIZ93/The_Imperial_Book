# Plan curricular verificable: Docker y Kubernetes, de cero a experto

Estado: diseño completo para implementación progresiva. **Todavía no es un track
publicado ni una declaración de cobertura.** Cada módulo se convierte en contenido
real sólo al cumplir el prompt maestro tema por tema.

## Propósito

El curso enseña qué aísla realmente un contenedor, cómo se construye y distribuye
una imagen OCI y cómo Kubernetes declara, programa, conecta, protege y opera cargas
en un clúster. No comienza memorizando `docker run` o YAML; primero establece
procesos, sistema de archivos, red, permisos y recursos.

**Proyecto progresivo:** desplegar RutaFlow como aplicación web, worker y base de
datos. Primero se ejecuta sin contenedores, luego con Docker/Compose y finalmente
en clúster local y clúster de producción simulado, con seguridad, observabilidad,
GitOps, rollback y recuperación comprobados.

## Bloque I · Fundamentos de contenedores y Docker

### Módulo 0 · Linux necesario para comprender contenedores

- proceso, PID, señal, usuario, grupo y capacidades;
- sistema de archivos, mount, permisos, enlaces e inode;
- namespace de PID, mount, red, usuario, IPC y UTS;
- cgroups v2: CPU, memoria, PIDs e I/O;
- syscall, kernel compartido y diferencia frente a VM;
- evidencia: aislar y limitar un proceso sin Docker antes de usar el motor.

### Módulo 1 · Arquitectura Docker y primer contenedor

- CLI, daemon, API, containerd, shim y runtime OCI;
- imagen, contenedor, capa, snapshot y writable layer;
- ciclo create/start/stop/kill/remove;
- foreground, detached, stdin, TTY y código de salida;
- señales, PID 1 y graceful shutdown;
- evidencia: ejecutar, inspeccionar, detener y diagnosticar un proceso real.

### Módulo 2 · Imágenes OCI y Dockerfile desde cero

- build context, `.dockerignore` y riesgo de enviar secretos;
- `FROM`, `RUN`, `COPY`, `WORKDIR`, `USER`, `ENV`, `ARG`;
- `CMD` frente a `ENTRYPOINT`, formas shell y exec;
- capas, content-addressability, digest y metadata;
- caché de build, invalidación y BuildKit;
- evidencia: construir, inspeccionar historial y explicar cada capa.

### Módulo 3 · Builds profesionales y reproducibles

- multi-stage build y artefactos mínimos;
- cache mounts, bind mounts y secretos de BuildKit;
- pin por digest y actualización controlada;
- Alpine, slim, distroless y `scratch` con trade-offs;
- builds multi-arquitectura con buildx;
- reproducibilidad, timestamps, SBOM y provenance;
- evidencia: comparar tamaño, CVE, tiempo y compatibilidad.

### Módulo 4 · Almacenamiento y persistencia en Docker

- writable layer y copy-on-write;
- volume, bind mount y tmpfs;
- ownership, UID/GID y rootless;
- consistencia en macOS/Windows/Linux;
- backup, restore y verificación de datos;
- bases de datos en contenedores y límites operativos;
- evidencia: destruir contenedor, conservar volumen y restaurar en limpio.

### Módulo 5 · Redes Docker en profundidad

- network namespace, veth, bridge, routing y NAT;
- bridge por defecto frente a red definida por usuario;
- DNS interno y descubrimiento por nombre;
- publicar puerto frente a exponerlo;
- host, none, overlay y macvlan;
- IPv4/IPv6, firewall y diagnóstico con herramientas de red;
- evidencia: trazar paquete cliente→host→contenedor y reproducir un puerto cerrado.

### Módulo 6 · Docker Compose como entorno reproducible

- proyecto, servicio, contenedor, red y volumen;
- `compose.yaml`, merge, include, perfiles y overrides;
- variables, interpolación, `env_file` y secretos;
- `depends_on`, healthcheck y por qué orden no garantiza disponibilidad;
- escalado local, logs y comandos one-off;
- Watch, desarrollo y diferencias frente a producción;
- evidencia: app/worker/DB con health y fallo de dependencia reproducido.

### Módulo 7 · Registros y distribución de imágenes

- repositorio, tag, manifest, index y digest;
- push/pull, autenticación y credenciales;
- Docker Hub, Harbor y registros cloud;
- immutability, retención, garbage collection y mirrors;
- firma con Sigstore/Cosign y verificación de provenance;
- evidencia: promover por digest y rechazar artefacto no firmado.

### Módulo 8 · Seguridad y operación Docker

- root dentro/fuera del contenedor y user namespaces;
- capabilities, seccomp, AppArmor/SELinux y read-only filesystem;
- secretos, socket Docker y superficies de escape;
- escaneo de imagen, CVE, falsos positivos y remediación;
- logs, stats, events, inspect y diagnóstico de OOM;
- rootless Docker y Docker Desktop/Engine;
- evidencia: endurecer una imagen y demostrar qué acción queda bloqueada.

## Bloque II · De Docker a Kubernetes

### Módulo 9 · Por qué orquestar y cuándo no hacerlo

- límites de Compose y necesidad de reconciliación;
- desired state, control loop y convergencia;
- scheduler, alta disponibilidad y self-healing;
- costo operacional de Kubernetes;
- alternativas: Compose, systemd, Nomad, ECS/Container Apps/Cloud Run;
- evidencia: decisión argumentada, incluida la opción de no usar Kubernetes.

### Módulo 10 · Arquitectura de Kubernetes y clúster local

- API server, etcd, scheduler y controller manager;
- kubelet, runtime CRI, kube-proxy y CNI;
- objeto, spec, status, metadata, UID y resourceVersion;
- declarativo, watch y reconciliación;
- kind, minikube y k3d: criterios y límites;
- kubeconfig, contextos y namespaces;
- evidencia: crear clúster, seguir eventos y ubicar cada componente.

### Módulo 11 · Pods y ciclo de vida

- Pod como unidad de scheduling, no como VM;
- contenedores de aplicación, init y sidecar;
- red y volúmenes compartidos dentro del Pod;
- phases, conditions, restart policy y termination;
- requests/limits, QoS y OOMKilled;
- liveness, readiness, startup probes y errores de diseño;
- evidencia: fallo de probe, terminación graceful y OOM diagnosticado.

### Módulo 12 · Controllers y despliegues

- ReplicaSet y Deployment;
- rollout, revision, RollingUpdate y Recreate;
- maxSurge, maxUnavailable y disponibilidad real;
- DaemonSet, StatefulSet, Job y CronJob;
- ownerReferences, garbage collection y finalizers;
- PodDisruptionBudget;
- evidencia: rollout fallido, pause/resume y rollback verificado.

### Módulo 13 · Services, DNS e ingreso de tráfico

- ClusterIP, headless, NodePort, LoadBalancer y ExternalName;
- selector, EndpointSlice y readiness;
- CoreDNS y nombres dentro del clúster;
- kube-proxy/IPVS/eBPF como implementaciones, no contrato de Service;
- Ingress, Gateway API y controller;
- TLS termination, SNI y certificados;
- evidencia: trazar cliente→gateway→service→pod y diagnosticar selector roto.

### Módulo 14 · Configuración, secretos e identidad

- ConfigMap, Secret y límites de codificación base64;
- env frente a volumen proyectado y actualización;
- ServiceAccount y tokens proyectados;
- External Secrets, CSI Secrets Store y rotación;
- cifrado de Secrets en etcd;
- configuración inmutable y rollout;
- evidencia: rotar secreto sin imprimirlo ni almacenarlo en Git.

### Módulo 15 · Persistencia Kubernetes

- volume, PV, PVC y StorageClass;
- provisión estática/dinámica y reclaim policy;
- access modes, volume mode y topology;
- CSI, snapshots, expansion y cloning;
- StatefulSet, identidad estable y headless Service;
- backup/restore y consistencia de aplicación;
- evidencia: perder Pod, conservar datos y restaurar en otro namespace.

### Módulo 16 · Scheduling, recursos y autoscaling

- scheduler filtering/scoring;
- nodeSelector, affinity/anti-affinity y topology spread;
- taints, tolerations y nodos dedicados;
- requests, limits, LimitRange y ResourceQuota;
- HPA, VPA y Cluster Autoscaler;
- CPU throttling, memoria y bin packing;
- evidencia: Pod Pending explicado y distribución corregida sin adivinar.

### Módulo 17 · Seguridad Kubernetes

- autenticación, autorización y admisión;
- RBAC: Role, ClusterRole y bindings;
- Pod Security Standards y securityContext;
- NetworkPolicy ingress/egress y dependencia del CNI;
- admission webhooks y policy engines Kyverno/OPA Gatekeeper;
- supply chain, firma y image policy;
- audit logs, multi-tenancy y aislamiento;
- evidencia: servicio comprometido sin permiso lateral ni acceso a API sensible.

### Módulo 18 · Helm, Kustomize y empaquetado

- YAML, schema y server-side apply;
- Kustomize bases/overlays y patches;
- Helm chart, values, templates y funciones;
- dependencias, hooks, CRD y lifecycle;
- lint, template, diff, test y rollback;
- librería de charts frente a abstracción prematura;
- evidencia: mismo artefacto promovido entre entornos sin copiar manifiestos.

### Módulo 19 · Observabilidad y diagnóstico

- eventos, logs y `kubectl describe`;
- metrics-server, Prometheus y kube-state-metrics;
- logs de nodo, control plane y workload;
- OpenTelemetry y trazas de aplicaciones;
- ephemeral containers, debug y port-forward;
- CrashLoopBackOff, ImagePullBackOff, Pending, DNS y red;
- evidencia: diagnosticar cinco fallos desde síntomas hasta causa.

### Módulo 20 · GitOps y entrega progresiva

- reconciliación GitOps y separación CI/CD;
- Argo CD y Flux;
- drift, sync, health y rollback;
- Sealed Secrets/SOPS sin secretos planos;
- canary y blue/green con Argo Rollouts/Flagger;
- promoción por digest y policy gates;
- evidencia: drift corregido y canary abortado por métrica.

### Módulo 21 · Extensión de Kubernetes

- API discovery y grupos/versiones;
- CRD, custom resource y status subresource;
- controller, informer, work queue y reconciliación idempotente;
- operator pattern y niveles de automatización;
- conversion/defaulting/validation webhooks;
- API aggregation y cuándo no crear un operador;
- evidencia: controller que converge, reintenta y no duplica efectos.

### Módulo 22 · Red avanzada y service mesh

- CNI, NetworkPolicy y dataplane;
- overlay, routing nativo y eBPF;
- ingress/egress gateway y control de salida;
- Istio/Linkerd, sidecar y ambient/sidecarless cuando aplique;
- mTLS, identidad de workload, retries y telemetría;
- costo, latencia, complejidad y criterios para no usar mesh;
- evidencia: mTLS y política demostrados, con overhead medido.

### Módulo 23 · Administración del clúster

- kubeadm y ciclo de certificados;
- etcd snapshot/restore y quorum;
- upgrade de control plane y workers;
- drain, cordon, eviction y mantenimiento;
- version skew y deprecaciones de API;
- capacidad, costos y nodos heterogéneos;
- evidencia: upgrade ensayado y restauración de etcd en laboratorio aislado.

### Módulo 24 · Producción, confiabilidad y desastre

- SLI/SLO del clúster y de workloads;
- alta disponibilidad y dominios de fallo;
- backup de estado y recursos declarativos;
- RPO, RTO y runbooks;
- caos controlado: nodo, zona, red, DNS y almacenamiento;
- incidente, comunicación y postmortem;
- evidencia: simulacro de desastre cronometrado con datos restaurados.

### Módulo 25 · Proyecto profesional RutaFlow

- imagen reproducible, firmada, escaneada y multi-arquitectura;
- Compose local con dependencias saludables;
- clúster con namespaces, cuotas, RBAC y NetworkPolicy;
- Gateway API/TLS, almacenamiento, autoscaling y PDB;
- observabilidad, alertas y trazas;
- GitOps, despliegue progresivo y rollback;
- upgrade, backup/restore e incidente reproducido;
- defensa final de decisiones y de componentes deliberadamente no usados.

## Contrato de implementación

Los contenidos actuales de DevOps 2, 3, 6, 7 y 15 son fuentes internas para
reclasificación, no prueba de que este curso exista. Cada tema nuevo debe indicar
prerrequisitos, mapa completo, archivos, comandos, salida, fallo, diagnóstico,
práctica, proyecto, fuentes primarias y estado real de ejecución. No se publicarán
25 módulos vacíos para aparentar un curso completo.
