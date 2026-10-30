# Módulo 25: Gobierno, configuración y continuidad — AWS Config, AppConfig y Backup


## Aprende construyendo

### Tema 1: AWS Config — rastrear reglas sobre tus recursos

#### Paso 1 · Objetivo y preparación
Al finalizar vas a declarar la regla que, contra AWS real, vigilaría que el bucket de evidencias de entrega de RutaFlow (`pruebas-entrega`, Módulo 2) siempre tenga versionado activo. Prerrequisitos: Módulo 2 completo.
#### Paso 2 · Contexto y caso real
RutaFlow necesita saber si alguien, por error, desactiva el versionado de `pruebas-entrega` — sin que un humano tenga que revisar la configuración de ese bucket manualmente cada semana.
#### Paso 3 · Teoría, modelo mental y analogía
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

#### Paso 4 · Demostración guiada
```bash
aws configservice put-config-rule --config-rule '{"ConfigRuleName":"pruebas-entrega-versionado","Source":{"Owner":"AWS","SourceIdentifier":"S3_BUCKET_VERSIONING_ENABLED"}}'
aws configservice describe-config-rules --query "ConfigRules[?ConfigRuleName=='pruebas-entrega-versionado']"
```
Resultado esperado: la regla queda registrada y consultable — lista para que, contra AWS real, Config la evalúe automáticamente sobre cada bucket de la cuenta, incluyendo `pruebas-entrega`.
#### Paso 5 · Práctica guiada
Pista: corré `aws configservice describe-compliance-by-config-rule --config-rule-names pruebas-entrega-versionado` esperando ver `COMPLIANT` o `NON_COMPLIANT` — ese es el fallo deliberado (o más bien, la limitación real que advierte este Tema): la respuesta es siempre `INSUFFICIENT_DATA`, porque Floci nunca evalúa si `pruebas-entrega` realmente tiene versionado activo, solo gestiona el plano de la regla en sí.
#### Paso 6 · Práctica independiente
Agrupá esta regla dentro de un paquete de conformidad (`put-conformance-pack`) junto a una segunda regla imaginaria sobre cifrado, y documentá por escrito quién sería el responsable de revisar manualmente el cumplimiento real mientras Floci no lo evalúe.
#### Paso 7 · Cierre y evidencia
Entregá la regla creada, el `INSUFFICIENT_DATA` del Paso 5, y el paquete de conformidad del Paso 6; explicá por qué `INSUFFICIENT_DATA` nunca debería reportarse como "cumple" en ningún dashboard real. Siguiente paso: AppConfig. Errores comunes: reglas sin responsable y falsos positivos. Fuente oficial: https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html.

### Tema 2: AppConfig — desplegar configuración sin redeployar código

#### Paso 1 · Objetivo y preparación
Al finalizar vas a crear un feature flag real para activar el modo mantenimiento del servicio de seguimiento (Módulo 24), sin recompilar ni redesplegar nada. Prerrequisitos: Módulo 24 completo.
#### Paso 2 · Contexto y caso real
RutaFlow necesita poder apagar temporalmente el servicio de seguimiento (por ejemplo, durante una migración de `ShipmentEvents`) en minutos, no esperando un ciclo completo de CI/CD para cambiar una sola bandera.
#### Paso 3 · Teoría, modelo mental y analogía
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

#### Paso 4 · Demostración guiada
```bash
APP_ID=$(aws appconfig create-application --name demo-config --query 'Id' --output text)
ENV_ID=$(aws appconfig create-environment --application-id "$APP_ID" --name dev --query 'Id' --output text)
PROFILE_ID=$(aws appconfig create-configuration-profile --application-id "$APP_ID" \
  --name feature-flags --location-uri hosted --type AWS.Freeform --query 'Id' --output text)
aws appconfig create-hosted-configuration-version --application-id "$APP_ID" \
  --configuration-profile-id "$PROFILE_ID" --content '{"modo_mantenimiento": false}' --content-type application/json
```
Resultado esperado: la versión 1 de la configuración queda registrada con `modo_mantenimiento: false` — el feature flag ya existe, aunque todavía no se desplegó a ningún entorno.
#### Paso 5 · Práctica guiada
Pista: intentá publicar un contenido JSON mal formado (`--content '{modo_mantenimiento: false'`, sin cerrar llaves ni comillas) como una nueva versión — ese es el fallo deliberado: la llamada se rechaza antes de crear la versión, porque AppConfig exige que el contenido sea JSON válido según el `--content-type` declarado.
#### Paso 6 · Práctica independiente
Creá una segunda versión con `"modo_mantenimiento": true`, desplegala al entorno `dev` con una estrategia inmediata, y simulá un rollback desplegando de nuevo la versión 1 — confirmá que ambas versiones siguen existiendo por separado, nunca se sobrescriben.
#### Paso 7 · Cierre y evidencia
Entregá la aplicación/entorno/perfil creados, el JSON inválido rechazado del Paso 5, y el despliegue más rollback del Paso 6; explicá por qué separar "cambios de configuración" de "cambios de código" permite reaccionar en minutos. Siguiente paso: sesiones. Errores comunes: configuración global y sin validación. Fuente oficial: https://docs.aws.amazon.com/appconfig/latest/userguide/what-is-appconfig.html.

### Tema 3: AppConfigData — el plano de datos que consume tu aplicación

#### Paso 1 · Objetivo y preparación
Al finalizar vas a leer el feature flag del Tema 2 exactamente como lo leería el servicio de seguimiento en ejecución, sin reiniciarse. Prerrequisitos: Tema 2 de este módulo.
#### Paso 2 · Contexto y caso real
El servicio de seguimiento necesita enterarse de que `modo_mantenimiento` cambió a `true` sin que nadie lo reinicie — el plano de gestión (Tema 2) y el plano de datos que consume la aplicación son dos cosas distintas.
#### Paso 3 · Teoría, modelo mental y analogía
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

#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir el archivo del ejemplo dentro.
```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
TOKEN=$(aws appconfigdata start-configuration-session \
  --application-identifier "$APP_ID" --environment-identifier "$ENV_ID" \
  --configuration-profile-identifier "$PROFILE_ID" --query InitialConfigurationToken --output text)
aws appconfigdata get-latest-configuration --configuration-token "$TOKEN"
```
Resultado esperado: tras el despliegue del Tema 2, `get-latest-configuration` devuelve el JSON real (`{"modo_mantenimiento": false}` o `true`, según la versión desplegada) junto con un nuevo token para la siguiente consulta.
#### Paso 5 · Práctica guiada
Pista: guardá el token de la respuesta anterior, y llamá `get-latest-configuration` DOS VECES con el mismo token viejo (sin usar el token nuevo que cada respuesta te devuelve) — ese es el fallo deliberado: reusar un token ya consumido no te da la configuración más reciente de forma confiable, porque el protocolo espera que siempre avances al token que la última respuesta te entregó.
#### Paso 6 · Práctica independiente
Llamá `get-latest-configuration` dos veces seguidas con el token correcto (encadenando cada nuevo token) sin que nadie despliegue nada entre medio, y confirmá que la segunda respuesta viene vacía — ahorrando ancho de banda cuando no hay novedades.
#### Paso 7 · Cierre y evidencia
Entregá la lectura real del flag del Paso 4, el error de reusar un token viejo del Paso 5, y la respuesta vacía por no-cambio del Paso 6; explicá por qué el servicio de seguimiento debería abrir una sola sesión y reusar el token, no abrir una sesión nueva en cada petición. Siguiente paso: backups. Errores comunes: polling excesivo y tokens compartidos. Fuente oficial: https://docs.aws.amazon.com/appconfig/latest/userguide/appconfig-retrieving-simplified.html.

### Tema 4: AWS Backup — centralizar la política de respaldo de múltiples servicios

#### Paso 1 · Objetivo y preparación
Al finalizar vas a centralizar el respaldo diario de `ShipmentEvents` (Módulo 4) en un plan de AWS Backup, en vez de gestionar snapshots sueltos servicio por servicio. Prerrequisitos: Módulo 4 completo.
#### Paso 2 · Contexto y caso real
RutaFlow necesita recuperar `ShipmentEvents` tras un incidente sin depender de que alguien se acuerde de respaldar esa tabla específica a mano, mientras otros equipos gestionan por separado los respaldos de RDS o S3.
#### Paso 3 · Teoría, modelo mental y analogía
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

#### Paso 4 · Demostración guiada
```bash
aws backup create-backup-vault --backup-vault-name demo-boveda
PLAN_ID=$(aws backup create-backup-plan --backup-plan \
  '{"BackupPlanName":"demo-diario","Rules":[{"RuleName":"diario","TargetBackupVaultName":"demo-boveda","ScheduleExpression":"cron(0 12 * * ? *)"}]}' \
  --query 'BackupPlanId' --output text)
aws backup create-backup-selection --backup-plan-id "$PLAN_ID" --backup-selection \
  '{"SelectionName":"shipment-events","IamRoleArn":"arn:aws:iam::000000000000:role/backup-role","Resources":["arn:aws:dynamodb:us-east-1:000000000000:table/ShipmentEvents"]}'
```
Resultado esperado: la bóveda, el plan y la selección quedan creados y encadenados — `ShipmentEvents` ahora tiene un respaldo diario automático a las 12:00, sin que nadie tenga que ejecutarlo a mano.
#### Paso 5 · Práctica guiada
Pista: creá un segundo plan de respaldo pero olvidá agregarle una `backup-selection` con ningún recurso — ese es el fallo deliberado: el plan existe y corre según su cron, pero como no protege ningún recurso real, nunca genera ningún punto de recuperación; un plan sin selección es, en la práctica, un plan que no respalda nada.
#### Paso 6 · Práctica independiente
Documentá, para `ShipmentEvents`, qué retención tendría sentido (pista: `Lifecycle.DeleteAfterDays` en la regla del plan) y qué RPO/RTO reales implicaría un cron diario a las 12:00 si el incidente ocurriera a las 11:59.
#### Paso 7 · Cierre y evidencia
Entregá el plan y selección creados sobre `ShipmentEvents`, el plan sin recursos del Paso 5, y el RPO/RTO documentados del Paso 6; explicá por qué centralizar el respaldo reduce el riesgo de que un servicio quede sin protección por descuido. Siguiente paso: jobs. Errores comunes: backup sin restore y selección incompleta. Fuente oficial: https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html.

### Tema 5: El ciclo de vida de un trabajo de respaldo

#### Paso 1 · Objetivo y preparación
Al finalizar vas a disparar un respaldo bajo demanda de `ShipmentEvents` antes de una migración riesgosa, sin esperar al cron diario del Tema 4. Prerrequisitos: Tema 4 de este módulo.
#### Paso 2 · Contexto y caso real
Antes de aplicar una migración de esquema arriesgada sobre `ShipmentEvents` (como las del Módulo 13, pero aplicadas acá a DynamoDB), RutaFlow necesita un punto de recuperación fresco AHORA, no el que generó el cron a las 12:00 de ayer.
#### Paso 3 · Teoría, modelo mental y analogía
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

#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir el archivo del ejemplo dentro.
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
Resultado esperado: el estado pasa de `CREATED` a `RUNNING` y, tras unos segundos, a `COMPLETED` — recién en ese momento, no antes, es seguro decir que el punto de recuperación de `ShipmentEvents` ya existe y la migración riesgosa puede empezar.
#### Paso 5 · Práctica guiada
Pista: iniciá un segundo job y, mientras todavía está en `RUNNING`, corré `aws backup stop-backup-job --backup-job-id <ese-id>` — ese es el fallo deliberado si lo hacés pensando que podés "pausar y reanudar": el job queda cancelado por completo, no pausado; si todavía necesitás ese respaldo, hay que iniciar un job nuevo desde cero.
#### Paso 6 · Práctica independiente
Confirmá con `describe-backup-vault --backup-vault-name demo-boveda --query 'NumberOfRecoveryPoints'` que el contador subió por el job `COMPLETED` del Paso 4, y después intentá borrar `demo-boveda` con `delete-backup-vault` — confirmá el error `InvalidRequestException`, porque ahora sí hay un punto de recuperación real protegiéndola.
#### Paso 7 · Cierre y evidencia
Entregá el job completado del Paso 4, la cancelación irreversible del Paso 5, y la bóveda protegida del Paso 6; explicá por qué asumir éxito apenas se crea el job (en vez de esperar `COMPLETED`) sería un error antes de empezar una migración riesgosa. Siguiente paso: continuidad. Errores comunes: asumir éxito por creación y no revisar estado final. Fuente oficial: https://docs.aws.amazon.com/aws-backup/latest/devguide/working-with-backups.html.

## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** desplegar un cambio de configuración dinámica con AppConfig sin tocar código, y crear un plan de respaldo en AWS Backup que protege una tabla DynamoDB con un trabajo bajo demanda.

**Requisitos previos:** una tabla DynamoDB existente (puedes reutilizar la del Módulo 4) y un rol IAM de ejemplo para el plan de respaldo.

### Laboratorio 25.1 — Configuración dinámica con AppConfig

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crea la aplicación y el entorno | `aws appconfig create-application --name mi-app` luego `aws appconfig create-environment --application-id <app-id> --name dev` | Define el contenedor lógico y el entorno de despliegue | IDs de aplicación y entorno |
| 2 | Crea el perfil y la versión de configuración | `aws appconfig create-configuration-profile --application-id <app-id> --name mi-perfil --location-uri hosted --type AWS.Freeform` luego `aws appconfig create-hosted-configuration-version --application-id <app-id> --configuration-profile-id <perfil-id> --content '{"modo_mantenimiento": false}' --content-type application/json` | El contenido real que se desplegará | Un `VersionNumber` |
| 3 | Crea una estrategia de despliegue inmediata | `aws appconfig create-deployment-strategy --name inmediata --deployment-duration-in-minutes 0 --growth-factor 100 --final-bake-time-in-minutes 0` | Define que el cambio se aplique de una sola vez, sin gradualidad | Un `DeploymentStrategyId` |
| 4 | Despliega la configuración | `aws appconfig start-deployment --application-id <app-id> --environment-id <env-id> --configuration-profile-id <perfil-id> --configuration-version 1 --deployment-strategy-id <estrategia-id>` | Publica la versión 1 en el entorno `dev` | Estado del despliegue |
| 5 | Recupérala desde el plano de datos | `TOKEN=$(aws appconfigdata start-configuration-session --application-identifier <app-id> --environment-identifier <env-id> --configuration-profile-identifier <perfil-id> --query InitialConfigurationToken --output text)` luego `aws appconfigdata get-latest-configuration --configuration-token $TOKEN` | Simula cómo tu aplicación leería la configuración en ejecución | El JSON `{"modo_mantenimiento": false}` |

### Laboratorio 25.2 — Plan de respaldo para DynamoDB

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crea la bóveda | `aws backup create-backup-vault --backup-vault-name mi-boveda` | El destino donde se almacenarán los puntos de recuperación | Confirmación de la bóveda |
| 2 | Crea el plan con una regla diaria | `aws backup create-backup-plan --backup-plan '{"BackupPlanName":"respaldo-diario","Rules":[{"RuleName":"diario","TargetBackupVaultName":"mi-boveda","ScheduleExpression":"cron(0 12 * * ? *)"}]}'` | Define la política de respaldo programado | Un `BackupPlanId` |
| 3 | Asigna tu tabla DynamoDB al plan | `aws backup create-backup-selection --backup-plan-id <plan-id> --backup-selection '{"SelectionName":"mis-tablas","IamRoleArn":"arn:aws:iam::000000000000:role/backup-role","Resources":["arn:aws:dynamodb:us-east-1:000000000000:table/mi-tabla"]}'` | Conecta el recurso real con la política del plan | Un `SelectionId` |
| 4 | Inicia un respaldo bajo demanda | `aws backup start-backup-job --backup-vault-name mi-boveda --resource-arn arn:aws:dynamodb:us-east-1:000000000000:table/mi-tabla --iam-role-arn arn:aws:iam::000000000000:role/backup-role` | No esperas al cron; respaldas ahora mismo | Un `BackupJobId` con estado `CREATED` |
| 5 | Sondea hasta `COMPLETED` | `aws backup describe-backup-job --backup-job-id <job-id>` | Confirma la transición de estados | `State: COMPLETED` |

**Verificación:** el laboratorio se considera exitoso si `get-latest-configuration` devuelve el JSON exacto que desplegaste con AppConfig, y si `describe-backup-job` reporta `State: COMPLETED` con un punto de recuperación visible en `list-recovery-points-by-backup-vault` para tu bóveda.

**Errores comunes y soluciones**

- **`GetLatestConfiguration` devuelve vacío en la primera llamada.** Es el comportamiento esperado si no hubo cambios desde el token inicial de la sesión; asegúrate de haber ejecutado `start-deployment` antes de abrir la sesión, o abre una sesión nueva después del despliegue.
- **`DeleteBackupVault` falla con `InvalidRequestException`.** La bóveda todavía contiene puntos de recuperación; elimínalos primero con `delete-recovery-point`, o acepta que una bóveda usada no se puede borrar hasta vaciarla — el mismo principio de protección contra pérdida accidental de datos.
- **`create-backup-selection` falla silenciosamente sin asignar recursos.** Verifica que el ARN del recurso esté completo y correctamente formado; un ARN mal escrito no lanza un error de validación fuerte en todos los casos, pero tampoco protegerá el recurso real.
- **El estado de cumplimiento en Config siempre es `INSUFFICIENT_DATA`.** Es el comportamiento documentado de Floci: la evaluación real de cumplimiento no está implementada; usa este servicio para practicar el flujo de gestión de reglas, no para validar cumplimiento real.

---

## Laboratorio de transferencia

### Tema 6: Simulacro de restauración: comprobar contenido, no solo la existencia del backup

#### Paso 1 · Objetivo y preparación
Al finalizar restaurarás una copia en un destino separado y detectarás una corrupción con un hash. **Prerrequisitos:** archivos, JSON, terminal y Python 3. Es un ejemplo independiente local desde una carpeta vacía; no necesita credenciales ni servicios cloud.

#### Paso 2 · Contexto y caso real
El proyecto integrador de cloud guarda entregas, pero ver una copia en un listado no demuestra que pueda recuperarse. **¿Por qué es importante?** Una restauración debe comprobar datos, permisos, dependencias y tiempo de recuperación; empezaremos comprobando contenido sin tocar el original.

#### Paso 3 · Teoría, modelo mental y analogía
RPO expresa cuántos datos puedes perder por antigüedad de la copia; RTO expresa cuánto tiempo puedes tardar en recuperar el servicio. Un hash SHA-256 permite comparar bytes, pero no prueba por sí solo que el contenido sea válido para el negocio. La recuperación necesita además abrir el archivo, validar estructura y ensayar el consumidor.

**Analogía:** tener una llave de repuesto sirve si abre la puerta. El límite es que una llave no recupera todo un edificio: este ejercicio no restaura red, identidad, configuración ni una base de datos administrada.

#### Paso 4 · Demostración guiada desde cero
```bash
mkdir simulacro-backup
cd simulacro-backup
```
Crea `restaurar.py`:
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
Windows puede usar `py restaurar.py`. **Resultado esperado:** `Contenido y estructura recuperados: ENV-42` y `Corrupción detectada`. Explica cada bloque: creación del dato, copia, restauración aislada, comparación y validación del caso de negocio. La última escritura altera solo el backup del laboratorio.

#### Paso 5 · Práctica guiada
**Fallo deliberado:** mueve `backup.write_text('[]', encoding='utf-8')` antes de copiar a `restored`. La comparación dispara un error antes de aceptar una recuperación vacía. **Pista:** no recalcules `expected` desde la copia sospechosa; conserva una referencia independiente.

#### Paso 6 · Práctica independiente
Añade un campo de versión y rechaza una copia que no lo incluya, aunque sea JSON válido. Mide cuánto tardas en restaurar y verificar. Define un RPO y un RTO para un caso pequeño y explica qué datos y pasos faltaría medir en cloud real.

#### Paso 7 · Cierre y evidencia
**Evidencia de aprendizaje:** resultado de restauración, archivo recuperado, hash y error de corrupción y procedimiento con tiempo observado. El siguiente paso es ensayar la exportación/restauración del servicio concreto en un entorno aislado. **Errores comunes:** restaurar encima del origen, confundir JSON válido con datos completos y guardar referencia y copia sin protección independiente. **Límites y decisión de uso:** el ejercicio valida archivos locales, no AWS Backup, snapshots consistentes, cifrado ni recuperación regional.

**Fuentes oficiales:** [AWS recuperación y continuidad](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/plan-for-disaster-recovery-dr.html) y [Python hashlib](https://docs.python.org/3/library/hashlib.html).
