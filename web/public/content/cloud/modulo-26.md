# Módulo 26: Streaming e integración avanzada — Firehose y EventBridge Pipes


## Aprende construyendo


### Tema 1: Amazon Data Firehose — entrega gestionada sin consumidores propios · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a acumular eventos reales de "entregado" en un stream Firehose que los deja en S3 sin que escribas ningún consumidor. Prerrequisitos: Módulo 19 completo.

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

#### ► LA ANALOGÍA
Operar un consumidor propio es conducir el camión tú mismo; delegar en Firehose es contratar una empresa de logística que entrega sin que manejes nada en el camino.

**Conceptos clave:** consumidor propio vs entrega gestionada, latencia de entrega, transformación en tránsito.

Ya viste Kinesis Data Streams en el Módulo 17: streams particionados con shards, donde tú escribes consumidores que leen registros con iteradores de shard y decides qué hacer con cada uno. Firehose, en cambio, no expone shards ni iteradores: no hay un "consumidor" que tú operes, porque el propio servicio actúa como consumidor gestionado que entrega hacia el destino configurado. Esta es la decisión de diseño que debes usar para elegir entre ambos: si necesitas procesamiento personalizado en tiempo real con múltiples consumidores independientes leyendo el mismo stream (fan-out), usas Kinesis Data Streams; si solo necesitas que los datos terminen de forma confiable en un destino de almacenamiento sin lógica intermedia compleja, usas Firehose.

En arquitecturas reales, ambos conviven con frecuencia: un productor escribe a un stream de Kinesis Data Streams, y Firehose se suscribe a ese mismo stream como uno de sus consumidores para garantizar que, además del procesamiento en tiempo real que hagan otros consumidores, siempre exista una copia completa y ordenada en S3 para análisis histórico.

**Analogía:** Kinesis Data Streams es una cinta transportadora donde varios trabajadores (consumidores) pueden inspeccionar cada paquete mientras pasa; Firehose es una cinta transportadora que termina automáticamente en un almacén (S3), sin trabajadores intermedios que decidan nada sobre cada paquete individual.

**¿Por qué es importante?** Esta distinción —¿necesito lógica de procesamiento en tránsito o solo entrega confiable?— es la misma pregunta de diseño que ya aplicaste al elegir entre SQS y SNS, o entre EventBridge y Step Functions: reconocer el patrón general de "¿cuánto control necesito realmente?" te ahorra sobre-ingeniería.

**Regla práctica:** si necesitas procesamiento personalizado en tiempo real con varios consumidores independientes leyendo el mismo stream, usa Kinesis Data Streams; si solo necesitas que los datos terminen de forma confiable en un destino sin lógica intermedia, usa Firehose.

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

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar laboratorio 26.1 — entrega automática con firehose.

</details>

### Laboratorio 26.2 — Pipe de SQS a Lambda sin código intermedio

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar laboratorio 26.2 — pipe de sqs a lambda sin código intermedio.

</details>
