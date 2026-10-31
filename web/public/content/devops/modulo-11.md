# Módulo 11: Seguridad DevSecOps


## Aprende construyendo

### Tema 1: Escaneo de imágenes y dependencias (Trivy, Snyk)

#### Paso 1 · Objetivo y preparación

Al finalizar podrás escanear una imagen Docker propia con Trivy, leer su reporte de CVEs por severidad, y decidir con criterio cuáles atender primero.

**Conocimiento previo:** Docker e imágenes base (Módulo 2 de este track).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** El software moderno depende de una cadena enorme de dependencias de terceros, cada una potencialmente introduciendo vulnerabilidades que el equipo nunca escribió directamente; ignorar esta superficie de riesgo es una de las causas más comunes de brechas de seguridad reales, muchas de las cuales explotan vulnerabilidades ya conocidas y con corrección disponible, simplemente no aplicada a tiempo.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** CVE (vulnerabilidad conocida), escaneo de sistema operativo base, escaneo de dependencias de aplicación, severidad (crítica, alta, media, baja).

Una CVE (Common Vulnerabilities and Exposures) es una vulnerabilidad de seguridad conocida y catalogada públicamente, identificada por un código único. Trivy escanea tanto el sistema operativo base de una imagen (heredado de la imagen base del Módulo 2) como las dependencias de aplicación empaquetadas (npm, pip, Maven), comparando cada versión instalada contra bases de datos de vulnerabilidades conocidas.

Este escaneo conecta directamente con la elección de imagen base: una imagen completa presenta una superficie mucho mayor de posibles vulnerabilidades detectables que una imagen Alpine o distroless minimalista, que al contener menos software instalado reduce proporcionalmente cuántas vulnerabilidades potenciales existen.

Una CVE reportada no significa automáticamente que tu aplicación esté explotable a través de ella: una CVE en una librería que tu código nunca invoca de la forma vulnerable puede representar un riesgo real menor que su severidad catalogada sugeriría de forma aislada, lo que requiere criterio humano al priorizar la respuesta.

**Analogía:** escanear una imagen con Trivy es como hacer una inspección de seguridad exhaustiva de un edificio antes de habitarlo, comparando cada componente instalado contra una base de datos de defectos de fabricación conocidos, y recibiendo un informe priorizado de qué corregir antes de mudarse.

**Diagrama:**

```
┌──────────────────────────┐
│ docker build → mi-api:1.0   │
└──────────┬───────────────┘
           │
┌──────────▼───────────────┐
│ trivy image mi-api:1.0        │
│ compara paquetes vs CVEs      │
└──────────┬───────────────┘
           │
   ┌───────┴────────┐
   ▼                 ▼
┌─────────┐    ┌──────────────────┐
│ Sin críticas │    │ Vulnerabilidades  │
└─────────┘    │ (por severidad)      │
                 └──────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo11/escaneo-imagen` con una imagen mínima para escanear:

```bash
mkdir -p academia-devops/src/modulo11/escaneo-imagen
cd academia-devops/src/modulo11/escaneo-imagen
cat > Dockerfile <<'EOF'
FROM node:18.19.0-alpine3.18
WORKDIR /app
COPY package.json .
CMD ["node", "-e", "console.log('mi-api activa')"]
EOF
cat > package.json <<'EOF'
{ "name": "mi-api", "version": "1.0.0", "dependencies": { "lodash": "4.17.15" } }
EOF
docker build -t mi-api:1.0 .
docker run --rm aquasec/trivy:0.55.0 --version
```

**Explicación línea por línea:** `--version` es la bandera que confirma qué versión de Trivy está corriendo, sin escanear nada todavía; se fija deliberadamente una versión antigua de `node:18-alpine` y de `lodash` (4.17.15, con CVEs conocidas y corregidas en versiones posteriores) para que el escaneo tenga contenido real que reportar, en vez de una imagen ya limpia sin ningún hallazgo.

Escanea la imagen construida y filtra por severidad:

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:0.55.0 image --severity CRITICAL,HIGH --format table mi-api:1.0
```

`--severity` es la bandera que filtra el reporte a solo los niveles indicados (`CRITICAL,HIGH`), dejando fuera hallazgos de severidad baja o media.

**Resultado esperado:** un reporte tabular que lista cada CVE encontrada en `lodash@4.17.15` o en las librerías del sistema de la imagen base, con la versión instalada, la versión donde se corrigió (si existe), y su severidad clasificada, permitiendo priorizar cuáles atender primero.

**Fallo deliberado:** ejecuta el mismo escaneo contra una etiqueta de imagen que no existe localmente ni en ningún registry (`mi-api:9.9-inexistente`). Trivy falla reportando que no puede resolver ni encontrar esa imagen — diagnostica confirmando que Trivy necesita una imagen ya construida (local o remota) para escanear; no puede inventar un reporte sobre una imagen que no existe en ningún lado.

#### Paso 5 · Práctica guiada

Actualiza `package.json` para fijar `lodash` a una versión reciente sin CVEs conocidas críticas, reconstruye la imagen, y confirma con un nuevo escaneo que el hallazgo específico de esa dependencia desaparece del reporte. **Pista:** compara el reporte "antes" y "después" línea por línea para confirmar exactamente qué cambió.

#### Paso 6 · Práctica independiente

Repite el escaneo comparando la imagen `node:18-alpine` (Módulo 2, imagen minimalista) contra `node:18` (imagen completa, sin `-alpine`) usando la misma aplicación, y documenta cuántas vulnerabilidades adicionales reporta la imagen completa solo por el software adicional instalado en su sistema base.

#### Paso 7 · Cierre

Ya escaneas imágenes propias y priorizas hallazgos por severidad con criterio, en vez de tratar cada CVE como igualmente urgente. El siguiente tema integra este escaneo como un paso automático del pipeline. Fuente oficial: [Trivy — Vulnerability Scanning](https://trivy.dev/latest/docs/scanner/vulnerability/).

**Errores comunes:** tratar cada CVE reportada como igualmente urgente sin revisar si el componente afectado realmente se usa de forma vulnerable en la aplicación; escanear solo una vez de forma manual y nunca repetir el escaneo cuando se publican nuevas CVEs para las mismas dependencias ya instaladas.

**Cuándo no usarlo:** para una imagen que nunca se despliega ni se expone a ningún tráfico real (por ejemplo, una herramienta interna de un solo uso ejecutada localmente y descartada), el coste de mantener un proceso de escaneo formal puede no justificarse; el valor aparece cuando la imagen se despliega y se mantiene en el tiempo.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Escanea exactamente la imagen que se desplegará y conserva el reporte con su digest. Revisa una vulnerabilidad detectada y documenta corrección o excepción con responsable y vencimiento.

### Tema 2: Integración en el pipeline

#### Paso 1 · Objetivo y preparación

Al finalizar podrás integrar Trivy como un gate obligatorio del pipeline de CI que bloquea el pipeline ante vulnerabilidades críticas.

**Conocimiento previo:** Tema 1 de este módulo; pipelines de CI (Módulo 4 de este track).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Igual que con CI obligatorio en general, convertir el escaneo de seguridad en una regla técnica del pipeline —no una práctica opcional dependiente de memoria individual— es lo que garantiza que ninguna imagen con vulnerabilidades críticas conocidas llegue a producción sin que alguien haya tenido la oportunidad explícita de revisarla.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** escaneo como gate obligatorio, código de salida distinto de cero, bloqueo de merge por vulnerabilidad crítica.

`--exit-code` es la bandera que fija con qué código termina Trivy si encuentra hallazgos (`1` en vez del `0` normal), y `--severity` es la bandera que filtra qué niveles de severidad cuentan para ese fallo; juntas, `trivy image --exit-code 1 --severity CRITICAL` configuran a Trivy para terminar con código de salida distinto de cero si encuentra al menos una vulnerabilidad crítica, aplicando el mismo mecanismo de "un comando que falla detiene el pipeline" que ya usaste para tests y linting en el Módulo 4. Calibrar el umbral de severidad (`CRITICAL` en vez de incluir también `MEDIUM`/`LOW`) evita la misma fatiga de alertas mal calibradas que ya estudiaste en observabilidad (Módulo 9).

**Analogía:** ejecutar un escaneo manualmente de vez en cuando es como una revisión de seguridad de un edificio solo cuando alguien se acuerda de programarla. Integrarlo como gate obligatorio es instalar un sistema de inspección automática que revisa cada nueva construcción antes de ocuparla, sin depender de que un inspector humano lo recuerde.

**Diagrama:**

```
┌──────────────────────────────────┐
│ Pipeline CI                          │
│  ├── job "test" (lint, tests)          │
│  ├── job "build" (construye imagen)     │
│  └── job "escaneo-seguridad"              │
│        trivy --exit-code 1 --severity CRITICAL │
└──────────┬───────────────────────┘
           │ ¿crítica encontrada?
      ┌────┴────┐
      ▼           ▼
    Sí          No
 job falla    continúa hacia despliegue
 PR bloqueado
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo11/gate-pipeline` reutilizando la imagen vulnerable del Tema 1 dentro de un workflow real:

```bash
mkdir -p academia-devops/src/modulo11/gate-pipeline/.github/workflows
cd academia-devops/src/modulo11/gate-pipeline
cat > .github/workflows/seguridad.yml <<'EOF'
name: Seguridad
on: [pull_request]
jobs:
  escaneo-seguridad:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Construir imagen
        run: docker build -t mi-api:${{ github.sha }} .
      - name: Escanear con Trivy (gate obligatorio)
        run: |
          docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
            aquasec/trivy:0.55.0 image --exit-code 1 --severity CRITICAL mi-api:${{ github.sha }}
EOF
python3 -c "import yaml; d = yaml.safe_load(open('.github/workflows/seguridad.yml')); print('jobs:', list(d['jobs'].keys()))"
```

**Explicación línea por línea:** la etiqueta `mi-api:${{ github.sha }}` (el hash del commit exacto) asegura trazabilidad exacta entre qué código generó qué imagen y qué resultado de escaneo corresponde a esa combinación específica, en vez de reescanear repetidamente una etiqueta genérica como `latest`.

Simula localmente el mismo gate contra la imagen vulnerable del Tema 1:

```bash
cd ../escaneo-imagen
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:0.55.0 image --exit-code 1 --severity CRITICAL mi-api:1.0
echo "código de salida: $?"
```

**Resultado esperado:** si la imagen tiene al menos una CVE crítica, el comando termina con código de salida `1` (visible en `echo $?`), exactamente el mismo mecanismo que haría fallar el job de CI y bloquear el merge del pull request.

**Fallo deliberado:** cambia `--severity CRITICAL` por `--severity LOW` en el mismo comando contra la misma imagen. El comando probablemente también falla, pero ahora por hallazgos de severidad baja que no ameritan bloquear un despliegue — diagnostica revisando el reporte: bloquear por severidad baja generaría fricción constante sin beneficio proporcional, confirmando por qué calibrar el umbral correctamente es una decisión deliberada, no un valor arbitrario.

#### Paso 5 · Práctica guiada

Agrega al mismo workflow un segundo step que solo se ejecute si el escaneo fue exitoso (usando `if: success()`), simulando un step de "publicar imagen" posterior al gate de seguridad. **Pista:** GitHub Actions ejecuta los steps de un job en orden secuencial, deteniéndose en el primero que falla salvo que se indique lo contrario explícitamente.

#### Paso 6 · Práctica independiente

Agrega un segundo umbral de severidad (`HIGH`) que solo genere una advertencia sin bloquear el pipeline (usando `continue-on-error: true` en ese step específico), documentando la diferencia entre un hallazgo que bloquea y uno que solo notifica.

#### Paso 7 · Cierre

Ya conviertes el escaneo de seguridad en un gate automático y obligatorio del pipeline, eliminando la dependencia de que alguien lo ejecute manualmente. El siguiente tema aborda cómo gestionar secretos de forma segura dentro de ese mismo pipeline. Fuente oficial: [Trivy Action — repositorio oficial](https://github.com/aquasecurity/trivy-action).

**Errores comunes:** bloquear el pipeline ante cualquier severidad (incluyendo baja/media) generando fricción y fatiga de alertas; escanear una etiqueta genérica como `latest` en vez de la imagen exacta del commit, perdiendo trazabilidad precisa.

**Cuándo no usarlo:** en un pipeline de un proyecto experimental sin intención de desplegarse nunca a un entorno real, el coste de mantener este gate puede no justificarse; se vuelve indispensable en cuanto existe un despliegue real hacia cualquier entorno accesible.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Introduce un hallazgo conocido en una rama de laboratorio y comprueba que la política del pipeline bloquea la publicación. Evita que una herramienta fallida se interprete como ausencia de vulnerabilidades.

### Tema 3: Gestión de secretos (Vault, SOPS)

#### Paso 1 · Objetivo y preparación

Al finalizar podrás explicar por qué hardcodear un secreto es un antipatrón y cómo Vault y SOPS resuelven la inyección segura de secretos en runtime.

**Conocimiento previo:** `.env` y variables de entorno (Módulo 3 de este track).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Los secretos hardcodeados o mal gestionados son, de forma consistente, una de las causas más citadas de incidentes de seguridad reales; adoptar desde el inicio la disciplina de nunca hardcodear secretos es una práctica de bajo coste de adopción temprana y de alto coste de corrección tardía.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** secreto hardcodeado (antipatrón), inyección en runtime, cifrado en reposo, auditoría de acceso.

Hardcodear un secreto directamente en el código (`const apiKey = "sk-abc123";`) queda expuesto en el historial de Git para siempre, recuperable incluso después de eliminarlo en un commit posterior, exactamente el mismo problema que estudiaste con `.env` filtrado en el Módulo 3. La alternativa correcta es inyectarlo en runtime desde una fuente externa (`process.env.API_KEY`, poblada por el sistema de despliegue). Vault cifra los secretos en reposo, controla el acceso mediante políticas (el mismo principio de mínimo privilegio de IAM/RBAC) y mantiene auditoría de quién accedió a qué secreto y cuándo. SOPS cifra archivos completos de configuración para versionarlos de forma segura directamente en Git, descifrándose solo en el momento y lugar correctos.

**Analogía:** hardcodear un secreto es como escribir la combinación de tu caja fuerte en un cartel pegado en tu puerta. Vault es una caja fuerte profesional que registra exactamente quién solicitó acceso y cuándo, entregando la combinación solo a quienes están autorizados.

**Diagrama:**

```
┌── NUNCA ──────────────────────┐   ┌── SIEMPRE ──────────────────────┐
│ const apiKey = "sk-abc123";        │   │ const apiKey = process.env.API_KEY; │
│ hardcodeado, expuesto en Git para siempre │   │ inyectado en runtime desde Vault/SOPS,  │
│                                              │   │ con cifrado y auditoría de acceso        │
└─────────────────────────┘   └─────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo11/gestion-secretos` y levanta Vault en modo desarrollo:

```bash
mkdir -p academia-devops/src/modulo11/gestion-secretos
cd academia-devops/src/modulo11/gestion-secretos
docker run -d --name vault-dev --cap-add=IPC_LOCK \
  -e 'VAULT_DEV_ROOT_TOKEN_ID=token-academia' -p 8200:8200 hashicorp/vault:1.17
sleep 5
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='token-academia'
docker exec -e VAULT_ADDR -e VAULT_TOKEN vault-dev \
  vault kv put secret/mi-api api_key="sk-real-gestionado-por-vault"
```

**Explicación línea por línea:** `--cap-add=IPC_LOCK` es la bandera que le da al contenedor un permiso de kernel específico que Vault necesita para bloquear su memoria y evitar que los secretos se escriban al disco de swap; `VAULT_DEV_ROOT_TOKEN_ID` fija un token conocido solo para este laboratorio (Vault en producción nunca usaría un token fijo así); `vault` es el comando que gestiona secretos en HashiCorp Vault, y `vault kv put` almacena el secreto cifrado en reposo dentro de Vault, en vez de escribirlo en ningún archivo de código versionado.

Lee el secreto de vuelta simulando cómo la aplicación lo obtendría en runtime, y confirma que no existe en ningún archivo del proyecto:

```bash
docker exec -e VAULT_ADDR -e VAULT_TOKEN vault-dev vault kv get -field=api_key secret/mi-api
grep -r "sk-real-gestionado-por-vault" . 2>/dev/null || echo "no encontrado en ningún archivo versionado"
```

**Resultado esperado:** el comando `vault kv get` recupera exitosamente el valor del secreto en runtime; el `grep` sobre los archivos del proyecto no encuentra ninguna coincidencia, confirmando que el secreto nunca existió como texto plano en ningún archivo versionable.

**Fallo deliberado:** intenta leer el mismo secreto sin exportar `VAULT_TOKEN` (`docker exec vault-dev vault kv get -field=api_key secret/mi-api`, sin las variables `-e`). El comando falla con un error de permiso/autenticación — diagnostica confirmando que Vault exige un token válido para cada acceso, quedando ese intento (exitoso o fallido) registrado en su auditoría, exactamente el control de acceso que un secreto hardcodeado en texto plano nunca tendría.

#### Paso 5 · Práctica guiada

Almacena un segundo secreto distinto (por ejemplo, una contraseña de base de datos simulada) bajo una ruta distinta (`secret/mi-api-db`) y confirma que puedes leer ambos secretos de forma independiente. **Pista:** Vault organiza los secretos en rutas jerárquicas, similar a un sistema de archivos.

#### Paso 6 · Práctica independiente

Detén el contenedor `vault-dev` (`docker stop vault-dev`) e intenta leer el secreto nuevamente; documenta qué comportamiento esperarías de una aplicación real si Vault estuviera temporalmente inaccesible durante su arranque, y por qué eso es preferible a que la aplicación tuviera el secreto hardcodeado como alternativa de respaldo.

#### Paso 7 · Cierre

Ya distingues por qué un secreto hardcodeado es un antipatrón grave y cómo Vault provee inyección segura con auditoría. El siguiente tema aplica el mismo principio de mínimo privilegio a las credenciales del propio pipeline de CI/CD. Fuente oficial: [HashiCorp Vault — Secrets Engines](https://developer.hashicorp.com/vault/docs/secrets).

**Errores comunes:** hardcodear un secreto "temporalmente" durante desarrollo y olvidar removerlo antes de hacer commit; almacenar el token raíz de Vault (u otro secreto maestro) con el mismo nivel de protección que un secreto de aplicación individual.

**Cuándo no usarlo:** para un proyecto personal sin ningún dato ni credencial real sensible, levantar Vault completo puede ser una sobre-ingeniería; los Secrets nativos de la plataforma de CI/CD suelen ser suficientes en ese contexto.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Entrega una credencial al servicio desde el mecanismo de secretos elegido. Rótala y verifica acceso con la nueva versión sin guardarla en artefactos, logs ni historial del repositorio.

### Tema 4: Menor privilegio en CI/CD

#### Paso 1 · Objetivo y preparación

Al finalizar podrás acotar los permisos de un token de pipeline al mínimo necesario para su tarea específica, y explicar por qué esto limita el daño ante una filtración.

**Conocimiento previo:** IAM (track Cloud) y RBAC de Kubernetes (Módulo 6 de este track).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Los pipelines de CI/CD son cada vez más un objetivo atractivo de ataques dirigidos precisamente porque suelen tener acceso amplio y automatizado a infraestructura crítica; aplicar mínimo privilegio a sus credenciales es una de las defensas más directas contra que un pipeline comprometido se convierta en la puerta de entrada a un compromiso mucho más amplio.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** token de pipeline, permisos acotados por tarea, radio de exposición ante filtración, identidad federada de corta duración.

El token que un pipeline usa para desplegar, publicar imágenes o aplicar Terraform es uno de los activos más sensibles del sistema de entrega: si se filtra, el daño potencial depende directamente de cuán amplios sean sus permisos concedidos. Aplicar mínimo privilegio sigue el mismo principio que IAM y RBAC: un token de despliegue no debería tener permisos de administrador sobre toda la infraestructura, solo los permisos exactos para su tarea acotada. Un patrón más avanzado usa identidades federadas de corta duración (OIDC) en vez de credenciales de larga duración almacenadas como secretos.

**Analogía:** el token de un pipeline es como la llave maestra de un servicio de limpieza: una llave que abre todo el edificio, si se pierde o se copia, expone todo; una llave acotada solo a las puertas necesarias limita el riesgo a esas áreas específicas.

**Diagrama:**

```
┌── Token con permisos amplios ────┐   ┌── Token con mínimo privilegio ──────┐
│ Administrador de TODA la infra      │   │ Solo: actualizar Deployment "mi-api" │
│ Si se filtra: daño MÁXIMO             │   │ en namespace "produccion"                │
└─────────────────────────┘   │ Si se filtra: daño ACOTADO                  │
                                        └─────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo11/minimo-privilegio` y compara dos RoleBinding de Kubernetes (retomando el RBAC del Módulo 7) representando un token amplio frente a uno acotado:

```bash
mkdir -p academia-devops/src/modulo11/minimo-privilegio
cd academia-devops/src/modulo11/minimo-privilegio
cat > pipeline-amplio.yaml <<'EOF'
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: pipeline-cluster-admin
subjects:
  - kind: ServiceAccount
    name: pipeline-ci
    namespace: default
roleRef:
  kind: ClusterRole
  name: cluster-admin
  apiGroup: rbac.authorization.k8s.io
EOF
cat > pipeline-acotado.yaml <<'EOF'
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pipeline-desplegar-mi-api
  namespace: produccion
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    resourceNames: ["mi-api"]
    verbs: ["get", "update", "patch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: pipeline-desplegar-mi-api-binding
  namespace: produccion
subjects:
  - kind: ServiceAccount
    name: pipeline-ci
    namespace: default
roleRef:
  kind: Role
  name: pipeline-desplegar-mi-api
  apiGroup: rbac.authorization.k8s.io
EOF
python3 -c "
import yaml
docs_amplio = list(yaml.safe_load_all(open('pipeline-amplio.yaml')))
docs_acotado = list(yaml.safe_load_all(open('pipeline-acotado.yaml')))
print('amplio:', docs_amplio[0]['roleRef']['name'])
print('acotado, verbos:', docs_acotado[0]['rules'][0]['verbs'], 'recurso:', docs_acotado[0]['rules'][0]['resourceNames'])
"
```

**Ejecuta el ejemplo** (desde una terminal con las herramientas instaladas):

```bash
bash ejemplo.sh
```
Verifica la salida y el estado de los recursos creados.


**Explicación línea por línea:** `pipeline-amplio.yaml` vincula el ServiceAccount `pipeline-ci` al `ClusterRole` predefinido `cluster-admin` (control total del clúster); `pipeline-acotado.yaml` define un `Role` que solo permite `get/update/patch` sobre el `Deployment` específico llamado `mi-api`, dentro del namespace `produccion` únicamente.

Simula la verificación de permisos que un clúster real haría con `kubectl auth can-i` (documentando el resultado esperado ya que no hay clúster real disponible en este entorno):

```bash
echo "kubectl auth can-i delete namespaces --as=system:serviceaccount:default:pipeline-ci"
echo "-> con pipeline-amplio.yaml: yes (cluster-admin permite todo)"
echo "-> con pipeline-acotado.yaml: no (el Role solo permite deployments específicos)"
```

**Resultado esperado:** con el binding acotado, el token del pipeline solo puede actualizar el Deployment `mi-api` en `produccion`; cualquier otra acción (borrar namespaces, leer Secrets de otros servicios, modificar otros Deployments) queda explícitamente denegada por RBAC.

**Fallo deliberado:** intenta usar el token acotado (`pipeline-acotado.yaml`) para una tarea fuera de su alcance, como actualizar un Deployment llamado `otro-servicio` en vez de `mi-api` (cambia mentalmente `resourceNames` para verificarlo). La API de Kubernetes denegaría la petición con un error de permisos — diagnostica confirmando que el `resourceNames` acota el Role a un recurso específico por nombre, no a todo el tipo de recurso.

#### Paso 5 · Práctica guiada

Agrega un segundo recurso permitido al `Role` acotado (por ejemplo, permiso de lectura sobre `pods` para poder verificar el estado del despliegue tras aplicarlo) y confirma que sigues sin otorgar ningún permiso de escritura sobre recursos no relacionados. **Pista:** agrega permisos incrementalmente, solo cuando confirmes que un step específico del pipeline realmente los necesita.

#### Paso 6 · Práctica independiente

Investiga y documenta en una frase cómo OIDC permite a un pipeline de GitHub Actions obtener credenciales temporales de un proveedor de nube sin almacenar ningún secreto de larga duración en la configuración de CI, comparando ese enfoque con almacenar una clave de acceso permanente como secreto.

#### Paso 7 · Cierre

Ya acotas los permisos de un token de pipeline al mínimo necesario, limitando el radio de daño ante una filtración. El siguiente tema cubre el inventario de dependencias (SBOM) que complementa este conjunto de defensas de la cadena de suministro. Fuente oficial: [Kubernetes — Using RBAC Authorization](https://kubernetes.io/docs/reference/access-authn-authz/rbac/).

**Errores comunes:** conceder `cluster-admin` "temporalmente para probar" y olvidar revertirlo; no revisar periódicamente si los permisos concedidos siguen siendo realmente necesarios a medida que el pipeline evoluciona.

**Cuándo no usarlo:** en un clúster de laboratorio personal de un solo usuario sin ningún dato sensible, acotar permisos con este nivel de detalle aporta poco valor práctico inmediato; se vuelve indispensable en cualquier entorno compartido o de producción real.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Reduce el token del job de prueba a permisos de lectura. Comprueba que el despliegue autorizado usa una identidad distinta y que una contribución externa no puede obtener sus credenciales.

### Tema 5: SBOM y supply chain security

#### Paso 1 · Objetivo y preparación

Al finalizar podrás generar un SBOM de una imagen propia y explicar cómo acelera la respuesta ante una vulnerabilidad reportada en el ecosistema.

**Conocimiento previo:** Tema 1 de este módulo (Trivy).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** A medida que la cadena de suministro de software se vuelve un vector de ataque cada vez más relevante, mantener un inventario preciso mediante SBOMs generados automáticamente permite responder con velocidad ante vulnerabilidades reportadas en el ecosistema más amplio, en vez de depender de auditorías manuales lentas exactamente cuando la velocidad de respuesta más importa.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** SBOM (Software Bill of Materials), cadena de suministro de software, respuesta rápida ante vulnerabilidades de terceros.

Un SBOM es un inventario completo y estructurado de exactamente qué componentes —incluyendo dependencias directas e indirectas, con versión exacta— forman parte de una aplicación en un momento dado. Sin un SBOM ya generado, responder "¿usamos esa librería vulnerable, y en qué versión?" puede requerir una auditoría manual de días; con un SBOM generado automáticamente en cada build, esa pregunta se responde en minutos.

**Analogía:** un SBOM es la lista completa de ingredientes de un producto empaquetado, incluyendo aditivos de sus propios componentes. Si una autoridad anuncia que un aditivo específico está contaminado, un fabricante con listas precisas responde en minutos qué productos lo contienen.

**Diagrama:**

```
┌── SBOM generado en cada build ─────────┐
│ mi-api v1.2.3                              │
│  ├── express@4.18.2                          │
│  └── lodash@4.17.15 (versión con CVE)          │
└──────────┬──────────────────────────┘
           │ se reporta CVE crítica en lodash@4.17.15
           ▼
   Consulta rápida a SBOMs almacenados
           │
   ──▶ "mi-api v1.2.3 usa esa versión exacta" (minutos)
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea un proyecto nuevo `academia-devops/src/modulo11/sbom-demo` reutilizando la imagen ya construida `mi-api:1.0` (Tema 1) como base para generar su inventario:

```bash
mkdir -p academia-devops/src/modulo11/sbom-demo
cd academia-devops/src/modulo11/sbom-demo
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "$(pwd)":/salida \
  aquasec/trivy:0.55.0 image --format cyclonedx --output /salida/sbom.json mi-api:1.0
python3 -c "
import json
sbom = json.load(open('sbom.json'))
componentes = [c['name'] + '@' + c.get('version','?') for c in sbom.get('components', [])]
print('total componentes:', len(componentes))
print('lodash presente:', any('lodash' in c for c in componentes))
"
```

**Explicación línea por línea:** `--format cyclonedx` genera el SBOM en el formato estándar CycloneDX, `--output` es la bandera que fija el archivo donde escribir el resultado (`/salida/sbom.json`) en vez de imprimirlo por pantalla, y el script Python lo parsea confirmando cuántos componentes fueron inventariados y si `lodash` aparece listado con su versión exacta.

Simula la respuesta rápida ante una nueva CVE reportada, consultando el SBOM ya generado en vez de re-escanear todo:

```bash
python3 -c "
import json
sbom = json.load(open('sbom.json'))
cve_reportada_en = 'lodash'
afectados = [c['name'] + '@' + c.get('version','?') for c in sbom.get('components', []) if cve_reportada_en in c['name']]
print('Componentes afectados por una CVE en', cve_reportada_en, ':', afectados)
"
```

**Resultado esperado:** la consulta sobre el SBOM ya generado identifica en segundos que `mi-api` usa `lodash@4.17.15`, sin necesidad de re-escanear la imagen completa ni auditar manualmente el `package.json`.

**Fallo deliberado:** elimina el archivo `sbom.json` y ejecuta la misma consulta de "componentes afectados". El script falla con un error de archivo no encontrado — diagnostica confirmando que la velocidad de respuesta depende enteramente de tener el SBOM ya generado y almacenado de antemano; generarlo reactivamente después de que ya se reportó la vulnerabilidad pierde la ventaja de velocidad que es el propósito central de esta práctica.

#### Paso 5 · Práctica guiada

Genera un segundo SBOM después de actualizar `lodash` a una versión reciente (Tema 1, Paso 5) y compara ambos archivos `sbom.json` para confirmar que la versión del componente cambió. **Pista:** usa el mismo script Python de conteo de componentes sobre ambos archivos y compara sus versiones.

#### Paso 6 · Práctica independiente

Investiga qué formato de SBOM (CycloneDX o SPDX) usa o prefiere alguna herramienta que ya conozcas, y documenta en una frase la diferencia práctica principal entre ambos formatos estándar.

#### Paso 7 · Cierre

Ya generas un inventario preciso de dependencias que acelera drásticamente la respuesta ante vulnerabilidades reportadas en el ecosistema. El siguiente tema distingue tres categorías de análisis de seguridad que se complementan con todo lo visto hasta ahora. Fuente oficial: [CycloneDX — Software Bill of Materials Standard](https://cyclonedx.org/).

**Errores comunes:** generar el SBOM solo una vez de forma manual en vez de automatizarlo en cada build; almacenar el SBOM en un lugar no vinculado a la versión específica de la imagen que describe, perdiendo trazabilidad.

**Cuándo no usarlo:** para un script personal de un solo uso sin dependencias externas relevantes, generar un SBOM formal aporta poco valor; su beneficio aparece con aplicaciones desplegadas y mantenidas en el tiempo con dependencias reales.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Genera una SBOM del artefacto publicado y relaciónala con su digest. Busca una dependencia específica y demuestra que el inventario corresponde al binario desplegado, no solo al árbol del desarrollador.

### Tema 6: SAST, DAST y SCA — diferencias y herramientas

#### Paso 1 · Objetivo y preparación

Al finalizar podrás distinguir qué detecta cada una de SAST, DAST y SCA, y en qué punto del ciclo de desarrollo integrar cada una.

**Conocimiento previo:** Temas 1 y 5 de este módulo (SCA vía Trivy, SBOM); linting en CI (Módulo 4).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Ninguna de las tres categorías por sí sola cubre todo el espectro de riesgos de seguridad de una aplicación moderna; entender qué detecta cada una permite diseñar un programa de seguridad completo que combine las tres en los puntos correctos del ciclo de desarrollo.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** SAST (análisis estático), DAST (análisis dinámico), SCA (análisis de composición de software), OWASP ZAP.

SAST analiza el código fuente sin ejecutarlo, buscando patrones potencialmente vulnerables (inyección SQL, criptografía débil), típicamente integrado en CI como el linting del Módulo 4; puede generar falsos positivos y no detecta problemas que solo se manifiestan en ejecución real. DAST analiza una aplicación ya en ejecución enviándole peticiones automatizadas diseñadas para detectar comportamientos vulnerables (OWASP ZAP es la herramienta abierta más adoptada); detecta problemas reales de comportamiento pero solo prueba lo alcanzable durante esa sesión. SCA es el mismo análisis que Trivy/Snyk del Tema 1, sobre dependencias de terceros, la misma base que habilita el SBOM del Tema 5.

**Analogía:** SAST es revisar los planos arquitectónicos antes de construir. DAST es poner a prueba el edificio ya construido con inspectores forzando puertas y ventanas. SCA es verificar la procedencia certificada de cada material comprado a proveedores externos.

**Diagrama:**

```
┌── SAST ──────────┐  ┌── DAST ──────────────┐  ┌── SCA ────────────┐
│ código propio,       │  │ aplicación en ejecución, │  │ dependencias de      │
│ sin ejecutar, en CI     │  │ probada como atacante real │  │ terceros, versiones   │
└────────┬─────────┘  └────────┬─────────────┘  └────────┬──────────┘
         ▼                        ▼                          ▼
  código inseguro       comportamiento vulnerable      CVEs conocidas
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo11/sast-dast-sca` con una app deliberadamente vulnerable a inyección, y aplica las tres categorías sobre ella:

```bash
mkdir -p academia-devops/src/modulo11/sast-dast-sca
cd academia-devops/src/modulo11/sast-dast-sca
cat > app.js <<'EOF'
const http = require('node:http');
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const nombre = url.searchParams.get('nombre') ?? 'invitado';
  res.end(`<h1>Hola, ${nombre}</h1>`); // vulnerable a XSS: sin escapar la entrada
}).listen(3000);
EOF
grep -n 'res.end(\`.*\${' app.js
```

**Explicación línea por línea:** el `grep` simula un análisis SAST muy simplificado: detecta el patrón de código sospechoso (interpolación directa de entrada de usuario `nombre` dentro de HTML sin escapar), exactamente el tipo de hallazgo que una herramienta SAST real reportaría analizando solo el texto del código, sin ejecutarlo.

Levanta la app y aplica un análisis DAST real con OWASP ZAP contra ella en ejecución:

```bash
docker run -d --name app-vulnerable -p 3040:3000 -v "$(pwd)":/app -w /app node:22-alpine node app.js
sleep 1
curl -s "http://localhost:3040/?nombre=<script>alert(1)</script>" | grep -o '<script>alert(1)</script>'
docker run --rm --network host zaproxy/zap-stable zap-baseline.py -t http://localhost:3040/ 2>&1 | tail -5
```

**Resultado esperado:** el `curl` confirma que la entrada `<script>alert(1)</script>` se refleja sin escapar en la respuesta HTML (el mismo hallazgo que SAST anticipó estáticamente, ahora confirmado dinámicamente); ZAP, al probar la aplicación en ejecución real, reporta una alerta de XSS reflejado sobre el parámetro `nombre`.

**Fallo deliberado:** ejecuta el mismo `grep` de SAST sobre un archivo `app-segura.js` que sí escapa correctamente la entrada (usando una función de escape HTML antes de interpolar). El `grep` no encuentra ninguna coincidencia sospechosa — diagnostica confirmando que SAST detecta patrones de código, no el comportamiento real; para confirmar con certeza que la app corregida efectivamente ya no es explotable, es DAST (probándola en ejecución) el que da la confirmación definitiva del comportamiento real observable.

#### Paso 5 · Práctica guiada

Corrige `app.js` escapando la entrada `nombre` antes de interpolarla en el HTML (por ejemplo, reemplazando `<`, `>` y `&` por sus entidades HTML), reconstruye, y repite la petición del `curl` con el mismo payload para confirmar que ya no se refleja sin escapar. **Pista:** una función simple de reemplazo de caracteres especiales es suficiente para esta demostración didáctica.

#### Paso 6 · Práctica independiente

Detén el contenedor `app-vulnerable` y documenta, para tu propio proyecto o ejercicio, un ejemplo concreto de qué esperarías que SAST detectara que DAST no podría (y viceversa), basándote en la diferencia de alcance entre analizar código estático y probar comportamiento en ejecución.

#### Paso 7 · Cierre

Ya distingues qué detecta específicamente cada una de SAST, DAST y SCA, y por qué un programa de seguridad maduro las integra en distintos puntos del ciclo de desarrollo. Esto cierra el módulo de seguridad DevSecOps; el siguiente módulo del track continúa con la práctica avanzada de la disciplina. Fuente oficial: [OWASP — Vulnerability Scanning Tools](https://owasp.org/www-community/Vulnerability_Scanning_Tools).

**Errores comunes:** depender de una sola categoría de análisis (típicamente solo SCA) asumiendo erróneamente que eso cubre todos los riesgos relevantes; ejecutar DAST solo una vez antes de un lanzamiento importante en vez de integrarlo regularmente contra cada versión desplegada al entorno de pruebas.

**Cuándo no usarlo:** DAST contra una aplicación que aún no expone ningún endpoint real accesible no aporta valor todavía; en esa etapa temprana, SAST y SCA sobre el código y dependencias ya existentes son las categorías aplicables primero.

---

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Asigna controles distintos a código, dependencias y aplicación en ejecución. Reproduce un hallazgo de prueba por categoría y documenta qué riesgo queda fuera del alcance de cada herramienta.

### Tema 7: Reconocimiento de tu propio laboratorio: escaneo de puertos y banners

#### Paso 1 · Objetivo y preparación
Al finalizar podrás explicar cómo un escáner descubre puertos abiertos, cerrados y filtrados, implementar uno mínimo con sockets, leer los banners de los servicios y comparar el resultado con `nmap`, siempre sobre equipos propios y con autorización. Prerrequisitos: Tema 7 del Módulo 0 (redes) y los temas anteriores de este módulo.

#### Paso 2 · Contexto y caso real
Una auditoría a RutaFlow encontró una base de datos de pruebas expuesta en un puerto que nadie recordaba haber abierto, y su banner revelaba la versión exacta. Los libros *Kali Linux* y *El libro blanco del hacker* de la biblioteca empiezan igual: el reconocimiento es la primera fase de un ataque, y por eso también es la primera revisión defensiva de un caso real.

#### Paso 3 · Teoría, modelo mental y analogía
Un escaneo **TCP connect** intenta abrir una conexión completa en cada puerto: si el sistema acepta, el puerto está **abierto**; si responde con rechazo (RST), está **cerrado**; si no responde dentro del tiempo límite, está **filtrado** (un firewall descarta los paquetes). Muchos servicios envían un **banner** al conectar, que revela producto y versión. `nmap` hace lo mismo y mucho más (escaneo SYN, detección de versiones con `-sV`, scripts). **Escanear sistemas ajenos sin permiso es ilegal** en muchos países; en una empresa, solo con un alcance escrito.

**Analogía:** es recorrer el edificio propio probando cada puerta: abierta, cerrada con llave o con un guardia que no responde.

**Diagrama:**

```mermaid
flowchart LR
    E[escaneo.py] --> P{connect al puerto}
    P -- acepta --> A[abierto + banner]
    P -- rechazo RST --> C[cerrado]
    P -- sin respuesta --> F[filtrado]
```

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema se reproduce en una **carpeta vacía**, como **proyecto nuevo**, sin estado de otros temas.

```bash
mkdir escaneo-laboratorio && cd escaneo-laboratorio
```

Crea `escaneo.py`:

```python
# Escaneo de puertos SOLO contra tu propio equipo o laboratorio, con autorización escrita.
import socket
import threading
import concurrent.futures as cf

# Laboratorio: levantamos dos servicios locales para tener algo que descubrir
def servicio(puerto, banner):
    s = socket.socket(); s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(("127.0.0.1", puerto)); s.listen()
    def atender():
        while True:
            conexion, _ = s.accept()
            conexion.sendall(banner); conexion.close()
    threading.Thread(target=atender, daemon=True).start()

servicio(18022, b"SSH-2.0-OpenSSH_9.6 laboratorio\r\n")
servicio(18080, b"HTTP/1.1 200 OK\r\nServer: rutaflow-dev\r\n\r\n")

def probar(host, puerto, espera=0.3):
    try:
        with socket.create_connection((host, puerto), timeout=espera) as c:   # conexión TCP completa
            c.settimeout(espera)
            try:
                banner = c.recv(64).decode(errors="replace").splitlines()[0]
            except socket.timeout:
                banner = ""
            return puerto, "abierto", banner
    except ConnectionRefusedError:
        return puerto, "cerrado", ""
    except socket.timeout:
        return puerto, "filtrado", ""

objetivo = "127.0.0.1"
puertos = range(18000, 18100)
with cf.ThreadPoolExecutor(max_workers=50) as ejecutor:
    resultados = list(ejecutor.map(lambda p: probar(objetivo, p), puertos))

abiertos = [r for r in resultados if r[1] == "abierto"]
print(f"Escaneados {len(resultados)} puertos de {objetivo}: {len(abiertos)} abiertos")
for puerto, estado, banner in abiertos:
    print(f"  {puerto}/tcp {estado:<8} {banner}")
```

**Ejecuta el ejemplo:**

```bash
python3 escaneo.py
nmap -sV -p 18000-18100 127.0.0.1   # opcional, con nmap instalado y el script aún corriendo
```

**Resultado esperado:**

```text
Escaneados 100 puertos de 127.0.0.1: 2 abiertos
  18022/tcp abierto  SSH-2.0-OpenSSH_9.6 laboratorio
  18080/tcp abierto  HTTP/1.1 200 OK
```

Los dos puertos abiertos son los servicios de laboratorio que el propio script levantó; sus banners muestran exactamente qué información regala un servidor mal configurado.

**Fallo deliberado:** Borra el bloque `except ConnectionRefusedError:` de `probar`. El escaneo termina con `ConnectionRefusedError: [Errno 111] Connection refused` (en macOS el número es 61): el primer puerto cerrado lanza una excepción que nadie maneja. En un escáner, "cerrado" es un resultado esperado, no un error.

#### Paso 5 · Práctica guiada
Agrega una columna con el tiempo de respuesta de cada puerto abierto y ordena los resultados por puerto. **Pista:** mide con `time.perf_counter()` alrededor de `create_connection` y devuelve el valor como cuarto elemento de la tupla.

#### Paso 6 · Práctica independiente
Escanea con `nmap -sV` un contenedor tuyo de Docker Compose (Módulo 3) y redacta un informe: puertos expuestos, cuáles no deberían estarlo, qué banners revelan versiones y cómo cerrarlos.

#### Paso 7 · Cierre
**¿Por qué es importante?** porque conocer tu superficie de ataque antes que un atacante es la base de DevSecOps.
**Fuente oficial:** [Nmap Reference Guide](https://nmap.org/book/man.html), [socket (docs.python.org)](https://docs.python.org/3/library/socket.html), [OWASP Web Security Testing Guide: Information Gathering](https://owasp.org/www-project-web-security-testing-guide/).
**Conceptos clave:** reconocimiento, escaneo TCP connect, abierto, cerrado y filtrado, banner, `nmap -sV`, alcance y autorización.
**Cuándo no usarlo:** nunca contra redes, IPs o dominios que no te pertenecen o sin autorización escrita. En la nube, revisa también las políticas del proveedor sobre pruebas de penetración.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** agrega al pipeline un escaneo de los puertos que expone el entorno de pruebas y falla si aparece uno no declarado.
Como **siguiente** paso, aplica lo aprendido en el proyecto integrador del track y compara el resultado con lo que esperabas.
**Errores comunes:** confundir un puerto "cerrado" con uno "filtrado" porque ninguno devuelve banner — el cerrado responde casi al instante con `ConnectionRefusedError` (RST), mientras que el filtrado tarda hasta agotar el `timeout` de `create_connection` sin respuesta alguna; medí cuánto demora cada resultado antes de concluir si hay un firewall descartando los paquetes en silencio.

## Laboratorio práctico

**Objetivo del laboratorio:** escanear una imagen propia con Trivy, integrar ese escaneo como gate obligatorio en el pipeline de CI, configurar secretos correctamente usando los mecanismos nativos de la plataforma, y generar un SBOM.

**Requisitos previos:** una imagen Docker propia (del Módulo 2 de este track), el pipeline de CI del Módulo 4 ya configurado, Trivy instalado localmente para pruebas iniciales.

| Paso | Acción | Comando/Configuración | Explicación | Resultado esperado |
|---|---|---|---|---|
| 1 | Escanear la imagen localmente | `trivy image mi-api:1.0` | Revisa el reporte completo de vulnerabilidades antes de integrarlo al pipeline | Un reporte con vulnerabilidades clasificadas por severidad (o ninguna, si la imagen está limpia) |
| 2 | Revisar y priorizar el reporte | Identifica manualmente si hay vulnerabilidades críticas, y si existe una versión corregida disponible para el paquete afectado | Aplica el criterio del Tema 1 antes de bloquear nada automáticamente | Una lista priorizada de qué actualizar primero, si aplica |
| 3 | Integrar el escaneo al pipeline de CI | Añade un step al workflow del Módulo 4: `trivy image --exit-code 1 --severity CRITICAL mi-api:${{ github.sha }}` | Convierte el escaneo en un gate obligatorio | El step se añade correctamente al archivo de workflow |
| 4 | Provocar un fallo intencional (opcional, si tienes una imagen con vulnerabilidades conocidas de prueba) | Usa una imagen base intencionalmente desactualizada para verificar que el pipeline efectivamente bloquea el merge | Confirma que el gate funciona como se espera | El pipeline falla visiblemente si hay una vulnerabilidad crítica |
| 5 | Configurar un secreto en GitHub Actions | En la configuración del repositorio, añade un secreto (por ejemplo, un token de despliegue) usando la sección nativa de "Secrets" de GitHub, nunca escrito directamente en el archivo YAML del workflow | Aplica el Tema 3 usando el mecanismo nativo de la plataforma | El secreto aparece listado (sin mostrar su valor) en la configuración del repositorio |
| 6 | Revisar los permisos del token por defecto del pipeline | Revisa la configuración de permisos del `GITHUB_TOKEN` automático que usa tu workflow, y redúcelos explícitamente al mínimo necesario (por ejemplo, solo lectura de contenido si el workflow no necesita escribir nada) | Aplica el Tema 4 | La configuración de permisos queda explícitamente acotada, no usando los permisos amplios por defecto |
| 7 | Generar un SBOM | `trivy image --format cyclonedx --output sbom.json mi-api:1.0` (o la herramienta equivalente que prefieras) | Genera un inventario estructurado de dependencias | Se genera un archivo `sbom.json` con el listado completo de componentes y versiones |

**Verificación:** el laboratorio se considera exitoso si el pipeline de CI efectivamente bloquea el merge cuando se escanea una imagen con una vulnerabilidad crítica de prueba, si el secreto configurado en el paso 5 nunca aparece en texto plano en ningún archivo versionado del repositorio, y si el SBOM generado en el paso 7 lista correctamente las dependencias reales de tu imagen.

**Errores comunes y soluciones**

- **Trivy reporta un volumen abrumador de vulnerabilidades de severidad baja/media, dificultando identificar qué es realmente urgente.** Filtra el reporte inicial por severidad (`--severity CRITICAL,HIGH`) para enfocar la atención en lo más urgente primero.
- **El pipeline falla en el step de escaneo pero el mensaje de error no indica claramente qué vulnerabilidad específica lo causó.** Revisa la salida completa del step de Trivy en los logs del pipeline, que normalmente incluye el detalle completo de cada vulnerabilidad encontrada.
- **El secreto configurado en GitHub Actions no parece estar disponible dentro del workflow.** Verifica que estás referenciándolo con la sintaxis `${{ secrets.NOMBRE_DEL_SECRETO }}`, y que el nombre coincide exactamente con el configurado en Secrets.
- **Reducir los permisos del `GITHUB_TOKEN` rompe un step que sí necesitaba un permiso específico.** Revisa cuidadosamente qué permisos usa realmente cada step antes de reducir permisos de forma demasiado agresiva.

---
