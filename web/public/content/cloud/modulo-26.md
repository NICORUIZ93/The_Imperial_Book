# Módulo 26: Streaming e integración avanzada — Firehose y EventBridge Pipes


## Aprende construyendo


### Tema 1: Amazon Data Firehose — entrega gestionada sin consumidores propios · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a acumular eventos reales de "entregado" en un stream Firehose que los deja en S3 sin que escribas ningún consumidor. Prerrequisitos: Módulo 19 completo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a acumular eventos reales de "entregado" en un stream Firehose que los deja en S3 sin que escribas ningún consumidor.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en amazon data firehose — entrega gestionada sin consumidores propios como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que amazon data firehose — entrega gestionada sin consumidores propios resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Amazon Data Firehose — entrega gestionada sin consumidores propios se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Amazon Data Firehose — entrega gestionada sin consumidores propios | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses amazon data firehose — entrega gestionada sin consumidores propios por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: amazon data firehose — entrega gestionada sin consumidores propios funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Amazon Data Firehose — entrega gestionada sin consumidores propios existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve amazon data firehose — entrega gestionada sin consumidores propios en tu contexto?
2. ¿Cómo sabrías que amazon data firehose — entrega gestionada sin consumidores propios no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar amazon data firehose — entrega gestionada sin consumidores propios?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-26/tema-1-firehose.sh — ejecutar con: bash tema-1-firehose.sh
aws firehose create-delivery-stream --delivery-stream-name demo-eventos
for i in 1 2 3 4 5; do
  aws firehose put-record --delivery-stream-name demo-eventos \
    --record "{\"Data\": \"{\\\"guia\\\": \\\"RF-00$i\\\", \\\"evento\\\": \\\"entregado\\\"}\"}"
done
aws s3 ls s3://floci-firehose-results/ --recursive
```

```bash
aws firehose create-delivery-stream --delivery-stream-name demo-eventos
for i in 1 2 3 4 5; do
  aws firehose put-record --delivery-stream-name demo-eventos \
    --record "{\"Data\": \"{\\\"guia\\\": \\\"RF-00$i\\\", \\\"evento\\\": \\\"entregado\\\"}\"}"
done
aws s3 ls s3://floci-firehose-results/ --recursive
```

</details>

### Tema 2: Firehose vs Kinesis Data Streams — quién consume los datos · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a comparar, con comandos reales, el stream de ubicaciones del Módulo 17 (que tú consumís) contra demo-eventos del Tema 1 (que Firehose consume por vos). Prerrequisitos: Módulo 17 completo, Tema 1 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a comparar, con comandos reales, el stream de ubicaciones del Módulo 17 (que tú consumís) contra demo-eventos del Tema 1 (que Firehose consume por vos).**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Operar un consumidor propio es conducir el camión tú mismo; delegar en Firehose es contratar una empresa de logística que entrega sin que manejes nada en el camino.

**Conceptos clave:** consumidor propio vs entrega gestionada, latencia de entrega, transformación en tránsito.

Ya viste Kinesis Data Streams en el Módulo 17: streams particionados con shards, donde tú escribes consumidores que leen registros con iteradores de shard y decides qué hacer con cada uno. Firehose, en cambio, no expone shards ni iteradores: no hay un "consumidor" que tú operes, porque el propio servicio actúa como consumidor gestionado que entrega hacia el destino configurado. Esta es la decisión de diseño que debes usar para elegir entre ambos: si necesitas procesamiento personalizado en tiempo real con múltiples consumidores independientes leyendo el mismo stream (fan-out), usas Kinesis Data Streams; si solo necesitas que los datos terminen de forma confiable en un destino de almacenamiento sin lógica intermedia compleja, usas Firehose.

En arquitecturas reales, ambos conviven con frecuencia: un productor escribe a un stream de Kinesis Data Streams, y Firehose se suscribe a ese mismo stream como uno de sus consumidores para garantizar que, además del procesamiento en tiempo real que hagan otros consumidores, siempre exista una copia completa y ordenada en S3 para análisis histórico.

**Analogía:** Kinesis Data Streams es una cinta transportadora donde varios trabajadores (consumidores) pueden inspeccionar cada paquete mientras pasa; Firehose es una cinta transportadora que termina automáticamente en un almacén (S3), sin trabajadores intermedios que decidan nada sobre cada paquete individual.

**¿Por qué es importante?** Esta distinción —¿necesito lógica de procesamiento en tránsito o solo entrega confiable?— es la misma pregunta de diseño que ya aplicaste al elegir entre SQS y SNS, o entre EventBridge y Step Functions: reconocer el patrón general de "¿cuánto control necesito realmente?" te ahorra sobre-ingeniería.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-26/tema-2-comparar-firehose-kinesis.sh — ejecutar con: bash tema-2-comparar-firehose-kinesis.sh
aws firehose describe-delivery-stream --delivery-stream-name demo-eventos \
  --query 'DeliveryStreamDescription.DeliveryStreamStatus'
aws kinesis describe-stream --stream-name demo-stream --query 'StreamDescription.Shards' 2>&1 | head -5
```

**Resultado esperado:** Firehose responde con un estado simple (`ACTIVE`) y ningún concepto de shard; Kinesis Data Streams responde con una lista de shards que tú tendrías que iterar manualmente para leer registros — la diferencia estructural entre "entrega gestionada" y "stream que tú consumes".

**Modifica esto:** crea un stream Kinesis (`aws kinesis create-stream --stream-name demo-stream --shard-count 1`) y repite la comparación para verla con datos reales en vez de un stream inexistente.

**Cuándo no usarlo:** no migres un consumidor Kinesis existente a Firehose solo por simplicidad si ese consumidor depende de leer registros en tiempo real con múltiples lectores independientes (fan-out); perderías esa capacidad.

**Cómo crece tu proyecto:** El proyecto usa Kinesis Data Streams para el tracking GPS en tiempo real (Módulo 17) y Firehose en paralelo para el histórico de entregas — la misma combinación que describe este tema.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Compara el consumo interactivo de posiciones con su archivo analítico. Justifica quién controla lectura, reintentos y retención en cada alternativa y comprueba un lote de eventos con identificadores conocidos.

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
1. Identifica el problema que firehose vs kinesis data streams — quién consume los datos resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Firehose vs Kinesis Data Streams — quién consume los datos se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Firehose vs Kinesis Data Streams — quién consume los datos | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses firehose vs kinesis data streams — quién consume los datos por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: firehose vs kinesis data streams — quién consume los datos funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Firehose vs Kinesis Data Streams — quién consume los datos existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve firehose vs kinesis data streams — quién consume los datos en tu contexto?
2. ¿Cómo sabrías que firehose vs kinesis data streams — quién consume los datos no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar firehose vs kinesis data streams — quién consume los datos?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-26/tema-2-comparar-firehose-kinesis.sh — ejecutar con: bash tema-2-comparar-firehose-kinesis.sh
aws firehose describe-delivery-stream --delivery-stream-name demo-eventos \
  --query 'DeliveryStreamDescription.DeliveryStreamStatus'
aws kinesis describe-stream --stream-name demo-stream --query 'StreamDescription.Shards' 2>&1 | head -5
```

```bash
aws firehose describe-delivery-stream --delivery-stream-name demo-eventos \
  --query 'DeliveryStreamDescription.DeliveryStreamStatus'
aws kinesis create-stream --stream-name rutaflow-ubicacion-conductores --shard-count 1 2>/dev/null
aws kinesis describe-stream --stream-name rutaflow-ubicacion-conductores --query 'StreamDescription.Shards'
```

</details>

### Tema 3: EventBridge Pipes — conectar origen y destino sin código de pegamento · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a conectar una cola de notificaciones directamente a una Lambda con un pipe, sin escribir ninguna función que haga polling. Prerrequisitos: Módulo 11 completo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a conectar una cola de notificaciones directamente a una Lambda con un pipe, sin escribir ninguna función que haga polling.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en eventbridge pipes — conectar origen y destino sin código de pegamento como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que eventbridge pipes — conectar origen y destino sin código de pegamento resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| EventBridge Pipes — conectar origen y destino sin código de pegamento se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar EventBridge Pipes — conectar origen y destino sin código de pegamento | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses eventbridge pipes — conectar origen y destino sin código de pegamento por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: eventbridge pipes — conectar origen y destino sin código de pegamento funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- EventBridge Pipes — conectar origen y destino sin código de pegamento existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve eventbridge pipes — conectar origen y destino sin código de pegamento en tu contexto?
2. ¿Cómo sabrías que eventbridge pipes — conectar origen y destino sin código de pegamento no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar eventbridge pipes — conectar origen y destino sin código de pegamento?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-26/tema-3-pipe.sh — ejecutar con: bash tema-3-pipe.sh
# Crea la cola aquí mismo: el ejercicio no depende de haber corrido nada antes.
aws sqs create-queue --queue-name demo-cola
COLA_URL=$(aws sqs get-queue-url --queue-name demo-cola --query QueueUrl --output text)

aws pipes create-pipe --name demo-pipe \
  --source arn:aws:sqs:us-east-1:000000000000:demo-cola \
  --target arn:aws:lambda:us-east-1:000000000000:function:demo-notificar \
  --role-arn arn:aws:iam::000000000000:role/pipe-role
aws sqs send-message --queue-url "$COLA_URL" --message-body '{"tarea":"notificar-entrega"}'
aws logs tail /aws/lambda/demo-notificar --since 1m
```

```bash
aws sqs create-queue --queue-name demo-cola
COLA_URL=$(aws sqs get-queue-url --queue-name demo-cola --query QueueUrl --output text)
aws pipes create-pipe --name demo-pipe \
  --source arn:aws:sqs:us-east-1:000000000000:demo-cola \
  --target arn:aws:lambda:us-east-1:000000000000:function:demo-notificar \
  --role-arn arn:aws:iam::000000000000:role/pipe-role
aws sqs send-message --queue-url "$COLA_URL" --message-body '{"tarea":"notificar-entrega"}'
aws logs tail /aws/lambda/demo-notificar --since 1m
```

</details>

### Tema 4: Cuándo usar Pipes frente a reglas EventBridge o Step Functions · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a confirmar, consultando las tres APIs reales, que RutaFlow ya usa las tres piezas de integración donde corresponde: Pipes, reglas EventBridge y Step Functions. Prerrequisitos: Módulos 11 y 16, Tema 3 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a confirmar, consultando las tres APIs reales, que RutaFlow ya usa las tres piezas de integración donde corresponde: Pipes, reglas EventBridge y Step Functions.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en cuándo usar pipes frente a reglas eventbridge o step functions como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que cuándo usar pipes frente a reglas eventbridge o step functions resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Cuándo usar Pipes frente a reglas EventBridge o Step Functions se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Cuándo usar Pipes frente a reglas EventBridge o Step Functions | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses cuándo usar pipes frente a reglas eventbridge o step functions por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: cuándo usar pipes frente a reglas eventbridge o step functions funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Cuándo usar Pipes frente a reglas EventBridge o Step Functions existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve cuándo usar pipes frente a reglas eventbridge o step functions en tu contexto?
2. ¿Cómo sabrías que cuándo usar pipes frente a reglas eventbridge o step functions no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar cuándo usar pipes frente a reglas eventbridge o step functions?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-26/tema-4-cuando-cada-uno.sh — ejecutar con: bash tema-4-cuando-cada-uno.sh
aws pipes describe-pipe --name demo-pipe --query 'Source'
aws events list-rules --event-bus-name demo-bus --query 'Rules[].Name' 2>&1 | head -5
aws stepfunctions list-state-machines --query 'stateMachines[].name' 2>&1 | head -5
```

```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
aws pipes describe-pipe --name demo-pipe --query 'Source'
aws events list-rules --event-bus-name rutaflow-eventos --query 'Rules[].Name'
aws stepfunctions list-state-machines --query 'stateMachines[].name'
```

</details>

### Laboratorio 26.1 — Entrega automática con Firehose

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por laboratorio 26.1 — entrega automática con firehose con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender laboratorio 26.1 — entrega automática con firehose te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en laboratorio 26.1 — entrega automática con firehose como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que laboratorio 26.1 — entrega automática con firehose resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Laboratorio 26.1 — Entrega automática con Firehose se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Laboratorio 26.1 — Entrega automática con Firehose | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses laboratorio 26.1 — entrega automática con firehose por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: laboratorio 26.1 — entrega automática con firehose funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Laboratorio 26.1 — Entrega automática con Firehose existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve laboratorio 26.1 — entrega automática con firehose en tu contexto?
2. ¿Cómo sabrías que laboratorio 26.1 — entrega automática con firehose no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar laboratorio 26.1 — entrega automática con firehose?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar laboratorio 26.1 — entrega automática con firehose.

</details>

### Laboratorio 26.2 — Pipe de SQS a Lambda sin código intermedio

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por laboratorio 26.2 — pipe de sqs a lambda sin código intermedio con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender laboratorio 26.2 — pipe de sqs a lambda sin código intermedio te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en laboratorio 26.2 — pipe de sqs a lambda sin código intermedio como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que laboratorio 26.2 — pipe de sqs a lambda sin código intermedio resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Laboratorio 26.2 — Pipe de SQS a Lambda sin código intermedio se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Laboratorio 26.2 — Pipe de SQS a Lambda sin código intermedio | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses laboratorio 26.2 — pipe de sqs a lambda sin código intermedio por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: laboratorio 26.2 — pipe de sqs a lambda sin código intermedio funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Laboratorio 26.2 — Pipe de SQS a Lambda sin código intermedio existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve laboratorio 26.2 — pipe de sqs a lambda sin código intermedio en tu contexto?
2. ¿Cómo sabrías que laboratorio 26.2 — pipe de sqs a lambda sin código intermedio no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar laboratorio 26.2 — pipe de sqs a lambda sin código intermedio?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar laboratorio 26.2 — pipe de sqs a lambda sin código intermedio.

</details>
