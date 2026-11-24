# Módulo 23: CI/CD nativo de AWS con CodeBuild y CodeDeploy


## Aprende construyendo


### Tema 1: CodeBuild — compilaciones reales dentro de contenedores Docker · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a compilar el servicio de seguimiento de RutaFlow dentro de un contenedor real, con un proyecto demo-build que sube el artefacto a S3. Prerrequisitos: Módulo 2 completo.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-24/tema-1-codebuild-real.sh — ejecutar con: bash tema-1-codebuild-real.sh
aws s3 mb s3://demo-artefactos
aws codebuild create-project --name demo-build --source type=NO_SOURCE \
  --artifacts type=S3,location=demo-artefactos \
  --environment type=LINUX_CONTAINER,image=public.ecr.aws/docker/library/alpine:latest,computeType=BUILD_GENERAL1_SMALL \
  --service-role arn:aws:iam::000000000000:role/codebuild-role
ID=$(aws codebuild start-build --project-name demo-build \
  --buildspec-override 'version: 0.2
phases:
  build:
    commands:
      - echo hola desde Floci > salida.txt
artifacts:
  files:
    - salida.txt' --query 'build.id' --output text)
aws codebuild batch-get-builds --ids "$ID" --query 'builds[0].buildStatus'
```

```bash
aws s3 mb s3://demo-artefactos
aws codebuild create-project --name demo-build --source type=NO_SOURCE \
  --artifacts type=S3,location=demo-artefactos \
  --environment type=LINUX_CONTAINER,image=public.ecr.aws/docker/library/alpine:latest,computeType=BUILD_GENERAL1_SMALL \
  --service-role arn:aws:iam::000000000000:role/codebuild-role
ID=$(aws codebuild start-build --project-name demo-build \
  --buildspec-override 'version: 0.2
phases:
  build:
    commands:
      - echo servicio-de-seguimiento-compilado > salida.txt
artifacts:
  files:
    - salida.txt' --query 'build.id' --output text)
aws codebuild batch-get-builds --ids "$ID" --query 'builds[0].buildStatus'
```

</details>

### Tema 2: buildspec.yml — fases y artefactos · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás definir fases y artefactos desde cero. Prerrequisitos: Docker y Node.js; verifica node --version.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir ejemplo-buildspec && cd ejemplo-buildspec
```

Crea el archivo `buildspec.yml`:

```yaml
version: 0.2
phases:
  install:
    commands:
      - echo "instalando dependencias"
  pre_build:
    commands:
      - mkdir -p dist
  build:
    commands:
      - echo "servicio-de-seguimiento 1.0" > dist/app.txt
  post_build:
    commands:
      - sha256sum dist/app.txt > dist/app.sha256
artifacts:
  base-directory: dist
  files:
    - app.txt
    - app.sha256
```

```bash
ID=$(aws codebuild start-build --project-name demo-build --buildspec-override "$(cat buildspec.yml)" \
  --query 'build.id' --output text)
until [ "$(aws codebuild batch-get-builds --ids "$ID" --query 'builds[0].buildComplete' --output text)" = "True" ]; do sleep 3; done
aws codebuild batch-get-builds --ids "$ID" --query 'builds[0].buildStatus' --output text
aws s3 ls s3://demo-artefactos/ --recursive
```

```bash
# archivo: src/labs/modulo-24/tema-2-fases.sh — ejecutar con: bash tema-2-fases.sh
aws codebuild start-build --project-name demo-build \
  --buildspec-override 'version: 0.2
phases:
  install:
    commands:
      - echo "instalando dependencias"
  pre_build:
    commands:
      - echo "paso previo"
  build:
    commands:
      - echo "compilando" > build.log
  post_build:
    commands:
      - echo "empaquetando" >> build.log
artifacts:
  files:
    - build.log'
```

</details>

### Tema 3: CodeDeploy — aplicaciones, grupos y configuraciones predefinidas · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a crear demo-app, la aplicación CodeDeploy que va a gestionar los despliegues canary del servicio de seguimiento compilado en el Tema 1. Prerrequisitos: Tema 1 de este módulo.

#### ► LA ANALOGÍA
El grupo de implementación es la flota a reemplazar; la configuración de despliegue decide qué tan rápido (o cuidadosamente) se reemplaza.

**Conceptos clave:** `computePlatform`, grupo de implementación, configuración de despliegue, las 17 configuraciones integradas.

CodeDeploy organiza el trabajo en dos niveles: una aplicación (`CreateApplication`) define la plataforma de cómputo objetivo —`Server`, `Lambda` o `ECS`—, y un grupo de implementación (`CreateDeploymentGroup`) dentro de esa aplicación define la configuración concreta del despliegue: qué configuración de despliegue usar, y para ECS específicamente, a qué servicio y grupos objetivo de balanceador apunta. AWS —y Floci, fielmente— provee 17 configuraciones de despliegue predefinidas que no puedes eliminar: desde `AllAtOnce` (todo de una vez) hasta variantes canary y lineales con distintos porcentajes y ventanas de tiempo, tanto para Lambda como para ECS.

Elegir entre estas configuraciones predefinidas es una decisión de riesgo: `AllAtOnce` es la más rápida pero la más arriesgada si el nuevo código tiene un bug, mientras que una estrategia canary (por ejemplo, `LambdaCanary10Percent5Minutes`) envía solo el 10% del tráfico a la versión nueva durante 5 minutos antes de decidir si continuar, limitando el impacto de un despliegue defectuoso a una fracción pequeña de usuarios durante poco tiempo.

**Analogía:** las configuraciones de despliegue predefinidas son como los ajustes de velocidad de una cinta transportadora en una fábrica: puedes elegir "máxima velocidad, todo de una vez" o "arranque lento, verificando calidad en cada tramo antes de acelerar" — la decisión depende de cuánto te puedes permitir arriesgar si algo sale mal.

**¿Por qué es importante?** La elección de estrategia de despliegue es una de las decisiones de ingeniería con mayor impacto directo en la disponibilidad de un sistema en producción; entender las opciones disponibles —no solo memorizar el comando para crear un despliegue— es la habilidad real que se evalúa aquí.

**Practícalo tú:**

```bash

# archivo: src/labs/modulo-24/tema-3-aplicacion-y-grupo.sh — ejecutar con: bash tema-3-aplicacion-y-grupo.sh
aws deploy create-application --application-name demo-app --compute-platform Lambda
aws deploy create-deployment-group --application-name demo-app --deployment-group-name demo-grupo \
  --deployment-config-name CodeDeployDefault.LambdaCanary10Percent5Minutes \
  --service-role-arn arn:aws:iam::000000000000:role/codedeploy-role \
  --deployment-style deploymentType=BLUE_GREEN,deploymentOption=WITH_TRAFFIC_CONTROL
aws deploy list-deployment-configs --query "deploymentConfigsList" --output text | wc -w
```

`--application-name` nombra la aplicación; `--compute-platform` fija dónde despliega (`Lambda`, `Server` o `ECS`). Al crear el grupo, `--deployment-group-name` lo nombra; `--deployment-config-name` elige cuál de las 17 estrategias predefinidas usar; `--service-role-arn` es el rol de IAM con el que CodeDeploy opera; `--deployment-style` fija el tipo de despliegue (acá, `BLUE_GREEN` con control de tráfico, en vez de reemplazar todo de una vez in-place). En resumen: `--application-name` es la bandera que nombra la aplicación, `--compute-platform` es la bandera que fija dónde despliega, y `--deployment-group-name` es la bandera que nombra el grupo de despliegue.

**Resultado esperado:** `create-application` y `create-deployment-group` devuelven confirmación con sus IDs; `list-deployment-configs` lista las 17 configuraciones predefinidas, incluida `LambdaCanary10Percent5Minutes` que acabas de usar.

**Modifica esto:** crea un segundo grupo usando `CodeDeployDefault.LambdaAllAtOnce` en vez de canary, y compara en la documentación qué diferencia de riesgo implica frente al que acabas de crear.

**Cuándo no usarlo:** no elijas `AllAtOnce` para una función crítica sin un plan de rollback probado; resérvalo para funciones de bajo impacto o entornos donde un rollback rápido no es crítico.

**Cómo crece tu proyecto:** `demo-app` es la aplicación CodeDeploy que gestionará todos los despliegues canary de las funciones Lambda del proyecto integrador.


</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-24/tema-3-aplicacion-y-grupo.sh — ejecutar con: bash tema-3-aplicacion-y-grupo.sh
aws deploy create-application --application-name demo-app --compute-platform Lambda
aws deploy create-deployment-group --application-name demo-app --deployment-group-name demo-grupo \
  --deployment-config-name CodeDeployDefault.LambdaCanary10Percent5Minutes \
  --service-role-arn arn:aws:iam::000000000000:role/codedeploy-role \
  --deployment-style deploymentType=BLUE_GREEN,deploymentOption=WITH_TRAFFIC_CONTROL
aws deploy list-deployment-configs --query "deploymentConfigsList" --output text | wc -w
```

```bash
aws deploy create-application --application-name demo-app --compute-platform Lambda
aws deploy create-deployment-group --application-name demo-app --deployment-group-name demo-grupo \
  --deployment-config-name CodeDeployDefault.LambdaCanary10Percent5Minutes \
  --service-role-arn arn:aws:iam::000000000000:role/codedeploy-role \
  --deployment-style deploymentType=BLUE_GREEN,deploymentOption=WITH_TRAFFIC_CONTROL
```

</details>

### Tema 4: Despliegue Blue/Green de Lambda — cambio de tráfico por alias · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a mover el alias live del servicio de seguimiento de la versión 1 a la versión 2 con el canary de demo-grupo (Tema 3), y a confirmar que un hook fallido revierte solo. Prerrequisitos: Tema 3 de este módulo, Módulo 5 (versiones y alias).

#### ► LA ANALOGÍA
El alias Lambda es el puntero que CodeDeploy mueve gradualmente; los lifecycle hooks son catadores que prueban cada lote antes de dejarlo avanzar al resto del tráfico.

**Conceptos clave:** alias Lambda, `RoutingConfig`, lifecycle hook `BeforeAllowTraffic`/`AfterAllowTraffic`, reversión automática.

Para `computePlatform: Lambda`, `CreateDeployment` ejecuta un cambio de tráfico real sobre el alias de tu función: lee la estrategia configurada en el grupo de implementación (todo a la vez, canary o lineal), y si es canary o lineal, actualiza gradualmente el `RoutingConfig` del alias para enrutar un porcentaje del tráfico hacia la nueva versión, espera el intervalo configurado, y luego completa el cambio al 100%. Si configuraste lifecycle hooks —funciones Lambda adicionales que se invocan en puntos específicos del despliegue, como `BeforeAllowTraffic` o `AfterAllowTraffic`—, CodeDeploy las invoca y espera a que reporten éxito vía `PutLifecycleEventHookExecutionStatus` antes de continuar.

El detalle más importante de este flujo es la reversión automática: si cualquier lifecycle hook reporta `Failed`, CodeDeploy revierte automáticamente el alias a la versión anterior y marca el despliegue completo como `Failed` — sin que tengas que intervenir manualmente para deshacer un despliegue problemático. Este es exactamente el tipo de red de seguridad que justifica usar una herramienta de despliegue dedicada en vez de cambiar el alias manualmente con un script propio.

**Analogía:** un lifecycle hook que valida el despliegue es como un catador que prueba cada lote antes de que salga a la venta: si algo sale mal, ese lote específico se retira automáticamente antes de que llegue a más clientes, en vez de esperar a que se quejen después.

**¿Por qué es importante?** La combinación de cambio de tráfico gradual más validación automática con reversión es el patrón de despliegue de más bajo riesgo que existe para funciones serverless; dominarlo aquí te prepara directamente para operar Lambda en producción con confianza.

**Practícalo tú:**

```bash

# archivo: src/labs/modulo-24/tema-4-canary-lambda.sh — ejecutar con: bash tema-4-canary-lambda.sh
ID=$(aws deploy create-deployment --application-name demo-app --deployment-group-name demo-grupo \
  --revision 'revisionType=AppSpecContent,appSpecContent={content="{\"version\":0.0,\"Resources\":[{\"miFuncion\":{\"Type\":\"AWS::Lambda::Function\",\"Properties\":{\"Name\":\"demo-tracking\",\"Alias\":\"live\",\"CurrentVersion\":\"1\",\"TargetVersion\":\"2\"}}}]}"}' \
  --query 'deploymentId' --output text)
aws deploy get-deployment --deployment-id "$ID" --query 'deploymentInfo.status'
```

`--revision` es el contenido que describe qué desplegar — acá, un AppSpec inline que dice qué alias mover de la versión 1 a la versión 2; `--deployment-id` (usado después con `get-deployment`) identifica ese despliegue puntual para consultar su estado. En resumen: `--deployment-id` es la bandera que identifica ese despliegue específico.

**Resultado esperado:** el estado empieza en `InProgress` mientras el 10% del tráfico se enruta a la versión 2 durante la ventana de 5 minutos configurada, y termina en `Succeeded` con el alias `live` apuntando al 100% a la versión nueva.

**Modifica esto:** simula un lifecycle hook fallido devolviendo `Failed` con `put-lifecycle-event-hook-execution-status` y confirma que CodeDeploy revierte automáticamente el alias a la versión 1, sin que tú hagas el rollback manualmente.

**Cuándo no usarlo:** no uses una ventana canary de 5 minutos para una función con tráfico muy bajo; si recibe pocas invocaciones, esos 5 minutos podrían no acumular suficiente señal para detectar un problema real antes de completar el despliegue.

**Cómo crece tu proyecto:** este es el despliegue exacto que promueve una nueva versión del servicio de seguimiento sin interrumpir a los repartidores que ya están usando la versión anterior.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Publica dos versiones de la función de confirmación y usa un alias para seleccionar tráfico. Envía peticiones identificables, observa la versión ejecutada y practica volver a la anterior.


</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-24/tema-4-canary-lambda.sh — ejecutar con: bash tema-4-canary-lambda.sh
ID=$(aws deploy create-deployment --application-name demo-app --deployment-group-name demo-grupo \
  --revision 'revisionType=AppSpecContent,appSpecContent={content="{\"version\":0.0,\"Resources\":[{\"miFuncion\":{\"Type\":\"AWS::Lambda::Function\",\"Properties\":{\"Name\":\"demo-tracking\",\"Alias\":\"live\",\"CurrentVersion\":\"1\",\"TargetVersion\":\"2\"}}}]}"}' \
  --query 'deploymentId' --output text)
aws deploy get-deployment --deployment-id "$ID" --query 'deploymentInfo.status'
```

```bash
ID=$(aws deploy create-deployment --application-name demo-app --deployment-group-name demo-grupo \
  --revision 'revisionType=AppSpecContent,appSpecContent={content="{\"version\":0.0,\"Resources\":[{\"miFuncion\":{\"Type\":\"AWS::Lambda::Function\",\"Properties\":{\"Name\":\"demo-tracking\",\"Alias\":\"live\",\"CurrentVersion\":\"1\",\"TargetVersion\":\"2\"}}}]}"}' \
  --query 'deploymentId' --output text)
aws deploy get-deployment --deployment-id "$ID" --query 'deploymentInfo.status'
```

</details>

### Tema 5: Despliegue Blue/Green de ECS — cambio de tráfico por listener ELB · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a desplegar una nueva definición de tarea del servicio de seguimiento en ECS usando el listener de demo-alb (Módulo 22) para cambiar tráfico de azul a verde. Prerrequisitos: Módulo 22 completo, Módulo 14 (ECS).

#### ► LA ANALOGÍA
Blue/Green es mantener dos flotas completas y mover el letrero del listener hacia la nueva recién cuando está lista, en vez de reemplazar tareas una por una mientras siguen atendiendo tráfico real.

**Conceptos clave:** conjunto de tareas verde, `TargetService`, promoción a PRIMARY, AppSpec.

Para `computePlatform: ECS`, el despliegue Blue/Green es más elaborado: CodeDeploy analiza un AppSpec en formato JSON que describe la nueva definición de tarea, crea un "conjunto de tareas verde" en tu servicio ECS apuntando a esa nueva definición, ejecuta los lifecycle hooks configurados, y luego cambia atómicamente la regla de reenvío por defecto del listener ELB v2 para dirigir tráfico hacia el grupo objetivo verde —de forma inmediata (`AllAtOnce`), gradual por pasos (`Canary`) o en incrementos lineales (`Linear`), según la configuración elegida. Al finalizar exitosamente, el conjunto de tareas verde se promueve a `PRIMARY` y el conjunto azul original se elimina.

Este flujo asume que tu servicio ECS fue creado con `deploymentController.type: EXTERNAL` —delegando el control del despliegue a CodeDeploy en vez de al mecanismo de actualización continua nativo de ECS— y que ya tienes un listener ELB v2 con grupos objetivo azul y verde configurados, lo que conecta directamente con lo que practicaste en el Módulo 22.

**Analogía:** un despliegue Blue/Green de ECS es como preparar un segundo turno completo de personal (verde) entrenado y listo antes de rotar la asignación de clientes hacia ellos, en vez de reemplazar al personal actual (azul) uno por uno mientras siguen atendiendo — si algo sale mal con el turno nuevo, el turno anterior sigue disponible para retomar sin fricción.

**¿Por qué es importante?** Blue/Green es la estrategia de despliegue con menor riesgo de tiempo de inactividad porque el entorno anterior sigue existiendo intacto durante todo el proceso, listo para recibir tráfico de vuelta si algo falla — la diferencia entre esto y un despliegue in-place es central para entender por qué las arquitecturas críticas prefieren Blue/Green.

**Practícalo tú:**

```bash

# archivo: src/labs/modulo-24/tema-5-blue-green-ecs.sh — ejecutar con: bash tema-5-blue-green-ecs.sh
# El listener se recupera por nombre del ALB del Módulo 22 — no hace falta
# haber conservado ninguna variable de esa sesión de terminal.
LB_ARN=$(aws elbv2 describe-load-balancers --names demo-alb --query 'LoadBalancers[0].LoadBalancerArn' --output text)
LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn "$LB_ARN" --query 'Listeners[0].ListenerArn' --output text)

aws deploy create-application --application-name demo-app-ecs --compute-platform ECS
aws deploy create-deployment-group --application-name demo-app-ecs --deployment-group-name demo-grupo-ecs \
  --deployment-config-name CodeDeployDefault.ECSAllAtOnce \
  --service-role-arn arn:aws:iam::000000000000:role/codedeploy-role \
  --ecs-services serviceName=demo-service,clusterName=demo-cluster \
  --load-balancer-info targetGroupPairInfoList='[{prodTrafficRoute={listenerArns=["'"$LISTENER_ARN"'"]},targetGroups=[{name=demo-objetivos-azul},{name=demo-objetivos-verde}]}]'
```

`--ecs-services` identifica qué servicio y cluster de ECS gestiona este grupo de implementación; `--load-balancer-info` describe la pareja de grupos objetivo (azul y verde) y el listener del ALB entre los que CodeDeploy va a mover el tráfico — la misma infraestructura que creaste en el Módulo 22. En resumen: `--ecs-services` es la bandera que identifica servicio y cluster, y `--load-balancer-info` es la bandera que describe los grupos objetivo azul/verde y el listener.

**Resultado esperado:** el grupo de implementación queda creado con `deploymentType=BLUE_GREEN`; al iniciar un despliegue real sobre este grupo, `describe-services` en ECS mostraría temporalmente dos conjuntos de tareas (azul y verde) hasta que el verde se promueve a `PRIMARY`.

**Modifica esto:** cambia `CodeDeployDefault.ECSAllAtOnce` por `CodeDeployDefault.ECSLinear10PercentEvery1Minutes` y compara cuánto tarda en completarse un despliegue de prueba con cada configuración.

**Cuándo no usarlo:** no configures Blue/Green en un servicio ECS que sigue usando `deploymentController.type` nativo (`ECS` en vez de `EXTERNAL`); CodeDeploy no puede tomar control de un servicio que no delegó su despliegue explícitamente.

**Cómo crece tu proyecto:** este grupo Blue/Green es el que usará el servicio ECS en producción para desplegar sin interrumpir el tráfico del ALB creado en el Módulo 22.

---

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Prepara dos revisiones del servicio de seguimiento con grupos objetivo separados. Cambia el listener en laboratorio y demuestra que puedes restaurar el destino anterior sin reconstruir la imagen.


</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-24/tema-5-blue-green-ecs.sh — ejecutar con: bash tema-5-blue-green-ecs.sh
# El listener se recupera por nombre del ALB del Módulo 22 — no hace falta
# haber conservado ninguna variable de esa sesión de terminal.
LB_ARN=$(aws elbv2 describe-load-balancers --names demo-alb --query 'LoadBalancers[0].LoadBalancerArn' --output text)
LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn "$LB_ARN" --query 'Listeners[0].ListenerArn' --output text)

aws deploy create-application --application-name demo-app-ecs --compute-platform ECS
aws deploy create-deployment-group --application-name demo-app-ecs --deployment-group-name demo-grupo-ecs \
  --deployment-config-name CodeDeployDefault.ECSAllAtOnce \
  --service-role-arn arn:aws:iam::000000000000:role/codedeploy-role \
  --ecs-services serviceName=demo-service,clusterName=demo-cluster \
  --load-balancer-info targetGroupPairInfoList='[{prodTrafficRoute={listenerArns=["'"$LISTENER_ARN"'"]},targetGroups=[{name=demo-objetivos-azul},{name=demo-objetivos-verde}]}]'
```

```bash
LB_ARN=$(aws elbv2 describe-load-balancers --names demo-alb --query 'LoadBalancers[0].LoadBalancerArn' --output text)
aws deploy create-deployment --application-name demo-app --deployment-group-name demo-grupo-ecs \
  --revision 'revisionType=AppSpecContent,appSpecContent={content="{\"version\":0.0,\"Resources\":[{\"TargetService\":{\"Type\":\"AWS::ECS::Service\",\"Properties\":{\"TaskDefinition\":\"arn:aws:ecs:us-east-1:000000000000:task-definition/rutaflow-planificador-task:2\"}}}]}"}'
```

</details>

### Laboratorio 24.1 — Compilación real con CodeBuild

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar laboratorio 24.1 — compilación real con codebuild.

</details>

### Laboratorio 24.2 — Despliegue canary de Lambda con CodeDeploy

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar laboratorio 24.2 — despliegue canary de lambda con codedeploy.

</details>
