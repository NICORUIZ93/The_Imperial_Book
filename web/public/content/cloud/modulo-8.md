# Módulo 8: Azure y GCP con Floci


## Aprende construyendo


### Tema 1: floci-az — Blob Storage, Queue Storage, Table Storage, Cosmos DB, Functions · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a portar la foto de prueba de entrega del bucket pruebas-entrega (Módulo 2, S3) a un contenedor Blob Storage, para comparar el mismo caso real en otro proveedor. Prerrequisitos: Módulo 2, floci-az corriendo (Módulo 0).

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a portar la foto de prueba de entrega del bucket pruebas-entrega (Módulo 2, S3) a un contenedor Blob Storage, para comparar el mismo caso real en otro proveedor.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en floci-az — blob storage, queue storage, table storage, cosmos db, functions como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que floci-az — blob storage, queue storage, table storage, cosmos db, functions resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| floci-az — Blob Storage, Queue Storage, Table Storage, Cosmos DB, Functions se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar floci-az — Blob Storage, Queue Storage, Table Storage, Cosmos DB, Functions | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses floci-az — blob storage, queue storage, table storage, cosmos db, functions por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: floci-az — blob storage, queue storage, table storage, cosmos db, functions funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- floci-az — Blob Storage, Queue Storage, Table Storage, Cosmos DB, Functions existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve floci-az — blob storage, queue storage, table storage, cosmos db, functions en tu contexto?
2. ¿Cómo sabrías que floci-az — blob storage, queue storage, table storage, cosmos db, functions no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar floci-az — blob storage, queue storage, table storage, cosmos db, functions?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
AWS                    Azure (floci-az)
┌──────────────┐      ┌──────────────────┐
│ S3             │ ──▶  │ Blob Storage        │
│ SQS            │ ──▶  │ Queue Storage       │
│ DynamoDB       │ ──▶  │ Cosmos DB           │
│ Lambda         │ ──▶  │ Azure Functions     │
└──────────────┘      └──────────────────┘
```

```bash
mkdir ejemplo && cd ejemplo && floci az start
eval "$(floci az env)"   # exporta AZURE_STORAGE_CONNECTION_STRING (puerto 4577)
printf 'foto de prueba de la entrega 001\n' > entrega-001.jpg
```

```bash
az storage container create --name pruebas-entrega --connection-string "$AZURE_STORAGE_CONNECTION_STRING"
az storage blob upload --container-name pruebas-entrega --file entrega-001.jpg --name envio-4471/entrega-001.jpg --connection-string "$AZURE_STORAGE_CONNECTION_STRING"
az storage blob download --container-name pruebas-entrega --name envio-4471/entrega-001.jpg --file descargada-azure.jpg --connection-string "$AZURE_STORAGE_CONNECTION_STRING"
diff entrega-001.jpg descargada-azure.jpg
```

</details>

### Tema 2: floci-gcp — Cloud Storage, Pub/Sub, Firestore, Cloud Functions · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a modelar el mismo "confirmar entrega" de DeliveryCommands (Módulo 3, SQS) como un topic Pub/Sub real en GCP. Prerrequisitos: Módulo 3, floci-gcp corriendo (Módulo 0).

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a modelar el mismo "confirmar entrega" de DeliveryCommands (Módulo 3, SQS) como un topic Pub/Sub real en GCP.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en floci-gcp — cloud storage, pub/sub, firestore, cloud functions como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que floci-gcp — cloud storage, pub/sub, firestore, cloud functions resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| floci-gcp — Cloud Storage, Pub/Sub, Firestore, Cloud Functions se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar floci-gcp — Cloud Storage, Pub/Sub, Firestore, Cloud Functions | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses floci-gcp — cloud storage, pub/sub, firestore, cloud functions por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: floci-gcp — cloud storage, pub/sub, firestore, cloud functions funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- floci-gcp — Cloud Storage, Pub/Sub, Firestore, Cloud Functions existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve floci-gcp — cloud storage, pub/sub, firestore, cloud functions en tu contexto?
2. ¿Cómo sabrías que floci-gcp — cloud storage, pub/sub, firestore, cloud functions no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar floci-gcp — cloud storage, pub/sub, firestore, cloud functions?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
AWS                    GCP (floci-gcp)
┌──────────────┐      ┌──────────────────┐
│ S3             │ ──▶  │ Cloud Storage       │
│ SQS            │ ~~▶  │ Pub/Sub (más parecido│
│                │      │  a un patrón fan-out) │
│ DynamoDB       │ ──▶  │ Firestore           │
│ Lambda         │ ──▶  │ Cloud Functions     │
└──────────────┘      └──────────────────┘
```

```bash
mkdir ejemplo && cd ejemplo && floci gcp start
export PUBSUB_EMULATOR_HOST=localhost:4588   # Pub/Sub de floci-gcp
```

```bash
gcloud pubsub topics create delivery-commands --project floci-local
gcloud pubsub subscriptions create delivery-commands-sub --topic delivery-commands --project floci-local
gcloud pubsub topics publish delivery-commands --message '{"shipmentId":"env-4471","recipientPin":"837201"}' --project floci-local
gcloud pubsub subscriptions pull delivery-commands-sub --auto-ack --project floci-local
```

</details>

### Tema 3: Comparativa AWS vs Azure vs GCP por categoría de servicio · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a comprobar en vivo una diferencia real (no solo de nombre) entre SQS y Pub/Sub, usando el mismo comando de RutaFlow de los Temas 1-2. Prerrequisitos: Temas 1-2 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a comprobar en vivo una diferencia real (no solo de nombre) entre SQS y Pub/Sub, usando el mismo comando de RutaFlow de los Temas 1-2.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en comparativa aws vs azure vs gcp por categoría de servicio como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que comparativa aws vs azure vs gcp por categoría de servicio resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Comparativa AWS vs Azure vs GCP por categoría de servicio se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Comparativa AWS vs Azure vs GCP por categoría de servicio | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses comparativa aws vs azure vs gcp por categoría de servicio por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: comparativa aws vs azure vs gcp por categoría de servicio funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Comparativa AWS vs Azure vs GCP por categoría de servicio existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve comparativa aws vs azure vs gcp por categoría de servicio en tu contexto?
2. ¿Cómo sabrías que comparativa aws vs azure vs gcp por categoría de servicio no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar comparativa aws vs azure vs gcp por categoría de servicio?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
Categoría          AWS              Azure               GCP
────────────────────────────────────────────────────────────────
Almacenamiento      S3               Blob Storage         Cloud Storage
                     (equivalencia funcional muy directa entre los tres)

Mensajería           SQS              Queue Storage        Pub/Sub
                     (cola simple)    (más básico)          (fan-out nativo,
                                                              distinto de SQS)

Base de datos        DynamoDB         Cosmos DB            Firestore
NoSQL                (esquema de      (multi-modelo,       (sin esquema de
                      clave explícito) más flexible)        clave, más simple)

Serverless           Lambda           Azure Functions      Cloud Functions
                     (muy similares entre los tres en propuesta de valor central)
```

```bash
mkdir ejemplo && cd ejemplo && floci gcp start
export PUBSUB_EMULATOR_HOST=localhost:4588
```

```bash
gcloud pubsub topics publish delivery-commands --message '{"shipmentId":"env-5002","sequence":1}' --ordering-key env-5002 --project floci-local
```

</details>

### Laboratorio 8.1 — Azure: Blob Storage y Queue Storage

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por laboratorio 8.1 — azure: blob storage y queue storage con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender laboratorio 8.1 — azure: blob storage y queue storage te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en laboratorio 8.1 — azure: blob storage y queue storage como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que laboratorio 8.1 — azure: blob storage y queue storage resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Laboratorio 8.1 — Azure: Blob Storage y Queue Storage se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Laboratorio 8.1 — Azure: Blob Storage y Queue Storage | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses laboratorio 8.1 — azure: blob storage y queue storage por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: laboratorio 8.1 — azure: blob storage y queue storage funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Laboratorio 8.1 — Azure: Blob Storage y Queue Storage existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve laboratorio 8.1 — azure: blob storage y queue storage en tu contexto?
2. ¿Cómo sabrías que laboratorio 8.1 — azure: blob storage y queue storage no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar laboratorio 8.1 — azure: blob storage y queue storage?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar laboratorio 8.1 — azure: blob storage y queue storage.

</details>

### Laboratorio 8.2 — GCP: Cloud Storage y Pub/Sub

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por laboratorio 8.2 — gcp: cloud storage y pub/sub con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender laboratorio 8.2 — gcp: cloud storage y pub/sub te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en laboratorio 8.2 — gcp: cloud storage y pub/sub como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que laboratorio 8.2 — gcp: cloud storage y pub/sub resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Laboratorio 8.2 — GCP: Cloud Storage y Pub/Sub se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Laboratorio 8.2 — GCP: Cloud Storage y Pub/Sub | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses laboratorio 8.2 — gcp: cloud storage y pub/sub por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: laboratorio 8.2 — gcp: cloud storage y pub/sub funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Laboratorio 8.2 — GCP: Cloud Storage y Pub/Sub existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve laboratorio 8.2 — gcp: cloud storage y pub/sub en tu contexto?
2. ¿Cómo sabrías que laboratorio 8.2 — gcp: cloud storage y pub/sub no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar laboratorio 8.2 — gcp: cloud storage y pub/sub?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar laboratorio 8.2 — gcp: cloud storage y pub/sub.

</details>
