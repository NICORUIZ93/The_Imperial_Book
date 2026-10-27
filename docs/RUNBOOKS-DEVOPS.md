# DevOps Runbooks — Troubleshooting Operacional

Guías paso-a-paso para diagnosticar y resolver problemas comunes en herramientas DevOps usadas en RutaFlow. Cada runbook está basado en incidentes reales observados.

---

## Runbook 1: Docker Image Build Failures

### Síntomas
- `docker build` falla en etapa específica
- Cache layers no funcionan (rebuild siempre toma >5 minutos)
- Image es muy grande (>500MB)
- Build funciona localmente pero falla en CI/CD

### Diagnosis

**Paso 1: Revisar error exacto de build**
```bash
docker build -t rutaflow:latest . 2>&1 | tail -50
```
Buscar línea con `ERROR` o `failed`.

**Paso 2: Revisar tamaño de imagen**
```bash
docker images rutaflow:latest --format "{{.Size}}"
```

**Paso 3: Revisar layers de imagen**
```bash
docker inspect rutaflow:latest \
  --format '{{json .RootFS.Layers}}' | jq '.[] | length'
```
Cada layer debe ser < 50MB idealmente.

**Paso 4: Revisar si archivo es demasiado grande**
```bash
# Dentro del Dockerfile
COPY . /app  # Esto copia TODO — revisar .dockerignore
```

### Solución

**Root cause más común:** Copiar archivos innecesarios o dependencias no cached.

**Fix: Crear .dockerignore**
```
node_modules
.git
.env
*.log
dist
build
.pytest_cache
__pycache__
```

**Fix: Multi-stage build (reduce tamaño final)**
```dockerfile
# ❌ ANTES: imagen final > 500MB
FROM python:3.12
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "app.py"]

# ✅ DESPUÉS: imagen final < 100MB
FROM python:3.12 AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
CMD ["python", "app.py"]
```

**Fix: Optimizar orden de layers (cache building)**
```dockerfile
# ❌ ANTES: Cambiar código = rebuildar deps
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]

# ✅ DESPUÉS: Cambiar código = cache hit en npm install
FROM node:18
WORKDIR /app
COPY package*.json .
RUN npm ci  # más rápido que npm install
COPY . .
CMD ["npm", "start"]
```

**Fix si build falla en CI pero funciona localmente:**
```dockerfile
# Revisar que no asumes archivos que existen en local pero no en repo
ARG BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
ARG GIT_COMMIT=$(git rev-parse --short HEAD)
# En CI: pasar explícitamente
# docker build --build-arg BUILD_DATE=... --build-arg GIT_COMMIT=...
```

### Validation
```bash
# Build y medir tiempo
time docker build -t rutaflow:test .

# Build segunda vez (debe ser casi instant si cache funciona)
time docker build -t rutaflow:test .
```
Segunda build debe tomar <5s.

### Prevention
- Revisión de imagen: `dive rutaflow:latest` muestra qué layers son grandes
- Test locally: `docker build && docker run` funciona
- Monitor CI build time: alerta si > promedio

---

## Runbook 2: Kubernetes Pod CrashLoopBackOff

### Síntomas
- Pod se crea pero muere segundos después
- Status muestra `CrashLoopBackOff`
- Logs vacíos o error críptico
- Mismo Dockerfile funciona fuera de Kubernetes

### Diagnosis

**Paso 1: Revisar estado del pod**
```bash
kubectl describe pod rutaflow-api-abc123 -n production
```
Buscar `LastState`, `ExitCode`, `Reason`.

**Paso 2: Revisar logs**
```bash
kubectl logs rutaflow-api-abc123 -n production --tail 50
```
Si vacío, usa `--previous` para versión anterior:
```bash
kubectl logs rutaflow-api-abc123 -n production --previous
```

**Paso 3: Revisar readiness/liveness probes**
```bash
kubectl get pod rutaflow-api-abc123 -n production -o yaml | grep -A 10 "readinessProbe\|livenessProbe"
```

**Paso 4: Revisar recursos requestados vs disponibles**
```bash
kubectl top nodes  # CPU/memoria disponible
kubectl describe node <node-name>
```

### Solución

**Root cause más común:** Probe falla → pod restart → probe falla → loop.

**Fix: Remover/ajustar probe si es muy agresivo**
```yaml
# ❌ ANTES: Probe demasiado strict
apiVersion: v1
kind: Pod
metadata:
  name: rutaflow-api
spec:
  containers:
  - name: app
    livenessProbe:
      httpGet:
        path: /health
        port: 8080
      initialDelaySeconds: 5  # Muy rápido, app aún iniciando
      periodSeconds: 5

# ✅ DESPUÉS: Probe más realista
    livenessProbe:
      httpGet:
        path: /health
        port: 8080
      initialDelaySeconds: 30  # Esperar a que app inicie
      periodSeconds: 10
      failureThreshold: 3  # Permitir 3 fallos antes de restart
```

**Fix: Ejecutar comando de health check manualmente**
```bash
# Dentro del pod
kubectl exec -it rutaflow-api-abc123 -n production -- bash
curl localhost:8080/health  # Simular liveness probe
```

**Fix: Revisar que imagen existe**
```bash
kubectl describe pod rutaflow-api-abc123 -n production | grep -i "image\|imageID"
```
Si vacío, imagen no existe.

**Fix: Aumentar recursos si pod muere por OOM**
```bash
# Si ExitCode: 137 = OOMKilled
kubectl set resources deployment rutaflow-api \
  -n production \
  --limits=memory=512Mi,cpu=500m \
  --requests=memory=256Mi,cpu=250m
```

### Validation
```bash
# Monitorear pod restart
kubectl get pod rutaflow-api-abc123 -n production -w

# Debe alcanzar Running state sin CrashLoopBackOff
# READY 1/1, STATUS Running
```

### Prevention
- Test readiness probe localmente: `curl http://localhost:8080/health`
- Alerta si pod RESTART_COUNT > 0 en 5 minutos
- Logs: nivel DEBUG en startup para diagnosticar lentitud

---

## Runbook 3: Terraform State Lock Deadlock

### Síntomas
- `terraform plan` se queda esperando indefinidamente
- Error: `Error acquiring the state lock`
- Otro terraform process desaparece pero deja lock
- CI/CD pipeline congelado en `terraform apply`

### Diagnosis

**Paso 1: Revisar si hay lock**
```bash
# Local state
ls -la .terraform/terraform.tfstate.lock.hcl

# Remote state (S3)
aws s3 ls s3://rutaflow-terraform-state/env:prod/terraform.tfstate.lock
```

**Paso 2: Revisar ID del lock**
```bash
# Remote state
aws s3api get-object --bucket rutaflow-terraform-state \
  --key env:prod/terraform.tfstate.lock \
  /dev/stdout
```
Salida muestra PID y timestamp de quién tiene el lock.

**Paso 3: Revisar si proceso original todavía está corriendo**
```bash
# Si lock muestra PID 12345
ps aux | grep 12345
```
Si no hay proceso, lock está "huérfano".

### Solución

**Fix inmediato: Borrar lock (⚠️ cuidado — asegurar no hay terraform en otro lugar)**
```bash
# Local
rm .terraform/terraform.tfstate.lock.hcl

# Remote (S3)
aws s3 rm s3://rutaflow-terraform-state/env:prod/terraform.tfstate.lock

# Ahora retry
terraform plan
```

**Fix: Usar backend DynamoDB con timeout**
```hcl
# main.tf
terraform {
  backend "s3" {
    bucket         = "rutaflow-terraform-state"
    key            = "env:prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    skip_region_validation = true
  }
}
```

**Fix: Crear timeout para locks (opcional pero recomendado)**
```bash
# En bash script wrapper
LOCK_TIMEOUT=300  # 5 minutos
for i in $(seq 1 10); do
  if terraform apply -lock-timeout=${LOCK_TIMEOUT}s; then
    break
  fi
  if [ $i -lt 10 ]; then
    echo "Lock timeout, retrying in 10s..."
    sleep 10
  fi
done
```

### Prevention
- Alerta: si lock existe >15 minutos, investigar
- CI/CD: agregar timeout a terraform commands
- Policy: "Solo un terraform apply por environment al mismo tiempo"

---

## Runbook 4: Ansible Idempotency Failures

### Síntomas
- Playbook funciona primera vez, falla segunda vez
- Tarea se ejecuta cada run aunque nada cambió (no idempotent)
- Código manual se comporta diferente en Ansible
- Estado esperado diferente de estado actual

### Diagnosis

**Paso 1: Revisar si tarea es idempotent**
```bash
# Ejecutar playbook dos veces
ansible-playbook site.yml -i inventory.ini
ansible-playbook site.yml -i inventory.ini
```
Segunda ejecución debe mostrar `ok` (no `changed`) para tareas idempotent.

**Paso 2: Revisar handlers vs tasks**
```yaml
# ❌ NO idempotent: siempre reinicia
- name: Install nginx
  apt:
    name: nginx
    state: present
- name: Restart nginx
  systemd:
    name: nginx
    state: restarted

# ✅ Idempotent: solo reinicia si hay cambios
- name: Install nginx
  apt:
    name: nginx
    state: present
  notify: Restart nginx

handlers:
- name: Restart nginx
  systemd:
    name: nginx
    state: restarted
```

**Paso 3: Revisar conditionals (when)**
```yaml
# ❌ Condición siempre true
- name: Create config
  copy:
    dest: /etc/app/config.ini
    content: ...
  when: true  # Siempre ejecuta

# ✅ Verifica si archivo ya existe
- name: Create config
  copy:
    dest: /etc/app/config.ini
    content: ...
  when: not ansible_files.stat.exists  # Solo si no existe
```

### Solución

**Fix: Usar módulos idempotent**
```yaml
# ❌ ANTES: shell/command no son idempotent
- name: Install package
  shell: "apt-get install -y nginx"

# ✅ DESPUÉS: apt module es idempotent
- name: Install package
  apt:
    name: nginx
    state: present
```

**Fix: Usar `changed_when` y `failed_when` explícitamente**
```yaml
# ❌ ANTES: comando siempre muestra "changed"
- name: Check service status
  shell: "systemctl is-active nginx"
  register: result

# ✅ DESPUÉS: marca changed solo si status es específico
- name: Check service status
  shell: "systemctl is-active nginx"
  register: result
  changed_when: result.stdout == "inactive"
  failed_when: false
```

**Fix: Usar templates con checksum**
```yaml
# ✅ Idempotent: solo reescribe si contenido cambió
- name: Deploy config
  template:
    src: config.j2
    dest: /etc/app/config.ini
    owner: root
    group: root
    mode: '0644'
  notify: Restart app
```

### Prevention
- Test: ejecutar playbook 2x, ambas deben tener `changed=0` al final
- Usar `--check` para dry-run: `ansible-playbook site.yml --check`
- CI: automatizar test idempotency

---

## Runbook 5: Jenkins Pipeline Stage Timeout

### Síntomas
- Stage se queda esperando (>30 min sin output)
- Pipeline cancela automáticamente
- Workspace está lleno (disco agotado)
- Build logs no muestran qué está lento

### Diagnosis

**Paso 1: Revisar últimos builds**
```bash
# URL: http://jenkins.local/job/RutaFlow-Build/ws
# Ver si hay archivos grandes en workspace
ls -lah /var/lib/jenkins/workspace/RutaFlow-Build/
```

**Paso 2: Revisar logs del build**
```bash
# En Jenkins UI, revisar "Console Output"
# Buscar timestamp para identificar dónde se queda
```

**Paso 3: Revisar recursos del Jenkins agent**
```bash
# Si remoto agent
ssh jenkins@agent-host
df -h  # Espacio en disco
free -h  # Memoria
top  # Procesos
```

**Paso 4: Revisar procesos colgados**
```bash
# En workspace
find . -name "*.lock" -type f
ps aux | grep jenkins
```

### Solución

**Root cause más común:** Workspace nunca se limpia → crece → eventual I/O bottleneck.

**Fix: Agregar workspace cleanup en Jenkinsfile**
```groovy
pipeline {
    agent any
    options {
        buildDiscarder(logRotator(numToKeepStr: '30'))  // Mantener solo últimos 30 builds
        disableConcurrentBuilds()  // Evitar paralelismo si recursos limitados
        timeout(time: 30, unit: 'MINUTES')  // Timeout global del pipeline
    }
    stages {
        stage('Build') {
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }
    }
    post {
        always {
            cleanWs()  // Limpiar workspace al final
        }
    }
}
```

**Fix: Forzar cleanup de workspace viejo**
```bash
# Manual (en Jenkins server)
rm -rf /var/lib/jenkins/workspace/RutaFlow-Build/*

# O desde Jenkins UI: Build → Workspace → Delete Workspace
```

**Fix: Aumentar timeout si build es legítimamente lento**
```groovy
// En Jenkinsfile
options {
    timeout(time: 60, unit: 'MINUTES')
}

// O por stage
stage('LongTest') {
    options {
        timeout(time: 90, unit: 'MINUTES')
    }
    steps {
        sh './run-long-tests.sh'
    }
}
```

### Prevention
- Dashboard Jenkins: monitorear "Average Build Duration"
- Alerta si workspace > 10GB
- Revisar logs de agentes: "Executor #X idle for X minutes" = agent bloqueado

---

## Runbook 6: ArgoCD Sync Failures

### Síntomas
- Application status muestra `OutOfSync`
- Sync falla con error críptico
- Helm chart validation falla
- Git commit es válido pero ArgoCD dice no

### Diagnosis

**Paso 1: Revisar status de aplicación**
```bash
argocd app get rutaflow-prod
```
Buscar `Sync Status`, `Health Status`, error message.

**Paso 2: Revisar logs de sync**
```bash
argocd app logs rutaflow-prod --namespace argocd
```

**Paso 3: Si es Helm, validar chart**
```bash
helm lint charts/rutaflow/
helm template rutaflow charts/rutaflow/ \
  -f values-prod.yaml
```

**Paso 4: Revisar commit en Git**
```bash
# Verificar que archivo que ArgoCD intenta sincronizar existe
git show HEAD:charts/rutaflow/Chart.yaml
```

### Solución

**Root cause más común:** Values file tiene typo o referenced image no existe.

**Fix: Validar antes de commit**
```bash
# Pre-commit hook
helm lint charts/rutaflow/
kubectl apply --dry-run=client -f manifests/
```

**Fix: Revisar que image existe en registry**
```bash
# Si error "image not found"
docker push us.gcr.io/rutaflow/api:v1.2.3
# Verificar
docker pull us.gcr.io/rutaflow/api:v1.2.3
```

**Fix: Forzar sync (después de corregir)**
```bash
argocd app sync rutaflow-prod
# O desde UI: click "SYNC" en ArgoCD dashboard
```

**Fix si problema es Network (ArgoCD no puede alcanzar Git)**
```bash
# Revisar Git credentials
argocd repo add https://github.com/floci-io/The_Imperial_Book.git \
  --username git \
  --password $GITHUB_TOKEN

# O revisar cert CA si privado
argocd repo add https://git.internal.local/akademia/repo.git \
  --username deploy \
  --password $GIT_TOKEN \
  --insecure
```

### Prevention
- Test: `helm template` pasa antes de commit
- CI check: validar que Kubernetes manifests pasan `kubectl apply --dry-run`
- Monitorear ArgoCD: alerta si `OutOfSync > 30 minutos`

---

## Runbook 7: Helm Release Upgrade Failures

### Síntomas
- `helm upgrade` falla pero rollback no funciona
- Pods viejos terminan pero nuevos no inician
- Values override no se aplica
- Chart falla por conflicto de CRD

### Diagnosis

**Paso 1: Revisar release status**
```bash
helm status rutaflow -n production
```
Debe mostrar `deployed` (no `pending-upgrade`).

**Paso 2: Revisar release history**
```bash
helm history rutaflow -n production
```
Si último show `deployed`, está ok. Si `pending-upgrade`, upgrade quedó a mitad.

**Paso 3: Revisar diferencias de values**
```bash
helm get values rutaflow -n production > current-values.yaml
diff current-values.yaml values-prod.yaml
```

**Paso 4: Revisar state de Helm en etcd (Kubernetes)**
```bash
# Helm 3 almacena release en Secrets
kubectl get secrets -n production | grep rutaflow
kubectl describe secret rutaflow.v1 -n production
```

### Solución

**Root cause más común:** Nueva versión de chart incompatible o valores inválidos.

**Fix: Rollback a versión anterior**
```bash
helm rollback rutaflow 3 -n production  # Volver a revisión 3
```

**Fix: Upgrade con wait (esperar pods Ready)**
```bash
helm upgrade rutaflow ./charts/rutaflow \
  -n production \
  -f values-prod.yaml \
  --wait \
  --timeout 5m \
  --atomic  # Rollback automático si falla
```

**Fix: Validar values antes de upgrade**
```bash
# Dry-run
helm upgrade rutaflow ./charts/rutaflow \
  -n production \
  -f values-prod.yaml \
  --dry-run --debug

# Revisar si hay errores en manifests generados
```

### Prevention
- Test chart upgrade en staging antes de prod
- CI: `helm lint` todas las charts
- Changelog: documentar breaking changes en nuevas versiones

---

## Runbook 8: Istio VirtualService Routing Issues

### Síntomas
- Traffic no llega a destino esperado
- 404 o 502 errors aunque pod está ready
- Canary deployment está stuck en versión vieja
- TLS handshake falla

### Diagnosis

**Paso 1: Revisar VirtualService config**
```bash
kubectl get virtualservice rutaflow-api -n production -o yaml
```
Buscar `hosts`, `http`, `route`, `destination`.

**Paso 2: Revisar DestinationRule**
```bash
kubectl get destinationrule rutaflow-api -n production -o yaml
```
Debe referenciar services existentes.

**Paso 3: Revisar DNS resolución dentro de mesh**
```bash
# Dentro de pod cliente
kubectl exec -it client-pod -- bash
curl -v http://rutaflow-api.production.svc.cluster.local:8080
```
Si falla, problema es routing.

**Paso 4: Revisar Envoy sidecar logs**
```bash
kubectl logs rutaflow-api-abc123 -n production -c istio-proxy
```
Buscar `UPSTREAM_REQUEST_TIMEOUT`, `RESET`, errores de conexión.

### Solución

**Root cause más común:** VirtualService host no coincide con service name.

**Fix: Revisar hosts en VirtualService**
```yaml
# ❌ ANTES: host no existe
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: rutaflow-api
spec:
  hosts:
  - rutaflow  # Incompleto, no resuelve
  http:
  - route:
    - destination:
        host: rutaflow-api

# ✅ DESPUÉS: host FQDN correcto
  hosts:
  - rutaflow-api.production.svc.cluster.local
  http:
  - route:
    - destination:
        host: rutaflow-api.production.svc.cluster.local
        port:
          number: 8080
```

**Fix si canary deployment está stuck:**
```yaml
# Revisar traffic splitting
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: rutaflow-api-canary
spec:
  hosts:
  - rutaflow-api
  http:
  - match:
    - uri:
        prefix: "/api/v2"  # New version
    route:
    - destination:
        host: rutaflow-api-v2
        port:
          number: 8080
      weight: 10  # 10% traffic
    - destination:
        host: rutaflow-api-v1
        port:
          number: 8080
      weight: 90  # 90% traffic
```

### Prevention
- Test: pod-to-pod communication en staging antes de prod
- Monitorear Envoy metrics: `istio_requests_total`
- Alerta: 5xx errors > 1% durante canary

---

## Runbook 9: ELK Stack Log Parsing Failures

### Síntomas
- Logs aparecen en Elasticsearch pero no parseados (data en `message` field solo)
- Queries por level, timestamp no funcionan
- Kibana dashboard muestra `N/A` para campos customizados
- Performance slow (queries toman >30s)

### Diagnosis

**Paso 1: Revisar que logs llegan a Elasticsearch**
```bash
# Desde máquina con Elasticsearch
curl -s localhost:9200/_cat/indices
# Buscar logstash-* indices
```

**Paso 2: Revisar mapping del index**
```bash
curl -s localhost:9200/logstash-rutaflow-2026.10.06/_mapping | jq .
```
Si `level`, `timestamp` no aparecen, no fueron parseados.

**Paso 3: Revisar Logstash pipeline**
```bash
# En Logstash config
grep -A 20 "filter {" /etc/logstash/conf.d/rutaflow.conf
```
Buscar filtros `grok`, `json`, `kv`.

**Paso 4: Revisar logs de Logstash mismo**
```bash
tail -f /var/log/logstash/logstash-plain.log
```
Si hay parse errors, aparecen ahí.

### Solución

**Root cause más común:** Grok pattern incorrecto o JSON parser en filtro de logs que no son JSON.

**Fix: Validar grok pattern**
```bash
# Tool online: https://grokdebug.herokuapp.com/
# Pattern: %{TIMESTAMP_ISO8601:timestamp} \[%{LOGLEVEL:level}\] %{GREEDYDATA:message}
# Input: 2026-10-06T10:30:45Z [ERROR] Database connection failed
```

**Fix: Actualizar Logstash pipeline**
```groovy
input {
  beats {
    port => 5044
  }
}

filter {
  # Aplicar grok solo a logs que parecen JSON
  if [type] == "json" {
    json {
      source => "message"
      target => "parsed"
    }
    mutate {
      replace => { "[@metadata][index_name]" => "logstash-json-%{+YYYY.MM.dd}" }
    }
  } else {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} \[%{LOGLEVEL:level}\] %{GREEDYDATA:msg}" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "%{[@metadata][index_name]}-%{+YYYY.MM.dd}"
  }
}
```

**Fix: Cambiar política de índice (si es volumen de datos)**
```bash
# Elasticsearch: usar índices diarios en lugar de mensuales
# En Logstash output, cambiar:
index => "logstash-%{+YYYY.MM.dd}"  # Diario
# En lugar de:
index => "logstash-%{+YYYY.MM}"     # Mensual
```

### Prevention
- Revisar Logstash logs diariamente (¿hay parse errors?)
- Grok patterns versionados en Git
- Kibana: dashboard que monitorea `_grokparsefailure` tag

---

## Runbook 10: Prometheus Scrape Failures

### Síntomas
- Métrica no aparece en Prometheus aunque target responde
- Target status muestra `DOWN` aunque aplicación está up
- Scrape timeout, pero endpoint devuelve rápido localmente
- Métrica desaparece después de cierto período

### Diagnosis

**Paso 1: Revisar target status**
```bash
# URL de Prometheus: http://prometheus.local:9090/targets
# O CLI:
curl -s 'http://localhost:9090/api/v1/targets' | jq .
```
Buscar `lastScrapeStatus` para cada target.

**Paso 2: Revisar error de scrape específico**
```bash
# En Prometheus UI, revisar "Scrape errors" tab
# O CLI:
curl -s 'http://localhost:9090/api/v1/targets?state=any' | jq '.data.activeTargets[] | select(.health=="down")'
```

**Paso 3: Revisar manualmente el endpoint**
```bash
# Si target es http://localhost:8080/metrics
curl http://localhost:8080/metrics
```
Debe retornar formato Prometheus válido.

**Paso 4: Revisar logs de Prometheus**
```bash
tail -f /var/log/prometheus/prometheus.log
```
Buscar `scrape error`, `connection refused`.

### Solución

**Root cause más común:** Endpoint cambia de puerto o path, o Prometheus config no se reloadea.

**Fix: Actualizar Prometheus config**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'rutaflow-api'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'  # Path correcto
    scrape_interval: 10s
    scrape_timeout: 5s
```

**Fix: Reloadear Prometheus sin restart**
```bash
# Enviar señal SIGHUP al proceso
kill -HUP $(pgrep prometheus)

# O curl si tiene API
curl -X POST http://localhost:9090/-/reload
```

**Fix si endpoint requiere autenticación**
```yaml
scrape_configs:
  - job_name: 'rutaflow-api'
    static_configs:
      - targets: ['localhost:8080']
    basic_auth:
      username: 'prometheus'
      password: 'secret'
```

### Prevention
- Alerta Prometheus: `up{job="rutaflow-api"} == 0` → investigar
- Revisar config antes de deploy: `promtool check config prometheus.yml`
- Test metrics endpoint manualmente cada sprint

---

## Runbook 11: MySQL Replication Lag

### Síntomas
- Datos escritos en primaria no aparecen en réplica rápidamente (>10s)
- Queries en réplica retornan datos viejos
- `Seconds_Behind_Master` crece constantemente
- Replicación se detiene con error `Duplicate Entry`

### Diagnosis

**Paso 1: Revisar lag en réplica**
```bash
# Conectar a réplica MySQL
mysql -h replica.local -u root -p
SHOW SLAVE STATUS\G
```
Buscar `Seconds_Behind_Master`, `Slave_IO_Running`, `Slave_SQL_Running`.

**Paso 2: Revisar binlog position en primaria**
```bash
# En primaria
mysql -h primary.local -u root -p
SHOW MASTER STATUS;
```
Comparar con `Master_Log_File` y `Read_Master_Log_Pos` en réplica.

**Paso 3: Revisar si hay transacciones largas**
```bash
# En primaria
SHOW PROCESSLIST;
```
Buscar queries con `Time` alto.

**Paso 4: Revisar error en replicación**
```bash
# Si Slave_SQL_Running: No
SHOW SLAVE STATUS\G | grep -A 5 "Last_Error"
```

### Solución

**Root cause más común:** Transacción larga en primaria genera binlog grande → réplica se queda atrás.

**Fix inmediato: Resincronizar réplica**
```bash
# En réplica (⚠️ causará downtime de lectura)
STOP SLAVE;

# Tomar backup de primaria
mysqldump -h primary --all-databases --master-data > dump.sql

# Restaurar en réplica
mysql -h replica < dump.sql

# Reiniciar replicación
CHANGE MASTER TO MASTER_HOST='primary', MASTER_USER='repl', MASTER_PASSWORD='password';
START SLAVE;

# Esperar a que sincronice
SHOW SLAVE STATUS\G;
```

**Fix permanente: Configurar multi-threaded replication**
```bash
# En réplica
STOP SLAVE;
SET GLOBAL slave_parallel_workers = 4;  # Procesar 4 threads en paralelo
SET GLOBAL slave_parallel_type = 'LOGICAL_CLOCK';
START SLAVE;
```

**Fix si hay conflicto de duplicate entry:**
```bash
# Revisar qué transaction causó conflict
SHOW SLAVE STATUS\G | grep -A 5 "Last_Error"

# Opción 1: Saltar error (⚠️ cuidado — datos inconsistentes)
SET GLOBAL SQL_SLAVE_SKIP_COUNTER = 1;
START SLAVE;

# Opción 2: Manual fix (mejor)
# Conectar a réplica, ejecutar el statement que falló, investigar diferencia
```

### Prevention
- Monitor: alerta si `Seconds_Behind_Master > 10`
- Revisar transacciones largas que afecten replicación
- Backup estrategia: backup de réplica en lugar de primaria (no afecta producción)

---

## Runbook 12: Load Balancer Health Check Failures

### Síntomas
- Instancias marcadas como `OutOfService` aunque están up
- Health check timeout aunque endpoint responde localmente
- Some instances reciben traffic, otros nunca
- 503 Service Unavailable aunque servidores están up

### Diagnosis

**Paso 1: Revisar health check config**
```bash
# AWS ELB
aws elb describe-load-balancers --load-balancer-names RutaFlow-LB \
  --query 'LoadBalancerDescriptions[0].HealthCheck'

# AWS ALB
aws elbv2 describe-target-groups --query 'TargetGroups[0].HealthCheckProtocol, HealthCheckPath, HealthCheckIntervalSeconds'
```

**Paso 2: Revisar instance health**
```bash
aws elb describe-instance-health --load-balancer-name RutaFlow-LB
```
Buscar status `OutOfService`.

**Paso 3: Medir manualmente el health check**
```bash
# Si health check es HTTP GET /health
curl -v http://instance-ip:8080/health
# Debe retornar 200, no 5xx
```

**Paso 4: Revisar logs del servidor**
```bash
# En instancia
tail -f /var/log/app/app.log | grep "/health"
```
Si hay timeouts, servidor está lento.

### Solución

**Root cause más común:** Health check endpoint lento o retorna error sob carga.

**Fix: Hacer health check más ligero**
```python
# ❌ ANTES: Health check consulta BD
@app.route('/health')
def health():
    db.execute("SELECT 1")  # Lento si BD está bajo presión
    return 'OK', 200

# ✅ DESPUÉS: Solo verifica que proceso está vivo
@app.route('/health')
def health():
    return 'OK', 200
```

**Fix: Aumentar health check interval/timeout**
```bash
# AWS ALB
aws elbv2 modify-target-group \
  --target-group-arn arn:aws:elasticloadbalancing:us-east-1:123456789:targetgroup/RutaFlow-TG/abc \
  --health-check-protocol HTTP \
  --health-check-path /health \
  --health-check-interval-seconds 30  # Aumentar de 5s a 30s
  --health-check-timeout-seconds 10   # Aumentar de 3s a 10s
  --healthy-threshold-count 3         # 3 checks OK para marcar healthy
  --unhealthy-threshold-count 2       # 2 checks fail para marcar unhealthy
```

**Fix: Revisar security groups permite traffic desde LB**
```bash
# Security group de instance debe permitir port 8080 desde SG del LB
aws ec2 authorize-security-group-ingress \
  --group-id sg-instance \
  --protocol tcp \
  --port 8080 \
  --source-security-group-id sg-load-balancer
```

### Prevention
- Monitorear health check sucesos: CloudWatch metric `UnHealthyHostCount`
- Test: acceder a health check endpoint bajo carga
- Alerta: si instancia es `OutOfService > 5 minutos`, investigar

---

## Runbook 13: iptables Firewall Rules

### Síntomas
- Traffic está bloqueado aunque no hay firewall en cloud
- Puertos locales no son accesibles
- UDP traffic funciona pero TCP no
- Localhost funciona pero cross-host no

### Diagnosis

**Paso 1: Revisar reglas iptables activas**
```bash
sudo iptables -L -n -v
# o
sudo iptables -L -n -v --line-numbers
```

**Paso 2: Revisar policy por defecto**
```bash
sudo iptables -L -n | head -5
# Debe mostrar INPUT ACCEPT, FORWARD ACCEPT, OUTPUT ACCEPT (permissive default)
```

**Paso 3: Revisar si reglas están guardadas (persistentes)**
```bash
sudo iptables-save > /tmp/rules.bak  # Backup
cat /etc/iptables/rules.v4  # Ubicación típica de reglas persistentes
```

**Paso 4: Test de conectividad específico**
```bash
# Desde otro host
telnet target-ip 8080
# Si timeout, regla está bloqueando
```

### Solución

**Root cause más común:** Regla DROP implícita en INPUT.

**Fix: Permitir port específico**
```bash
# Permitir puerto 8080 entrada (all IPs)
sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT

# Permitir solo desde red específica
sudo iptables -A INPUT -p tcp -s 10.0.0.0/8 --dport 8080 -j ACCEPT

# Guardar permanentemente
sudo iptables-save | sudo tee /etc/iptables/rules.v4
# O para iptables-persistent:
sudo netfilter-persistent save
```

**Fix: Revisar regla de OUTPUT si tráfico saliente está bloqueado**
```bash
# Permitir outbound a puerto 443 (HTTPS)
sudo iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT
```

**Fix: Resetear iptables a default (⚠️ arriesgado)**
```bash
# Flush todas las reglas
sudo iptables -F

# Establecer policy default como ACCEPT
sudo iptables -P INPUT ACCEPT
sudo iptables -P FORWARD ACCEPT
sudo iptables -P OUTPUT ACCEPT

# Guardar
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

### Prevention
- Documentar reglas iptables en repo (versionar)
- Test: desde otro host, verificar puertos son accesibles
- Usar ufw (wrapper de iptables) si prefieres sintaxis más simple: `sudo ufw allow 8080`

---

## Runbook 14: etcd Cluster Split Brain

### Síntomas
- Kubernetes API no responde ocasionalmente
- Pods no pueden ser scheduled
- etcd logs muestran "leader election failed"
- Cluster muestra múltiples líderes

### Diagnosis

**Paso 1: Revisar cluster health**
```bash
# Desde node master
export ETCDCTL_API=3
etcdctl member list -w table

# O ver endpoint status
etcdctl endpoint health
```
Debe mostrar todos los miembros `healthy`.

**Paso 2: Revisar logs de etcd**
```bash
# Típicamente en /var/log/etcd/
tail -f /var/log/etcd.log | grep -i "leader\|election"
```

**Paso 3: Revisar si hay network partition**
```bash
# Pingear otros masters
for ip in master1 master2 master3; do
  echo "$ip:"
  ping -c 1 $ip
done
```

**Paso 4: Revisar quórum (debe ser odd number, ej 3, 5, 7)**
```bash
etcdctl member list | wc -l
# Debe ser 3, 5, 7, etc (NUNCA par)
```

### Solución

**Fix inmediato: Restaurar desde backup**
```bash
# 1. Detener etcd
sudo systemctl stop etcd

# 2. Restaurar snapshot
sudo etcdctl snapshot restore /path/to/snapshot.db \
  --data-dir /var/lib/etcd-restored

# 3. Reiniciar
sudo systemctl start etcd
```

**Fix: Remover miembro ghost (si hay nodo muerto)**
```bash
# Listar miembros
etcdctl member list

# Si ves un miembro muerto, removerlo
etcdctl member remove abc123def456
```

**Fix: Cambiar cluster de 2 a 3 nodes (evitar split brain)**
```bash
# Agregar nuevo miembro
etcdctl member add etcd3 --peer-urls=https://etcd3:2380

# En nuevo node, iniciar etcd con --initial-cluster flag
sudo etcd \
  --name etcd3 \
  --initial-cluster "etcd1=https://etcd1:2380,etcd2=https://etcd2:2380,etcd3=https://etcd3:2380" \
  --initial-cluster-state existing
```

### Prevention
- Cluster de mínimo 3 masters (nunca 2)
- Monitorear etcd cluster health en alertas
- Backup automático de etcd cada hora
- Network monitoring: alerta si inter-node latency > 100ms

---

## Runbook 15: Database Backup Restoration Timing

### Síntomas
- Restauración toma horas cuando debería tomar minutos
- RTO (Recovery Time Objective) incumplido
- Network saturation durante restore
- Algunos datos se pierden entre último backup y failure

### Diagnosis

**Paso 1: Revisar última backup date**
```bash
# AWS RDS
aws rds describe-db-instances --db-instance-identifier rutaflow-db \
  --query 'DBInstances[0].[LatestRestorableTime,PreferredBackupWindow]'

# Backup automático debería existir cada 24h
aws rds describe-db-snapshots --db-instance-identifier rutaflow-db
```

**Paso 2: Simular restore time**
```bash
# Crear restore en staging (measure tiempo)
time aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier rutaflow-db-restore \
  --db-snapshot-identifier rutaflow-db-snapshot-2026-10-06
```

**Paso 3: Revisar binlog/WAL retention**
```bash
# MySQL: revisar binlog retention
SHOW VARIABLES LIKE 'binlog_expire_logs_seconds';
# Debe ser >= 86400 (1 día) para recovery point granular
```

**Paso 4: Revisar network I/O durante restore**
```bash
# En RDS instance
# Revisar "Network Throughput" en CloudWatch
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name NetworkReceiveThroughput \
  --dimensions Name=DBInstanceIdentifier,Value=rutaflow-db \
  --start-time 2026-10-06T10:00:00Z \
  --end-time 2026-10-06T12:00:00Z \
  --period 60 \
  --statistics Average
```

### Solución

**Root cause más común:** Backup no es incremental (full restore cada vez).

**Fix: Implementar backup estrategia (full + incremental)**
```bash
# AWS RDS: usar automated backups + manual snapshots
# Full backup: snapshot (1 vez al mes)
aws rds create-db-snapshot \
  --db-instance-identifier rutaflow-db \
  --db-snapshot-identifier rutaflow-db-monthly-2026-10

# Incremental: binlogs (daily, 7-day retention)
aws rds modify-db-instance \
  --db-instance-identifier rutaflow-db \
  --backup-retention-period 7  # Mantener backups 7 días
  --apply-immediately
```

**Fix: Testing de restore procedure**
```bash
# Hacer restore a staging monthly
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier rutaflow-db-test \
  --db-snapshot-identifier <latest-snapshot>

# Revisar:
# 1. Tiempo total de restore
# 2. Integridad de datos
# 3. Binlog position para recovery exacto a punto específico
```

**Fix: Paralelizar restore si hay múltiples schemas**
```bash
# Restore múltiples DBs simultáneamente (si recursos permiten)
for schema in db1 db2 db3; do
  aws rds restore-db-instance-from-db-snapshot \
    --db-instance-identifier "$schema-restored" \
    --db-snapshot-identifier "$schema-snapshot" &
done
wait
```

### Prevention
- Mensual: test restore en staging (documentar tiempo real)
- Alerta: si automated backup falla
- SLA: RTO <= 30 minutos, RPO <= 1 hora (definir según negocio)
- Documentar: runbook de restore (paso-a-paso) actualized cada quarter

---

**Next Steps:**
1. Run `./scripts/validate.sh` after infrastructure changes
2. Review runbooks monthly as tools update
3. Test disaster recovery quarterly

