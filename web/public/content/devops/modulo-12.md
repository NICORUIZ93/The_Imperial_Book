# Módulo 12: DevOps y este curso — del laboratorio a la nube


## Aprende construyendo

### Tema 1: De cloud local a un proveedor cloud real

#### Paso 1 · Objetivo y preparación

Al finalizar podrás identificar exactamente qué dos configuraciones cambian al migrar un proyecto Terraform de Floci (local) a un proveedor cloud real.

**Conocimiento previo:** track Cloud (Floci/LocalStack); Terraform (Módulo 8 de este track).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Entender que la transición técnica de Floci a un proveedor real es deliberadamente simple es lo que justifica todo el enfoque pedagógico del track Cloud: el tiempo invertido practicando contra un emulador es directamente transferible, no tiempo que haya que volver a aprender de otra forma en producción real.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** paridad de API, endpoint personalizado, credenciales reales, transición mínima de configuración.

Todo lo practicado contra Floci usa exactamente las mismas APIs que AWS, Azure o GCP reales exponen. Lo que cambia son dos configuraciones puntuales: el endpoint (en Floci apuntabas explícitamente a `http://localhost:4566`; contra un proveedor real simplemente omites ese endpoint) y las credenciales (de marcador de posición `test`/`test` a credenciales IAM reales con mínimo privilegio, Módulo 11). Un emulador local no replica comportamiento a escala real, latencia de red entre regiones, ni coste real de producción — la transición de configuración es simple; operar responsablemente en producción real es sustancialmente mayor responsabilidad.

**Analogía:** practicar contra Floci y pasar a un proveedor real es como aprender en un simulador de vuelo extremadamente fiel y luego subir al avión real: los controles son idénticos, y lo que cambia sustancialmente es que ahora las consecuencias de cualquier error son reales, no simuladas.

**Diagrama:**

```
┌── Terraform contra Floci (local) ────────┐   ┌── Terraform contra AWS real ─────────┐
│ endpoints = { s3 = "http://localhost:4566" } │   │ region = "us-east-1"                        │
│ credenciales: test/test                          │   │ (sin endpoint personalizado: apunta directo) │
└─────────────────────────────────┘   │ credenciales: IAM reales, mínimo privilegio    │
                                                 └─────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo12/floci-a-real` con dos configuraciones Terraform equivalentes usando el provider `local` (sin necesidad de credenciales reales) para representar objetivamente el mismo recurso apuntado a "Floci" y a "producción real":

```bash
mkdir -p academia-devops/src/modulo12/floci-a-real
cd academia-devops/src/modulo12/floci-a-real
cat > floci.tf <<'EOF'
terraform {
  required_providers { local = { source = "hashicorp/local" } }
}
variable "endpoint" { default = "http://localhost:4566" }
variable "credenciales" { default = "test/test (marcador de posicion, Floci no las valida)" }
resource "local_file" "config_bucket" {
  filename = "bucket-config-floci.txt"
  content  = "endpoint=${var.endpoint}\ncredenciales=${var.credenciales}\n"
}
EOF
cat > produccion.tf.ejemplo <<'EOF'
terraform {
  required_providers { local = { source = "hashicorp/local" } }
}
variable "region" { default = "us-east-1" }
variable "credenciales" { default = "IAM real, rol con minimo privilegio (Modulo 11)" }
resource "local_file" "config_bucket" {
  filename = "bucket-config-produccion.txt"
  content  = "region=${var.region}\ncredenciales=${var.credenciales}\n(sin endpoint personalizado: apunta directo a AWS real)\n"
}
EOF
docker run --rm -v "$(pwd)":/trabajo -w /trabajo hashicorp/terraform:1.9 init >/dev/null
docker run --rm -v "$(pwd)":/trabajo -w /trabajo hashicorp/terraform:1.9 apply -auto-approve
```

**Explicación línea por línea:** `floci.tf` documenta explícitamente el endpoint personalizado y las credenciales de marcador de posición de Floci; `produccion.tf.ejemplo` (con extensión `.ejemplo` para que Terraform no lo aplique junto al primero en este laboratorio) documenta la ausencia deliberada de endpoint y el uso de credenciales IAM reales, siendo la única diferencia real de configuración entre ambos contextos.

`produccion.tf.ejemplo` todavía no generó ningún archivo (Terraform ignora la extensión `.ejemplo`); para comparar ambos resultados sin mezclar sus estados, aplícalo una sola vez en un directorio aparte:

```bash
mkdir -p ../produccion-preview
cp produccion.tf.ejemplo ../produccion-preview/produccion.tf
(cd ../produccion-preview && \
  docker run --rm -v "$(pwd)":/trabajo -w /trabajo hashicorp/terraform:1.9 init >/dev/null && \
  docker run --rm -v "$(pwd)":/trabajo -w /trabajo hashicorp/terraform:1.9 apply -auto-approve >/dev/null)
cp ../produccion-preview/bucket-config-produccion.txt .
diff <(grep -v '^$' bucket-config-floci.txt) <(sed 's/produccion/floci/' bucket-config-produccion.txt)
cat bucket-config-floci.txt
```

**Resultado esperado:** `bucket-config-floci.txt` refleja el endpoint local y las credenciales de marcador de posición; el `diff` contra `bucket-config-produccion.txt` (generado en un directorio aislado, para no mezclar su estado con el de `floci.tf`) confirma que la única diferencia estructural entre ambos es el endpoint y el origen de las credenciales, no la lógica del recurso en sí.

**Fallo deliberado:** copia `produccion.tf.ejemplo` a `produccion.tf` (activándolo junto a `floci.tf` en el mismo directorio) y ejecuta `apply` de nuevo. Terraform aplica ambos recursos sin conflicto porque tienen nombres de archivo de salida distintos, pero si ambos definieran el mismo `resource "local_file" "config_bucket"` sin distinguir su nombre, Terraform fallaría con un error de recurso duplicado — diagnostica confirmando que, igual que en un proyecto real, mezclar configuración de dos entornos distintos en el mismo estado de Terraform sin una separación clara (como los workspaces del Módulo 8) genera justamente este tipo de conflicto.

#### Paso 5 · Práctica guiada

Renombra los recursos en `produccion.tf.ejemplo` para que no colisionen con `floci.tf` (por ejemplo, `local_file.config_bucket_produccion`) y aplica ambos en el mismo `apply`, confirmando que Terraform genera ambos archivos de configuración simultáneamente sin conflicto. **Pista:** el nombre del recurso, no solo su tipo, debe ser único dentro del mismo estado de Terraform.

#### Paso 6 · Práctica independiente

Toma un módulo Terraform propio (del Módulo 8 de este track) y documenta línea por línea qué cambiaría exactamente al migrarlo de Floci a un proveedor real, siguiendo el mismo formato de comparación de este Tema.

#### Paso 7 · Cierre

Ya identificas con precisión las dos únicas configuraciones que cambian entre Floci y un proveedor real, confirmando que el conocimiento práctico del track Cloud se transfiere directamente. El siguiente tema aborda cómo cambia específicamente la gestión de secretos en ese mismo salto a producción. Fuente oficial: [LocalStack — AWS API Parity](https://docs.localstack.cloud/).

**Errores comunes:** dejar credenciales de marcador de posición (`test/test`) olvidadas en archivos que se copian sin revisión hacia una configuración de producción real; asumir que "funciona en Floci" garantiza automáticamente comportamiento idéntico a escala real en producción.

**Cuándo no usarlo:** para un proyecto que nunca se desplegará a un proveedor cloud real (un ejercicio puramente educativo sin intención de producción), mantener esta distinción explícita de configuración por entorno aporta menos valor inmediato.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Documenta las dos configuraciones exactas (endpoint y credenciales) que cambiarán cuando la plataforma migre de Floci a un proveedor real, antes de tocar la gestión de secretos del Tema siguiente.

### Tema 2: Gestión de secretos cloud-native

#### Paso 1 · Objetivo y preparación

Al finalizar podrás describir el flujo completo de un secreto gestionado de forma nativa por un proveedor cloud, desde su almacenamiento hasta su inyección en el pipeline de despliegue.

**Conocimiento previo:** `.env` (Módulo 3) y Vault/SOPS (Módulo 11) de este track.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** La transición de `.env` local (adecuado solo para desarrollo) a un gestor de secretos cloud-native en producción es una de las diferencias operativas más concretas y de mayor impacto de seguridad entre practicar contra Floci y operar realmente en producción.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** Secrets Manager/Key Vault en producción, integración con el pipeline de despliegue, identidad federada.

El servicio de gestión de secretos nativo de un proveedor cloud (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager) tiene una ventaja de integración nativa: un pipeline con un rol IAM apropiado lee directamente el secreto sin gestionar ninguna credencial adicional separada. El flujo típico: el pipeline se autentica ante el proveedor (idealmente identidad federada de corta duración, Módulo 11), consulta el secreto en el momento del despliegue, y lo inyecta como variable de entorno en el entorno final, sin pasar nunca por un paso intermedio menos seguro.

**Analogía:** usar el gestor de secretos nativo del proveedor donde ya vive tu infraestructura es como usar la caja fuerte integrada de tu propio edificio, que ya reconoce las credenciales de tus empleados autorizados, en vez de contratar un servicio de custodia externo con credenciales separadas.

**Diagrama:**

```
┌── Desarrollo local (Módulo 3) ────┐   ┌── Producción real (este tema) ──────────┐
│ .env (archivo local, nunca            │   │ Secrets Manager / Key Vault / Secret Manager │
│ versionado)                                 │                                                    │
│      │                                        │      │                                            │
│ Docker Compose lo lee                    │   │ Pipeline con rol IAM consulta el secreto      │
│ directamente                                 │   │ en el momento exacto del despliegue              │
└─────────────────────────┘   └───────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo12/secretos-cloud-native` usando LocalStack (el mismo emulador del track Cloud) para representar de forma real la API de Secrets Manager:

```bash
mkdir -p academia-devops/src/modulo12/secretos-cloud-native
cd academia-devops/src/modulo12/secretos-cloud-native
docker run -d --name localstack-secretos -p 4566:4566 localstack/localstack:3.7
sleep 8
docker run --rm --network host -e AWS_ACCESS_KEY_ID=test -e AWS_SECRET_ACCESS_KEY=test \
  amazon/aws-cli --endpoint-url=http://localhost:4566 secretsmanager create-secret \
  --name mi-api/api-key --secret-string "sk-real-gestionado-por-secrets-manager"
```

**Explicación línea por línea:** `--endpoint-url` es la bandera que redirige el AWS CLI hacia LocalStack en `localhost:4566` en vez de la nube real de AWS; `--secret-string` es la bandera con el valor del secreto a guardar. El secreto se crea directamente vía la API de Secrets Manager (contra LocalStack, con paridad de API real como viste en el Tema 1), nunca escrito en ningún archivo `.env` local ni en el código de la aplicación. Al leerlo, `--secret-id` es la bandera que identifica qué secreto pedir, y `--query` es la bandera que filtra la respuesta JSON con una expresión JMESPath (acá, quedándose solo con `SecretString`).

Simula el flujo del pipeline: consultar el secreto en el momento del despliegue e inyectarlo como variable de entorno, sin que quede en ningún archivo versionado:

```bash
SECRETO=$(docker run --rm --network host -e AWS_ACCESS_KEY_ID=test -e AWS_SECRET_ACCESS_KEY=test \
  amazon/aws-cli --endpoint-url=http://localhost:4566 secretsmanager get-secret-value \
  --secret-id mi-api/api-key --query SecretString --output text)
docker run --rm -e API_KEY="$SECRETO" node:22-alpine node -e "console.log('API_KEY inyectada, longitud:', process.env.API_KEY.length)"
grep -r "sk-real-gestionado-por-secrets-manager" . 2>/dev/null || echo "no encontrado en ningún archivo versionado"
```

**Resultado esperado:** el contenedor Node.js confirma que recibió `API_KEY` como variable de entorno con la longitud esperada; el `grep` sobre el directorio del proyecto no encuentra ninguna coincidencia del valor real del secreto, confirmando que nunca existió en un archivo versionable.

**Fallo deliberado:** consulta un secreto con un nombre que nunca fue creado (`--secret-id mi-api/secreto-inexistente`). El comando falla con un error `ResourceNotFoundException` — diagnostica confirmando que, a diferencia de un archivo `.env` que simplemente tendría una variable vacía o indefinida sin ningún aviso explícito, Secrets Manager falla de forma ruidosa y explícita ante un secreto que no existe, una señal de error mucho más clara para el pipeline.

#### Paso 5 · Práctica guiada

Actualiza el secreto ya creado con `secretsmanager update-secret --secret-id mi-api/api-key --secret-string "sk-nuevo-valor-rotado"` y confirma que una nueva consulta obtiene el valor actualizado, simulando una rotación de secreto sin ningún cambio de código en la aplicación. **Pista:** la rotación de secretos es justamente el tipo de operación que un gestor dedicado facilita frente a un archivo `.env` estático.

#### Paso 6 · Práctica independiente

Detén el contenedor `localstack-secretos` e intenta consultar el secreto nuevamente; documenta qué comportamiento debería tener un pipeline real si el servicio de gestión de secretos estuviera temporalmente inaccesible durante un despliegue (¿debería reintentar? ¿debería abortar el despliegue?).

#### Paso 7 · Cierre

Ya describes el flujo completo de un secreto gestionado de forma nativa por el proveedor cloud, desde su creación hasta su inyección segura en el pipeline. El siguiente tema aborda si vale la pena abstraer esta y otras decisiones entre múltiples proveedores de nube. Fuente oficial: [AWS Secrets Manager — Documentation](https://docs.aws.amazon.com/secretsmanager/).

**Errores comunes:** seguir usando `.env` en producción real "porque ya funcionaba en desarrollo", sin migrar a un gestor de secretos apropiado; no manejar explícitamente el caso de un secreto inexistente o inaccesible durante el despliegue.

**Cuándo no usarlo:** para un proyecto que se despliega íntegramente en una sola máquina sin ningún proveedor cloud de por medio, un gestor de secretos nativo del proveedor no aplica; ahí Vault o SOPS (Módulo 11) siguen siendo las alternativas apropiadas.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Configura acceso a secretos con identidad del servicio. Prueba permiso revocado y recuperación, verificando que el proceso informa del fallo sin recurrir a credenciales incrustadas de respaldo.

### Tema 3: IaC multi-nube

#### Paso 1 · Objetivo y preparación

Al finalizar podrás distinguir entre "Terraform soporta múltiples proveedores" y "mi infraestructura es realmente portable entre proveedores", construyendo un módulo con la misma interfaz para dos proveedores distintos.

**Conocimiento previo:** Terraform y módulos reutilizables (Módulo 8 de este track).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Entender que "soportar múltiples proveedores técnicamente" y "tener infraestructura realmente portable entre ellos" son cosas distintas evita la expectativa poco realista de que adoptar Terraform automáticamente resuelve la portabilidad multi-nube sin esfuerzo de diseño adicional.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** módulos por proveedor, abstracción multi-nube, coste de mantener portabilidad, vendor lock-in.

Terraform soporta múltiples providers simultáneamente, pero cada uno expone recursos con nombres y estructuras específicas (`aws_s3_bucket` frente a `azurerm_storage_account`), sin un mapeo uno a uno automático. Escribir infraestructura verdaderamente portable requiere diseñar módulos con la misma interfaz funcional (mismas variables de entrada, mismos outputs) que internamente invocan recursos distintos por proveedor. Esta inversión solo se justifica en contextos específicos: requisitos regulatorios multi-nube, o evitar vendor lock-in por razones estratégicas explícitas.

**Analogía:** escribir infraestructura verdaderamente portable entre AWS, Azure y GCP es como diseñar un electrodoméstico que funcione con los estándares eléctricos de tres países distintos: técnicamente posible, pero requiere un esfuerzo de ingeniería deliberado, muy distinto de optimizar para un único estándar bien conocido.

**Diagrama:**

```
┌── "Terraform soporta múltiples providers" ┐   ┌── "Mi infraestructura es realmente portable" ┐
│ Puedo escribir código para AWS Y Azure          │   │ Requiere módulos con la MISMA interfaz               │
│ en el mismo proyecto (verdad técnica trivial)     │ ≠ │ (variables/outputs) que internamente implementan │
│                                                        │   │ cada proveedor por separado                              │
└─────────────────────────────────────┘   └───────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo12/iac-multi-nube` con dos módulos que implementan la misma interfaz (`nombre_archivo`, `contenido`) usando el provider `local` para simular dos "proveedores" distintos sin necesidad de credenciales reales:

```bash
mkdir -p academia-devops/src/modulo12/iac-multi-nube/modulos/almacenamiento-proveedor-a
mkdir -p academia-devops/src/modulo12/iac-multi-nube/modulos/almacenamiento-proveedor-b
cd academia-devops/src/modulo12/iac-multi-nube
cat > modulos/almacenamiento-proveedor-a/main.tf <<'EOF'
variable "nombre_archivo" {}
variable "contenido" {}
resource "local_file" "almacenamiento" {
  filename = "${path.root}/salida-proveedor-a-${var.nombre_archivo}"
  content  = "proveedor=A\n${var.contenido}"
}
output "ruta" { value = local_file.almacenamiento.filename }
EOF
cat > modulos/almacenamiento-proveedor-b/main.tf <<'EOF'
variable "nombre_archivo" {}
variable "contenido" {}
resource "local_file" "almacenamiento" {
  filename = "${path.root}/objeto-proveedor-b-${var.nombre_archivo}"
  content  = "proveedor=B (nombres de recurso y de archivo distintos)\n${var.contenido}"
}
output "ruta" { value = local_file.almacenamiento.filename }
EOF
cat > main.tf <<'EOF'
terraform { required_providers { local = { source = "hashicorp/local" } } }
module "almacen_a" {
  source         = "./modulos/almacenamiento-proveedor-a"
  nombre_archivo = "config.txt"
  contenido      = "misma interfaz de entrada para ambos módulos"
}
module "almacen_b" {
  source         = "./modulos/almacenamiento-proveedor-b"
  nombre_archivo = "config.txt"
  contenido      = "misma interfaz de entrada para ambos módulos"
}
output "ruta_a" { value = module.almacen_a.ruta }
output "ruta_b" { value = module.almacen_b.ruta }
EOF
docker run --rm -v "$(pwd)":/trabajo -w /trabajo hashicorp/terraform:1.9 init >/dev/null
docker run --rm -v "$(pwd)":/trabajo -w /trabajo hashicorp/terraform:1.9 apply -auto-approve
```

**Explicación línea por línea:** ambos módulos (`almacenamiento-proveedor-a` y `-b`) reciben exactamente las mismas variables de entrada (`nombre_archivo`, `contenido`) y exponen el mismo output (`ruta`), la interfaz funcional común; internamente cada uno implementa una convención de nombres de archivo completamente distinta, representando cómo cada proveedor real nombra y estructura sus recursos de forma diferente.

Confirma que ambos módulos, invocados con la misma entrada, produjeron resultados funcionalmente equivalentes pero con implementación interna distinta:

```bash
cat salida-proveedor-a-config.txt
cat objeto-proveedor-b-config.txt
docker run --rm -v "$(pwd)":/trabajo -w /trabajo hashicorp/terraform:1.9 output -json | python3 -m json.tool
```

**Resultado esperado:** ambos archivos contienen el mismo `contenido` recibido como entrada, confirmando la misma interfaz funcional; sus nombres de archivo (`salida-proveedor-a-*` frente a `objeto-proveedor-b-*`) son deliberadamente distintos, representando cómo cada proveedor real expone sus recursos con convenciones propias que el módulo encapsula.

**Fallo deliberado:** modifica `modulos/almacenamiento-proveedor-b/main.tf` para que reciba una variable llamada `archivo` en vez de `nombre_archivo` (rompiendo la interfaz común), sin actualizar `main.tf` en la raíz. Ejecuta `apply` de nuevo. Terraform falla con un error de variable no declarada — diagnostica confirmando que la portabilidad depende enteramente de mantener la interfaz idéntica entre módulos; un cambio no coordinado en un módulo específico rompe la abstracción multi-nube inmediatamente.

#### Paso 5 · Práctica guiada

Agrega un tercer módulo `almacenamiento-proveedor-c` con la misma interfaz, e inclúyelo en `main.tf` junto a los otros dos, confirmando que la misma entrada produce un tercer resultado funcionalmente equivalente. **Pista:** copia la estructura de uno de los módulos existentes y solo cambia su convención interna de nombres.

#### Paso 6 · Práctica independiente

Documenta en una tabla de dos columnas, para un servicio real que ya conozcas de dos proveedores distintos (por ejemplo, almacenamiento de objetos en AWS vs. Azure), qué atributos de configuración no tienen un mapeo uno a uno directo entre ambos.

#### Paso 7 · Cierre

Ya distingues el coste real de diseñar infraestructura verdaderamente portable frente a simplemente usar Terraform con múltiples providers. El siguiente tema construye la checklist que formaliza todas las prácticas de este track antes de salir a producción. Fuente oficial: [Terraform — Module Composition](https://developer.hashicorp.com/terraform/language/modules/develop/composition).

**Errores comunes:** asumir que agregar un segundo `provider` a un proyecto Terraform ya garantiza portabilidad real; no coordinar cambios de interfaz entre módulos de distintos proveedores, rompiendo la abstracción silenciosamente.

**Cuándo no usarlo:** para un proyecto que opera y operará siempre dentro de un único proveedor cloud, invertir en esta abstracción multi-nube es coste sin beneficio real; resérvala para el caso explícito de requisito multi-nube genuino.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Implementa un recurso equivalente en dos proveedores con estados separados. Compara red, identidad y recuperación para el servicio, y documenta las diferencias que impiden intercambiar módulos sin adaptación.

### Tema 4: Checklist de salida a producción

#### Paso 1 · Objetivo y preparación

Al finalizar podrás construir y ejecutar una checklist verificable de salida a producción que cubra observabilidad, seguridad, resiliencia, costos y documentación.

**Conocimiento previo:** Módulos 9, 10, 11 y 5/6/7 de este track (observabilidad, logging, seguridad, resiliencia).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Sin una checklist explícita, es común que un proyecto llegue a producción con alguna categoría incompleta simplemente por presión de tiempo, y el coste de descubrir esa omisión durante un incidente real es sustancialmente mayor que el coste de haberla verificado deliberadamente antes del lanzamiento.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** verificación pre-lanzamiento, cobertura de observabilidad/seguridad/resiliencia/costos/documentación.

Una checklist mínima razonable cubre cinco categorías: observabilidad (logs centralizados, métricas, al menos una alerta sobre un síntoma real, Módulos 9-10), seguridad (secretos fuera del código, imagen escaneada, permisos mínimos, Módulo 11), resiliencia (healthchecks y rollback efectivamente probado, no solo documentado, Módulos 3/5/6/7), costos (límites de autoscaling razonables y recursos etiquetados) y documentación (al menos un runbook básico de incidentes).

**Analogía:** una checklist de salida a producción es como la lista de verificación previa al despegue de un piloto: no es desconfianza en su experiencia, sino reconocimiento de que bajo presión de tiempo es fácil pasar por alto un detalle crítico sin una lista explícita que fuerce la verificación sistemática.

**Diagrama:**

```
┌──────────────────────────────────────────┐
│      Checklist de salida a producción         │
├──────────────────────────────────────────┤
│ [ ] Observabilidad: logs, métricas, alerta   │
│ [ ] Seguridad: secretos fuera, imagen escaneada │
│ [ ] Resiliencia: healthchecks, rollback PROBADO │
│ [ ] Costos: límites de autoscaling, tags          │
│ [ ] Documentación: runbook de incidentes            │
└──────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo12/checklist-produccion` con un script que verifica programáticamente ítems reales de un proyecto (reutilizando artefactos de módulos anteriores de este track):

```bash
mkdir -p academia-devops/src/modulo12/checklist-produccion
cd academia-devops/src/modulo12/checklist-produccion
docker pull python:3.12-slim >/dev/null
mkdir -p proyecto-simulado
echo '{"level":"info","service":"api"}' > proyecto-simulado/ejemplo.log
cat > verificar-checklist.py <<'EOF'
import os, sys

items = {
    "observabilidad_logs_estructurados": os.path.exists("proyecto-simulado/ejemplo.log")
        and open("proyecto-simulado/ejemplo.log").read().strip().startswith("{"),
    "seguridad_sin_env_versionado": not os.path.exists("proyecto-simulado/.env"),
    "resiliencia_healthcheck_documentado": os.path.exists("proyecto-simulado/healthcheck.md"),
    "documentacion_runbook_existe": os.path.exists("proyecto-simulado/runbook.md"),
}
for nombre, cumplido in items.items():
    estado = "CUMPLE" if cumplido else "NO CUMPLE"
    print(f"[{estado}] {nombre}")

total = len(items)
cumplidos = sum(items.values())
print(f"\nResumen: {cumplidos}/{total} items cumplidos")
if cumplidos < total:
    sys.exit(1)
EOF
docker run --rm -v "$(pwd)":/trabajo -w /trabajo python:3.12-slim python3 verificar-checklist.py
echo "código de salida: $?"
```

**Explicación línea por línea:** el script verifica programáticamente ítems concretos y binarios (¿existe el log estructurado? ¿existe el runbook?) en vez de una autoevaluación subjetiva; el código de salida distinto de cero cuando algún ítem no se cumple permite, igual que en el Tema 2 del Módulo 11, integrarlo como un gate más del pipeline antes de un despliegue a producción.

**Resultado esperado:** el script reporta cada ítem como `CUMPLE` o `NO CUMPLE`; en este proyecto simulado, `healthcheck.md` y `runbook.md` no existen todavía, por lo que el resumen muestra menos de 4/4 ítems cumplidos y el script termina con código de salida `1`.

**Fallo deliberado:** crea los archivos faltantes vacíos (`touch proyecto-simulado/healthcheck.md proyecto-simulado/runbook.md`) y ejecuta el script de nuevo — ahora reporta 4/4 cumplidos, pero los archivos están vacíos y no documentan realmente nada útil. Diagnostica revisando el contenido de ambos archivos (`cat proyecto-simulado/runbook.md`): confirma que la checklist automatizada solo verifica existencia, no calidad de contenido, exactamente la advertencia del laboratorio de que "una checklist que pasa todo perfectamente" puede ser demasiado superficial si no se revisa también el contenido real, no solo su presencia.

#### Paso 5 · Práctica guiada

Agrega un quinto ítem verificable programáticamente a `verificar-checklist.py` (por ejemplo, confirmar que existe un archivo de política de escaneo de seguridad del Módulo 11) y confirma que el script lo reporta correctamente como `CUMPLE` o `NO CUMPLE`. **Pista:** sigue el mismo patrón de `os.path.exists` u otra verificación concreta y objetiva.

#### Paso 6 · Práctica independiente

Escribe contenido real (no vacío) en `runbook.md` documentando al menos: cómo diagnosticar el problema más común de tu proyecto, a quién escalar, y cómo ejecutar un rollback manual — y luego escribe una verificación adicional en el script que confirme que el archivo tiene más de una línea de contenido, no solo que existe.

#### Paso 7 · Cierre

Ya construyes y ejecutas una checklist de producción verificable programáticamente, no solo una lista teórica. El siguiente tema presenta GitOps como una forma específica de aplicar consistentemente parte de estas prácticas de despliegue. Fuente oficial: [Google SRE Book — Production Readiness Reviews](https://sre.google/sre-book/table-of-contents/).

**Errores comunes:** dejar la checklist como un documento teórico nunca verificado programáticamente contra el proyecto real; marcar un ítem como cumplido solo por la existencia de un archivo sin revisar si su contenido es realmente útil.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Ejecuta esta checklist como gate del pipeline antes de desplegar la plataforma a producción real, verificando con contenido real (no archivos vacíos) el runbook y la política de escaneo de seguridad del Módulo 11.

**Cuándo no usarlo:** para un cambio interno menor sin ningún riesgo de impacto en usuarios reales (un script de uso puramente personal), aplicar la checklist completa de producción es una sobrecarga innecesaria.

### Tema 5: GitOps con ArgoCD y FluxCD

#### Paso 1 · Objetivo y preparación

Al finalizar podrás explicar el modelo de reconciliación pull-based de GitOps y demostrar cómo corrige automáticamente una deriva manual no autorizada.

**Conocimiento previo:** Kubernetes (Módulo 6), CD tradicional (Módulo 5) y `git revert` (Módulo 1) de este track.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** GitOps reduce la superficie de exposición de credenciales sensibles de despliegue y añade una capa de auto-corrección continua contra cambios manuales no autorizados, dos propiedades que el modelo tradicional de CD basado en push no ofrece de la misma forma nativa.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** GitOps, reconciliación continua desde Git, pull-based deployment, Git como fuente de verdad.

En GitOps, un agente (ArgoCD/FluxCD) corre dentro del propio clúster y observa continuamente un repositorio Git, reconciliando el estado real para que coincida con lo declarado, sin que un sistema externo empuje cambios. Esto contrasta con el CD tradicional del Módulo 5, donde un pipeline externo ejecuta `kubectl apply` con credenciales de escritura directa. Al reconciliar continuamente, el agente detecta y revierte automáticamente cualquier deriva: si alguien modifica manualmente un recurso con `kubectl edit`, el agente lo revierte de vuelta al estado declarado en Git en su siguiente ciclo.

**Analogía:** el CD tradicional es un mensajero que viaja hasta tu casa con una llave de tu puerta cada vez que hay un paquete. GitOps es un sistema de vigilancia dentro de tu propia casa que revisa constantemente un catálogo compartido de qué debería haber en cada habitación, y reorganiza automáticamente cualquier cosa que no coincida, sin que nadie externo necesite nunca una llave.

**Diagrama:**

```
┌── CD tradicional (push) ──────────────┐   ┌── GitOps (pull) ────────────────────┐
│ Pipeline CI/CD ──▶ kubectl apply           │   │ Repositorio Git (estado deseado)         │
│ (necesita credenciales de escritura          │   │        ▲                                    │
│  sobre el clúster)                                │   │        │ el agente CONSULTA continuamente   │
└─────────────────────────────────┘   │ ArgoCD/FluxCD (dentro del clúster)          │
                                                  │ reconcilia y revierte cambios manuales   │
                                                  └───────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo12/gitops-reconciliacion` simulando el ciclo de reconciliación de un agente GitOps con un script que compara el "estado deseado" (un repo Git real) contra el "estado real" (un archivo que representa el clúster):

```bash
mkdir -p academia-devops/src/modulo12/gitops-reconciliacion
cd academia-devops/src/modulo12/gitops-reconciliacion
docker run --rm -v "$(pwd)":/repo -w /repo alpine/git:2.45.2 sh -c "
  git init -q -b main &&
  git config user.email a@a.com && git config user.name a &&
  echo 'replicas: 3' > deployment-mi-api.yaml &&
  git add -A && git commit -q -m 'estado deseado inicial: 3 replicas'
"
cp deployment-mi-api.yaml estado-real-clúster.yaml
cat > reconciliar.sh <<'EOF'
#!/bin/sh
if ! diff -q deployment-mi-api.yaml estado-real-clúster.yaml >/dev/null 2>&1; then
  echo "DERIVA DETECTADA: el estado real no coincide con Git. Reconciliando..."
  cp deployment-mi-api.yaml estado-real-clúster.yaml
  echo "Reconciliado: estado real ahora coincide con Git."
else
  echo "Sin deriva: el estado real ya coincide con el declarado en Git."
fi
EOF
chmod +x reconciliar.sh
./reconciliar.sh
```

**Explicación línea por línea:** `deployment-mi-api.yaml` dentro del repositorio Git representa el estado deseado (lo que ArgoCD/FluxCD observaría); `estado-real-clúster.yaml` representa el estado real del clúster; `reconciliar.sh` simula el ciclo de reconciliación comparando ambos y corrigiendo cualquier diferencia, exactamente el comportamiento central de un agente GitOps.

Simula un cambio manual no autorizado directamente sobre el "clúster" (saltándose Git) y ejecuta la reconciliación:

```bash
echo "replicas: 99" > estado-real-clúster.yaml
echo "--- cambio manual aplicado directamente al clúster, saltándose Git ---"
cat estado-real-clúster.yaml
./reconciliar.sh
cat estado-real-clúster.yaml
```

**Resultado esperado:** tras el cambio manual, `estado-real-clúster.yaml` muestra `replicas: 99`; al ejecutar `reconciliar.sh`, el script detecta la deriva y revierte automáticamente el archivo de vuelta a `replicas: 3` (el estado declarado en Git), demostrando el comportamiento central de auto-corrección de GitOps sin que nadie ejecutara ningún comando de despliegue manual.

**Fallo deliberado:** modifica el estado deseado directamente en Git (`echo 'replicas: 5' > deployment-mi-api.yaml`) sin hacer commit del cambio, y ejecuta `reconciliar.sh`. El script reconcilia comparando contra el archivo de trabajo sin commitear — diagnostica revisando `git status` dentro del repo: confirma que en un agente GitOps real, la reconciliación observa el estado commiteado en la rama configurada, no cambios sin commitear en el árbol de trabajo; un cambio real requeriría un commit (y típicamente un push) para que el agente lo reconcilie.

#### Paso 5 · Práctica guiada

Modifica `deployment-mi-api.yaml`, haz commit del cambio dentro del contenedor `alpine/git` (`git add -A && git commit -m "actualizar replicas a 5"`), y ejecuta `reconciliar.sh` para confirmar que el estado real se actualiza al nuevo valor commiteado. **Pista:** este es el flujo real de un despliegue GitOps: cambiar Git, no ejecutar un comando de despliegue directo.

#### Paso 6 · Práctica independiente

Extiende `reconciliar.sh` para que registre en un archivo `historial-reconciliacion.log` cada vez que detecta y corrige una deriva, con una marca de tiempo, simulando el registro de auditoría que un agente GitOps real mantendría de cada reconciliación efectuada.

#### Paso 7 · Cierre

Ya demuestras el modelo de reconciliación pull-based de GitOps y su capacidad de auto-corrección ante cambios manuales no autorizados. El siguiente y último tema del módulo aborda cómo estas prácticas se consolidan a escala organizacional mediante Platform Engineering. Fuente oficial: [OpenGitOps — Principles](https://opengitops.dev/).

**Errores comunes:** modificar recursos manualmente en el clúster esperando que el cambio persista, sin entender que un agente GitOps lo revertirá en su siguiente ciclo; olvidar hacer commit (y push) de un cambio, asumiendo incorrectamente que el agente ya lo detectó.

**Cuándo no usarlo:** para un entorno de un solo desarrollador con despliegues muy infrecuentes y de bajo riesgo, la complejidad adicional de operar un agente GitOps puede no justificarse frente a un `kubectl apply` manual simple y ocasional.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Introduce un cambio de imagen mediante Git y observa la reconciliación en el clúster. Provoca drift manual en laboratorio y demuestra cómo se detecta y restaura el estado declarado.

### Tema 6: Platform Engineering — Internal Developer Platforms (IDPs)

#### Paso 1 · Objetivo y preparación

Al finalizar podrás explicar el problema que resuelve una Internal Developer Platform y diseñar una interfaz mínima de autoservicio para una tarea común de despliegue.

**Conocimiento previo:** todos los módulos anteriores de este track (Kubernetes, Terraform, CI/CD, observabilidad, seguridad).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** A medida que una organización crece en número de equipos y servicios, Platform Engineering e IDPs son la respuesta a escala al mismo problema fundamental que este track completo aborda a nivel individual: aplicar de forma consistente las buenas prácticas de CI/CD, seguridad y observabilidad, en vez de que cada equipo las redescubra de forma inconsistente.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** plataforma interna de desarrollo, autoservicio para equipos de producto, abstracción de complejidad operativa.

Cada equipo que necesita desplegar una aplicación nueva enfrenta complejidad operativa considerable (manifiestos de Kubernetes, pipelines de CI/CD, políticas de seguridad, dashboards de observabilidad); si cada equipo la resuelve por su cuenta, produce inconsistencia y duplica esfuerzo. Una IDP expone una interfaz simplificada (un formulario, un archivo mínimo, un comando de CLI interno) para tareas comunes, sin que cada equipo entienda toda la complejidad subyacente. La IDP no reemplaza Kubernetes, Terraform o Prometheus; los orquesta y expone de forma estandarizada, encapsulando las buenas prácticas de este track como comportamiento por defecto.

**Analogía:** sin una IDP, cada equipo es un cocinero que construye su propia cocina desde cero en cada restaurante nuevo. Una IDP es una cocina estandarizada y preconstruida que la cadena entera proporciona: el cocinero se concentra en cocinar, mientras la infraestructura ya viene correctamente configurada y consistente.

**Diagrama:**

```
┌── Sin IDP ──────────────────────────┐   ┌── Con IDP ───────────────────────────┐
│ Equipo A construye su pipeline desde cero  │   │ Equipos A, B y C usan la MISMA plataforma  │
│ Equipo B construye el suyo, distinto           │   │ de autoservicio (orquesta Kubernetes,        │
│ Equipo C construye el suyo, inconsistente       │ ≠ │ Terraform, CI/CD, observabilidad, seguridad)  │
│ Resultado: inconsistencia, duplicación             │   │ Resultado: consistencia, menor fricción         │
└─────────────────────────────────┘   └───────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo12/idp-minima` con un script de CLI interno mínimo que representa una IDP muy simplificada: un solo comando que genera todos los artefactos estandarizados (Dockerfile, workflow de CI, manifiesto de Kubernetes) para un servicio nuevo:

```bash
mkdir -p academia-devops/src/modulo12/idp-minima
cd academia-devops/src/modulo12/idp-minima
cat > crear-servicio.sh <<'EOF'
#!/bin/sh
NOMBRE_SERVICIO=$1
if [ -z "$NOMBRE_SERVICIO" ]; then
  echo "Uso: ./crear-servicio.sh <nombre-del-servicio>"
  exit 1
fi
mkdir -p "servicios/$NOMBRE_SERVICIO/.github/workflows"
cat > "servicios/$NOMBRE_SERVICIO/Dockerfile" <<DOCKERFILE
FROM node:22-alpine
WORKDIR /app
CMD ["node", "-e", "console.log('$NOMBRE_SERVICIO activo')"]
DOCKERFILE
cat > "servicios/$NOMBRE_SERVICIO/.github/workflows/ci.yml" <<CIYML
name: CI de $NOMBRE_SERVICIO
on: [pull_request]
jobs:
  escaneo-seguridad:
    runs-on: ubuntu-latest
    steps:
      - run: echo "escaneo estandar de la plataforma (Modulo 11)"
CIYML
cat > "servicios/$NOMBRE_SERVICIO/deployment.yaml" <<DEPLOY
apiVersion: apps/v1
kind: Deployment
metadata:
  name: $NOMBRE_SERVICIO
spec:
  replicas: 2
  template:
    spec:
      containers:
        - name: $NOMBRE_SERVICIO
          livenessProbe: { httpGet: { path: /health, port: 3000 } }
DEPLOY
echo "Servicio '$NOMBRE_SERVICIO' creado con CI, seguridad y healthchecks preconfigurados."
EOF
chmod +x crear-servicio.sh
./crear-servicio.sh mi-nuevo-servicio
find servicios -type f
```

**Ejecuta el ejemplo** (desde una terminal con las herramientas instaladas):

```bash
bash ejemplo.sh
```
Verifica la salida y el estado de los recursos creados.


**Explicación línea por línea:** un equipo de producto ejecuta un único comando (`./crear-servicio.sh mi-nuevo-servicio`) sin necesitar escribir manualmente ningún Dockerfile, workflow de CI o manifiesto de Kubernetes; la "plataforma" (este script, en una IDP real sería una herramienta interna mucho más sofisticada) ya incorpora el escaneo de seguridad del Módulo 11 y el healthcheck del Módulo 3/6 como comportamiento por defecto, sin que el equipo de producto tenga que recordarlos ni configurarlos manualmente.

Confirma que dos equipos distintos, usando la misma IDP mínima, obtienen servicios consistentes sin ninguna variación accidental entre ellos:

```bash
./crear-servicio.sh servicio-equipo-b
diff servicios/mi-nuevo-servicio/.github/workflows/ci.yml servicios/servicio-equipo-b/.github/workflows/ci.yml | grep -v "^[<>] name:"
echo "diferencias fuera del nombre del servicio: (vacío si son consistentes)"
```

**Resultado esperado:** ambos servicios generados comparten exactamente la misma estructura de CI, seguridad y healthcheck, difiriendo únicamente en su nombre — el `diff` filtrado por líneas de nombre no muestra ninguna otra diferencia, confirmando la consistencia que una IDP aporta frente a que cada equipo construyera su propio pipeline de forma independiente.

**Fallo deliberado:** crea manualmente un tercer servicio sin usar `crear-servicio.sh` (por ejemplo, con un `mkdir` y un Dockerfile escrito a mano, omitiendo el escaneo de seguridad y el healthcheck). Compáralo con los servicios generados por la IDP — le faltan el workflow de CI y el healthcheck por completo — diagnostica confirmando exactamente el problema que una IDP resuelve: sin la plataforma de autoservicio, nada garantiza que un equipo recuerde incluir esas prácticas, mientras que pasar por la IDP las incluye automáticamente sin depender de que alguien las recuerde.

#### Paso 5 · Práctica guiada

Agrega al script `crear-servicio.sh` la generación adicional de un archivo `README.md` con una plantilla estándar (nombre del servicio, cómo ejecutarlo localmente, a quién contactar), y confirma que el nuevo servicio generado lo incluye automáticamente. **Pista:** sigue el mismo patrón de heredoc (`cat > archivo <<EOF`) ya usado para los demás artefactos.

#### Paso 6 · Práctica independiente

Documenta en una frase qué otra práctica de este track (por ejemplo, un dashboard de Grafana preconfigurado del Módulo 9, o una política de RBAC acotada del Módulo 11) incluirías por defecto en una IDP real para tu propio contexto de proyecto, y por qué.

#### Paso 7 · Cierre

Ya explicas el problema que resuelve una IDP y demuestras, con un ejemplo mínimo, cómo garantiza consistencia entre equipos sin que cada uno redescubra las mismas buenas prácticas de forma independiente. Esto cierra el track de DevOps completo: desde el shell scripting básico del Módulo 0 hasta la consolidación organizacional de estas prácticas en una plataforma interna; el siguiente módulo aplica todo este recorrido en conjunto sobre un proyecto propio. Fuente oficial: [Platform Engineering — What is an Internal Developer Platform](https://platformengineering.org/blog/what-is-an-internal-developer-platform).

**Errores comunes:** construir una IDP demasiado rígida que no permite ninguna personalización legítima que un equipo específico realmente necesite; confundir una IDP con simplemente documentación de buenas prácticas sin ninguna automatización real que las aplique por defecto.

**Cuándo no usarlo:** para una organización con un solo equipo pequeño y un solo servicio, construir una IDP formal es una sobre-inversión; el valor de una IDP aparece con múltiples equipos repitiendo el mismo esfuerzo de configuración de forma independiente.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Convierte el script de autoservicio en la forma estándar en que cualquier equipo agrega un servicio nuevo a la plataforma, con CI, escaneo de seguridad y healthchecks del track ya incorporados por defecto, sin que cada equipo los redescubra por su cuenta.

---


## Laboratorio práctico

**Objetivo del laboratorio:** documentar la migración de un módulo Terraform del track Cloud (Floci) hacia un proveedor cloud real, comparar la gestión de secretos entre ambos contextos, y construir una checklist de salida a producción aplicada a un proyecto propio.

**Requisitos previos:** un módulo Terraform escrito contra Floci (del Módulo 8 de este track, o el proyecto final del track Cloud), acceso conceptual o real a una cuenta de un proveedor cloud real (no es necesario ejecutar cambios reales para este laboratorio si prefieres solo documentar el proceso).

| Paso | Acción | Documentación esperada | Explicación |
|---|---|---|---|
| 1 | Identificar los cambios de configuración necesarios | Documenta exactamente qué líneas de tu configuración Terraform cambiarían (endpoint, credenciales) al pasar de Floci a AWS/Azure/GCP real | Aplica el Tema 1 a tu propio código específico |
| 2 | Comparar la gestión de secretos | Escribe un documento comparando cómo gestionabas secretos localmente (`.env` o variables de entorno) contra cómo los gestionarías con Secrets Manager (o equivalente) en producción real | Aplica el Tema 2 |
| 3 | Construir tu checklist de producción | Escribe una checklist propia de al menos 15 ítems, cubriendo las cinco categorías del Tema 4 (observabilidad, seguridad, resiliencia, costos, documentación) | Aplica el Tema 4 a un nivel de detalle concreto y accionable, no genérico |
| 4 | Aplicar la checklist a un proyecto propio | Toma un proyecto tuyo (de este track o de otro) y marca honestamente qué ítems de tu checklist ya cumple y cuáles no | Convierte la checklist en una herramienta de diagnóstico real, no solo teórica |
| 5 | Documentar qué le falta | Para cada ítem no cumplido, escribe una nota breve de qué se necesitaría para cumplirlo | Convierte los huecos identificados en un plan de acción concreto |

**Verificación:** el laboratorio se considera exitoso si el documento de migración del paso 1 identifica correctamente y con precisión técnica los cambios exactos de endpoint y credenciales, y si la checklist aplicada en el paso 4 a un proyecto real identifica honestamente al menos un ítem no cumplido (una checklist que "pasa todo perfectamente" en el primer intento es, con alta probabilidad, una checklist demasiado superficial o generosa consigo misma).

**Errores comunes y soluciones**

- **La checklist queda demasiado genérica ("tener buena seguridad") en vez de accionable.** Reescribe cada ítem para que sea verificable de forma objetiva y binaria (sí/no), como "el pipeline bloquea el merge si Trivy reporta una vulnerabilidad crítica" en vez de simplemente "seguridad revisada".
- **El documento de comparación de secretos no menciona la integración con el pipeline de despliegue.** Asegúrate de describir explícitamente el flujo completo: cómo el pipeline se autentica, cómo consulta el secreto, y en qué momento exacto se inyecta, no solo "dónde vive" el secreto de forma aislada.
- **Aplicar la checklist al proyecto propio resulta en que "todo cumple perfectamente".** Revisa con más escepticismo cada ítem, especialmente resiliencia (¿el rollback fue realmente PROBADO, no solo documentado teóricamente?) y documentación (¿existe realmente un runbook, o solo la intención de escribirlo algún día?).

---
