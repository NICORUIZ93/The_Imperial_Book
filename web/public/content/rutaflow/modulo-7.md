# Módulo 7: Producción: cloud, DevOps, seguridad y operación

## Aprende construyendo


### Tema 1: Infraestructura y entrega segura · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás construir y verificar Tema 1: Infraestructura y entrega segura dentro de RutaFlow, provisionando un namespace de Kubernetes con Terraform y bloqueando el despliegue de imágenes sin firma verificada. Conocimiento previo: terminal, Git, nociones básicas de Terra…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás construir y verificar Tema 1: Infraestructura y entrega segura dentro de RutaFlow, provisionando un namespace de Kubernetes con Terraform y bloqueando el despliegue de imágenes sin firma verificada.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en infraestructura y entrega segura como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  A[Build de la imagen] --> B[Escaneo y SBOM]
  B --> C[cosign sign con clave del pipeline]
  C --> D[(Registro de imagenes)]
  D --> E{cosign verify antes del deploy}
  E -->|firma valida| F[kubectl apply en rutaflow-envios]
  E -->|firma invalida o ausente| G[Deploy bloqueado]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Infraestructura y entrega segura se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Infraestructura y entrega segura | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses infraestructura y entrega segura por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: infraestructura y entrega segura funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Infraestructura y entrega segura existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve infraestructura y entrega segura en tu contexto?
2. ¿Cómo sabrías que infraestructura y entrega segura no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar infraestructura y entrega segura?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
  A[Build de la imagen] --> B[Escaneo y SBOM]
  B --> C[cosign sign con clave del pipeline]
  C --> D[(Registro de imagenes)]
  D --> E{cosign verify antes del deploy}
  E -->|firma valida| F[kubectl apply en rutaflow-envios]
  E -->|firma invalida o ausente| G[Deploy bloqueado]
```

```bash
kind create cluster --name rutaflow   # crea el contexto kubectl kind-rutaflow
mkdir -p rutaflow-labs/tema-1-infraestructura-y-entrega-segura
cd rutaflow-labs/tema-1-infraestructura-y-entrega-segura
```

```hcl
# main.tf — infraestructura mínima de api-envios en Kubernetes
terraform {
  required_providers {
    kubernetes = {
      source = "hashicorp/kubernetes"
    }
  }
}

provider "kubernetes" {
  config_path    = "~/.kube/config"
  config_context = "kind-rutaflow"
}

resource "kubernetes_namespace" "rutaflow" {
  metadata {
    name = "rutaflow-envios"
  }
}

resource "kubernetes_deployment" "api_envios" {
  metadata {
    name      = "api-envios"
    namespace = kubernetes_namespace.rutaflow.metadata[0].name
  }

  spec {
    replicas = 2

    selector {
      match_labels = { app = "api-envios" }
    }

    template {
      metadata {
        labels = { app = "api-envios" }
      }
      spec {
        container {
          name  = "api-envios"
          image = "registry.rutaflow.dev/api-envios:1.4.2"
        }
      }
    }
  }
}
```

```bash
terraform init
terraform plan -out=plan.tfplan
```

```bash
# ci-firmar.sh — corre en CI, no en el despliegue
set -euo pipefail
docker build -t registry.rutaflow.dev/api-envios:1.4.2 .
docker push registry.rutaflow.dev/api-envios:1.4.2
IMAGE=$(docker inspect --format '{{index .RepoDigests 0}}' registry.rutaflow.dev/api-envios:1.4.2)
cosign sign --key cosign.key "$IMAGE"   # firma registry.rutaflow.dev/api-envios@sha256:...
echo "$IMAGE" > imagen-firmada.txt      # el despliegue recibe este valor
```

```bash
#!/usr/bin/env bash
set -euo pipefail
IMAGE="registry.rutaflow.dev/api-envios:1.4.2"
kubectl set image deployment/api-envios \
  api-envios="$IMAGE" -n rutaflow-envios          # BUG: tag mutable y sin verificar la firma
echo "Desplegado $IMAGE"
```

</details>

### Tema 2: SLO y respuesta a incidentes · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás construir y verificar Tema 2: SLO y respuesta a incidentes dentro de RutaFlow, definiendo un SLO concreto para /envios/:id y configurando readinessProbe/livenessProbe con semántica distinta. Conocimiento previo: terminal, Git, YAML de Kubernetes y lectura de m…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás construir y verificar Tema 2: SLO y respuesta a incidentes dentro de RutaFlow, definiendo un SLO concreto para /envios/:id y configurando readinessProbe/livenessProbe con semántica distinta.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en slo y respuesta a incidentes como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
  A["Pod sirviendo tráfico"] --> B["readinessProbe"]
  B -->|"falla puntual"| C["sale del Service, sigue vivo"]
  C --> D["reingresa al recuperarse"]
  A --> E["livenessProbe con el mismo endpoint y umbral"]
  E -->|"falla por lentitud"| F["Kubernetes reinicia el pod"]
  F --> G["pod nuevo en frío, sin caché"]
  G --> E
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| SLO y respuesta a incidentes se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar SLO y respuesta a incidentes | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses slo y respuesta a incidentes por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: slo y respuesta a incidentes funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- SLO y respuesta a incidentes existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve slo y respuesta a incidentes en tu contexto?
2. ¿Cómo sabrías que slo y respuesta a incidentes no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar slo y respuesta a incidentes?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
  A["Pod sirviendo tráfico"] --> B["readinessProbe"]
  B -->|"falla puntual"| C["sale del Service, sigue vivo"]
  C --> D["reingresa al recuperarse"]
  A --> E["livenessProbe con el mismo endpoint y umbral"]
  E -->|"falla por lentitud"| F["Kubernetes reinicia el pod"]
  F --> G["pod nuevo en frío, sin caché"]
  G --> E
```

```bash
mkdir -p rutaflow-labs/tema-2-slo-y-respuesta-a-incidentes
cd rutaflow-labs/tema-2-slo-y-respuesta-a-incidentes
```

```text
SLO: 99.9% de las peticiones a GET /envios/:id responden en menos de 300 ms,
medido sobre una ventana móvil de 30 días.
Presupuesto de error: 0.1% de peticiones pueden exceder 300 ms o fallar
antes de que se dispare una alerta de burn rate acelerado.
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-envios
  namespace: rutaflow-envios
spec:
  template:
    spec:
      containers:
        - name: api-envios
          image: registry.rutaflow.dev/api-envios:1.4.2
          readinessProbe:
            httpGet: { path: /envios/health, port: 8080 }
            periodSeconds: 5
            timeoutSeconds: 1
            failureThreshold: 2
          livenessProbe:               # BUG: idéntica a la readiness
            httpGet: { path: /envios/health, port: 8080 }
            periodSeconds: 5
            timeoutSeconds: 1
            failureThreshold: 2
```

```yaml
          readinessProbe:
            httpGet: { path: /envios/health, port: 8080 }
            periodSeconds: 5
            timeoutSeconds: 1
            failureThreshold: 2
          livenessProbe:               # FIX: solo pregunta "¿el proceso sigue vivo?"
            httpGet: { path: /envios/vivo, port: 8080 }   # no toca la base de datos
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 5
```

</details>

### Tema 3: Pruebas end-to-end del sistema completo (app ↔ backend) · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás escribir una prueba end-to-end que ejercite el flujo real cruzando la app (Flutter) y el backend (Spring Boot): login → crear entrega → asignar repartidor → confirmar, contra servicios reales levantados con Docker. Prerrequisitos: Temas 1-2 de este módulo; tes…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás escribir una prueba end-to-end que ejercite el flujo real cruzando la app (Flutter) y el backend (Spring Boot): login → crear entrega → asignar repartidor → confirmar, contra servicios reales levantados con Docker.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en pruebas end-to-end del sistema completo (app ↔ backend) como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que pruebas end-to-end del sistema completo (app ↔ backend) resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Pruebas end-to-end del sistema completo (app ↔ backend) se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Pruebas end-to-end del sistema completo (app ↔ backend) | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses pruebas end-to-end del sistema completo (app ↔ backend) por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: pruebas end-to-end del sistema completo (app ↔ backend) funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Pruebas end-to-end del sistema completo (app ↔ backend) existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve pruebas end-to-end del sistema completo (app ↔ backend) en tu contexto?
2. ¿Cómo sabrías que pruebas end-to-end del sistema completo (app ↔ backend) no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar pruebas end-to-end del sistema completo (app ↔ backend)?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# Recorre login -> crear -> confirmar por HTTP real contra un PostgreSQL efímero
./mvnw test -Dtest=FlujoEntregaE2ETest
```

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
@Testcontainers
class FlujoEntregaE2ETest {
    @Container @ServiceConnection static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:16");
    @Autowired TestRestTemplate http;

    @Test
    void flujoCompletoDeEntrega() {
        // 1. Login: obtiene el token (igual que haría la app Flutter)
        var login = http.postForEntity("/api/auth/login",
            Map.of("email", "ana@rutaflow.dev", "password", "clave-larga-segura"), Map.class);
        String token = (String) login.getBody().get("token");

        // 2. Crear entrega con el token (contrato real que consume la app)
        var headers = new HttpHeaders();
        headers.setBearerAuth(token);
        var crear = http.exchange("/api/entregas", HttpMethod.POST,
            new HttpEntity<>(Map.of("guia", "RF-9001"), headers), Map.class);
        assertThat(crear.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        // 3. Confirmar entrega y verificar el estado final
        var confirmar = http.exchange("/api/entregas/RF-9001/confirmar", HttpMethod.POST,
            new HttpEntity<>(headers), Map.class);
        assertThat(confirmar.getBody().get("estado")).isEqualTo("ENTREGADA");
    }
}
```

</details>

### Tema 4: Continuidad, costes y proyecto final · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás construir y verificar Tema 3: Continuidad, costes y proyecto final dentro de RutaFlow, probando un backup real de las tablas de envíos mediante una restauración completa en una base vacía. Conocimiento previo: terminal, Git, psql/pg_dump básico.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás construir y verificar Tema 3: Continuidad, costes y proyecto final dentro de RutaFlow, probando un backup real de las tablas de envíos mediante una restauración completa en una base vacía.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en continuidad, costes y proyecto final como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  A[pg_dump de envios y envio_eventos] --> B[(Archivo backup-envios.sql)]
  B --> C[Restore en base nueva y vacia]
  C --> D{Conteo de filas origen vs restaurado}
  D -->|coincide| E[Backup verificado]
  D -->|no coincide| F[Backup inutil: nadie lo habia probado]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Continuidad, costes y proyecto final se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Continuidad, costes y proyecto final | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses continuidad, costes y proyecto final por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: continuidad, costes y proyecto final funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Continuidad, costes y proyecto final existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve continuidad, costes y proyecto final en tu contexto?
2. ¿Cómo sabrías que continuidad, costes y proyecto final no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar continuidad, costes y proyecto final?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
  A[pg_dump de envios y envio_eventos] --> B[(Archivo backup-envios.sql)]
  B --> C[Restore en base nueva y vacia]
  C --> D{Conteo de filas origen vs restaurado}
  D -->|coincide| E[Backup verificado]
  D -->|no coincide| F[Backup inutil: nadie lo habia probado]
```

```bash
mkdir ejemplo && cd ejemplo
```

```bash
#!/usr/bin/env bash
set -euo pipefail
umask 077

archivo=${1:?"Uso: bash backup_verified.sh backup-envios.dump"}
[[ -n "${DATABASE_URL:-}" ]] || { echo 'Define DATABASE_URL' >&2; exit 2; }
[[ ! -e "$archivo" ]] || { echo "No se sobrescribe $archivo" >&2; exit 2; }

lab_dir=$(mktemp -d)
restore_db="rutaflow_restore_$(date +%s)_$$"
restore_created=false
cleanup() {
  if [[ "$restore_created" == true ]]; then dropdb "$restore_db"; fi
  rm -rf "$lab_dir"
}
trap cleanup EXIT

for tabla in envios envio_eventos; do
  psql -X -At -v ON_ERROR_STOP=1 "$DATABASE_URL" \
    -c "SELECT * FROM $tabla ORDER BY 1" > "$lab_dir/$tabla.origen"
done
pg_dump --format=custom "$DATABASE_URL" > "$archivo"
createdb --template=template0 "$restore_db"
restore_created=true
pg_restore --exit-on-error --no-owner --no-privileges \
  --dbname="$restore_db" "$archivo"
for tabla in envios envio_eventos; do
  psql -X -At -v ON_ERROR_STOP=1 "$restore_db" \
    -c "SELECT * FROM $tabla ORDER BY 1" > "$lab_dir/$tabla.restaurada"
  diff -u "$lab_dir/$tabla.origen" "$lab_dir/$tabla.restaurada"
done
printf '%s\n' 'OK: envios y envio_eventos restaurados y comparados'
```

```bash
# Usa autenticación local configurada; no guardes contraseñas en Git.
export PGHOST=localhost PGPORT=5432 PGUSER=postgres
export DATABASE_URL=postgresql://postgres@localhost:5432/rutaflow_lab
bash backup_verified.sh backup-envios.dump
```

```bash
set -euo pipefail
lab_dir=$(mktemp -d)
empty_db="rutaflow_empty_$(date +%s)_$$"
empty_created=false
cleanup_empty() {
  if [ "$empty_created" = true ]; then dropdb "$empty_db"; fi
  rm -rf "$lab_dir"
}
trap cleanup_empty EXIT
pg_dump --schema-only --no-owner --no-privileges "$DATABASE_URL" > "$lab_dir/schema.sql"
createdb --template=template0 "$empty_db"
empty_created=true
psql -X -v ON_ERROR_STOP=1 "$empty_db" -f "$lab_dir/schema.sql"
pg_dump --format=custom "$empty_db" > "$lab_dir/wrong-origin.dump"
original_count=$(psql -X -At -v ON_ERROR_STOP=1 "$DATABASE_URL" -c 'SELECT count(*) FROM envios')
empty_count=$(psql -X -At -v ON_ERROR_STOP=1 "$empty_db" -c 'SELECT count(*) FROM envios')
if [ "$original_count" -gt 0 ] && [ "$empty_count" -eq 0 ]; then
  echo 'FALLO REPRODUCIDO: dump válido del origen equivocado'
else
  echo 'Revisa los datos de preparación: el origen debe contener envíos' >&2
  exit 1
fi
```

</details>
