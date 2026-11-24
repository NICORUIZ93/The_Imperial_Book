# Módulo 25: Gobierno, configuración y continuidad — AWS Config, AppConfig y Backup


## Aprende construyendo


### Tema 1: AWS Config — rastrear reglas sobre tus recursos · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a declarar la regla que, contra AWS real, vigilaría que el bucket de evidencias de entrega de RutaFlow (pruebas-entrega, Módulo 2) siempre tenga versionado activo. Prerrequisitos: Módulo 2 completo.

#### ► LA ANALOGÍA
Una regla de Config es un checklist ("este bucket debe tener versionado"); el grabador conserva evidencia de qué recursos existen; el estado de cumplimiento agrupa el resultado de aplicar el checklist a cada uno.

**Conceptos clave:** regla de configuración, grabador de configuración, paquete de conformidad, estado de cumplimiento.

AWS Config existe para responder una pregunta que crece en importancia a medida que una cuenta tiene más recursos: "¿mis recursos cumplen las reglas que definí, y quién cambió qué y cuándo?" El servicio se organiza en tres piezas: reglas de configuración (`PutConfigRule`) que describen una condición deseada —por ejemplo, "todo bucket S3 debe tener versionado activo"—, un grabador de configuración (`PutConfigurationRecorder`) que decide qué tipos de recursos observar, y paquetes de conformidad (`PutConformancePack`) que agrupan varias reglas relacionadas para desplegarlas juntas como una política reutilizable.

En Floci, las reglas, grabadores y paquetes de conformidad se almacenan y se devuelven correctamente vía API —puedes construir y probar la lógica de gestión de tu infraestructura como código (Terraform, CDK) contra ellos—, pero el estado de cumplimiento siempre reporta `INSUFFICIENT_DATA`, porque Floci no ejecuta la evaluación real de recursos que en AWS verificaría si, por ejemplo, tus buckets realmente tienen versionado activo. Esta es una limitación explícita y documentada, no un bug: evaluar cumplimiento real requeriría reimplementar la lógica completa de cada regla administrada por AWS.

**Analogía:** AWS Config en Floci es como tener el formulario de auditoría completamente diseñado y archivado correctamente, pero sin un auditor real todavía revisando cada expediente para marcar aprobado o rechazado — la estructura del proceso está lista, falta la evaluación de contenido.

**¿Por qué es importante?** Practicar la creación de reglas, grabadores y paquetes de conformidad vía IaC es exactamente el mismo flujo de trabajo que usarías para desplegar gobierno de cumplimiento en una cuenta real, aunque la verificación de "¿de verdad cumple?" la debas validar contra AWS real antes de confiar en ella para producción.

**Practícalo tú:**

```bash

# archivo: src/labs/modulo-25/tema-1-config-rule.sh — ejecutar con: bash tema-1-config-rule.sh
aws configservice put-config-rule --config-rule '{"ConfigRuleName":"demo-s3-versionado","Source":{"Owner":"AWS","SourceIdentifier":"S3_BUCKET_VERSIONING_ENABLED"}}'
aws configservice describe-config-rules --query "ConfigRules[?ConfigRuleName=='demo-s3-versionado']"
aws configservice describe-compliance-by-config-rule --config-rule-names demo-s3-versionado
```

`--config-rule` es el JSON que describe la regla (acá, referenciando una regla administrada por AWS, `S3_BUCKET_VERSIONING_ENABLED`); `--config-rule-names` filtra la consulta de cumplimiento por el nombre de esa regla específica. En resumen: `--config-rule-names` es la bandera que filtra la consulta por nombre de regla.

**Resultado esperado:** la regla queda registrada y consultable con `describe-config-rules`; `describe-compliance-by-config-rule` devuelve `INSUFFICIENT_DATA` — recuerda que Floci no evalúa cumplimiento real, solo gestiona el plano de reglas.

**Modifica esto:** agrupa esta regla dentro de un paquete de conformidad con `put-conformance-pack` y confirma con `describe-conformance-packs` que quedó asociada.

**Cuándo no usarlo:** no reportes `INSUFFICIENT_DATA` como "cumple" en ningún dashboard real; es la ausencia de evaluación, no una aprobación.

**Cómo crece tu proyecto:** esta regla es la que, contra AWS real, verificaría que el bucket de evidencias de entrega del proyecto siempre tenga versionado activo.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Define una regla de configuración para los recursos de evidencias. Introduce una desviación controlada y registra tanto el resultado de evaluación como la corrección aplicada al recurso afectado.


</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-25/tema-1-config-rule.sh — ejecutar con: bash tema-1-config-rule.sh
aws configservice put-config-rule --config-rule '{"ConfigRuleName":"demo-s3-versionado","Source":{"Owner":"AWS","SourceIdentifier":"S3_BUCKET_VERSIONING_ENABLED"}}'
aws configservice describe-config-rules --query "ConfigRules[?ConfigRuleName=='demo-s3-versionado']"
aws configservice describe-compliance-by-config-rule --config-rule-names demo-s3-versionado
```

```bash
aws configservice put-config-rule --config-rule '{"ConfigRuleName":"pruebas-entrega-versionado","Source":{"Owner":"AWS","SourceIdentifier":"S3_BUCKET_VERSIONING_ENABLED"}}'
aws configservice describe-config-rules --query "ConfigRules[?ConfigRuleName=='pruebas-entrega-versionado']"
```

</details>

### Tema 2: AppConfig — desplegar configuración sin redeployar código · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a crear un feature flag real para activar el modo mantenimiento del servicio de seguimiento (Módulo 24), sin recompilar ni redesplegar nada. Prerrequisitos: Módulo 24 completo.

#### ► LA ANALOGÍA
AppConfig es un archivador por aplicación, entorno y perfil: cada cambio de configuración queda versionado y auditable, como un despliegue de código, no como sobrescribir un archivo a mano.

**Conceptos clave:** aplicación, entorno, perfil de configuración, estrategia de despliegue.

AppConfig resuelve un problema muy concreto: cambiar un valor de configuración —un feature flag, un límite de tasa, un mensaje de mantenimiento— sin tener que recompilar y redesplegar toda tu aplicación. El modelo tiene cuatro niveles: una aplicación (`CreateApplication`) agrupa el trabajo; un entorno (`CreateEnvironment`, por ejemplo `dev` o `prod`) representa dónde se aplica la configuración; un perfil de configuración (`CreateConfigurationProfile`) define de dónde viene el contenido —en este curso, configuración "alojada" directamente en AppConfig—; y una versión de configuración alojada (`CreateHostedConfigurationVersion`) es el contenido real, versionado como cualquier artefacto.

Para efectivamente cambiar la configuración que ve tu aplicación, creas una estrategia de despliegue (`CreateDeploymentStrategy`, por ejemplo "inmediata" con duración cero) y ejecutas `StartDeployment` apuntando una versión de configuración específica a un entorno. Esto es deliberadamente distinto de simplemente sobrescribir un archivo: cada despliegue de configuración queda versionado y auditable, exactamente como un despliegue de código.

**Analogía:** AppConfig es como un panel de control central de un edificio inteligente donde puedes cambiar la temperatura objetivo de todos los termostatos con una sola actualización versionada y reversible, en vez de tener que ir físicamente a reprogramar cada termostato uno por uno.

**¿Por qué es importante?** Separar "cambios de comportamiento" (configuración) de "cambios de código" (despliegue de artefactos) es lo que permite reaccionar en minutos —no en un ciclo completo de CI/CD— ante un feature flag que hay que desactivar urgentemente en producción.

**Practícalo tú:**

```bash

# archivo: src/labs/modulo-25/tema-2-appconfig.sh — ejecutar con: bash tema-2-appconfig.sh
APP_ID=$(aws appconfig create-application --name demo-config --query 'Id' --output text)
ENV_ID=$(aws appconfig create-environment --application-id "$APP_ID" --name dev --query 'Id' --output text)
PROFILE_ID=$(aws appconfig create-configuration-profile --application-id "$APP_ID" \
  --name feature-flags --location-uri hosted --type AWS.Freeform --query 'Id' --output text)
aws appconfig create-hosted-configuration-version --application-id "$APP_ID" \
  --configuration-profile-id "$PROFILE_ID" --content '{"modo_mantenimiento": false}' --content-type application/json
```

`--application-id` encadena cada comando a la aplicación creada en el paso anterior; `--location-uri hosted` le dice al perfil que el contenido vive dentro de AppConfig mismo (no en un S3 o SSM externo); `--configuration-profile-id` identifica ese perfil al crear una versión de configuración; `--content` es el valor real (acá, JSON) y `--content-type` declara su formato. En resumen: `--application-id` es la bandera que fija a qué aplicación pertenece cada recurso, y `--location-uri` es la bandera que fija dónde vive el contenido del perfil.

**Resultado esperado:** cada comando devuelve el ID correspondiente (`APP_ID`, `ENV_ID`, `PROFILE_ID`) y la versión de configuración queda registrada con `VersionNumber: 1`, lista para desplegarse.

**Modifica esto:** crea una segunda versión con `"modo_mantenimiento": true` y despliega solo esa versión — confirma que la anterior sigue existiendo, versionada, para poder volver a ella.

**Cuándo no usarlo:** no uses AppConfig para secretos (contraseñas, claves API); para eso está Secrets Manager o Parameter Store con cifrado, no configuración de aplicación en texto plano.

**Cómo crece tu proyecto:** este feature flag activa o desactiva el modo mantenimiento del servicio de seguimiento sin recompilar ni redesplegar código.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Controla la activación de un proveedor de notificaciones mediante configuración versionada. Prueba un despliegue gradual y una reversión manteniendo el mismo artefacto de aplicación.


</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-25/tema-2-appconfig.sh — ejecutar con: bash tema-2-appconfig.sh
APP_ID=$(aws appconfig create-application --name demo-config --query 'Id' --output text)
ENV_ID=$(aws appconfig create-environment --application-id "$APP_ID" --name dev --query 'Id' --output text)
PROFILE_ID=$(aws appconfig create-configuration-profile --application-id "$APP_ID" \
  --name feature-flags --location-uri hosted --type AWS.Freeform --query 'Id' --output text)
aws appconfig create-hosted-configuration-version --application-id "$APP_ID" \
  --configuration-profile-id "$PROFILE_ID" --content '{"modo_mantenimiento": false}' --content-type application/json
```

```bash
APP_ID=$(aws appconfig create-application --name demo-config --query 'Id' --output text)
ENV_ID=$(aws appconfig create-environment --application-id "$APP_ID" --name dev --query 'Id' --output text)
PROFILE_ID=$(aws appconfig create-configuration-profile --application-id "$APP_ID" \
  --name feature-flags --location-uri hosted --type AWS.Freeform --query 'Id' --output text)
aws appconfig create-hosted-configuration-version --application-id "$APP_ID" \
  --configuration-profile-id "$PROFILE_ID" --content '{"modo_mantenimiento": false}' --content-type application/json
```

</details>

### Tema 3: AppConfigData — el plano de datos que consume tu aplicación · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a leer el feature flag del Tema 2 exactamente como lo leería el servicio de seguimiento en ejecución, sin reiniciarse. Prerrequisitos: Tema 2 de este módulo.

#### ► LA ANALOGÍA
La sesión de AppConfigData entrega un token; cada consulta posterior con ese token devuelve solo lo que cambió desde la última vez, como suscribirte a las actualizaciones de un documento en vez de redescargarlo entero.

**Conceptos clave:** sesión de configuración, `GetLatestConfiguration`, token de configuración.

Mientras AppConfig es el plano de gestión que tú usas para definir y desplegar configuración, AppConfigData es el plano de datos que tu aplicación en ejecución usa para leerla: primero abre una sesión con `StartConfigurationSession` especificando la aplicación, entorno y perfil que le interesan, recibiendo un token inicial; luego, periódicamente, llama a `GetLatestConfiguration` con ese token, que devuelve el contenido de configuración más reciente (o una respuesta vacía si no cambió desde la última consulta, ahorrando ancho de banda) junto con un nuevo token para la siguiente consulta.

Este patrón de "sesión más polling eficiente" es exactamente lo que hace el SDK de AppConfig del lado del cliente para tu aplicación de forma transparente, y entender el flujo subyacente te ayuda a diagnosticar problemas de configuración que no se están actualizando cuando esperas que lo hagan.

**Analogía:** una sesión de AppConfigData es como suscribirte a las actualizaciones de un documento colaborativo: en vez de volver a descargar el documento completo cada vez que quieres saber si cambió, simplemente preguntas "¿hay algo nuevo desde la última vez que pregunté?" y solo recibes contenido cuando efectivamente cambió.

**¿Por qué es importante?** Separar explícitamente plano de gestión (quién despliega configuración) de plano de datos (cómo la consume la aplicación) es el mismo patrón arquitectónico que ya viste en otros servicios de AWS, y reconocerlo aquí refuerza esa intuición general.

**Practícalo tú:**

```bash

# archivo: src/labs/modulo-25/tema-3-appconfigdata.sh — ejecutar con: bash tema-3-appconfigdata.sh
# Los tres IDs se recuperan por nombre, no de la sesión de terminal del Tema 2.
APP_ID=$(aws appconfig list-applications --query "Items[?Name=='demo-config'].Id | [0]" --output text)
ENV_ID=$(aws appconfig list-environments --application-id "$APP_ID" --query "Items[?Name=='dev'].Id | [0]" --output text)
PROFILE_ID=$(aws appconfig list-configuration-profiles --application-id "$APP_ID" \
  --query "Items[?Name=='feature-flags'].Id | [0]" --output text)

TOKEN=$(aws appconfigdata start-configuration-session \
  --application-identifier "$APP_ID" --environment-identifier "$ENV_ID" \
  --configuration-profile-identifier "$PROFILE_ID" --query InitialConfigurationToken --output text)
aws appconfigdata get-latest-configuration --configuration-token "$TOKEN"
```

`--application-identifier`, `--environment-identifier` y `--configuration-profile-identifier` son los mismos tres IDs de siempre (aplicación, entorno, perfil), solo que con nombre de bandera distinto en esta API de plano de datos; `--configuration-token` es el token de sesión que te dice qué versión ya viste, para no volver a descargar contenido que no cambió. En resumen: `--application-identifier` es la bandera equivalente a `--application-id` en la API de plano de datos; `--environment-identifier` es la bandera equivalente a `--environment-id`; y `--configuration-profile-identifier` es la bandera equivalente a `--configuration-profile-id`.

**Resultado esperado:** tras desplegar la configuración del Tema 2, `get-latest-configuration` devuelve el JSON `{"modo_mantenimiento": false}` y un nuevo token para la siguiente consulta.

**Modifica esto:** vuelve a llamar `get-latest-configuration` inmediatamente con el nuevo token, sin que haya cambiado nada, y confirma que el contenido viene vacío — así ahorra ancho de banda cuando no hay novedades.

**Cuándo no usarlo:** no abras una sesión nueva en cada petición de tu aplicación; el patrón correcto es abrir una sesión una vez y reusar el token en cada consulta periódica.

**Cómo crece tu proyecto:** el servicio de seguimiento usa exactamente este flujo de sesión + polling para enterarse de cambios de configuración sin reiniciarse.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Haz que el consumidor consulte configuración usando el protocolo del plano de datos. Registra versión y renovación de la sesión sin interpretar una respuesta sin cambios como una configuración vacía.


</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-25/tema-3-appconfigdata.sh — ejecutar con: bash tema-3-appconfigdata.sh
# Los tres IDs se recuperan por nombre, no de la sesión de terminal del Tema 2.
APP_ID=$(aws appconfig list-applications --query "Items[?Name=='demo-config'].Id | [0]" --output text)
ENV_ID=$(aws appconfig list-environments --application-id "$APP_ID" --query "Items[?Name=='dev'].Id | [0]" --output text)
PROFILE_ID=$(aws appconfig list-configuration-profiles --application-id "$APP_ID" \
  --query "Items[?Name=='feature-flags'].Id | [0]" --output text)

TOKEN=$(aws appconfigdata start-configuration-session \
  --application-identifier "$APP_ID" --environment-identifier "$ENV_ID" \
  --configuration-profile-identifier "$PROFILE_ID" --query InitialConfigurationToken --output text)
aws appconfigdata get-latest-configuration --configuration-token "$TOKEN"
```

```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
TOKEN=$(aws appconfigdata start-configuration-session \
  --application-identifier "$APP_ID" --environment-identifier "$ENV_ID" \
  --configuration-profile-identifier "$PROFILE_ID" --query InitialConfigurationToken --output text)
aws appconfigdata get-latest-configuration --configuration-token "$TOKEN"
```

</details>

### Tema 4: AWS Backup — centralizar la política de respaldo de múltiples servicios · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a centralizar el respaldo diario de ShipmentEvents (Módulo 4) en un plan de AWS Backup, en vez de gestionar snapshots sueltos servicio por servicio. Prerrequisitos: Módulo 4 completo.

#### ► LA ANALOGÍA
Una bóveda guarda los puntos de recuperación; un plan define cuándo y con qué frecuencia respaldar; una selección asigna recursos concretos (por ARN) a ese plan — una sola póliza en vez de varias independientes por servicio.

**Conceptos clave:** bóveda de respaldo, plan de respaldo, selección de recursos, punto de recuperación.

En lugar de configurar copias de seguridad servicio por servicio —snapshots de RDS por un lado, respaldos de DynamoDB por otro—, AWS Backup centraliza la política: una bóveda de respaldo (`CreateBackupVault`) es el contenedor donde se almacenan los puntos de recuperación; un plan de respaldo (`CreateBackupPlan`) define reglas de cuándo y con qué frecuencia respaldar (expresadas como una expresión cron), hacia qué bóveda, y con qué ventanas de tiempo permitidas; y una selección de recursos (`CreateBackupSelection`) asigna recursos específicos —identificados por ARN— a ese plan.

Además de los respaldos programados por el plan, puedes iniciar un respaldo bajo demanda con `StartBackupJob` apuntando directamente a un recurso y una bóveda. Floci soporta como tipos de recurso S3, RDS, DynamoDB, EFS, EC2, EBS, Aurora, DocumentDB, Neptune, FSx y máquinas virtuales genéricas — la misma lista amplia de AWS real, aunque la copia de seguridad en sí se simula: no se leen ni escriben datos reales de los recursos referenciados, solo se gestiona correctamente el ciclo de vida del trabajo y del punto de recuperación resultante.

**Analogía:** AWS Backup es como contratar un servicio único de seguros que cubre tu casa, tu auto y tu negocio con una sola póliza y un solo calendario de revisiones, en vez de gestionar tres pólizas independientes con tres aseguradoras distintas.

**¿Por qué es importante?** Centralizar la política de respaldo reduce drásticamente la probabilidad de que un servicio quede sin protección por descuido — un riesgo real y común en cuentas AWS que crecen orgánicamente sin una estrategia de respaldo unificada desde el principio.

**Practícalo tú:**

```bash

# archivo: src/labs/modulo-25/tema-4-backup-plan.sh — ejecutar con: bash tema-4-backup-plan.sh
aws backup create-backup-vault --backup-vault-name demo-boveda
PLAN_ID=$(aws backup create-backup-plan --backup-plan \
  '{"BackupPlanName":"demo-diario","Rules":[{"RuleName":"diario","TargetBackupVaultName":"demo-boveda","ScheduleExpression":"cron(0 12 * * ? *)"}]}' \
  --query 'BackupPlanId' --output text)
aws backup create-backup-selection --backup-plan-id "$PLAN_ID" --backup-selection \
  '{"SelectionName":"tablas-demo","IamRoleArn":"arn:aws:iam::000000000000:role/backup-role","Resources":["arn:aws:dynamodb:us-east-1:000000000000:table/demo-entregas"]}'
```

`--backup-vault-name` nombra la bóveda de destino; `--backup-plan` es el JSON con las reglas de cuándo respaldar (acá, una expresión cron diaria); `--backup-plan-id` (tomado de la respuesta anterior) identifica a qué plan asignarle la selección; `--backup-selection` es el JSON que dice qué recursos concretos (por ARN) protege ese plan.

**Resultado esperado:** la bóveda, el plan y la selección quedan creados y encadenados; `aws backup list-backup-plans` muestra `demo-diario` con su regla cron de las 12:00.

**Modifica esto:** intenta borrar `demo-boveda` con `delete-backup-vault` antes de tener ningún punto de recuperación — a diferencia del Tema 5, aquí sí debería funcionar porque todavía no hay puntos de recuperación que proteger.

**Cuándo no usarlo:** no confíes en la ejecución real de datos de este respaldo: Floci gestiona el ciclo de vida del trabajo, pero no lee ni escribe los datos reales de la tabla DynamoDB referenciada.

**Cómo crece tu proyecto:** este plan protege la tabla de entregas con un respaldo diario automático, sin que nadie tenga que ejecutarlo a mano.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Asigna retención y objetivos de recuperación a los datos de entregas. Selecciona los recursos cubiertos y demuestra una restauración de prueba; una política creada sin recuperación observada no cierra el incremento.


</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-25/tema-4-backup-plan.sh — ejecutar con: bash tema-4-backup-plan.sh
aws backup create-backup-vault --backup-vault-name demo-boveda
PLAN_ID=$(aws backup create-backup-plan --backup-plan \
  '{"BackupPlanName":"demo-diario","Rules":[{"RuleName":"diario","TargetBackupVaultName":"demo-boveda","ScheduleExpression":"cron(0 12 * * ? *)"}]}' \
  --query 'BackupPlanId' --output text)
aws backup create-backup-selection --backup-plan-id "$PLAN_ID" --backup-selection \
  '{"SelectionName":"tablas-demo","IamRoleArn":"arn:aws:iam::000000000000:role/backup-role","Resources":["arn:aws:dynamodb:us-east-1:000000000000:table/demo-entregas"]}'
```

```bash
aws backup create-backup-vault --backup-vault-name demo-boveda
PLAN_ID=$(aws backup create-backup-plan --backup-plan \
  '{"BackupPlanName":"demo-diario","Rules":[{"RuleName":"diario","TargetBackupVaultName":"demo-boveda","ScheduleExpression":"cron(0 12 * * ? *)"}]}' \
  --query 'BackupPlanId' --output text)
aws backup create-backup-selection --backup-plan-id "$PLAN_ID" --backup-selection \
  '{"SelectionName":"shipment-events","IamRoleArn":"arn:aws:iam::000000000000:role/backup-role","Resources":["arn:aws:dynamodb:us-east-1:000000000000:table/ShipmentEvents"]}'
```

</details>

### Tema 5: El ciclo de vida de un trabajo de respaldo · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a disparar un respaldo bajo demanda de ShipmentEvents antes de una migración riesgosa, sin esperar al cron diario del Tema 4. Prerrequisitos: Tema 4 de este módulo.

#### ► LA ANALOGÍA
El estado del job de respaldo es un semáforo (`CREATED → RUNNING → COMPLETED`) que te dice si ya es seguro continuar con la migración o si todavía hay que esperar.

**Conceptos clave:** `CREATED → RUNNING → COMPLETED`, punto de recuperación, `StopBackupJob`.

Un trabajo de respaldo iniciado con `StartBackupJob` transiciona automáticamente por estados: `CREATED` al iniciar, `RUNNING` aproximadamente un segundo después, y `COMPLETED` tras un retraso configurable (por defecto 3 segundos en Floci, ajustable con `FLOCI_SERVICES_BACKUP_JOB_COMPLETION_DELAY_SECONDS` para acelerar pruebas automatizadas). Al llegar a `COMPLETED`, se crea un punto de recuperación en la bóveda de destino, y el contador de puntos de recuperación de esa bóveda se incrementa — información que puedes auditar en cualquier momento con `DescribeBackupVault`.

Restricciones importantes a tener en cuenta: no puedes eliminar una bóveda que contiene puntos de recuperación (`DeleteBackupVault` falla con `InvalidRequestException`), ni un plan que todavía tiene selecciones activas asociadas — tienes que deshacer las dependencias en orden inverso a como las creaste, el mismo patrón de "no puedes borrar lo que todavía está en uso" que ya viste con grupos objetivo de ELB en el Módulo 22.

**Analogía:** el ciclo de vida de un trabajo de respaldo es como el proceso de un banco al procesar un depósito: primero se registra la solicitud (`CREATED`), luego se procesa activamente (`RUNNING`), y finalmente queda confirmado y disponible en tu cuenta (`COMPLETED`) — no puedes cerrar la cuenta bancaria mientras haya depósitos pendientes de procesar.

**¿Por qué es importante?** Entender que las restricciones de eliminación existen para prevenir pérdida accidental de datos de respaldo —no son limitaciones arbitrarias de la API— te ayuda a diseñar scripts de limpieza de infraestructura que respeten el orden correcto de dependencias.

**Practícalo tú:**

```bash

# archivo: src/labs/modulo-25/tema-5-ciclo-de-vida.sh — ejecutar con: bash tema-5-ciclo-de-vida.sh
JOB_ID=$(aws backup start-backup-job --backup-vault-name demo-boveda \
  --resource-arn arn:aws:dynamodb:us-east-1:000000000000:table/demo-entregas \
  --iam-role-arn arn:aws:iam::000000000000:role/backup-role --query 'BackupJobId' --output text)
sleep 4
aws backup describe-backup-job --backup-job-id "$JOB_ID" --query 'State'
aws backup describe-backup-vault --backup-vault-name demo-boveda --query 'NumberOfRecoveryPoints'
```

`--resource-arn` es el recurso puntual a respaldar (fuera de la programación del plan, "ahora mismo"); `--iam-role-arn` es el rol con el que Backup accede a ese recurso; `--backup-job-id` (tomado de la respuesta) identifica este trabajo específico para consultar su estado después.

**Resultado esperado:** el trabajo pasa de `CREATED` a `RUNNING` y, tras ~3 segundos, a `COMPLETED`; `NumberOfRecoveryPoints` en la bóveda aumenta en uno.

**Modifica esto:** intenta ahora sí borrar `demo-boveda` con `delete-backup-vault` y confirma el error `InvalidRequestException` — a diferencia del Tema 4, ahora la bóveda sí tiene un punto de recuperación que la protege de eliminación.

**Cuándo no usarlo:** no uses `StopBackupJob` esperando poder reanudar después; detener un trabajo lo cancela por completo, no lo pausa.

**Cómo crece tu proyecto:** este es el trabajo bajo demanda que ejecutarías antes de una migración riesgosa de la tabla de entregas, sin esperar al cron programado.

---

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Sigue un trabajo de respaldo desde solicitud hasta estado terminal. Simula o registra un fallo y comprueba que la automatización no anuncia éxito mientras el trabajo continúe pendiente.


</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-25/tema-5-ciclo-de-vida.sh — ejecutar con: bash tema-5-ciclo-de-vida.sh
JOB_ID=$(aws backup start-backup-job --backup-vault-name demo-boveda \
  --resource-arn arn:aws:dynamodb:us-east-1:000000000000:table/demo-entregas \
  --iam-role-arn arn:aws:iam::000000000000:role/backup-role --query 'BackupJobId' --output text)
sleep 4
aws backup describe-backup-job --backup-job-id "$JOB_ID" --query 'State'
aws backup describe-backup-vault --backup-vault-name demo-boveda --query 'NumberOfRecoveryPoints'
```

```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
JOB_ID=$(aws backup start-backup-job --backup-vault-name demo-boveda \
  --resource-arn arn:aws:dynamodb:us-east-1:000000000000:table/ShipmentEvents \
  --iam-role-arn arn:aws:iam::000000000000:role/backup-role --query 'BackupJobId' --output text)
sleep 4
aws backup describe-backup-job --backup-job-id "$JOB_ID" --query 'State'
```

</details>

### Laboratorio 25.1 — Configuración dinámica con AppConfig

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar laboratorio 25.1 — configuración dinámica con appconfig.

</details>

### Laboratorio 25.2 — Plan de respaldo para DynamoDB

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar laboratorio 25.2 — plan de respaldo para dynamodb.

</details>

### Tema 6: Simulacro de restauración: comprobar contenido, no solo la existencia del backup · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar restaurarás una copia en un destino separado y detectarás una corrupción con un hash. Prerrequisitos: archivos, JSON, terminal y Python 3. Es un ejemplo independiente local desde una carpeta vacía; no necesita credenciales ni servicios cloud.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir simulacro-backup
cd simulacro-backup
```

```python
from pathlib import Path
import hashlib
import json
import shutil

original = Path('envios.json')
backup = Path('envios.backup.json')
restored = Path('restaurado.json')
original.write_text('[{"id": "ENV-42", "estado": "creado"}]', encoding='utf-8')
shutil.copy2(original, backup)
expected = hashlib.sha256(original.read_bytes()).hexdigest()
# El destino separado evita sobrescribir datos activos.
shutil.copy2(backup, restored)
assert hashlib.sha256(restored.read_bytes()).hexdigest() == expected
rows = json.loads(restored.read_text(encoding='utf-8'))
assert rows[0]['id'] == 'ENV-42'
assert rows[0]['estado'] == 'creado'
print('Contenido y estructura recuperados: ENV-42')
# También comprobamos que una copia alterada se detecta.
backup.write_text('[]', encoding='utf-8')
assert hashlib.sha256(backup.read_bytes()).hexdigest() != expected
print('Corrupción detectada')
```

```bash
python3 restaurar.py
```

</details>
