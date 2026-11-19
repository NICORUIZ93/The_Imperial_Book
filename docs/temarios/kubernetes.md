# Temario propuesto · Kubernetes

**Estado:** propuesta para aprobación del dueño. No hay lecciones escritas.
**Fecha de revisión de fuentes:** 2026-11-18.
**Identificador de ruta previsto:** `kubernetes`.

## 1. Público y prerrequisitos

Este curso es para quien ya empaqueta servicios en contenedores y necesita desplegarlos, operarlos y
administrar el clúster donde corren. Cubre los temarios de CKAD y CKA sobre Kubernetes 1.37.

| Prerrequisito | Módulos | Para qué |
|---|---|---|
| Docker | M0–M9 (como mínimo M3, M4, M6 y M7) | Imágenes, redes y datos de contenedores |
| Fundamentos | M3 T1–T2 y M8 T3 | Red, HTTP y Linux observable |
| Spring Boot | M7 (Actuator) | Probes de RutaFlow |

Recomendado: Docker M11, para comparar con Swarm, y DevOps M4–M5 (CI/CD), para el módulo de GitOps.

## 2. Resultado final medible

1. RutaFlow (API Spring Boot, worker y PostgreSQL) desplegado en un clúster kind multinodo con Kustomize, con
   overlays `dev` y `prod`, y un chart de Helm 4 propio.
2. Tráfico de entrada por Gateway API con TLS y un canary 90/10 por pesos, verificado con peticiones.
3. Probes, requests/limits, HPA, PodDisruptionBudget, NetworkPolicy de denegación por defecto y
   ServiceAccount con RBAC mínimo, cada uno con una prueba que demuestra el efecto.
4. Un clúster creado con kubeadm, actualizado una versión menor y con un respaldo de etcd restaurado.
5. Doce incidentes provocados (nodo, plano de control, red, DNS, almacenamiento y aplicación), diagnosticados
   en menos de 10 min cada uno, con su registro.
6. Despliegue continuo con GitOps: un commit en el repositorio de configuración llega al clúster y se revierte.
7. Un simulacro con tareas tipo CKA y CKAD resuelto en el tiempo del examen (unas 2 h).

## 3. Versiones de referencia

| Herramienta | Versión | Fuente y fecha |
|---|---|---|
| Kubernetes | 1.37. Última versión de parche: 1.37.1. Fin de soporte: 2027-10-28 | `docs/VERSIONES.md`; [kubernetes.io/releases](https://kubernetes.io/releases/), 2026-11-18 |
| Exámenes | CKAD y CKA sobre v1.37 | [CKAD (Linux Foundation)](https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad/); [cncf/curriculum](https://github.com/cncf/curriculum) (`CKA_Curriculum_v1.37.pdf`, `CKAD_Curriculum_v1.37.pdf`) |
| kind | v0.33.0, imagen de nodo `kindest/node:v1.37.0` | [kind releases](https://github.com/kubernetes-sigs/kind/releases) |
| Helm | 4.x. Helm 3 solo recibe parches de seguridad hasta el 2027-02-10 | [Helm: fin de Helm 3](https://helm.sh/blog/helm-v3-end-of-life) |
| Gateway API | v1.6.2 (estable más reciente) | [gateway-api releases](https://github.com/kubernetes-sigs/gateway-api/releases) |
| Docker Engine | 29.x | `docs/VERSIONES.md` |

Retirado y no enseñado como camino principal: **Ingress-NGINX**. Kubernetes anunció que, desde marzo de 2026,
no tiene nuevas versiones ni parches de seguridad
([blog de Kubernetes](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/)). `docs/VERSIONES.md`
ya lo lista como retirado. La API Ingress se enseña como heredada, porque el CKA y el CKAD todavía la piden,
con un controlador mantenido.

## 4. Qué se incorpora desde otros cursos (reparto aprobado en specs/016)

| Origen | Contenido | Destino | Tratamiento |
|---|---|---|---|
| DevOps M6 T1 | Pod, ReplicaSet y Deployment | M1 T1–T2 | — |
| DevOps M6 T2 | Service ClusterIP, NodePort y LoadBalancer | M4 T2 | — |
| DevOps M6 T3 | ConfigMaps y Secrets | M2 T1 | — |
| DevOps M6 T4 | kubectl esencial | M0 T3–T4 | — |
| DevOps M6 T5 | Namespaces | M0 T5 | — |
| DevOps M6 T6 | StatefulSets, DaemonSets, Jobs y CronJobs | M1 T5 y M6 T4 | — |
| DevOps M6 T7 | PV, PVC y StorageClass | M6 T2–T3 | — |
| DevOps M6 T8 | Minikube, addons e Ingress | M0 T2 y M5 | Se cambia Minikube por kind (una sola herramienta, hallazgo D15) e Ingress-NGINX por Gateway API |
| DevOps M6 T9 | Arquitectura: plano de control y reconciliación | M0 T1 | — |
| DevOps M6 T10 | Requests, limits, afinidad, taints y tolerations | M2 T2 y M8 T3 | — |
| DevOps M7 T1 | Helm charts y values | M7 T2–T3 | Se actualiza a Helm 4 |
| DevOps M7 T2 | Ingress controllers | M5 T5 | Queda como API heredada |
| DevOps M7 T3 | HorizontalPodAutoscaler | M8 T1 | — |
| DevOps M7 T4 | Probes de liveness y readiness | M3 T1 | Se añade startup |
| DevOps M7 T5 | RBAC | M9 T1 | — |
| DevOps M7 T6 | Service mesh: Istio, Linkerd, Envoy y mTLS | M13 T3 | — |
| DevOps M7 T7 | Recreate y RollingUpdate | M1 T3 | — |
| DevOps M7 T8 | NetworkPolicy y Pod Security Admission | M4 T4 y M2 T5 | — |
| DevOps M15 T2 | Kubernetes extensible y Helm avanzado | M10 y M7 | — |
| DevOps M15 T3 | Service mesh con Istio o Linkerd | M13 T3 | Se fusiona con M7 T6 en un solo tema |
| DevOps M15 T4 | GitOps con Argo CD y Flux | M13 T1–T2 | DevOps M12 T5 (GitOps) se fusiona aquí, sin duplicar |
| Cloud M14 T3 | Contenedores frente a Lambda, y EKS | M14 | Cloud conserva la comparación con Lambda y enlaza aquí para EKS |

Estos temas no se mueven; se enlazan: Spring Boot M19 T3 (health checks para Kubernetes), desde M3 T1, y
Microservicios M9 (despliegue y descubrimiento), que remite a este curso para la implementación.

## 5. Módulos

### M0 · Arquitectura y primer clúster
**Objetivo:** crear un clúster local y explicar cómo converge al estado deseado.
**Origen:** DevOps M6 T4, T5, T8 y T9.
- T1 · Plano de control, nodos y bucle de reconciliación · 40 min
- T2 · kind: clúster multinodo, kubeconfig y contextos · 35 min
- T3 · kubectl: `get`, `describe`, `explain` y salidas `-o yaml` y `jsonpath` · 40 min
- T4 · Manifiestos declarativos: `apply`, `diff`, `--dry-run=server` y generación imperativa para el examen · 40 min
- T5 · Namespaces, etiquetas y selectores · 35 min

**Hito RutaFlow:** clúster kind de tres nodos con el namespace `rutaflow`.
**Duración:** 3 h 10 min

### M1 · Cargas de trabajo
**Objetivo:** elegir el recurso de carga correcto y desplegar sin cortes.
**Origen:** DevOps M6 T1, M6 T6 y M7 T7.
- T1 · Pod: ciclo de vida, fases y `restartPolicy` · 40 min
- T2 · Deployment y ReplicaSet: rollout, historial y rollback · 45 min
- T3 · Estrategias Recreate y RollingUpdate: `maxSurge` y `maxUnavailable` · 35 min
- T4 · Pods multicontenedor: init containers y sidecars (CKAD «Application Design and Build») · 45 min
- T5 · Jobs, CronJobs y DaemonSets · 40 min

**Hito RutaFlow:** API como Deployment, migración de esquema como init container y liquidación nocturna como CronJob.
**Duración:** 3 h 25 min

### M2 · Configuración, recursos y seguridad de la aplicación
**Objetivo:** cubrir el dominio de CKAD de mayor peso (25 %).
**Origen:** DevOps M6 T3, M6 T10 y M7 T8.
- T1 · ConfigMap y Secret como variables de entorno y como volumen · 40 min
- T2 · Requests, limits y clases QoS; LimitRange y ResourceQuota · 45 min
- T3 · SecurityContext: usuario no root, capacidades y `readOnlyRootFilesystem` · 40 min
- T4 · ServiceAccount y token proyectado · 35 min
- T5 · Pod Security Admission: niveles `baseline` y `restricted` · 35 min

**Hito RutaFlow:** RutaFlow pasa el nivel `restricted` en su namespace.
**Duración:** 3 h 15 min

### M3 · Salud, observación y depuración de aplicaciones
**Objetivo:** cubrir «Application Observability and Maintenance» (CKAD, 15 %).
**Origen:** DevOps M7 T4.
- T1 · Probes liveness, readiness y startup con Actuator (enlaza Spring Boot M19 T3) · 45 min
- T2 · Logs de contenedores y `kubectl top` con metrics-server · 35 min
- T3 · `kubectl debug` y contenedores efímeros · 40 min
- T4 · Deprecaciones de API: guía de migración y `kubectl convert` · 35 min
- T5 · Eventos y estados: CrashLoopBackOff, ImagePullBackOff y Pending · 45 min

**Hito RutaFlow:** tres fallos de aplicación provocados y diagnosticados.
**Duración:** 3 h 20 min

### M4 · Red: Services, DNS y políticas
**Objetivo:** conectar servicios y limitar quién habla con quién.
**Origen:** DevOps M6 T2 y M7 T8.
- T1 · Modelo de red de Kubernetes y conectividad entre Pods · 35 min
- T2 · Service ClusterIP, NodePort y LoadBalancer; EndpointSlices · 45 min
- T3 · CoreDNS y descubrimiento por nombre · 35 min
- T4 · NetworkPolicy: denegación por defecto y excepciones · 45 min
- T5 · Diagnóstico: un Service sin endpoints · 40 min

**Hito RutaFlow:** PostgreSQL solo acepta tráfico de la API y del worker.
**Duración:** 3 h 20 min

### M5 · Tráfico de entrada con Gateway API
**Objetivo:** exponer RutaFlow con la API recomendada y conocer la heredada.
**Origen:** DevOps M6 T8 y M7 T2, rehechos.
- T1 · De Ingress a Gateway API: roles y el retiro de Ingress-NGINX · 35 min
- T2 · GatewayClass, Gateway y HTTPRoute con un controlador conforme · 45 min
- T3 · División por pesos: canary y blue/green (CKAD «Application Deployment») · 40 min
- T4 · TLS en el Gateway y referencias entre namespaces · 40 min
- T5 · Recurso Ingress con un controlador mantenido (lo piden CKA y CKAD) · 35 min

**Hito RutaFlow:** `api.rutaflow.local` con TLS y un canary de la versión 2.
**Duración:** 3 h 15 min

### M6 · Almacenamiento
**Objetivo:** cubrir «Storage» (CKA, 10 %) y dar estado a PostgreSQL.
**Origen:** DevOps M6 T6 y T7.
- T1 · Volúmenes efímeros: `emptyDir` y proyectados · 35 min
- T2 · PersistentVolume y PersistentVolumeClaim: modos de acceso y política de recuperación · 45 min
- T3 · StorageClass, aprovisionamiento dinámico y CSI · 40 min
- T4 · StatefulSet para PostgreSQL: identidad estable y volumen por réplica · 45 min

**Hito RutaFlow:** PostgreSQL sobrevive al borrado de su Pod sin perder datos.
**Duración:** 2 h 45 min

### M7 · Empaquetado: Kustomize y Helm 4
**Objetivo:** desplegar el mismo sistema en varios entornos sin copiar YAML.
**Origen:** DevOps M7 T1 y M15 T2.
- T1 · Kustomize: base, overlays y parches · 45 min
- T2 · Helm 4: instalar un chart existente, values, upgrade y rollback · 45 min
- T3 · Crear el chart de RutaFlow · 45 min
- T4 · Cuándo Helm y cuándo Kustomize; migrar un uso de Helm 3 · 35 min

**Hito RutaFlow:** overlays `dev` y `prod`, y chart publicado.
**Duración:** 2 h 50 min

### M8 · Escalado y scheduling
**Objetivo:** escalar con datos y ubicar Pods a propósito.
**Origen:** DevOps M7 T3 y M6 T10.
- T1 · HorizontalPodAutoscaler con métricas de CPU · 40 min
- T2 · PodDisruptionBudget y drenado de nodos · 40 min
- T3 · Afinidad, taints y tolerations · 45 min
- T4 · Topology spread constraints y PriorityClass · 35 min

**Hito RutaFlow:** la API escala bajo carga y sobrevive a un `kubectl drain`.
**Duración:** 2 h 40 min

### M9 · Seguridad del clúster
**Objetivo:** controlar quién puede hacer qué y qué entra al clúster.
**Origen:** DevOps M7 T5.
- T1 · RBAC: Role, ClusterRole, bindings y `kubectl auth can-i` · 45 min
- T2 · Autenticación: certificados de usuario y kubeconfig · 40 min
- T3 · Control de admisión: ValidatingAdmissionPolicy con CEL · 40 min
- T4 · Cifrado de Secrets en reposo · 35 min

**Hito RutaFlow:** el usuario `operador` puede reiniciar la API y no puede leer Secrets.
**Duración:** 2 h 40 min

### M10 · Extender Kubernetes
**Objetivo:** cubrir CRD, operadores e interfaces (CKA y CKAD).
**Origen:** DevOps M15 T2.
- T1 · CustomResourceDefinition: esquema y validación · 40 min
- T2 · Patrón operador: instalar uno y leer su reconciliación · 45 min
- T3 · Interfaces CNI, CSI y CRI: qué decide cada una · 35 min

**Hito RutaFlow:** PostgreSQL gestionado por un operador. Se compara con el StatefulSet de M6.
**Duración:** 2 h

### M11 · Administración con kubeadm
**Objetivo:** cubrir «Cluster Architecture, Installation and Configuration» (CKA, 25 %).
**Origen:** nuevo (hallazgo D2 de la auditoría).
- T1 · Preparar nodos: runtime containerd, swap y módulos del kernel · 45 min
- T2 · `kubeadm init` y `join` · 45 min
- T3 · Actualizar una versión menor con `kubeadm upgrade` · 45 min
- T4 · Respaldo y restauración de etcd · 45 min
- T5 · Plano de control de alta disponibilidad: topologías · 35 min

**Hito RutaFlow:** clúster kubeadm actualizado y etcd restaurado.
**Duración:** 3 h 35 min

### M12 · Resolución de problemas
**Objetivo:** cubrir «Troubleshooting» (CKA, 30 %).
**Origen:** nuevo (hallazgo D2).
- T1 · Método: del síntoma al componente · 35 min
- T2 · Nodo NotReady: kubelet, `journalctl` y runtime · 45 min
- T3 · Componentes del plano de control caídos: static Pods y manifiestos · 45 min
- T4 · Red y DNS rotos entre servicios · 45 min
- T5 · Simulacro cronometrado con tareas mixtas de CKA y CKAD · 45 min

**Hito RutaFlow:** el registro de los doce incidentes del apartado 2.
**Duración:** 3 h 35 min

### M13 · GitOps y service mesh
**Objetivo:** desplegar desde Git y decidir con datos si un mesh compensa.
**Origen:** DevOps M15 T3–T4 y M7 T6; DevOps M12 T5 se fusiona.
- T1 · GitOps con Argo CD: sincronización y drift · 45 min
- T2 · Promoción entre entornos con overlays y reversión por commit · 40 min
- T3 · Service mesh: mTLS y tráfico, y cuándo no compensa · 45 min

**Hito RutaFlow:** un commit despliega la versión 2 y otro la revierte.
**Duración:** 2 h 10 min

### M14 · Kubernetes gestionado
**Objetivo:** pasar de kind a un servicio gestionado sabiendo qué cambia.
**Origen:** Cloud M14 T3 (parte EKS).
- T1 · Qué gestiona el proveedor y qué sigue siendo tuyo · 40 min
- T2 · De kind a EKS: LoadBalancer, identidad de Pods y almacenamiento · 40 min
- T3 · Costo y límites de un clúster gestionado · 35 min

**Hito RutaFlow:** queda la lista de cambios de manifiestos para correr RutaFlow en EKS. No se crean recursos de pago.
**Duración:** 1 h 55 min

### M15 · Proyecto integrador
**Objetivo:** reunir las siete evidencias del apartado 2.
- T1 · Hito 1: RutaFlow con Kustomize, Helm y Gateway API (M1–M7) · 45 min
- T2 · Hito 2: endurecimiento y escalado demostrados (M2, M4, M8 y M9) · 45 min
- T3 · Hito 3: clúster kubeadm, actualización y restauración (M11) · 45 min
- T4 · Hito 4: GitOps y simulacro final de 2 h (M12 y M13) · 45 min

Trabajo autónomo del proyecto: 10 h.
**Duración:** 3 h de temas + 10 h de proyecto.

## 6. Proyecto integrador sobre RutaFlow

Parte de la imagen firmada del curso Docker (M13). El sistema es la API Spring Boot, el worker y PostgreSQL de
RutaFlow, con el tracking público expuesto por Gateway API. La rúbrica son las siete evidencias del apartado 2,
cada una con comando, salida y solución plegada.

## 7. Horas estimadas

Fórmula: suma de las duraciones de los temas más las horas de proyecto. Total: **46 h 55 min de temas + 10 h de proyecto = 56 h 55 min (≈ 57 h)**.

## 8. Cobertura frente a fuentes primarias

**CKAD (examen sobre Kubernetes v1.37)**, según la [página de la Linux Foundation](https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad/)
y la [CNCF](https://www.cncf.io/training/certification/ckad/):

| Dominio | Peso | Competencias | Dónde |
|---|---:|---|---|
| Application Design and Build | 20 % | Imágenes; elegir Deployment, DaemonSet o CronJob; multicontenedor (sidecar, init); volúmenes persistentes y efímeros | Docker M3–M4; M1; M6 T1 |
| Application Deployment | 20 % | Blue/green y canary; rolling updates; Helm; Kustomize | M5 T3; M1 T2–T3; M7 |
| Application Observability and Maintenance | 15 % | Deprecaciones de API; probes; CLI de monitoreo; logs; depuración | M3 |
| Application Environment, Configuration and Security | 25 % | CRD y operadores; autenticación, autorización y admisión; requests, limits y quotas; ConfigMaps; Secrets; ServiceAccounts; SecurityContext y capacidades | M10; M9; M2 |
| Services and Networking | 20 % | NetworkPolicies; Services; Ingress | M4; M5 T5 |

**CKA** (cambios vigentes desde el 18-02-2025), según el
[anuncio de la Linux Foundation](https://training.linuxfoundation.org/certified-kubernetes-administrator-cka-program-changes/):

| Dominio | Peso | Dónde |
|---|---:|---|
| Storage | 10 % | M6 |
| Troubleshooting | 30 % | M3, M4 T5 y M12 |
| Workloads and Scheduling | 15 % | M1, M2 T1–T2 y M8 |
| Cluster Architecture, Installation and Configuration | 25 % | M9 T1 (RBAC), M11 (kubeadm, ciclo de vida, HA), M7 (Helm y Kustomize), M10 (CNI, CSI, CRI, CRD y operadores) |
| Services and Networking | 20 % | M4 (conectividad, NetworkPolicy, tipos de Service, CoreDNS) y M5 (Gateway API e Ingress) |

Los huecos que la auditoría encontró en DevOps (D2 y D3) quedan cubiertos así:
- kubeadm y etcd: M11.
- Kustomize: M7 T1.
- CoreDNS: M4 T3.
- CNI, CSI y CRI: M10 T3.
- Gateway API: M5.
- Troubleshooting: M12.
- Init containers y sidecars: M1 T4.
- Deprecaciones de API: M3 T4.
- `kubectl debug`: M3 T3.
- PodDisruptionBudget: M8 T2.
- Control de admisión: M9 T3.
- CRD y operadores: M10.

La auditoría pedía también VPA. Queda fuera porque no está en ninguna de las dos listas de competencias del examen;
se menciona en M8 T1 como alternativa.

## 9. Fuera de alcance, con motivo

- **CKS:** su temario está sobre v1.34 (`CKS_Curriculum v1.34.pdf` en cncf/curriculum). Se deja para un curso
  futuro.
- **Minikube:** se elige una sola herramienta local, kind (hallazgo D15).
- **Ingress-NGINX:** retirado (apartado 3).

## 10. Pendientes de verificar antes de escribir

- El controlador de Gateway API del laboratorio: se elige al escribir M5, entre las implementaciones conformes
  con v1.6, y se ejecuta en kind en el Mac del dueño.
- El entorno de M11 (kubeadm necesita máquinas virtuales, no kind): la herramienta de VM en el Mac del dueño se
  prueba en specs/015 antes de escribir.
- El operador de PostgreSQL de M10 T2: se elige uno mantenido y compatible con 1.37 al escribir.

## Fuentes consultadas (2026-11-18)

- https://kubernetes.io/releases/
- https://kubernetes.io/blog/2026/08/26/kubernetes-v1-37-release/
- https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/
- https://training.linuxfoundation.org/certified-kubernetes-administrator-cka-program-changes/
- https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad/
- https://www.cncf.io/training/certification/ckad/
- https://github.com/cncf/curriculum
- https://github.com/kubernetes-sigs/kind/releases
- https://github.com/kubernetes-sigs/gateway-api/releases
- https://helm.sh/blog/helm-v3-end-of-life
