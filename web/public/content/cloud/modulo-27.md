# Módulo 27: APIs GraphQL con AppSync y correo transaccional con SES


## Aprende construyendo


### Tema 1: AppSync — APIs GraphQL gestionadas · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás definir una API GraphQL desde cero. Prerrequisitos: Node.js y Docker; verifica node --version.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás definir una API GraphQL desde cero.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en appsync — apis graphql gestionadas como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que appsync — apis graphql gestionadas resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| AppSync — APIs GraphQL gestionadas se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar AppSync — APIs GraphQL gestionadas | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses appsync — apis graphql gestionadas por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: appsync — apis graphql gestionadas funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- AppSync — APIs GraphQL gestionadas existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve appsync — apis graphql gestionadas en tu contexto?
2. ¿Cómo sabrías que appsync — apis graphql gestionadas no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar appsync — apis graphql gestionadas?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-27/tema-1-appsync-api.sh — ejecutar con: bash tema-1-appsync-api.sh
API_ID=$(aws appsync create-graphql-api --name demo-api --authentication-type API_KEY --query 'graphqlApi.apiId' --output text)
printf 'type Query { estadoEntrega(guia: String!): String }\n' > schema.graphql
aws appsync start-schema-creation --api-id "$API_ID" --definition fileb://schema.graphql
```

```bash
mkdir -p ejemplo-graphql/src && cd ejemplo-graphql
```

Crea el archivo `src/schema.graphql`:

```text
type Query {
  estadoEntrega(guia: String!): String
}
```

```bash
API_ID=$(aws appsync create-graphql-api --name demo-api-esquema --authentication-type API_KEY \
  --query 'graphqlApi.apiId' --output text)
aws appsync start-schema-creation --api-id "$API_ID" --definition fileb://src/schema.graphql
aws appsync get-schema-creation-status --api-id "$API_ID" --query status --output text
aws appsync get-introspection-schema --api-id "$API_ID" --format SDL esquema-publicado.graphql
grep estadoEntrega esquema-publicado.graphql
```

</details>

### Tema 2: Fuentes de datos y resolvers · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a conectar el campo estadoEntrega de demo-api (Tema 1) a un resolver local, antes de tener lista la tabla DynamoDB real detrás. Prerrequisitos: Tema 1 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a conectar el campo estadoEntrega de demo-api (Tema 1) a un resolver local, antes de tener lista la tabla DynamoDB real detrás.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en fuentes de datos y resolvers como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que fuentes de datos y resolvers resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Fuentes de datos y resolvers se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Fuentes de datos y resolvers | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses fuentes de datos y resolvers por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: fuentes de datos y resolvers funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Fuentes de datos y resolvers existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve fuentes de datos y resolvers en tu contexto?
2. ¿Cómo sabrías que fuentes de datos y resolvers no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar fuentes de datos y resolvers?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-27/tema-2-resolver-local.sh — ejecutar con: bash tema-2-resolver-local.sh
# El apiId se recupera por nombre, no de la sesión de terminal del Tema 1.
API_ID=$(aws appsync list-graphql-apis --query "graphqlApis[?name=='demo-api'].apiId | [0]" --output text)
aws appsync create-data-source --api-id "$API_ID" --name origen-local --type NONE
aws appsync create-resolver --api-id "$API_ID" --type-name Query --field-name estadoEntrega \
  --data-source-name origen-local
aws appsync create-api-key --api-id "$API_ID" --description "clave de prueba"
```

```bash
API_ID=$(aws appsync list-graphql-apis --query "graphqlApis[?name=='demo-api'].apiId | [0]" --output text)
aws appsync create-data-source --api-id "$API_ID" --name origen-local --type NONE
aws appsync create-resolver --api-id "$API_ID" --type-name Query --field-name estadoEntrega \
  --data-source-name origen-local
```

</details>

### Tema 3: SES — identidades, envío y plantillas · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a crear la plantilla real que RutaFlow usa para notificar por correo cuando un paquete se marca entregado. Prerrequisitos: Módulo 20 (ya viste SMS vía Bedrock; esto es el equivalente por correo).

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a crear la plantilla real que RutaFlow usa para notificar por correo cuando un paquete se marca entregado.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
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

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
1. Identifica el problema que ses — identidades, envío y plantillas resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| SES — identidades, envío y plantillas se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar SES — identidades, envío y plantillas | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses ses — identidades, envío y plantillas por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: ses — identidades, envío y plantillas funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- SES — identidades, envío y plantillas existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve ses — identidades, envío y plantillas en tu contexto?
2. ¿Cómo sabrías que ses — identidades, envío y plantillas no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar ses — identidades, envío y plantillas?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-27/tema-3-ses-plantilla.sh — ejecutar con: bash tema-3-ses-plantilla.sh
aws ses verify-email-identity --email-address notificaciones@demo.example.com
aws ses create-template --template '{"TemplateName":"entrega-confirmada","SubjectPart":"Tu pedido {{guia}} fue entregado","TextPart":"Hola {{nombre}}, tu paquete {{guia}} llegó."}'
aws ses send-templated-email --source notificaciones@demo.example.com \
  --destination ToAddresses=success@simulator.amazonses.com \
  --template entrega-confirmada --template-data '{"guia":"RF-001","nombre":"Ana"}'
```

```bash
aws ses verify-email-identity --email-address notificaciones@demo.example.com
aws ses create-template --template '{"TemplateName":"entrega-confirmada","SubjectPart":"Tu pedido {{guia}} fue entregado","TextPart":"Hola {{nombre}}, tu paquete {{guia}} llegó."}'
aws ses send-templated-email --source notificaciones@demo.example.com \
  --destination ToAddresses=success@simulator.amazonses.com \
  --template entrega-confirmada --template-data '{"guia":"RF-001","nombre":"Ana"}'
```

</details>

### Tema 4: El simulador de buzones y el punto de inspección local · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a provocar a propósito un rebote de correo real para probar el manejador de rebotes de RutaFlow, sin depender de una dirección inválida real. Prerrequisitos: Tema 3 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a provocar a propósito un rebote de correo real para probar el manejador de rebotes de RutaFlow, sin depender de una dirección inválida real.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en el simulador de buzones y el punto de inspección local como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que el simulador de buzones y el punto de inspección local resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| El simulador de buzones y el punto de inspección local se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar El simulador de buzones y el punto de inspección local | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses el simulador de buzones y el punto de inspección local por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: el simulador de buzones y el punto de inspección local funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- El simulador de buzones y el punto de inspección local existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve el simulador de buzones y el punto de inspección local en tu contexto?
2. ¿Cómo sabrías que el simulador de buzones y el punto de inspección local no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar el simulador de buzones y el punto de inspección local?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-27/tema-4-simulador.sh — ejecutar con: bash tema-4-simulador.sh
aws ses send-email --from notificaciones@demo.example.com \
  --destination ToAddresses=bounce@simulator.amazonses.com \
  --message "Subject={Data=Prueba rebote},Body={Text={Data=Hola}}"
curl -s http://localhost:4566/_aws/ses | grep -o '"bounce@simulator.amazonses.com"'
```

```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
aws ses send-email --from notificaciones@demo.example.com \
  --destination ToAddresses=bounce@simulator.amazonses.com \
  --message "Subject={Data=Prueba rebote},Body={Text={Data=Hola}}"
curl -s http://localhost:4566/_aws/ses | grep -o '"bounce@simulator.amazonses.com"'
```

</details>

### Laboratorio 27.1 — API GraphQL con resolver local

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por laboratorio 27.1 — api graphql con resolver local con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender laboratorio 27.1 — api graphql con resolver local te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en laboratorio 27.1 — api graphql con resolver local como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que laboratorio 27.1 — api graphql con resolver local resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Laboratorio 27.1 — API GraphQL con resolver local se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Laboratorio 27.1 — API GraphQL con resolver local | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses laboratorio 27.1 — api graphql con resolver local por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: laboratorio 27.1 — api graphql con resolver local funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Laboratorio 27.1 — API GraphQL con resolver local existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve laboratorio 27.1 — api graphql con resolver local en tu contexto?
2. ¿Cómo sabrías que laboratorio 27.1 — api graphql con resolver local no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar laboratorio 27.1 — api graphql con resolver local?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar laboratorio 27.1 — api graphql con resolver local.

</details>

### Laboratorio 27.2 — Simulador de entrega, rebote y queja con SES

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por laboratorio 27.2 — simulador de entrega, rebote y queja con ses con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender laboratorio 27.2 — simulador de entrega, rebote y queja con ses te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en laboratorio 27.2 — simulador de entrega, rebote y queja con ses como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que laboratorio 27.2 — simulador de entrega, rebote y queja con ses resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Laboratorio 27.2 — Simulador de entrega, rebote y queja con SES se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Laboratorio 27.2 — Simulador de entrega, rebote y queja con SES | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses laboratorio 27.2 — simulador de entrega, rebote y queja con ses por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: laboratorio 27.2 — simulador de entrega, rebote y queja con ses funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Laboratorio 27.2 — Simulador de entrega, rebote y queja con SES existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve laboratorio 27.2 — simulador de entrega, rebote y queja con ses en tu contexto?
2. ¿Cómo sabrías que laboratorio 27.2 — simulador de entrega, rebote y queja con ses no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar laboratorio 27.2 — simulador de entrega, rebote y queja con ses?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar laboratorio 27.2 — simulador de entrega, rebote y queja con ses.

</details>
