# Módulo 27: APIs GraphQL con AppSync y correo transaccional con SES


## Aprende construyendo

### Tema 1: AppSync — APIs GraphQL gestionadas

#### Paso 1 · Objetivo y preparación
Al finalizar podrás definir una API GraphQL desde cero. Prerrequisitos: Node.js y Docker; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una aplicación necesita consultar exactamente los campos que su pantalla requiere.
#### Paso 3 · Teoría, modelo mental y analogía
El esquema GraphQL es menú tipado; el cliente pide solo platos necesarios.

**Conceptos clave:** `CreateGraphqlApi`, esquema GraphQL, tipo de autenticación.

AppSync resuelve el mismo problema de fondo que API Gateway del Módulo 6 —exponer una API a tus clientes—, pero con GraphQL en vez de REST: en lugar de múltiples endpoints donde cada uno devuelve una forma fija de datos, GraphQL expone un único endpoint donde el cliente especifica exactamente qué campos necesita en cada consulta, evitando tanto la sobre-obtención (recibir campos que no usas) como la sub-obtención (tener que hacer varias llamadas para juntar los datos que necesitas). Crear una API con `CreateGraphqlApi` requiere elegir un tipo de autenticación —`API_KEY` es el más simple para empezar— y luego definir el esquema con `StartSchemaCreation`, que en Floci es siempre síncrono: no hay espera de procesamiento como en otros servicios.

Una vez definido el esquema, cada campo de tipo `Query`, `Mutation` o `Subscription` necesita un resolver que le diga a AppSync de dónde sacar los datos. Este desacoplamiento entre "qué forma tienen mis datos" (esquema) y "de dónde vienen realmente" (resolvers) es lo que hace GraphQL flexible para evolucionar sin romper a los clientes existentes.

**Analogía:** una API REST es como un menú de restaurante con platos fijos predefinidos; una API GraphQL es como pedirle al chef exactamente los ingredientes que quieres en tu plato, ni más ni menos, en un solo pedido.

**¿Por qué es importante?** Elegir GraphQL sobre REST no es gratis —añade la complejidad de definir un esquema y resolvers—, así que reconocer cuándo el problema real es "mis clientes necesitan formas de datos muy variables" (donde GraphQL brilla) frente a "necesito operaciones CRUD simples y predecibles" (donde REST suele ser más simple) es la decisión de diseño central de este tema.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-27/tema-1-appsync-api.sh — ejecutar con: bash tema-1-appsync-api.sh
API_ID=$(aws appsync create-graphql-api --name demo-api --authentication-type API_KEY --query 'graphqlApi.apiId' --output text)
aws appsync start-schema-creation --api-id "$API_ID" \
  --definition 'type Query { estadoEntrega(guia: String!): String }'
```

`--authentication-type` elige cómo se autentican los clientes de la API (`API_KEY` es el más simple: una clave compartida, sin login de usuario); `--api-id` (tomado de la respuesta del primer comando) identifica esa API en cada llamada siguiente.

**Resultado esperado:** `create-graphql-api` devuelve un `apiId`; `start-schema-creation` confirma de inmediato (es síncrono en Floci, sin estado `PROCESSING` que sondear).

**Modifica esto:** añade un segundo campo al esquema (`totalEntregas: Int`) recreando el esquema con `start-schema-creation`, y confirma con `get-introspection-schema` que ambos campos existen.

**Cuándo no usarlo:** no migres una API REST simple y estable a GraphQL solo por moda; si tus clientes siempre piden la misma forma de datos, el costo de mantener esquema y resolvers no se paga solo.

**Cómo crece tu proyecto:** `estadoEntrega` es el campo GraphQL que el panel de seguimiento consulta para pedir exactamente los datos de una guía, sin sobre-pedir el resto de la entrega.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Expón una consulta de estado de guía por GraphQL con campos públicos explícitos. Prueba una selección válida y el intento de consultar un dato privado que no debe formar parte del esquema.

#### Paso 4 · Demostración guiada
Crea `src/schema.graphql` desde una carpeta vacía.
```bash
mkdir ejemplo-graphql
node --version
```

**Ejecuta el ejemplo** (con Floci corriendo en local, ejecuta el comando contra el emulador):

```bash
floci up
aws --endpoint-url http://localhost:4566 sts get-caller-identity
```
Confirma la respuesta del servicio emulado.

Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: consulta un campo inexistente para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Añade tipo, query y autenticación.
#### Paso 7 · Cierre y evidencia
Entrega esquema, salida, fallo y corrección; explica el resultado. Siguiente paso: resolvers. Errores comunes: esquema sin límites y consultas costosas. Fuente oficial: https://docs.aws.amazon.com/appsync/latest/devguide/what-is-appsync.html.

### Tema 2: Fuentes de datos y resolvers

#### Paso 1 · Objetivo y preparación
Al finalizar vas a conectar el campo `estadoEntrega` de `demo-api` (Tema 1) a un resolver local, antes de tener lista la tabla DynamoDB real detrás. Prerrequisitos: Tema 1 de este módulo.
#### Paso 2 · Contexto y caso real
El equipo de frontend de RutaFlow quiere empezar a consumir `estadoEntrega` desde su app ya mismo, sin esperar a que el backend termine de conectar la fuente de datos real.
#### Paso 3 · Teoría, modelo mental y analogía
Una fuente de datos `NONE` es un mostrador local que responde sin ir a la cocina (el backend real) — útil para validar el esquema con clientes reales antes de conectar nada definitivo.

**Conceptos clave:** fuente de datos tipo `NONE`, resolvers locales, función.

Un resolver conecta un campo del esquema con una fuente de datos (`CreateDataSource`): puede ser DynamoDB, Lambda, o el tipo especial `NONE`, que permite resolvers completamente locales sin backend externo — útiles para prototipar rápidamente antes de conectar un origen de datos real, exactamente lo que vas a practicar en el laboratorio de este módulo. Los resolvers se pueden crear directamente sobre un campo (`CreateResolver`) o como funciones reutilizables (`CreateFunction`) que varios resolvers pueden compartir, evitando duplicar lógica cuando varios campos necesitan un patrón de acceso a datos similar.

Un detalle de comportamiento importante para gestionar el ciclo de vida de tu API: eliminar una API GraphQL con `DeleteGraphqlApi` elimina en cascada absolutamente todo lo que depende de ella —esquema, fuentes de datos, resolvers, funciones, tipos y claves API—, replicando fielmente el comportamiento de AWS real, donde no hay forma de eliminar una API "a medias" dejando huérfanos sus recursos hijos.

**Analogía:** una fuente de datos tipo `NONE` es como un mesero que puede confirmar tu pedido y darte una respuesta inmediata sin tener que ir a la cocina — útil cuando la "cocina" (backend real) todavía no existe pero necesitas probar el flujo completo de todos modos.

**¿Por qué es importante?** Empezar con resolvers `NONE` te permite validar el diseño de tu esquema GraphQL con clientes reales antes de invertir tiempo conectando fuentes de datos definitivas — un patrón de "maqueta funcional primero" útil en cualquier desarrollo de API.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-27/tema-2-resolver-local.sh — ejecutar con: bash tema-2-resolver-local.sh
# El apiId se recupera por nombre, no de la sesión de terminal del Tema 1.
API_ID=$(aws appsync list-graphql-apis --query "graphqlApis[?name=='demo-api'].apiId | [0]" --output text)
aws appsync create-data-source --api-id "$API_ID" --name origen-local --type NONE
aws appsync create-resolver --api-id "$API_ID" --type-name Query --field-name estadoEntrega \
  --data-source-name origen-local
aws appsync create-api-key --api-id "$API_ID" --description "clave de prueba"
```

`--data-source-name` identifica la fuente al crear el resolver que la usa; `--type-name` y `--field-name` juntos apuntan a un campo específico del esquema (acá, `Query.estadoEntrega`) para conectarlo a esa fuente. En resumen: `--data-source-name` es la bandera que identifica la fuente, y `--type-name`/`--field-name` son las banderas que apuntan al campo del esquema.

**Resultado esperado:** la fuente `origen-local` y el resolver quedan creados sin backend externo; la clave API devuelta es la que usarías desde un cliente GraphQL real para consultar `estadoEntrega`.

**Modifica esto:** elimina la API completa con `delete-graphql-api --api-id $API_ID` y confirma con `get-data-source` que la fuente también desapareció — la eliminación en cascada no deja huérfanos.

**Cuándo no usarlo:** no dejes un resolver `NONE` en producción esperando datos reales; es exclusivamente una herramienta de prototipado antes de conectar DynamoDB o Lambda como fuente definitiva.

**Cómo crece tu proyecto:** este resolver local es el borrador rápido antes de conectar `estadoEntrega` a la tabla DynamoDB real de entregas.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Implementa el resolver de seguimiento y prueba fuente vacía, dato existente y error. El resultado debe distinguir ausencia de entrega de fallo de infraestructura sin filtrar detalles internos.

#### Paso 4 · Demostración guiada
```bash
API_ID=$(aws appsync list-graphql-apis --query "graphqlApis[?name=='demo-api'].apiId | [0]" --output text)
aws appsync create-data-source --api-id "$API_ID" --name origen-local --type NONE
aws appsync create-resolver --api-id "$API_ID" --type-name Query --field-name estadoEntrega \
  --data-source-name origen-local
```
Resultado esperado: la fuente `origen-local` y el resolver quedan creados sin backend externo — cualquier cliente GraphQL ya puede consultar `estadoEntrega` y recibir una respuesta, aunque todavía no venga de ninguna base de datos real.
#### Paso 5 · Práctica guiada
Pista: configurá el resolver local para devolver una forma de dato que no coincide con el tipo declarado en el esquema (por ejemplo, un número donde el esquema espera un `String`) — ese es el fallo deliberado: AppSync rechaza la respuesta del resolver con un error de tipo, aunque el resolver en sí "corrió" sin excepciones.
#### Paso 6 · Práctica independiente
Corregí la forma de la respuesta para que coincida con el esquema, y documentá qué validación agregarías antes de reemplazar este resolver `NONE` por la tabla DynamoDB real de entregas, para no romper a los clientes que ya empezaron a consumir `estadoEntrega`.
#### Paso 7 · Cierre y evidencia
Entregá el resolver local funcionando del Paso 4, el error de tipo del Paso 5, y la validación propuesta del Paso 6; explicá por qué "maqueta funcional primero" le permitió al frontend avanzar sin esperar al backend. Siguiente paso: correo. Errores comunes: lógica sin autorización y respuestas inconsistentes. Fuente oficial: https://docs.aws.amazon.com/appsync/latest/devguide/resolver-mapping-template-reference.html.

### Tema 3: SES — identidades, envío y plantillas

#### Paso 1 · Objetivo y preparación
Al finalizar vas a crear la plantilla real que RutaFlow usa para notificar por correo cuando un paquete se marca `entregado`. Prerrequisitos: Módulo 20 (ya viste SMS vía Bedrock; esto es el equivalente por correo).
#### Paso 2 · Contexto y caso real
RutaFlow necesita avisarle al cliente por correo que su pedido llegó, sin concatenar HTML a mano cada vez ni arriesgarse a enviar desde una dirección que nadie verificó.
#### Paso 3 · Teoría, modelo mental y analogía
Verificar una identidad es registrar quién puede enviar en nombre de ese remitente; una plantilla es un formato reutilizable con marcadores, no un string armado a mano en cada envío.

**Conceptos clave:** `VerifyEmailIdentity`, `SendEmail`, plantilla de correo, SES v1 vs v2.

Enviar correo transaccional desde una aplicación —confirmaciones de pedido, restablecimiento de contraseña, notificaciones— requiere primero verificar la identidad remitente: en AWS real, esto implica probar que controlas esa dirección o dominio (mediante un enlace de confirmación o un registro DNS); en Floci, `VerifyEmailIdentity` y `VerifyDomainIdentity` marcan la identidad como verificada de inmediato, sin ese flujo de validación real, para que puedas iterar rápido en desarrollo. A partir de ahí, `SendEmail` envía un correo estructurado con asunto y cuerpo de texto o HTML, `SendRawEmail` acepta un mensaje MIME completo para casos con adjuntos o estructura compleja, y `SendTemplatedEmail` resuelve una plantilla previamente creada con `CreateTemplate` contra los datos que le pases, útil cuando el mismo tipo de correo se envía con distintos valores miles de veces.

SES existe en dos versiones de API en Floci: la consulta clásica v1 (la que usan los comandos `aws ses ...`) y la REST JSON v2 (`aws sesv2 ...`), pero comparten el mismo estado subyacente — una identidad o plantilla creada con v1 es completamente visible y utilizable desde v2, y viceversa, así que puedes mezclar ambas superficies según lo que tu SDK o código existente use.

**Analogía:** verificar una identidad de correo es como validar tu remitente en un servicio postal antes de que acepten enviar cartas en tu nombre: en Floci ese trámite se aprueba al instante para que puedas concentrarte en probar el contenido y el flujo de tus correos, no el papeleo de verificación.

**¿Por qué es importante?** Practicar plantillas y envío estructurado desde el principio —en vez de concatenar strings de HTML manualmente en cada llamada— es el hábito que evita correos inconsistentes o rotos cuando tu aplicación crece y empieza a enviar decenas de tipos distintos de notificación.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-27/tema-3-ses-plantilla.sh — ejecutar con: bash tema-3-ses-plantilla.sh
aws ses verify-email-identity --email-address notificaciones@demo.example.com
aws ses create-template --template '{"TemplateName":"entrega-confirmada","SubjectPart":"Tu pedido {{guia}} fue entregado","TextPart":"Hola {{nombre}}, tu paquete {{guia}} llegó."}'
aws ses send-templated-email --source notificaciones@demo.example.com \
  --destination ToAddresses=success@simulator.amazonses.com \
  --template entrega-confirmada --template-data '{"guia":"RF-001","nombre":"Ana"}'
```

`--destination` (con `ToAddresses=...`) es a quién le llega el correo; `--template` elige qué plantilla usar de las ya creadas; `--template-data` es el JSON con los valores que rellenan los `{{marcadores}}` de esa plantilla (acá, la guía y el nombre). En resumen: `--email-address` es la bandera que fija qué dirección verificar como remitente, y `--destination` es la bandera que fija a quién le llega el correo.

**Resultado esperado:** la identidad queda verificada de inmediato; la plantilla se crea; `send-templated-email` devuelve un `MessageId` y el correo resuelto con los datos de Ana llega al buzón de inspección local.

**Modifica esto:** reenvía el mismo correo pero con `template-data` distinto (`{"guia":"RF-002","nombre":"Luis"}`) y confirma en el buzón de inspección que cada mensaje muestra su propio contenido resuelto, sin mezclarse.

**Cuándo no usarlo:** no uses `SendEmail` con strings concatenados a mano para el mismo tipo de correo que envías cientos de veces; ahí es exactamente donde una plantilla evita inconsistencias.

**Cómo crece tu proyecto:** esta plantilla es la que El proyecto usa para notificar automáticamente a cada cliente cuando su paquete se marca como entregado.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Prepara una plantilla de aviso de entrega con datos de prueba. Verifica identidad remitente, destinatario y escape de variables antes de habilitar envíos desde el flujo operativo.

#### Paso 4 · Demostración guiada
```bash
aws ses verify-email-identity --email-address notificaciones@demo.example.com
aws ses create-template --template '{"TemplateName":"entrega-confirmada","SubjectPart":"Tu pedido {{guia}} fue entregado","TextPart":"Hola {{nombre}}, tu paquete {{guia}} llegó."}'
aws ses send-templated-email --source notificaciones@demo.example.com \
  --destination ToAddresses=success@simulator.amazonses.com \
  --template entrega-confirmada --template-data '{"guia":"RF-001","nombre":"Ana"}'
```
Resultado esperado: `send-templated-email` devuelve un `MessageId`, y el correo resuelto con los datos reales de Ana (no los marcadores `{{}}` literales) llega al buzón de inspección local.
#### Paso 5 · Práctica guiada
Pista: probá enviar el mismo correo con `--source no-verificado@demo.example.com` (una dirección que nunca pasó por `verify-email-identity`) — ese es el fallo deliberado: SES rechaza el envío porque la identidad remitente no está verificada, el mismo control que en producción evitaría que cualquiera envíe en nombre de un dominio que no le pertenece.
#### Paso 6 · Práctica independiente
Reenviá la plantilla con datos distintos (`{"guia":"RF-002","nombre":"Luis"}`) y confirmá en el buzón de inspección que cada mensaje muestra su propio contenido resuelto; documentá qué pasaría con el manejo de un rebote si la dirección de Luis estuviera mal escrita (vas a provocarlo de verdad en el Tema 4).
#### Paso 7 · Cierre y evidencia
Entregá la plantilla creada y el envío exitoso del Paso 4, el rechazo por identidad no verificada del Paso 5, y los dos correos distintos del Paso 6; explicá por qué una plantilla evita inconsistencias frente a concatenar HTML a mano en cada envío. Siguiente paso: simulador. Errores comunes: destinatarios sin consentimiento y logs con PII. Fuente oficial: https://docs.aws.amazon.com/ses/latest/dg/Welcome.html.

### Tema 4: El simulador de buzones y el punto de inspección local

#### Paso 1 · Objetivo y preparación
Al finalizar vas a provocar a propósito un rebote de correo real para probar el manejador de rebotes de RutaFlow, sin depender de una dirección inválida real. Prerrequisitos: Tema 3 de este módulo.
#### Paso 2 · Contexto y caso real
RutaFlow necesita desactivar automáticamente las notificaciones a una dirección que rebota — y probar ese manejador de forma confiable contra un proveedor de correo real, sin poder forzar un rebote a voluntad, sería prácticamente imposible.
#### Paso 3 · Teoría, modelo mental y analogía
El simulador es un maniquí de entrenamiento: reacciona de forma predecible a cada procedimiento que practiques, en vez de esperar una emergencia real para entrenar la respuesta correcta.

**Conceptos clave:** direcciones del simulador (`success@`, `bounce@`, `complaint@`), punto de inspección `/_aws/ses`, eventos deterministas.

Probar cómo reacciona tu aplicación ante un correo que rebota (bounce) o genera una queja (complaint) es difícil contra un proveedor de correo real: no puedes forzar esos eventos a voluntad de forma confiable. AWS resuelve esto con direcciones de simulador de buzones de correo especiales —`success@simulator.amazonses.com`, `bounce@simulator.amazonses.com`, `complaint@simulator.amazonses.com`, `suppressionlist@simulator.amazonses.com`— que generan de forma determinista el evento correspondiente cada vez que envías un correo a esa dirección, sin enviar correo real a nadie. Floci reconoce estas mismas direcciones especiales e implementa la misma emisión determinista de eventos, así que puedes escribir pruebas automatizadas de tu manejador de rebotes o quejas sin depender de infraestructura de correo real ni de comportamiento aleatorio.

Además, cada correo enviado —simulador o no— queda almacenado en un buzón de inspección local accesible en `GET /_aws/ses`, donde puedes consultar exactamente qué se envió, a quién y con qué contenido, o borrar el buzón capturado con `DELETE /_aws/ses` entre pruebas para empezar limpio.

**Analogía:** las direcciones del simulador son como un maniquí de entrenamiento de primeros auxilios que reacciona de forma predecible a cada procedimiento que practiques, en vez de tener que esperar una emergencia real para poder entrenar la respuesta correcta.

**¿Por qué es importante?** Un sistema de notificaciones por correo que nunca fue probado contra un rebote o una queja real fallará silenciosamente en producción la primera vez que ocurra uno; el simulador te permite escribir esa prueba desde el primer día, sin excusas.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-27/tema-4-simulador.sh — ejecutar con: bash tema-4-simulador.sh
aws ses send-email --from notificaciones@demo.example.com \
  --destination ToAddresses=bounce@simulator.amazonses.com \
  --message "Subject={Data=Prueba rebote},Body={Text={Data=Hola}}"
curl -s http://localhost:4566/_aws/ses | grep -o '"bounce@simulator.amazonses.com"'
```

`--from` es la dirección remitente (debe estar verificada, como en el Tema 3).

**Resultado esperado:** el envío genera un evento `Bounce` determinista (no un error); el buzón de inspección `GET /_aws/ses` confirma que el mensaje quedó registrado con esa dirección de destino.

**Modifica esto:** escribe un pequeño manejador (puede ser un script que consulte `/_aws/ses`) que distinga un correo enviado a `bounce@` de uno enviado a `success@`, simulando cómo tu aplicación reaccionaría distinto ante cada evento.

**Cuándo no usarlo:** no uses estas direcciones de simulador para probar contenido real de correo (diseño, renderizado HTML); solo generan eventos deterministas, no validan cómo se ve el correo en un cliente real.

**Cómo crece tu proyecto:** esta prueba determinista es la que El proyecto usa en su suite automatizada para verificar que el manejador de rebotes desactiva correctamente las notificaciones a una dirección inválida.

---

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Usa el buzón simulado para observar un aviso por confirmación. Repite el evento y verifica la política contra duplicados sin enviar mensajes a destinatarios reales durante la práctica.

#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir el archivo del ejemplo dentro.
```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
aws ses send-email --from notificaciones@demo.example.com \
  --destination ToAddresses=bounce@simulator.amazonses.com \
  --message "Subject={Data=Prueba rebote},Body={Text={Data=Hola}}"
curl -s http://localhost:4566/_aws/ses | grep -o '"bounce@simulator.amazonses.com"'
```
Resultado esperado: el envío genera un evento `Bounce` determinista (no un error de la llamada); el buzón de inspección confirma que el mensaje quedó registrado con esa dirección de destino, listo para que tu manejador de rebotes lo procese.
#### Paso 5 · Práctica guiada
Pista: ese envío a `bounce@simulator.amazonses.com` ES el fallo deliberado que buscás provocar a propósito — ahora escribí (o simulá con otra consulta a `/_aws/ses`) el código que debería reaccionar a ese evento `Bounce` desactivando las notificaciones futuras a esa dirección, y confirmá que un segundo envío a la misma dirección simulada se sigue registrando igual (el simulador no bloquea nada solo, es tu aplicación la que debe reaccionar al evento).
#### Paso 6 · Práctica independiente
Repetí el mismo envío hacia `complaint@simulator.amazonses.com` y hacia `success@simulator.amazonses.com`, e inspeccioná `/_aws/ses` para confirmar que los tres eventos (`Bounce`, `Complaint`, `Delivery`) quedaron registrados por separado, cada uno con su propio contenido.
#### Paso 7 · Cierre y evidencia
Entregá el evento `Bounce` provocado del Paso 4, el manejador de rebotes propuesto del Paso 5, y los tres eventos distintos del Paso 6; explicá por qué un sistema de notificaciones nunca probado contra un rebote real fallará silenciosamente la primera vez que ocurra uno en producción. Siguiente paso: almacenamiento. Errores comunes: confundir simulador con proveedor real y no revisar eventos. Fuente oficial: https://docs.aws.amazon.com/ses/latest/dg/mailbox-simulator.html.

## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** crear una API GraphQL básica en AppSync con un resolver local, y luego verificar una identidad SES y probar los tres flujos deterministas del simulador de buzones (éxito, rebote, queja).

**Requisitos previos:** ninguno adicional a Floci corriendo.

### Laboratorio 27.1 — API GraphQL con resolver local

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crea la API | `aws appsync create-graphql-api --name mi-api --authentication-type API_KEY` | Registra la API con autenticación por clave | Un `apiId` |
| 2 | Define el esquema | `aws appsync start-schema-creation --api-id <api-id> --definition 'type Query { saludo: String }'` | Crea el esquema de forma síncrona | Confirmación inmediata |
| 3 | Crea la fuente de datos local | `aws appsync create-data-source --api-id <api-id> --name origen-local --type NONE` | Sin backend externo, útil para prototipar | Confirmación de la fuente |
| 4 | Crea el resolver | `aws appsync create-resolver --api-id <api-id> --type-name Query --field-name saludo --data-source-name origen-local` | Conecta el campo `saludo` con la fuente local | Confirmación del resolver |
| 5 | Crea una clave API para probar | `aws appsync create-api-key --api-id <api-id> --description "clave de prueba"` | Genera credenciales para consultar la API | Una clave API |

### Laboratorio 27.2 — Simulador de entrega, rebote y queja con SES

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Verifica tu identidad remitente | `aws ses verify-email-identity --email-address remitente@example.com` | Marca la identidad como verificada de inmediato | Confirmación |
| 2 | Envía a la dirección de éxito | `aws ses send-email --from remitente@example.com --destination ToAddresses=success@simulator.amazonses.com --message "Subject={Data=Prueba exito},Body={Text={Data=Hola}}"` | Genera un evento `Delivery` determinista | Un `MessageId` |
| 3 | Envía a la dirección de rebote | `aws ses send-email --from remitente@example.com --destination ToAddresses=bounce@simulator.amazonses.com --message "Subject={Data=Prueba rebote},Body={Text={Data=Hola}}"` | Genera un evento `Bounce` determinista | Un `MessageId` |
| 4 | Envía a la dirección de queja | `aws ses send-email --from remitente@example.com --destination ToAddresses=complaint@simulator.amazonses.com --message "Subject={Data=Prueba queja},Body={Text={Data=Hola}}"` | Genera un evento `Complaint` determinista | Un `MessageId` |
| 5 | Inspecciona el buzón local | `curl http://localhost:4566/_aws/ses` | Confirma los tres correos capturados | Una lista con los tres mensajes enviados |

**Verificación:** el laboratorio se considera exitoso si `create-resolver` conecta correctamente el campo `saludo` con la fuente de datos local sin errores, y si el buzón de inspección `GET /_aws/ses` muestra los tres correos enviados a las direcciones del simulador, confirmando que cada uno llegó al almacenamiento local independientemente del tipo de evento que representa.

**Errores comunes y soluciones**

- **`CreateResolver` falla porque el campo no existe en el esquema.** El nombre de campo y tipo (`Query`/`Mutation`) debe coincidir exactamente con lo definido en `StartSchemaCreation`; revisa el esquema con `GetIntrospectionSchema` si tienes dudas.
- **`DeleteGraphqlApi` deja recursos "huérfanos" en tu script de limpieza.** No debería pasar: la eliminación en cascada es automática. Si tu script falla al intentar eliminar un resolver después de eliminar la API, es que el orden de eliminación está invertido — elimina la API primero, no al final.
- **Los correos al simulador no generan el evento esperado.** Verifica que la dirección de destino sea exactamente una de las cuatro reconocidas (`success@`, `bounce@`, `complaint@`, `suppressionlist@simulator.amazonses.com`); cualquier otra dirección solo emite el evento `Send` genérico.
- **El buzón de inspección parece acumular correos de pruebas anteriores.** Usa `DELETE /_aws/ses` al inicio de tu suite de pruebas para partir de un estado limpio y evitar falsos positivos por mensajes de ejecuciones previas.

---
