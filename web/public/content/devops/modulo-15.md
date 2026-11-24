# Módulo 15: DevOps Master: GitOps, Service Mesh y DevSecOps


## Aprende construyendo


### Tema 1: Docker y Compose avanzados · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a declarar un healthcheck y un depends_on: condition: service_healthy para que el servicio de RutaFlow no arranque contra una base de datos que aún no acepta conexiones. Prerrequisitos: Docker Compose v2 instalado (docker compose version).

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
  participant C as docker compose up
  participant D as db
  participant A as api
  C->>D: start
  D-->>D: healthcheck pg_isready (reintentos)
  D-->>C: healthy
  C->>A: start (solo tras healthy)
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
sequenceDiagram
  participant C as docker compose up
  participant D as db
  participant A as api
  C->>D: start
  D-->>D: healthcheck pg_isready (reintentos)
  D-->>C: healthy
  C->>A: start (solo tras healthy)
```

```bash
mkdir ejemplo-devops-health
cd ejemplo-devops-health
```

```json
{
  "name": "health-lab",
  "private": true,
  "type": "module",
  "dependencies": { "pg": "8.13.1" }
}
```

```js
import http from 'node:http';
import pg from 'pg';

const client = new pg.Client({ connectionTimeoutMillis: 2000 });
await client.connect();
await client.query('SELECT 1');

const server = http.createServer(async (request, response) => {
  try {
    const result = await client.query('SELECT 1 AS disponible');
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(result.rows[0]));
  } catch {
    response.writeHead(503, { 'Content-Type': 'application/json' });
    response.end('{"error":"base no disponible"}');
  }
});
server.listen(3000, '0.0.0.0');
```

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.mjs ./
CMD ["node", "server.mjs"]
```

```dotenv
LAB_DB_PASSWORD=lab-local-only
```

</details>

### Tema 2: Kubernetes extensible y Helm avanzado · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a declarar un Helm hook pre-upgrade que corra las migraciones de RutaFlow antes de que el nuevo Deployment reciba tráfico. Prerrequisitos: Tema 1 de este módulo; Helm 3 instalado (helm version).

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
  participant H as helm upgrade
  participant J as Job (pre-upgrade)
  participant D as Deployment
  H->>J: ejecutar migración
  J-->>H: completado (o falla y detiene)
  H->>D: reemplazar pods (solo si J OK)
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
sequenceDiagram
  participant H as helm upgrade
  participant J as Job (pre-upgrade)
  participant D as Deployment
  H->>J: ejecutar migración
  J-->>H: completado (o falla y detiene)
  H->>D: reemplazar pods (solo si J OK)
```

```bash
mkdir ejemplo-helm && cd ejemplo-helm
mkdir -p chart/templates
```

```yaml
apiVersion: v2
name: rutaflow-api
version: 0.1.0
```

```yaml
image:
  tag: "1.0.0"
```

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: rutaflow-migrate
  annotations:
    "helm.sh/hook": pre-upgrade
    "helm.sh/hook-weight": "0"
    "helm.sh/hook-delete-policy": before-hook-creation
spec:
  template:
    spec:
      containers:
        - name: migrate
          image: rutaflow/api:{{ .Values.image.tag }}
          command: ["npm", "run", "migrate"]
      restartPolicy: Never
```

```bash
helm template rutaflow ./chart
helm upgrade --install rutaflow ./chart --dry-run=client
```

</details>

### Tema 3: Service Mesh con Istio o Linkerd · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a declarar un VirtualService y un DestinationRule de Istio para dividir el tráfico de la API de RutaFlow 90/10 entre la versión estable y un canary. Prerrequisitos: Tema 2 de este módulo; clúster con Istio instalado (istioctl version).

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  U[Cliente] --> VS[VirtualService 90/10]
  VS -->|90%| V1[Subset v1]
  VS -->|10%| V2[Subset v2]
  V2 -.->|sin pods etiquetados| E[503 UH]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
  U[Cliente] --> VS[VirtualService 90/10]
  VS -->|90%| V1[Subset v1]
  VS -->|10%| V2[Subset v2]
  V2 -.->|sin pods etiquetados| E[503 UH]
```

```bash
kubectl get deployment rutaflow-delivery-api -o jsonpath='{.metadata.labels.version}'
```

```bash
mkdir ejemplo-istio && cd ejemplo-istio
```

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata: { name: rutaflow-api }
spec:
  host: rutaflow-api
  subsets:
    - name: v1
      labels: { version: v1 }
    - name: v2
      labels: { version: v2 }
---
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata: { name: rutaflow-api }
spec:
  hosts: [rutaflow-api]
  http:
    - route:
        - destination: { host: rutaflow-api, subset: v1 }
          weight: 90
        - destination: { host: rutaflow-api, subset: v2 }
          weight: 10
```

```bash
istioctl analyze -f virtualservice.yaml
kubectl apply -f virtualservice.yaml
kubectl get destinationrule,virtualservice rutaflow-api
```

</details>

### Tema 4: GitOps con Argo CD y Flux · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a declarar una Application de Argo CD con syncPolicy.automated.selfHeal para que el estado de RutaFlow en el clúster nunca diverja silenciosamente del repositorio Git. Prerrequisitos: Tema 3 de este módulo; Argo CD instalado (argocd version).

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
  participant G as Git (infra)
  participant A as Argo CD
  participant K as Clúster
  Note over K: kubectl scale --replicas=10 (manual)
  A->>K: reconciliar contra Git
  K-->>A: diverge (10 != 3)
  A->>K: revertir a 3 (selfHeal)
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
sequenceDiagram
  participant G as Git (infra)
  participant A as Argo CD
  participant K as Clúster
  Note over K: kubectl scale --replicas=10 (manual)
  A->>K: reconciliar contra Git
  K-->>A: diverge (10 != 3)
  A->>K: revertir a 3 (selfHeal)
```

```bash
mkdir ejemplo-gitops && cd ejemplo-gitops
```

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata: { name: rutaflow-api }
spec:
  source: { repoURL: 'https://github.com/rutaflow/infra', path: api, targetRevision: main }
  destination: { server: 'https://kubernetes.default.svc', namespace: rutaflow }
  syncPolicy:
    automated: { prune: true, selfHeal: true }
```

```bash
kubectl apply --dry-run=client -f application.yaml
kubectl apply -f application.yaml
argocd app get rutaflow-api
```

</details>

### Tema 5: Ansible, inventarios, roles y Vault · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a cifrar la API key de RutaFlow con ansible-vault y a escribirla en el servidor usando una tarea idempotente que no duplique su valor al ejecutarse varias veces. Prerrequisitos: Tema 4 de este módulo; Ansible instalado (ansible --version).

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  P1[Ejecucion 1: changed] --> P2[Ejecucion 2: lineinfile changed=0]
  P1b[Ejecucion 1: shell echo] --> P2b[Ejecucion 2: shell echo linea duplicada]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
  P1[Ejecucion 1: changed] --> P2[Ejecucion 2: lineinfile changed=0]
  P1b[Ejecucion 1: shell echo] --> P2b[Ejecucion 2: shell echo linea duplicada]
```

```bash
docker run --rm -it -v "$PWD":/playbooks ansible/ansible-runner ansible-playbook -i /playbooks/inventory.ini --ask-vault-pass /playbooks/site.yml
```

```bash
mkdir ejemplo-ansible && cd ejemplo-ansible
```

```bash
ansible-vault encrypt_string 'sk-rutaflow-lab-xxx' --name 'api_key'
```

```yaml
- hosts: all
  become: true
  vars_files:
    - vault.yml
  tasks:
    - name: Configurar API key de RutaFlow
      lineinfile:
        path: /etc/environment
        regexp: '^RUTAFLOW_API_KEY='
        line: "RUTAFLOW_API_KEY={{ api_key }}"
        state: present
```

```ini
[lab]
servidor ansible_host=192.0.2.10 ansible_user=ubuntu
```

</details>

### Tema 6: DevSecOps y métricas DORA · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a calcular las cuatro métricas DORA (frecuencia de despliegue, lead time, tasa de fallo de cambios y MTTR) a partir de los datos reales del pipeline de RutaFlow. Prerrequisitos: Tema 5 de este módulo; acceso a los logs de CI/CD y al historial de incidentes de Rut…

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  A[Commits] --> B[Pipeline CI/CD]
  B -->|exito + gate seguridad| C[Despliegue real a produccion]
  B -->|fallo/reintento| B
  C --> D[4 metricas DORA]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
  A[Commits] --> B[Pipeline CI/CD]
  B -->|exito + gate seguridad| C[Despliegue real a produccion]
  B -->|fallo/reintento| B
  C --> D[4 metricas DORA]
```

```bash
kubectl get events --field-selector reason=Started -n rutaflow --sort-by='.lastTimestamp'
```

```bash
mkdir ejemplo-dora && cd ejemplo-dora
```

```bash
#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR=${1:?Indica la carpeta Git de tu propio proyecto}
: "${DEPLOY_TIME:?Define DEPLOY_TIME}"
: "${COMMIT_TIME:?Define COMMIT_TIME}"

# Frecuencia de despliegue: despliegues EXITOSOS a producción por día
git -C "$PROJECT_DIR" log --since="30 days ago" --grep="deploy: production" --oneline | wc -l

# Lead time: desde el commit hasta el despliegue exitoso
echo "$(( $(date -d "$DEPLOY_TIME" +%s) - $(date -d "$COMMIT_TIME" +%s) )) segundos"
```

```bash
export COMMIT_TIME="2026-07-15T10:00:00Z"
export DEPLOY_TIME="2026-07-15T12:30:00Z"
bash medir_dora.sh /ruta/a/tu/proyecto
```

</details>
