# Módulo 0: Kubernetes — fundamentos

> **Requisitos de este curso:** [Docker](/curso/docker). Lo que esos cursos enseñan aquí se usa sin volver a explicarlo; si algo no te suena, vuelve a su capítulo antes de seguir.


## Aprende construyendo


### Tema 1: Pod, ReplicaSet, Deployment · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás explicar la jerarquía Deployment → ReplicaSet → Pod y observar cómo un Deployment gestiona un rollout y un rollback entre dos versiones.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── Deployment "mi-api" (gestiona actualizaciones y rollback) ──┐
│  ├── ReplicaSet "mi-api-v1" (0 réplicas, conservado para rollback) │
│  └── ReplicaSet "mi-api-v2" (3 réplicas activas)                     │
│       ├── Pod (mi-api:1.1)  ├── Pod (mi-api:1.1)  └── Pod (mi-api:1.1) │
└─────────────────────────────────────────┘
```

```bash
mkdir -p academia-devops/src/modulo6/deployment && cd academia-devops/src/modulo6/deployment
kind create cluster --name academia-devops
kubectl get nodes
```

Crea el archivo `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mi-api
spec:
  replicas: 3
  selector:
    matchLabels: { app: mi-api }
  template:
    metadata:
      labels: { app: mi-api }
    spec:
      containers:
        - name: mi-api
          image: node:22-alpine
          command: ["node", "-e", "require('http').createServer((q,r)=>r.end('v1')).listen(3000)"]
```

```bash
kubectl apply -f deployment.yaml
```

```bash
kubectl get replicasets
kubectl set image deployment/mi-api mi-api=node:24-alpine
kubectl annotate deployment/mi-api kubernetes.io/change-cause="imagen node:24-alpine"
kubectl rollout status deployment/mi-api
kubectl get replicasets
```

</details>

### Tema 2: Service (ClusterIP, NodePort, LoadBalancer) · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás exponer un Deployment con un Service que enruta tráfico de forma estable hacia Pods efímeros, sin depender de sus direcciones IP internas.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── Service "mi-api" (selector: app=mi-api) ──────┐
│  enruta automáticamente, sin importar qué Pod exista ahora  │
│    Pod A (v1.1)   Pod B (v1.1)   Pod C (v1.2, nuevo)          │
└─────────────────────────────────────────┘
```

```bash
mkdir -p academia-devops/src/modulo6/service && cd academia-devops/src/modulo6/service
```

Crea el archivo `service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mi-api-svc
spec:
  type: ClusterIP
  selector: { app: mi-api }
  ports:
    - port: 80
      targetPort: 3000
```

```bash
kubectl apply -f service.yaml
kubectl get service mi-api-svc
kubectl describe service mi-api-svc | grep Endpoints
```

```bash
kubectl port-forward service/mi-api-svc 8080:80 &
sleep 2
curl -s http://localhost:8080/
kubectl delete pod $(kubectl get pods -l app=mi-api -o jsonpath='{.items[0].metadata.name}')
sleep 3
curl -s http://localhost:8080/
kill %1
```

</details>

### Tema 3: ConfigMaps y Secrets · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás externalizar configuración con ConfigMaps y datos sensibles con Secrets, entendiendo que un Secret nativo de Kubernetes solo está codificado en base64, no cifrado.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── ConfigMap "config-app" ──────┐   ┌── Secret "db-creds" ───────────┐
│ LOG_LEVEL: info                   │   │ password: c2VjcmV0bw==  ← solo base64 │
└─────────────────────────┘   └──────────────────────────┘
                Pod (variables de entorno LOG_LEVEL, password)
```

```bash
mkdir -p academia-devops/src/modulo6/config-secrets && cd academia-devops/src/modulo6/config-secrets
kubectl create configmap config-app --from-literal=LOG_LEVEL=info
kubectl create secret generic db-creds --from-literal=password=secreto123
kubectl get secret db-creds -o jsonpath='{.data.password}'
echo
kubectl get secret db-creds -o jsonpath='{.data.password}' | base64 -d
echo
```

```bash
kubectl run demo-config --image=alpine --restart=Never --command -- sh -c \
  "env | grep -E 'LOG_LEVEL|DB_PASSWORD'; sleep 3" \
  --env="LOG_LEVEL=$(kubectl get configmap config-app -o jsonpath='{.data.LOG_LEVEL}')" \
  --env="DB_PASSWORD=$(kubectl get secret db-creds -o jsonpath='{.data.password}' | base64 -d)"
sleep 4
kubectl logs demo-config
```

</details>

### Tema 4: kubectl esencial · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás diagnosticar el estado de cualquier objeto de un clúster con kubectl get, describe, logs y exec, verificando siempre contra qué contexto operas.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
kubectl get pods                ──▶ vista resumida de todos los Pods
kubectl describe pod <x>        ──▶ detalle completo + eventos recientes
kubectl logs <x>                ──▶ salida estándar/error de ese Pod
kubectl exec -it <x> -- sh      ──▶ shell interactiva dentro de ese Pod
kubectl config current-context  ──▶ confirma contra qué clúster operas
```

```bash
mkdir -p academia-devops/src/modulo6/kubectl-esencial && cd academia-devops/src/modulo6/kubectl-esencial
kubectl config current-context
kubectl run diagnostico --image=alpine --restart=Never -- sh -c "echo arrancando; sleep 60"
kubectl get pods
kubectl logs diagnostico
kubectl exec -it diagnostico -- sh -c "echo 'estoy dentro del contenedor'; hostname"
```

```bash
kubectl run imposible --image=alpine --restart=Never --requests=cpu=1000,memory=1000Gi -- sleep 60
kubectl get pods imposible
kubectl describe pod imposible | grep -A5 Events
kubectl delete pod diagnostico imposible
```

</details>

### Tema 5: Namespaces · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás aislar lógicamente objetos de un mismo clúster en namespaces distintos, evitando colisiones de nombres entre entornos o equipos.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── Clúster físico único ──────────────────┐
│ namespace "desarrollo"  → Deployment "mi-api" (dev)  │
│ namespace "staging"     → Deployment "mi-api" (staging, sin conflicto) │
│ namespace "default"     → lo que crees sin especificar namespace │
└─────────────────────────────────────┘
```

```bash
mkdir -p academia-devops/src/modulo6/namespaces && cd academia-devops/src/modulo6/namespaces
kubectl create namespace desarrollo
kubectl create namespace staging
kubectl run mi-api --image=alpine --restart=Never -n desarrollo -- sh -c "echo soy-desarrollo; sleep 60"
kubectl run mi-api --image=alpine --restart=Never -n staging -- sh -c "echo soy-staging; sleep 60"
kubectl get pods -n desarrollo
kubectl get pods -n staging
```

```bash
kubectl get pods
kubectl config set-context --current --namespace=desarrollo
kubectl get pods
```

</details>

### Tema 6: StatefulSets, DaemonSets, Jobs y CronJobs · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás elegir entre Deployment, StatefulSet, DaemonSet, Job o CronJob según si tu carga de trabajo necesita identidad estable, presencia por nodo, o una tarea con principio y fin.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌ Deployment ┐ ┌ StatefulSet ┐ ┌ DaemonSet ┐ ┌ Job / CronJob ┐
│ sin estado,  │ │ con estado,   │ │ uno por     │ │ tarea que        │
│ intercambiable│ │ identidad     │ │ nodo          │ │ termina (o se     │
│              │ │ estable       │ │               │ │ programa)          │
└──────────┘ └───────────┘ └─────────┘ └──────────────┘
```

```bash
mkdir -p academia-devops/src/modulo6/workloads && cd academia-devops/src/modulo6/workloads
```

Crea el archivo `job.yaml`:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: migracion-datos
spec:
  template:
    spec:
      containers:
        - name: migracion
          image: alpine
          command: ["sh", "-c", "echo 'migrando datos...'; sleep 2; echo 'migracion completa'"]
      restartPolicy: Never
```

Crea el archivo `cronjob.yaml`:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: respaldo-nocturno
spec:
  schedule: "0 3 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: respaldo
              image: alpine
              command: ["sh", "-c", "echo 'respaldo ejecutado'"]
          restartPolicy: Never
```

```bash
kubectl apply -f job.yaml -f cronjob.yaml
kubectl wait --for=condition=complete job/migracion-datos --timeout=30s
kubectl get jobs cronjobs
```

```bash
kubectl get pods -l job-name=migracion-datos
kubectl logs -l job-name=migracion-datos
```

</details>

### Tema 7: Persistent Volumes, PVCs y StorageClasses · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás solicitar almacenamiento persistente para un Pod con un PVC, aprovisionado dinámicamente por una StorageClass, sin acoplar la aplicación a los detalles físicos del almacenamiento.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── StatefulSet "mi-base" (3 réplicas) ────────────────┐
│ mi-base-0 ──▶ PVC "datos-0" ──▶ (StorageClass) ──▶ PV físico 0 │
│ mi-base-1 ──▶ PVC "datos-1" ──▶ (StorageClass) ──▶ PV físico 1 │
│ mi-base-2 ──▶ PVC "datos-2" ──▶ (StorageClass) ──▶ PV físico 2 │
└─────────────────────────────────────────┘
```

```bash
mkdir -p academia-devops/src/modulo6/almacenamiento && cd academia-devops/src/modulo6/almacenamiento
```

Crea el archivo `pvc.yaml`:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: datos-app
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 1Gi
```

```bash
kubectl apply -f pvc.yaml
kubectl get pvc datos-app
```

Crea el archivo `pod-con-volumen.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: escritor
spec:
  containers:
    - name: escritor
      image: alpine
      command: ["sh", "-c", "echo 'dato persistente' > /datos/registro.txt; sleep 3600"]
      volumeMounts:
        - name: almacenamiento
          mountPath: /datos
  volumes:
    - name: almacenamiento
      persistentVolumeClaim:
        claimName: datos-app
```

```bash
kubectl apply -f pod-con-volumen.yaml
kubectl wait --for=condition=Ready pod/escritor --timeout=30s
kubectl exec escritor -- cat /datos/registro.txt
```

```bash
kubectl delete pod escritor
kubectl apply -f pod-con-volumen.yaml
kubectl wait --for=condition=Ready pod/escritor --timeout=30s
kubectl exec escritor -- cat /datos/registro.txt
```

</details>

### Tema 8: Clúster local con Minikube: perfiles, addons e Ingress · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a levantar un clúster con Minikube, activar el addon de Ingress, publicar el Deployment mi-api del Tema 1 por un nombre de host y explicar cuándo conviene Minikube frente a kind. Conocimiento previo: Temas 1, 2 y 4 de este módulo; Docker en ejecución, kubectl y m…

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    DEV["tu máquina (kubectl, navegador)"] -->|"contexto academia"| API["API server del perfil academia"]
    DEV -->|"minikube tunnel"| ING["Ingress controller (addon)"]
    ING --> SVC["Service mi-api"] --> PODS["Pods del Deployment mi-api"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación

```bash
mkdir -p academia-devops/src/modulo6/minikube && cd academia-devops/src/modulo6/minikube
minikube start -p academia --driver=docker --cpus=2 --memory=4096
kubectl config current-context
minikube addons enable ingress -p academia
kubectl get pods -n ingress-nginx
```

```bash
kubectl create deployment mi-api --image=nginx:1.30-alpine --replicas=2
kubectl expose deployment mi-api --port=80
```

Crea el archivo `ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mi-api
spec:
  ingressClassName: nginx
  rules:
    - host: mi-api.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service: { name: mi-api, port: { number: 80 } }
```

```bash
kubectl apply -f ingress.yaml
kubectl get ingress mi-api
```

```bash
curl -s -H "Host: mi-api.local" http://127.0.0.1/ | head -4
```

</details>

### Tema 9: Arquitectura de Kubernetes: plano de control, nodos y el ciclo de reconciliación · Avanzado · 40 min

## Motivación

Escribes `kubectl apply -f api.yaml` y, segundos después, hay tres pods corriendo en máquinas que no elegiste. Si un pod muere, aparece otro sin que hagas nada. Para diagnosticar un pod que no arranca o un Service que no responde, tienes que saber qué componente hace cada parte de ese trabajo.

## Concepto

Un clúster tiene dos zonas:

- **Plano de control (*control plane*):** decide qué debe pasar.
- **Nodos (*workers*):** ejecutan los contenedores.

Todo gira alrededor de una idea: tú declaras el **estado deseado** («quiero 3 réplicas de `api-pedidos`») y unos procesos llamados **controladores** comparan sin parar ese estado con el **estado actual** y actúan para igualarlos. Es el **ciclo de reconciliación**.

**Componentes del plano de control**

| Componente | Qué hace |
|---|---|
| `kube-apiserver` | La única puerta de entrada. `kubectl`, los controladores y los nodos hablan solo con él. Valida, autentica y guarda en etcd. |
| `etcd` | Base de datos clave-valor distribuida con todo el estado del clúster. Si se pierde sin copia, se pierde el clúster. |
| `kube-scheduler` | Elige en qué nodo corre cada pod nuevo según CPU y memoria pedidas, afinidades y *taints*. |
| `kube-controller-manager` | Ejecuta los controladores integrados: Deployment, ReplicaSet, Node, Job, EndpointSlice, etc. |
| `cloud-controller-manager` | Solo en la nube: crea balanceadores para Services `LoadBalancer`, registra nodos y discos del proveedor. |
| *Admission controllers* | Filtros dentro del apiserver que validan o modifican cada objeto antes de guardarlo (cuotas, Pod Security, webhooks). |

**Componentes de cada nodo**

| Componente | Qué hace |
|---|---|
| `kubelet` | Agente del nodo: recibe los pods asignados y pide al runtime que arranque sus contenedores; reporta su estado. |
| *Container runtime* | containerd o CRI-O: descarga imágenes y ejecuta contenedores. |
| `kube-proxy` | Programa las reglas de red (iptables o IPVS) para que la IP de un Service llegue a sus pods. |

**Complementos (*add-ons*) imprescindibles**

| Complemento | Qué hace |
|---|---|
| CoreDNS | Resuelve nombres como `inventario.default.svc.cluster.local` a la IP del Service. |
| CNI (Calico, Cilium, Flannel) | Da IP a cada pod y conecta pods entre nodos. |
| CSI (*Container Storage Interface*) | Drivers que crean y montan discos para los PersistentVolumes. |
| Metrics Server | Recoge CPU y memoria de los pods; lo necesitan `kubectl top` y el HPA. |

## Ejemplo mínimo

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-pedidos
spec:
  replicas: 3
  selector:
    matchLabels: { app: api-pedidos }
  template:
    metadata:
      labels: { app: api-pedidos }
    spec:
      containers:
        - name: api
          image: nginx:1.27
          resources:
            requests: { cpu: 100m, memory: 64Mi }
```

```bash
kubectl get pods -n kube-system        # componentes del plano de control en minikube o kind
kubectl apply -f api-pedidos.yaml
kubectl get events --sort-by=.lastTimestamp | tail -12
```

En los eventos aparece cada componente, en este orden:
1. `ScalingReplicaSet`: el controlador de Deployment crea el ReplicaSet.
2. `SuccessfulCreate`: el controlador de ReplicaSet crea los pods.
3. `Scheduled`: el scheduler les asigna nodo.
4. `Pulling`, `Pulled`, `Created`, `Started`: el kubelet arranca los contenedores.

## Cómo funciona por dentro

```mermaid
sequenceDiagram
  participant U as kubectl
  participant A as kube-apiserver
  participant E as etcd
  participant D as Controlador Deployment
  participant R as Controlador ReplicaSet
  participant S as Scheduler
  participant K as kubelet
  U->>A: apply Deployment (replicas: 3)
  A->>E: guarda el estado deseado
  D->>A: ve el Deployment nuevo → crea ReplicaSet
  R->>A: ve el ReplicaSet con 0 pods → crea 3 pods
  S->>A: ve 3 pods sin nodo → asigna nodos
  K->>A: ve pods asignados a su nodo → arranca contenedores
  K->>A: reporta estado Running
```

Ningún componente llama a otro directamente: todos **observan** el apiserver (*watch*) y escriben en él. Por eso el sistema se autorrepara. Si borras un pod, el controlador de ReplicaSet ve 2 en lugar de 3 y crea otro; no hay un «script» que lo haga, sino un ciclo que nunca termina.

## Reglas y casos límite

- **Un pod en `Pending` es casi siempre un problema del scheduler:** no hay nodo con los recursos pedidos o ninguno tolera sus *taints*. Mira `kubectl describe pod`, sección *Events*.
- **`ImagePullBackOff` es del kubelet y el runtime**, no del plano de control: nombre de imagen mal escrito o registro privado sin credenciales.
- **Un Service sin respuesta suele ser de selectores:** `kubectl get endpointslices -l kubernetes.io/service-name=<servicio>` muestra si tiene pods detrás.
- **En la nube, el plano de control lo gestiona el proveedor** (EKS, AKS, GKE): no ves etcd, pero los mismos conceptos explican cada error.

## Compruébalo

1. Borra uno de los tres pods con `kubectl delete pod`. ¿Qué controlador crea el reemplazo y en qué evento lo ves?
2. Pide `cpu: 64` en `requests` y aplica. ¿En qué estado queda el pod y qué componente lo explica?
3. ¿Qué componente falla si `nslookup inventario` no resuelve desde un pod?

### Tema 10: Scheduling en Kubernetes: requests, limits, afinidad, taints y tolerations · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Usa kind con varios nodos: crea kind-3nodos.yaml con un plano de control y tres workers, y ejecuta kind create cluster --config kind-3nodos.yaml.

#### ► LA ANALOGÍA
**Conceptos clave:** request, limit, clase de QoS, `podAntiAffinity`, `topologyKey`, `topologySpreadConstraints`, taint, toleration, `nodeSelector`.

- **requests:** lo que el pod reserva; el scheduler solo lo pone en nodos con ese espacio libre.
- **limits:** el máximo. Si supera el límite de memoria, el contenedor se mata (`OOMKilled`); si supera el de CPU, se frena.
- **Anti-afinidad** (`podAntiAffinity`) evita poner pods iguales juntos según una `topologyKey` (por ejemplo, el nombre del nodo o la zona).
- **Taint** en un nodo: «aquí no entra nadie, salvo quien tolere esto». **Toleration** en un pod: «yo sí puedo entrar». Se usa para nodos especiales (GPU, procesos batch).

Las reglas pueden ser **obligatorias** (`required...`) o **preferidas** (`preferred...`). Las obligatorias pueden dejar pods en `Pending` si no hay dónde cumplirlas.

**Analogía:** requests son reservas de mesa en un restaurante; limits, el máximo que alguien puede pedir; anti-afinidad es «no sienten a toda la familia en la misma mesa»; un taint es un cartel «mesa reservada para grupos» que solo respetan quienes traen la reserva (toleration). La analogía falla en que el restaurante no echa al cliente que se pasa del límite; Kubernetes sí.

**Límite de uso:** la anti-afinidad obligatoria con más réplicas que nodos deja pods sin programar: usa `topologySpreadConstraints` o la versión preferida. Requests muy altas desperdician capacidad; mídelas con el uso real.

```mermaid
flowchart TB
    S["scheduler"] --> N1["worker 1: api-1"]
    S --> N2["worker 2: api-2"]
    S --> N3["worker 3 (taint batch): reporte"]
    S -. "api no tolera batch" .-> N3
```

#### ► CÓMO FUNCIONA
```mermaid
flowchart TB
    S["scheduler"] --> N1["worker 1: api-1"]
    S --> N2["worker 2: api-2"]
    S --> N3["worker 3 (taint batch): reporte"]
    S -. "api no tolera batch" .-> N3
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TB
    S["scheduler"] --> N1["worker 1: api-1"]
    S --> N2["worker 2: api-2"]
    S --> N3["worker 3 (taint batch): reporte"]
    S -. "api no tolera batch" .-> N3
```

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
  - role: worker
  - role: worker
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: api }
spec:
  replicas: 2
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            - labelSelector: { matchLabels: { app: api } }
              topologyKey: kubernetes.io/hostname   # una réplica por nodo
      containers:
        - name: api
          image: nginx:1.30
          resources:
            requests: { cpu: 100m, memory: 64Mi }
            limits: { memory: 128Mi }
```

```yaml
apiVersion: batch/v1
kind: Job
metadata: { name: reporte-nocturno }
spec:
  template:
    spec:
      restartPolicy: Never
      nodeSelector: { carga: batch }
      tolerations:
        - { key: carga, operator: Equal, value: batch, effect: NoSchedule }
      containers:
        - name: reporte
          image: busybox:1.36
          command: ["sh", "-c", "echo reporte listo"]
```

```bash
cd academia-labs/devops/scheduling
kind create cluster --config kind-3nodos.yaml
kubectl taint nodes kind-worker3 carga=batch:NoSchedule
kubectl label nodes kind-worker3 carga=batch
kubectl apply -f api.yaml -f reporte.yaml
kubectl get pods -o wide
```

```text
NAME                     READY   STATUS      NODE
api-xxxx-aaaaa           1/1     Running     kind-worker
api-xxxx-bbbbb           1/1     Running     kind-worker2
reporte-nocturno-ccccc   0/1     Completed   kind-worker3
```

</details>
