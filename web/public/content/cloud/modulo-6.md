# Módulo 6: APIs con API Gateway


## Aprende construyendo

### Tema 1: Qué es API Gateway y tipos de API — REST, HTTP, WebSocket

#### Paso 1 · Objetivo y preparación
Al finalizar vas a crear el contenedor de API REST que, en los siguientes Temas, va a exponer `confirmar-entrega` (Módulo 5) como endpoint HTTP. Prerrequisitos: Módulo 5 completo.
#### Paso 2 · Contexto y caso real
La app del conductor de RutaFlow necesita confirmar una entrega al toque, con conexión directa, en vez de depender siempre de la cola asíncrona `DeliveryCommands` del Módulo 5 Tema 6 — eso exige un endpoint HTTP síncrono.
#### Paso 3 · Teoría, modelo mental y analogía
API Gateway es recepción, enrutamiento y control en una sola puerta entre el cliente HTTP y tu Lambda.

**Conceptos clave:** puerta de entrada (gateway), API REST, API HTTP, API WebSocket, comunicación bidireccional.

API Gateway es el servicio que actúa como puerta de entrada única entre el mundo exterior (clientes HTTP: navegadores, aplicaciones móviles, otros servicios) y la lógica de tu backend, que puede vivir en Lambda, en un servidor tradicional, o en otro servicio de AWS. En vez de que cada cliente hable directamente con tus funciones Lambda (lo cual no sería siquiera posible de forma nativa, porque Lambda no expone un endpoint HTTP por sí sola), API Gateway recibe la petición HTTP, la transforma en el formato que tu backend espera, invoca ese backend, y transforma la respuesta de vuelta a un formato HTTP válido para el cliente.

Las API REST son el tipo históricamente más completo y configurable de API Gateway: soportan validación de peticiones con modelos, transformación detallada de datos con plantillas de mapeo, autorizadores personalizados, y un control granular sobre cada aspecto del comportamiento de la API. Esta flexibilidad tiene un coste de complejidad de configuración mayor comparado con las alternativas más recientes.

Las API HTTP son una versión más reciente y simplificada, diseñada específicamente para el caso de uso más común: exponer una Lambda (o un servicio HTTP) como un endpoint, con menos opciones de configuración pero también con menor latencia y menor coste por petición en una cuenta real de AWS. Para la mayoría de las APIs nuevas construidas principalmente para conectar con Lambda mediante integración proxy, las API HTTP son la recomendación por defecto en el ecosistema real de AWS, precisamente por esa simplicidad.

Las API WebSocket resuelven un problema completamente distinto: mientras que REST y HTTP siguen el modelo petición-respuesta clásico (el cliente pide, el servidor responde, y la conexión termina), WebSocket mantiene una conexión persistente y bidireccional entre cliente y servidor, permitiendo que el servidor envíe datos al cliente en cualquier momento sin que el cliente tenga que solicitarlos explícitamente cada vez. Esto es indispensable para casos de uso como chats en tiempo real, notificaciones instantáneas, o paneles de datos que se actualizan en vivo. Este curso, en su laboratorio, usa el tipo API REST, tanto por ser el más ilustrativo para entender los conceptos fundamentales de recursos, métodos y despliegue, como por ser el tipo con el que Floci tiene mayor compatibilidad de emulación estable.

**Analogía:** API Gateway es como la recepción de un edificio de oficinas con múltiples departamentos internos (tus funciones Lambda u otros backends): el visitante (cliente) no entra directamente a cada oficina, sino que pasa por recepción, que verifica su identidad si es necesario, lo dirige al departamento correcto, y le entrega de vuelta cualquier documento que ese departamento genere. Una API REST es como una recepción con un protocolo detallado y formal para cada tipo de visita; una API HTTP es como una recepción más ágil para el flujo de visitas más común y simple; una API WebSocket es como abrir una línea telefónica directa y continua entre el visitante y el departamento, en vez de visitas puntuales una por una.

**¿Por qué es importante?** Elegir el tipo correcto de API Gateway afecta directamente a la complejidad de configuración, el coste, y las capacidades disponibles. Entender las tres opciones desde el principio evita construir sobre una API REST completa (con toda su complejidad) cuando una API HTTP simple habría sido suficiente, o intentar forzar un caso de uso de tiempo real sobre REST/HTTP cuando WebSocket es la herramienta correcta.

**Diagrama:**

```
┌─────────────┐        ┌───────────────────────┐        ┌──────────────┐
│  Cliente HTTP  │ ────▶ │      API Gateway         │ ────▶ │   Lambda        │
│ (navegador,     │◀──── │  (REST / HTTP / WebSocket)│◀──── │  (tu backend)   │
│  app móvil, etc)│        └───────────────────────┘        └──────────────┘
└─────────────┘
   REST/HTTP: petición → respuesta, conexión termina
   WebSocket: conexión persistente, datos en ambas direcciones en cualquier momento
```

En el proyecto integrador RutaFlow, `API_ID` apunta a la misma API REST que en los próximos
Temas vas a conectar con `ConfirmarEntregaFn` (declarada en
`examples/rutaflow/cloud/template.yaml`). La diferencia frente a elegir API HTTP desde el
principio: acá se usa REST a propósito, porque este módulo necesita el control granular de
modelos de validación del Tema 4, algo que API HTTP no conviene usar si tu caso real no lo
necesita.

#### Paso 4 · Demostración guiada
```bash
API_ID=$(aws apigateway create-rest-api --name "API RutaFlow" --query id --output text)
ROOT_ID=$(aws apigateway get-resources --rest-api-id "$API_ID" --query 'items[0].id' --output text)
echo "API_ID=$API_ID ROOT_ID=$ROOT_ID"
```

**Ejecuta el ejemplo** (con Floci corriendo en local, ejecuta el comando contra el emulador):

```bash
floci up
aws --endpoint-url http://localhost:4566 sts get-caller-identity
```
Confirma la respuesta del servicio emulado.

Resultado esperado: `API_ID` y `ROOT_ID` quedan guardados en variables de shell — todavía no hay ningún recurso propio ni ningún método, solo el contenedor vacío y su raíz (`/`).
#### Paso 5 · Práctica guiada
Pista: probá `curl http://localhost:4566/restapis/$API_ID/dev/_user_request_/entregas` ahora mismo, antes de crear nada más — ese es el fallo deliberado: `{"message":"Missing Authentication Token"}`, porque ni el recurso `/entregas` ni el stage `dev` existen todavía.
#### Paso 6 · Práctica independiente
Corré `aws apigateway get-rest-apis` y confirmá que "API RutaFlow" aparece en la lista con el mismo `id` que guardaste en `API_ID` — es el mismo objeto, solo lo estás consultando por otro camino.
#### Paso 7 · Cierre y evidencia
Entregá la creación de la API, el error de ruta inexistente del Paso 5 y la confirmación del Paso 6; explicá qué falta todavía para que `/entregas` responda algo. Siguiente paso: recursos. Errores comunes: exponer rutas internas y no limitar tráfico. Fuente oficial: https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html.

### Tema 2: Recursos, métodos y stages

#### Paso 1 · Objetivo y preparación
Al finalizar vas a crear el recurso `/entregas` con el único método que necesita: `POST`. Prerrequisitos: Tema 1 de este módulo.
#### Paso 2 · Contexto y caso real
Confirmar una entrega es una acción que cambia estado (escribe en `ShipmentEvents`), no una consulta — por eso el contrato HTTP correcto es `POST /entregas`, no `GET`.
#### Paso 3 · Teoría, modelo mental y analogía
El recurso es el destino (`/entregas`); el método es la acción permitida sobre ese destino (`POST`); el stage, que llega en el Tema 5, es el ambiente donde eso se publica.

**Error real:**
```error-output
User: arn:aws:apigateway:us-east-1:000000000000:invoke-api is not authorized to perform: lambda:InvokeFunction on resource: arn:aws:lambda:us-east-1:000000000000:function:confirmar-entrega
```

**Diagnosis:**
1. **Qué sucedió:** API Gateway puede ver la función Lambda pero no tiene permiso para invocarla.
2. **Por qué sucede:** El permiso `lambda:InvokeFunction` debe ser explícitamente otorgado a API Gateway con `add-permission`. Sin este paso, API Gateway nunca puede llamar a Lambda, aunque el recurso Lambda exista.
3. **Qué buscar en logs:** Revisa si ejecutaste el paso `add-permission` con `--principal apigateway.amazonaws.com` y `--source-arn` correcto.

**Comando que produce el error:**
```bash
# ❌ INCORRECTO: Integración sin permiso
aws apigateway put-integration --rest-api-id "$API_ID" --resource-id "$ENTREGAS_ID" \
  --http-method POST --type AWS_PROXY --integration-http-method POST \
  --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/.../confirmar-entrega/invocations

# Ahora invocas POST /entregas → 403 Forbidden (sin permiso)

# ✅ CORRECTO: Agregar permiso PRIMERO
aws lambda add-permission --function-name confirmar-entrega \
  --statement-id apigw-entregas \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:000000000000:$API_ID/*/POST/entregas"

# LUEGO de add-permission, la integración funciona
```

**Fix inmediato:**
Verificar que el permiso existe:
```bash
aws lambda get-policy --function-name confirmar-entrega
```
Si no aparece `apigw-entregas` (o tu statement-id), ejecutar `add-permission`.

**Learning:**
En AWS, "crear una integración" no implica automáticamente que tenga permiso de ejecutarla. Es el principio de least-privilege: API Gateway solo puede hacer lo que explícitamente le permitimos. Sin `add-permission`, aunque todo esté conectado, el permiso hace falta.

**Trade-off en RutaFlow:**
En despliegue manual, este error es común la primera vez. En infraestructura como código (Terraform/CloudFormation), el `resource "aws_lambda_permission"` se declara junto a la integración, evitando el olvido.

---

**Conceptos clave:** recurso (resource), método (GET/POST/PUT/DELETE), stage, ruta (path).

Un recurso en una API REST de API Gateway representa un segmento de la ruta de la URL, organizado jerárquicamente: por ejemplo, `/tareas` es un recurso, y `/tareas/{id}` sería un recurso hijo que representa una tarea específica identificada por un parámetro de ruta. Cada recurso puede tener uno o más métodos HTTP asociados —GET, POST, PUT, DELETE, entre otros—, y cada combinación de recurso más método es lo que define un endpoint concreto y su comportamiento específico (por ejemplo, `GET /tareas` para listar todas las tareas, y `POST /tareas` para crear una nueva, ambos sobre el mismo recurso pero con métodos y comportamientos distintos).

Un stage es un espacio de despliegue con nombre (comúnmente `dev`, `staging`, `prod`) que representa una instantánea desplegada y accesible de tu configuración de API en un momento dado. Un mismo conjunto de recursos y métodos puede desplegarse en múltiples stages simultáneamente, cada uno con su propia URL base y, potencialmente, su propia configuración de variables de stage (que verás en el Tema 5), permitiendo por ejemplo que el stage `dev` apunte a una función Lambda de pruebas mientras el stage `prod` apunta a la versión de producción de esa misma función.

La URL final de un endpoint desplegado combina estas piezas: el ID único de la API, la región, el stage, y la ruta del recurso. Por ejemplo, una URL típica en AWS real tendría la forma `https://{api-id}.execute-api.{region}.amazonaws.com/{stage}/tareas`; en Floci, la URL sigue una estructura análoga pero apuntando al endpoint local en vez de al dominio real de AWS.

Es importante entender que definir un recurso y un método (por ejemplo, crear `/tareas` con `GET`) no es, por sí solo, suficiente para que ese endpoint responda peticiones reales: hace falta, además, conectar ese método a una integración (en este curso, siempre una integración proxy con Lambda, tema siguiente) y desplegar esa configuración a un stage, algo que verás explícitamente en el Tema 5. Sin ese despliegue, la configuración existe pero no es accesible desde fuera.

**Analogía:** los recursos son como las distintas secciones de un edificio de oficinas (`/tareas` sería el departamento de "tareas", `/tareas/{id}` sería una oficina específica dentro de ese departamento), y los métodos son como las distintas acciones que puedes solicitar en esa sección (consultar información, enviar una solicitud nueva, actualizar un expediente, eliminarlo). El stage es como tener réplicas completas de ese mismo edificio en distintas ciudades (desarrollo, pruebas, producción), cada una operando de forma independiente aunque compartan el mismo plano de organización interna.

**¿Por qué es importante?** Entender la jerarquía de recursos, métodos y stages es la base para diseñar correctamente cualquier API REST, no solo en API Gateway sino en el diseño de APIs en general: agrupar operaciones relacionadas bajo el mismo recurso, usar el método HTTP semánticamente correcto para cada acción, y mantener entornos separados (stages) para poder probar cambios sin afectar producción.

**Diagrama:**

```
API: "Sistema de Tareas"
├── /tareas
│    ├── GET    → listar todas las tareas
│    └── POST   → crear una tarea nueva
└── /tareas/{id}
     ├── GET    → obtener una tarea específica
     ├── PUT    → actualizar una tarea específica
     └── DELETE → eliminar una tarea específica

Desplegado en stages:
  /dev/tareas   → apunta a Lambda de desarrollo
  /prod/tareas  → apunta a Lambda de producción
```

En el proyecto integrador RutaFlow, este mismo recurso `/entregas` con método `POST` es el que,
en producción, declararías junto a `ConfirmarEntregaFn` en
`examples/rutaflow/cloud/template.yaml` mediante un evento `Api:` en vez de los comandos
`create-resource`/`put-method` manuales que acabás de ejecutar — infraestructura como código en
vez de pasos sueltos de CLI.

#### Paso 4 · Demostración guiada
```bash
ENTREGAS_ID=$(aws apigateway create-resource --rest-api-id "$API_ID" --parent-id "$ROOT_ID" --path-part entregas --query id --output text)
aws apigateway put-method --rest-api-id "$API_ID" --resource-id "$ENTREGAS_ID" --http-method POST --authorization-type NONE
```
Resultado esperado: `put-method` devuelve un JSON confirmando `httpMethod: POST` sobre el recurso `/entregas` — el contrato ya existe, aunque todavía no esté conectado a ningún backend (eso es el Tema 3).
#### Paso 5 · Práctica guiada
Pista: intentá `aws apigateway put-method --rest-api-id "$API_ID" --resource-id "$ENTREGAS_ID" --http-method GET --authorization-type NONE` y después invocá con `curl -X GET` sobre el endpoint desplegado (una vez llegues al Tema 5) — ese GET nunca debería existir para este recurso: `/entregas` solo tiene sentido como `POST`, un `GET` ahí es un contrato mal diseñado, no solo un método de más.
#### Paso 6 · Práctica independiente
Confirmá con `aws apigateway get-resource --rest-api-id "$API_ID" --resource-id "$ENTREGAS_ID"` que el recurso ahora lista ambos métodos (`POST` del Paso 4, `GET` del Paso 5) bajo `resourceMethods`, y borrá el `GET` con `aws apigateway delete-method --rest-api-id "$API_ID" --resource-id "$ENTREGAS_ID" --http-method GET` para dejar el contrato limpio otra vez.
#### Paso 7 · Cierre y evidencia
Entregá la creación de `/entregas` con `POST`, el `GET` agregado por error y su borrado; explicá por qué `POST` es el verbo correcto acá y no `GET`. Siguiente paso: integraciones. Errores comunes: mezclar stages y verbos. Fuente oficial: https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-api-definition.html.
### Fallo Deliberado: User: arn:aws:apigateway is not authorized to invoke

### Tema 3: Integración con Lambda (proxy)

#### Paso 1 · Objetivo y preparación
Al finalizar vas a conectar `POST /entregas` con la función `confirmar-entrega` del Módulo 5 mediante integración proxy, y a otorgar el permiso que esa conexión necesita de verdad. Prerrequisitos: Tema 2 de este módulo, Módulo 5 completo.
#### Paso 2 · Contexto y caso real
`confirmar-entrega` ya sabe devolver `{statusCode, body}` desde el Módulo 5 Tema 4 — exactamente el contrato que una integración proxy espera, sin que tengas que reescribir nada del handler.
#### Paso 3 · Teoría, modelo mental y analogía
La integración proxy entrega el paquete completo sin abrirlo; la integración no proxy lo reempaqueta con reglas (VTL) antes de entregarlo.

**Conceptos clave:** integración proxy (`AWS_PROXY`), integración no proxy (`AWS`), plantilla de mapeo, permisos de invocación.

Una integración es la configuración que le dice a API Gateway qué hacer cuando llega una petición a un método específico: a qué backend reenviarla, y cómo transformar los datos en el camino de ida y de vuelta. La integración proxy con Lambda (identificada internamente como `AWS_PROXY`) es, con diferencia, la más simple y la más usada en la práctica moderna: API Gateway reenvía la petición HTTP completa —método, ruta, cabeceras, parámetros de consulta, cuerpo— empaquetada tal cual dentro del `event` que recibe tu función Lambda, sin ninguna transformación intermedia configurable. A cambio, como viste en el Módulo 5, tu función es responsable de devolver la respuesta ya en el formato exacto que API Gateway espera (`statusCode`, `headers`, `body`).

La alternativa, la integración no proxy (`AWS`, sin el sufijo `_PROXY`), permite definir plantillas de mapeo explícitas: reglas que transforman la petición entrante a un formato personalizado antes de que llegue a Lambda, y transforman la respuesta de Lambda a un formato personalizado antes de devolverla al cliente. Esto da más control granular (por ejemplo, exponer solo ciertos campos del evento HTTP a tu función, ocultando el resto), pero añade una capa de configuración adicional —escrita en un lenguaje de plantillas llamado VTL (Velocity Template Language)— que la mayoría de los equipos modernos prefieren evitar en favor de la simplicidad de la integración proxy, delegando cualquier transformación de datos al propio código de la función Lambda, un lenguaje de programación de propósito general en el que es más cómodo trabajar que en un lenguaje de plantillas especializado.

Para que la integración funcione, API Gateway necesita permiso explícito para invocar tu función Lambda: esto se gestiona mediante una política de permisos de recurso (resource-based policy) adjunta a la propia función Lambda, que autoriza específicamente al servicio de API Gateway (y, más concretamente, a esa API y método concretos) a invocarla. Sin este permiso, aunque la integración esté correctamente configurada en apariencia, las peticiones fallarán con un error de autorización al intentar invocar la función.

Este curso usa exclusivamente integración proxy, tanto por ser el enfoque recomendado en el ecosistema real de AWS para la inmensa mayoría de los casos, como por mantener la coherencia directa con el contrato de entrada/salida de Lambda que ya aprendiste en el Módulo 5: el mismo formato de `event` y de respuesta que usaste al invocar la función directamente es, con la integración proxy, exactamente el mismo formato que recibe y debe devolver cuando la invoca API Gateway.

**Analogía:** la integración proxy es como un mensajero que entrega el sobre completo, cerrado y sin abrir, directamente al destinatario final (tu Lambda), confiando en que el destinatario sabe cómo abrirlo e interpretarlo, y que su respuesta también vendrá en un sobre con el formato correcto ya preparado por el destinatario. La integración no proxy es como un mensajero que primero abre el sobre, reescribe su contenido según un formulario específico antes de entregarlo, y hace lo mismo a la inversa con la respuesta: más control sobre el formato final, pero un paso adicional de trabajo (y de posibles errores) en el camino.

**¿Por qué es importante?** La integración proxy es, en la práctica moderna, la opción por defecto correcta para conectar Lambda con API Gateway en la gran mayoría de proyectos nuevos, precisamente porque mantiene toda la lógica de transformación de datos en un solo lugar (tu código Lambda) en vez de repartirla entre plantillas de configuración de infraestructura y código de aplicación.

**Diagrama:**

```
Integración PROXY (AWS_PROXY):                Integración NO PROXY (AWS):
Petición HTTP completa                         Petición HTTP
      │                                              │
      ▼ (sin transformar)                            ▼ (plantilla VTL transforma)
event = { httpMethod, path,                     event = { solo los campos
          headers, body, ... }                          que la plantilla decida exponer }
      │                                              │
      ▼                                              ▼
Lambda debe devolver                            Lambda devuelve lo que sea,
{statusCode, headers, body}                     otra plantilla VTL lo transforma
```

**Diagrama interactivo — flujo completo de una petición (integrando lo visto en los Módulos 4 y 5):**

```mermaid
sequenceDiagram
  participant Cliente
  participant APIGW as API Gateway (Floci)
  participant Lambda as Función Lambda
  participant DynamoDB

  Cliente->>APIGW: GET /tareas
  APIGW->>Lambda: invoke (integración proxy, event = petición completa)
  Lambda->>DynamoDB: get-item / query
  DynamoDB-->>Lambda: item(s) encontrados
  Lambda-->>APIGW: {statusCode: 200, body: JSON}
  APIGW-->>Cliente: respuesta HTTP 200
```

En el proyecto integrador RutaFlow, esta misma integración proxy y el `AWS::Lambda::Permission`
implícito que SAM genera a partir del evento `Api:` de `ConfirmarEntregaFn` en
`examples/rutaflow/cloud/template.yaml` reemplazan en producción los dos comandos manuales
(`put-integration` y `add-permission`) que ejecutaste arriba.
**Evidencia de aprendizaje:** entrega el `put-integration` confirmado del Paso 4, el error 500 reproducido sin permiso del Paso 5, y la política con `Sid: apigw-entregas` verificada en el Paso 6.

#### Paso 4 · Demostración guiada
```bash
aws apigateway put-integration --rest-api-id "$API_ID" --resource-id "$ENTREGAS_ID" --http-method POST \
  --type AWS_PROXY --integration-http-method POST \
  --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:000000000000:function:confirmar-entrega/invocations
aws lambda add-permission --function-name confirmar-entrega --statement-id apigw-entregas \
  --action lambda:InvokeFunction --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:000000000000:$API_ID/*/POST/entregas"
```
Resultado esperado: `put-integration` confirma `type: AWS_PROXY`; `add-permission` devuelve la política de recurso agregada a `confirmar-entrega` — sin ese segundo comando, API Gateway no tiene autorización para invocar la función aunque la integración esté bien configurada.
#### Paso 5 · Práctica guiada
Pista: comentá mentalmente (o probá de verdad) qué pasaría si NO hubieras corrido el `add-permission` del Paso 4 — ese es el fallo real documentado en el laboratorio de este módulo: el `curl` contra el endpoint responde con un error 500 genérico, aunque invocar `confirmar-entrega` directamente con `aws lambda invoke` funcione perfecto. El problema nunca está en la Lambda en sí, está en el permiso que falta entre los dos servicios.
**Fallo deliberado:** quitá (o nunca corras) el `add-permission` del Paso 4, dejando solo el `put-integration` — provoca que el `curl` contra el endpoint responda con un error 500 genérico de API Gateway, mientras que invocar `confirmar-entrega` directamente con `aws lambda invoke` sigue funcionando sin problema; diagnosticalo corriendo `aws lambda get-policy --function-name confirmar-entrega` y confirmando que el `Sid: apigw-entregas` nunca se creó.
#### Paso 6 · Práctica independiente
Confirmá el permiso ya otorgado con `aws lambda get-policy --function-name confirmar-entrega`, y ubicá dentro del JSON el `Sid: apigw-entregas` con el `Resource` apuntando a tu `API_ID` — esa es la diferencia concreta entre "configurado" y "autorizado".
#### Paso 7 · Cierre y evidencia
Entregá la integración creada, el permiso otorgado y el diagnóstico del error 500 que ocurriría sin ese permiso; explicá por qué ese error no apunta directamente a "falta un permiso". Siguiente paso: modelos. Errores comunes: permisos implícitos y payload incompatible. Fuente oficial: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html.
### Tema 4: Mapeo de entrada/salida y validación con modelos

#### Paso 1 · Objetivo y preparación
Al finalizar vas a rechazar un comando de entrega malformado en API Gateway mismo, antes de que `confirmar-entrega` siquiera se invoque. Prerrequisitos: Tema 3 de este módulo.
#### Paso 2 · Contexto y caso real
`confirmar-entrega` ya valida `shipmentId`/`recipientPin` dentro del handler (Módulo 5), pero eso significa pagar una invocación completa de Lambda solo para rechazar un JSON mal formado — un modelo en API Gateway filtra eso una capa antes, gratis.
#### Paso 3 · Teoría, modelo mental y analogía
El modelo es un formulario obligatorio en la puerta: si el paquete no cumple el formato mínimo, ni siquiera entra al edificio.

**Conceptos clave:** modelo (model), esquema JSON, validación de petición, mapeo de parámetros.

Un modelo en API Gateway es un esquema (siguiendo la convención de JSON Schema) que define la estructura esperada del cuerpo de una petición: qué campos son obligatorios, de qué tipo debe ser cada uno, y qué restricciones adicionales deben cumplir (por ejemplo, que un campo `email` siga un patrón de formato válido, o que un campo `cantidad` sea un número positivo). Cuando asocias un modelo a un método y activas la validación de petición, API Gateway rechaza automáticamente, antes de siquiera invocar tu Lambda, cualquier petición cuyo cuerpo no cumpla ese esquema, devolviendo un error 400 con detalles de qué campo falló la validación.

Esta validación a nivel de API Gateway tiene una ventaja de eficiencia real: evita invocar (y, en una cuenta real, pagar por invocar) tu función Lambda con datos que de todas formas vas a rechazar por estar mal formados, delegando esa primera capa de validación estructural al propio API Gateway antes de que la petición llegue a tu código. Esto no elimina la necesidad de validación adicional dentro de tu función (reglas de negocio más complejas que un esquema JSON no puede expresar, como "el usuario debe tener permiso para esta acción específica"), pero sí filtra los casos más básicos de datos malformados en una capa anterior, más barata y más rápida.

El mapeo de parámetros, un concepto relacionado pero distinto de la validación de cuerpo, permite especificar de dónde provienen ciertos valores esperados por tu integración: por ejemplo, mapear un parámetro de ruta como `{id}` en `/tareas/{id}` a una variable específica que tu integración (o, en integración no proxy, tu plantilla VTL) puede usar directamente. Con integración proxy, como la que usa este curso, este mapeo explícito de parámetros individuales es menos relevante, porque —como viste en el Tema 3— toda la petición, incluyendo los parámetros de ruta capturados dentro de `event.pathParameters`, llega completa a tu función sin transformación, y es tu propio código el que extrae y valida lo que necesita de ahí.

**Analogía:** un modelo de validación es como un guardia de seguridad en la entrada de un edificio que revisa que cualquier paquete que entra cumple ciertos requisitos básicos de formato (tamaño máximo, tipo de contenido declarado) antes de dejarlo pasar al departamento correspondiente, sin necesidad de que cada departamento interno tenga que revisar esos mismos requisitos básicos una y otra vez. El mapeo de parámetros sería como etiquetar explícitamente, antes de la entrega, qué parte del paquete corresponde a qué campo del formulario interno del departamento receptor.

**¿Por qué es importante?** Añadir validación de modelos en API Gateway, en vez de depender exclusivamente de validación dentro del código de tu Lambda, es una práctica de eficiencia y de defensa en profundidad: rechaza peticiones claramente malformadas lo antes posible en la cadena de procesamiento, reduciendo invocaciones innecesarias y simplificando la lógica de validación que tu función realmente necesita manejar.

**Diagrama:**

```
Petición POST /tareas con cuerpo malformado
      │
      ▼
┌───────────────────────┐
│ API Gateway valida       │
│ contra el modelo JSON     │  ──▶ Si NO cumple: rechaza con 400,
│ Schema asociado al método │       Lambda nunca se invoca
└───────────────────────┘
      │  Si SÍ cumple
      ▼
   Invoca Lambda con el cuerpo ya validado estructuralmente
```

En el proyecto integrador RutaFlow, este `EntregaModel` es el que validaría en la puerta el
mismo payload `{shipmentId, recipientPin}` que `ConfirmarEntregaFn` (en
`examples/rutaflow/cloud/template.yaml`) ya valida internamente — defensa en profundidad entre
API Gateway y la propia función.

#### Paso 4 · Demostración guiada
```bash
aws apigateway create-model --rest-api-id "$API_ID" --name EntregaModel --content-type application/json --schema \
  '{"$schema":"http://json-schema.org/draft-04/schema#","title":"EntregaModel","type":"object","required":["shipmentId","recipientPin"],"properties":{"shipmentId":{"type":"string"},"recipientPin":{"type":"string"}}}'
aws apigateway update-method --rest-api-id "$API_ID" --resource-id "$ENTREGAS_ID" --http-method POST \
  --patch-operations op=replace,path=/requestValidatorId,value="$(aws apigateway create-request-validator --rest-api-id "$API_ID" --name validar-body --validate-request-body --query id --output text)"
```
Resultado esperado: `create-model` y `create-request-validator` devuelven sus respectivos JSON sin error; `update-method` confirma que `POST /entregas` ahora tiene un `requestValidatorId` asociado.
#### Paso 5 · Práctica guiada
Pista: una vez desplegado (Tema 5), un `curl -X POST .../entregas -d '{"shipmentId":"env-4471"}'` (sin `recipientPin`) es el fallo deliberado — API Gateway responde `400 {"message":"Invalid request body"}` directamente, sin que `confirmar-entrega` se invoque ni una sola vez; compará esto con el 500 del Tema 3, que sí pasaba por la Lambda.
#### Paso 6 · Práctica independiente
Confirmá con `aws apigateway get-model --rest-api-id "$API_ID" --model-name EntregaModel` que el esquema sigue intacto, y agregá un patrón de formato al campo `recipientPin` (`"pattern": "^\\d{6}$"`) para que el modelo rechace también un PIN con letras, no solo un PIN ausente.
#### Paso 7 · Cierre y evidencia
Entregá el modelo y el validador creados, el 400 del Paso 5 sin invocar la Lambda, y el patrón agregado en el Paso 6; explicá la diferencia entre el 400 de este Tema y el 400 que ya devolvía el propio handler en el Módulo 5. Siguiente paso: despliegue. Errores comunes: validar solo en frontend y aceptar tipos ambiguos. Fuente oficial: https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-method-request-validation.html.

### Tema 5: Despliegue y variables de stage

#### Paso 1 · Objetivo y preparación
Al finalizar vas a publicar `POST /entregas` en un stage real y a probar el endpoint completo de punta a punta. Prerrequisitos: Temas 1-4 de este módulo.
#### Paso 2 · Contexto y caso real
Todo lo configurado en los Temas 1-4 (recurso, método, integración, modelo) sigue invisible desde fuera hasta este paso — RutaFlow necesita una URL real que la app del conductor pueda llamar.
#### Paso 3 · Teoría, modelo mental y analogía
El despliegue es publicar una fotografía de la configuración actual; la variable de stage es el rótulo del ambiente que esa fotografía usa (por ejemplo, qué alias de Lambda invocar).
#### Paso 4 · Demostración guiada
```bash
aws apigateway create-deployment --rest-api-id "$API_ID" --stage-name dev
aws apigateway update-stage --rest-api-id "$API_ID" --stage-name dev \
  --patch-operations op=replace,path=/variables/lambdaAlias,value=produccion
curl -X POST "http://localhost:4566/restapis/$API_ID/dev/_user_request_/entregas" \
  -d '{"shipmentId":"env-4471","recipientPin":"837201"}'
```
Resultado esperado: el `curl` devuelve `{"shipmentId":"env-4471","status":"delivered"}` con HTTP 200 — la cadena completa (API Gateway → integración proxy → `confirmar-entrega` → respuesta) funciona de punta a punta, y el stage `dev` ya tiene su propia variable `lambdaAlias` apuntando al alias `produccion` del Módulo 5 Tema 5.
#### Paso 5 · Práctica guiada
Pista: repetí el mismo `curl` pero contra `/qa/_user_request_/entregas` (un stage que nunca desplegaste) — ese es el fallo deliberado: `{"message":"Missing Authentication Token"}`, el mismo error del Tema 1, confirmando que ese mensaje significa "esta combinación de ruta y stage no existe todavía", no un problema de autenticación real.
#### Paso 6 · Práctica independiente
Cambiá el `requestValidatorId` del método (por ejemplo, quitá la validación del Tema 4 con `update-method`), confirmá con un `curl` que el comportamiento en `dev` NO cambió todavía, y recién después de un nuevo `create-deployment --stage-name dev` confirmá que sí cambió — evidencia directa de que configurar y desplegar son pasos separados.
#### Paso 7 · Cierre y evidencia
Entregá el `curl` exitoso del Paso 4, el error de stage inexistente del Paso 5, y la comparación antes/después de re-desplegar del Paso 6; explicá por qué un cambio de configuración no se nota hasta el siguiente despliegue. Siguiente paso: observabilidad. Errores comunes: cambiar producción sin versionar y olvidar cache. Fuente oficial: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-deployments.html.
**Conceptos clave:** despliegue (deployment), variable de stage, inmutabilidad de la configuración hasta el despliegue.

Un aspecto que sorprende a quien configura una API Gateway por primera vez es que modificar la configuración de recursos, métodos o integraciones —incluso guardando esos cambios explícitamente— no los hace accesibles de inmediato en ningún stage. API Gateway requiere una operación explícita y separada llamada despliegue (deployment), que toma una instantánea del estado actual de la configuración y la publica en un stage específico. Hasta que no ejecutas ese despliegue, cualquier cliente que llame a la URL de un stage sigue recibiendo el comportamiento de la última configuración desplegada anteriormente, no los cambios que acabas de guardar.

Esta separación entre "configurar" y "desplegar" es una decisión de diseño deliberada: te permite hacer múltiples cambios de configuración —añadir varios métodos nuevos, ajustar varias integraciones— y desplegarlos todos juntos de una sola vez en un momento controlado, en vez de que cada cambio individual se vuelva inmediatamente visible en producción de forma descoordinada. También te permite probar una configuración en un stage de pruebas antes de desplegar exactamente esa misma configuración a producción.

Las variables de stage son pares clave-valor específicos de cada stage, que puedes referenciar dentro de tu configuración de integración (por ejemplo, para apuntar a un alias distinto de tu función Lambda según el stage). Un patrón común es usar una variable de stage para almacenar el nombre del alias de Lambda a invocar, de forma que el stage `dev` invoque el alias `desarrollo` de tu función y el stage `prod` invoque el alias `produccion` de esa misma función, sin necesidad de duplicar la configuración completa de la API para cada entorno: solo cambia el valor de esa variable entre stages.

Olvidar este paso de despliegue explícito es, con mucha diferencia, el error más común y más desconcertante al empezar a trabajar con API Gateway: haber configurado todo aparentemente bien, pero seguir viendo el comportamiento antiguo (o directamente un error 404, si el recurso ni siquiera existía en el último despliegue) al probar el endpoint, simplemente porque el cambio nunca se desplegó al stage que estás consultando.

**Analogía:** configurar recursos y métodos en API Gateway es como editar un documento en un procesador de texto: los cambios existen en tu editor, pero nadie más los ve todavía. Desplegar a un stage es como publicar ese documento en un sitio web específico: solo después de "publicar" (desplegar), los lectores de esa URL concreta (ese stage) ven la versión actualizada. Puedes seguir editando el documento (haciendo más cambios de configuración) sin que eso afecte lo ya publicado, hasta que decidas publicar (desplegar) de nuevo.

**¿Por qué es importante?** Entender que la configuración y el despliegue son pasos separados evita la confusión más común al depurar una API Gateway que "no refleja mis cambios": casi siempre, la solución es simplemente recordar ejecutar un nuevo despliegue al stage correspondiente, no un problema más profundo en la configuración en sí.

**Diagrama:**

```
Configuración actual (recursos, métodos, integraciones)
        │
        │  create-deployment --stage-name dev
        ▼
   Stage "dev" ahora refleja esta configuración
        │
   (sigues editando la configuración: nuevos cambios)
        │
        │  create-deployment --stage-name dev   ← hay que repetirlo
        ▼
   Stage "dev" refleja los nuevos cambios
```

En el proyecto integrador RutaFlow, el stage `dev` que acabás de desplegar a mano es el que un
pipeline de CI (ver `examples/rutaflow/devops/deployment.yaml` para el equivalente en
Kubernetes) desplegaría automáticamente en cada cambio a `template.yaml`, sin pasos manuales de
`create-deployment`.

---


## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** crear una API REST completa con un recurso `/tareas`, conectarlo mediante integración proxy a la función Lambda del Módulo 5, desplegarla en un stage `dev`, e invocar el endpoint HTTP resultante con `curl`.

**Requisitos previos:** Floci corriendo con los servicios API Gateway y Lambda activos, la función `mi-funcion` del Módulo 5 ya desplegada.

### Laboratorio 6.1 — Construir y desplegar el endpoint

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crear la API REST | `aws apigateway create-rest-api --name "API Tareas"` | Crea el contenedor de la API; guarda el `id` devuelto | Un JSON con `id` y `name: "API Tareas"` |
| 2 | Obtener el ID del recurso raíz | `aws apigateway get-resources --rest-api-id <api-id>` | Toda API REST nace con un recurso raíz (`/`); necesitas su ID para crear recursos hijos | Un JSON con un `item` cuyo `path` es `/` |
| 3 | Crear el recurso `/tareas` | `aws apigateway create-resource --rest-api-id <api-id> --parent-id <id-recurso-raiz> --path-part tareas` | Crea el recurso `/tareas` como hijo de la raíz | Un JSON con `id` del nuevo recurso y `path: "/tareas"` |
| 4 | Crear el método GET sobre ese recurso | `aws apigateway put-method --rest-api-id <api-id> --resource-id <id-recurso-tareas> --http-method GET --authorization-type NONE` | Define que `/tareas` acepta peticiones GET, sin autorización adicional para este laboratorio | Un JSON confirmando el método `GET` |
| 5 | Conectar el método a la Lambda con integración proxy | `aws apigateway put-integration --rest-api-id <api-id> --resource-id <id-recurso-tareas> --http-method GET --type AWS_PROXY --integration-http-method POST --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:000000000000:function:mi-funcion/invocations` | Define que las peticiones GET a `/tareas` se reenvían completas a `mi-funcion`, y su respuesta se devuelve tal cual (proxy) | Un JSON confirmando `type: AWS_PROXY` |
| 6 | Desplegar la API al stage `dev` | `aws apigateway create-deployment --rest-api-id <api-id> --stage-name dev` | Publica la configuración actual en el stage `dev`, haciéndola accesible por primera vez | Un JSON con `id` del despliegue |
| 7 | Invocar el endpoint desplegado | `curl http://localhost:4566/restapis/<api-id>/dev/_user_request_/tareas` | Prueba de extremo a extremo: petición HTTP real que llega a API Gateway y este la reenvía a Lambda | El mismo JSON que devolvería invocar la Lambda directamente, por ejemplo `{"mensaje":"Hola, mundo"}` |
| 8 | Comparar con invocar la Lambda directamente | `aws lambda invoke --function-name mi-funcion --payload '{}' --cli-binary-format raw-in-base64-out salida-directa.json && cat salida-directa.json` | Confirma que ambos caminos (API Gateway y la CLI directa) llegan al mismo resultado final de negocio | El contenido de `salida-directa.json` coincide en su parte de negocio con la respuesta del `curl` del paso 7 |

**Comprobación visual:** usa Floci UI para comprobar que la función Lambda integrada sigue disponible en **Cloud Explorer → Serverless**. API Gateway no tiene actualmente una superficie unificada completa en Cloud Explorer, por lo que rutas, métodos, integración y deployment se verifican con `get-resources`, `get-integration` y `get-deployments`. La interfaz aporta contexto visual de la función; `curl` demuestra el flujo de extremo a extremo.

**Verificación:** el laboratorio se considera exitoso si la función integrada aparece con la configuración esperada, y si el `curl` del paso 7 responde con un código HTTP 200 y un cuerpo JSON coherente con lo que Lambda devuelve, confirmando la cadena completa (petición HTTP → API Gateway → integración proxy → Lambda → respuesta).

**Errores comunes y soluciones**

- **`{"message":"Missing Authentication Token"}` al hacer `curl`.** Casi siempre significa que la ruta de la URL está mal formada (falta el stage, o el `_user_request_` en el formato de Floci/LocalStack), o que el método/recurso no coincide exactamente con lo configurado. Revisa cuidadosamente cada segmento de la URL contra el paso 6.
- **El `curl` responde con un error 500 genérico.** Revisa primero que invocar la Lambda directamente (paso 8) funciona correctamente; si falla ahí también, el problema está en la función, no en API Gateway. Si la invocación directa funciona pero el `curl` falla, revisa los permisos de invocación entre API Gateway y Lambda, y que el `type` de la integración sea exactamente `AWS_PROXY`.
- **Los cambios de configuración no se reflejan al volver a probar el endpoint.** Como viste en el Tema 5, cualquier cambio posterior a los métodos o integraciones requiere un nuevo `create-deployment` al stage correspondiente; sin ese paso, el stage sigue sirviendo la configuración anterior.
- **Olvidar reemplazar `<api-id>` o los IDs de recurso en cada comando.** Cada comando de este laboratorio depende del `id` devuelto por un paso anterior; es buena práctica guardar esos valores en variables de shell (`API_ID=$(aws apigateway create-rest-api ... --query id --output text ...)`) para no tener que copiarlos manualmente cada vez.

---
