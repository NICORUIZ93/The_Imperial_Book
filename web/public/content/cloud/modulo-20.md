# Módulo 20: IA y servicios especializados: Bedrock, Textract y Transcribe


## Aprende construyendo

### Tema 1: Bedrock Runtime y respuestas stub deterministas · Avanzado · 40 min

#### Paso 1 · Objetivo y preparación
Al finalizar vas a usar Bedrock para redactar el texto del SMS de confirmación de entrega (Módulo 10-11), y a comprobar qué parte de eso es realmente verificable en local. Prerrequisitos: Módulos 10 y 11 completos.
#### Paso 2 · Contexto y caso real
En vez de un SMS con texto fijo, RutaFlow quiere que un LLM redacte un mensaje breve y natural por cada entrega ("Tu pedido env-4471 llegó a las 14:32") — pero ese texto va a cambiar entre invocaciones reales, así que el código que lo consume no puede depender de un contenido exacto.
#### Paso 3 · Teoría, modelo mental y analogía
El contrato (la forma del JSON de entrada y salida) es el formulario; el contenido generado puede variar y se evalúa por separado, nunca con un `assert` de texto exacto.

**Conceptos clave:** probar la estructura del contrato de integración, no el contenido generativo real.

```bash
aws bedrock-runtime invoke-model --model-id anthropic.claude-sonnet-5 --body '{"prompt":"Hola","max_tokens":100}' --cli-binary-format raw-in-base64-out output.json
```

`--model-id` elige qué modelo invocar (acá, Claude Sonnet 5 de Anthropic — verificá siempre el ID actual en la consola de Bedrock o en `aws bedrock list-foundation-models`, porque AWS retira IDs de modelos antiguos con el tiempo); `--body` es el JSON con el prompt y los parámetros de generación (aquí, `max_tokens` limita cuánto puede responder el modelo); `--cli-binary-format raw-in-base64-out` es un ajuste de formato de la propia AWS CLI (no del modelo) necesario porque `invoke-model` maneja datos binarios — le dice a la CLI que acepte el `--body` tal cual en vez de esperar que ya venga codificado en base64.

Bedrock Runtime expone modelos de IA generativa (LLMs de distintos proveedores) a través de una API HTTP unificada (`InvokeModel`), permitiendo integrar capacidades de generación de texto, resumen, o análisis en una aplicación sin gestionar infraestructura de modelo propia; cloud local, al no poder ejecutar modelos de lenguaje reales localmente (por su tamaño y requisitos computacionales), devuelve en cambio una respuesta stub determinista: la misma entrada siempre produce exactamente la misma salida predefinida, en vez de la variabilidad inherente y no determinista de un modelo real (donde incluso el mismo prompt exacto puede producir respuestas ligeramente distintas en invocaciones sucesivas).

Esta determinismo del stub es una característica deliberada y valiosa para testing: permite escribir pruebas automatizadas confiables sobre el flujo de integración completo (¿la aplicación construye correctamente el prompt? ¿parsea correctamente la estructura de la respuesta? ¿maneja correctamente errores de la API?) sin la variabilidad no determinista que haría frágil cualquier aserción sobre el contenido exacto de una respuesta generativa real.

**Analogía:** un stub determinista de Bedrock es como un maniquí de práctica que siempre responde de forma idéntica y predecible ante el mismo estímulo específico de entrenamiento, permitiendo verificar consistentemente que el procedimiento de interacción se ejecuta correctamente, en vez de practicar con una persona real cuyas respuestas variarían de forma natural entre cada repetición del mismo ejercicio.

**¿Por qué es importante?** cloud local usa stubs deterministas para IA en vez de modelos reales porque permite escribir pruebas automatizadas confiables sobre la estructura del flujo de integración, sin la variabilidad no determinista inherente de un modelo real que haría frágil cualquier aserción sobre contenido exacto.

**Prueba en terminal:**

```bash
aws bedrock-runtime invoke-model --model-id ... --body '{"prompt":"Hola"}' ...
# cloud local: MISMA entrada → SIEMPRE la misma salida stub (determinista)
# AWS real: misma entrada → puede variar entre invocaciones (no determinista)
```

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Consume una respuesta determinista del asistente de incidencias en el entorno local. Prueba el contrato de entrada y salida y deja explícito que ese resultado no mide precisión ni seguridad de un modelo real.

#### Paso 4 · Demostración guiada
```bash
aws bedrock-runtime invoke-model --model-id anthropic.claude-sonnet-5 \
  --body '{"prompt":"Redacta un SMS breve confirmando la entrega del envío env-4471","max_tokens":50}' \
  --cli-binary-format raw-in-base64-out salida1.json
aws bedrock-runtime invoke-model --model-id anthropic.claude-sonnet-5 \
  --body '{"prompt":"Redacta un SMS breve confirmando la entrega del envío env-4471","max_tokens":50}' \
  --cli-binary-format raw-in-base64-out salida2.json
diff salida1.json salida2.json
```
Resultado esperado: `diff` no muestra ninguna diferencia — Floci devuelve exactamente la misma respuesta stub para el mismo prompt, algo que un modelo real jamás garantizaría. Esto te deja probar con confianza que tu código parsea bien la respuesta, no que el texto generado es bueno.
#### Paso 5 · Práctica guiada
Pista: escribí el código que lee la respuesta asumiendo un campo `completion` (en vez del campo real que Floci devuelve en su stub) — ese es el fallo deliberado: tu parseo falla con un valor `undefined`, no porque Bedrock haya cambiado nada, sino porque asumiste la forma del contrato sin confirmarla primero contra la respuesta real del stub.
#### Paso 6 · Práctica independiente
Probá qué pasa si el prompt pide explícitamente algo fuera del `max_tokens` configurado (un mensaje mucho más largo que 50 tokens), y documentá cómo tu código debería manejar una respuesta truncada sin que el SMS le llegue cortado a la mitad al cliente.
#### Paso 7 · Cierre
Entregá el stub determinista del Paso 4, el error de contrato mal asumido del Paso 5, y el manejo de truncamiento del Paso 6; explicá qué de todo esto seguiría siendo cierto contra el Bedrock real, y qué no. Siguiente paso: extracción. Errores comunes: probar solo texto feliz y filtrar datos sensibles. Fuente oficial: https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html.

### Tema 2: Textract y Transcribe · Avanzado · 40 min

#### Paso 1 · Objetivo y preparación
Al finalizar vas a extraer automáticamente cliente y monto de una factura escaneada (Módulo 13) con Textract, y a transcribir el reporte de voz de un conductor con Transcribe. Prerrequisitos: Módulo 13 completo.
#### Paso 2 · Contexto y caso real
Facturación recibe fotos de facturas en papel que hoy alguien transcribe a mano a la tabla `facturas` (Módulo 13); y un conductor reporta incidencias por nota de voz que nadie escucha hasta el día siguiente.
#### Paso 3 · Teoría, modelo mental y analogía
La extracción es pasar de una imagen de factura a un formulario estructurado con campos nombrados, en vez de que un humano la transcriba línea por línea.

**Conceptos clave:** extracción estructurada de información desde formatos no estructurados (imágenes, audio).

```bash
aws textract analyze-document --document '{"S3Object":{"Bucket":"mi-bucket","Name":"documento.jpg"}}' --feature-types TABLES FORMS
```

`--document` apunta al archivo a analizar (acá, un objeto en S3); `--feature-types` elige qué tipo de estructura extraer además del texto plano — `TABLES` para tablas, `FORMS` para pares clave-valor de formularios. En resumen: `--document` es la bandera que fija el archivo a analizar, y `--feature-types` es la bandera que elige qué estructura extraer.

Textract extrae texto y estructura (tablas, pares clave-valor de formularios) directamente de imágenes o PDFs escaneados mediante OCR (reconocimiento óptico de caracteres) combinado con comprensión estructural del documento, transformando un documento visual no estructurado en datos estructurados consumibles programáticamente (por ejemplo, extraer automáticamente los campos de una factura escaneada hacia un registro de base de datos), evitando el trabajo manual de transcripción de documentos que de otra forma requeriría intervención humana.

```bash
aws transcribe start-transcription-job --transcription-job-name mi-transcripcion --media '{"MediaFileUri":"s3://mi-bucket/audio.mp3"}' --output-bucket-name mi-bucket
```

`--transcription-job-name` identifica este trabajo de transcripción (para consultar su estado después); `--media` apunta al archivo de audio a transcribir; `--output-bucket-name` es el bucket donde Transcribe va a dejar el resultado una vez que termine. En resumen: `--transcription-job-name` es la bandera que nombra el trabajo de transcripción.

Transcribe convierte audio hablado en texto escrito (speech-to-text), un proceso asíncrono (se inicia el job y se consulta su estado posteriormente, similar al patrón de invocación asíncrona ya visto con otras operaciones de larga duración) apropiado para transcribir grabaciones de llamadas, reuniones, o contenido de audio hacia texto buscable y procesable, ambos servicios (Textract y Transcribe) representando la categoría de servicios de IA especializada preentrenada para una tarea específica bien definida, en contraste con Bedrock que expone modelos generativos de propósito más general.

**Analogía:** Textract es como un asistente que lee automáticamente documentos escaneados y extrae la información relevante hacia un formulario estructurado, sin requerir que un humano transcriba manualmente cada campo; Transcribe es como un taquígrafo automático que convierte una grabación de audio hablado en un documento de texto completo y buscable.

**¿Por qué es importante?** Textract y Transcribe extraen información estructurada de formatos no estructurados (imágenes, audio) automáticamente, evitando transcripción manual humana, representando servicios de IA especializada preentrenada para tareas específicas bien definidas.

**Diagrama:**

```mermaid
flowchart LR
    A["Textract: imagen/PDF escaneado"] --> A1["texto + estructura (tablas, formularios)"]
    B["Transcribe: audio hablado"] --> B1["texto escrito, buscable y procesable"]
```

En el proyecto integrador RutaFlow, la regla de revisión humana por baja confianza del Paso 6
viviría en la misma función que escribe en la tabla `facturas` (Módulo 13) — una extensión
natural de `ConfirmarEntregaFn` o una Lambda hermana que declares en tu propia `template.yaml`,
nunca insertando directo sin ese chequeo.

#### Paso 4 · Demostración guiada
```bash
aws s3 cp factura-escaneada.jpg s3://adjuntos-tareas/facturas/factura-001.jpg
aws textract analyze-document --document '{"S3Object":{"Bucket":"adjuntos-tareas","Name":"facturas/factura-001.jpg"}}' --feature-types FORMS
aws transcribe start-transcription-job --transcription-job-name reporte-conductor-c891 \
  --media '{"MediaFileUri":"s3://adjuntos-tareas/audios/reporte-c891.mp3"}' --output-bucket-name adjuntos-tareas
```
Resultado esperado: `analyze-document` devuelve pares clave-valor (`Cliente: ...`, `Monto: ...`) que podrías insertar directamente en la tabla `facturas` del Módulo 13; `start-transcription-job` arranca un trabajo asíncrono cuyo resultado vas a consultar después, no de inmediato.
#### Paso 5 · Práctica guiada
Pista: subí una foto borrosa o con el monto tapado y repetí `analyze-document` — ese es el fallo deliberado: Textract puede devolver el campo `Monto` con un `Confidence` bajo (o directamente no detectarlo), y aceptar ese valor sin revisar la confianza significaría cargar un monto incorrecto a la tabla `facturas` sin que nadie lo note.
#### Paso 6 · Práctica independiente
Escribí la regla de negocio que faltaría en el código: si `Confidence` de cualquier campo extraído es menor a un umbral (por ejemplo 80%), la factura se marca para revisión humana en vez de insertarse directamente en `facturas`.
#### Paso 7 · Cierre
Entregá la extracción exitosa del Paso 4, el campo de baja confianza del Paso 5, y la regla de revisión humana del Paso 6; explicá por qué "Textract respondió algo" no es lo mismo que "Textract respondió algo confiable". Siguiente paso: límites. Errores comunes: aceptar extracción sin confianza y no conservar original. Fuente oficial: https://docs.aws.amazon.com/textract/latest/dg/what-is.html.

### Tema 3: Stub vs mock, y qué probar localmente · Avanzado · 40 min

#### Paso 1 · Objetivo y preparación
Al finalizar vas a documentar, para los SMS generados (Tema 1) y las facturas extraídas (Tema 2), qué se puede confiar probando en Floci y qué necesita el servicio real de AWS. Prerrequisitos: Temas 1-2 de este módulo.
#### Paso 2 · Contexto y caso real
Antes de llevar esto a producción, alguien del equipo de RutaFlow va a preguntar "¿ya probamos que esto funciona?" — y la respuesta correcta depende de qué significa "probar" en cada caso.
#### Paso 3 · Teoría, modelo mental y analogía
La prueba local con el stub valida el cableado (¿tu código llama bien a la API y parsea bien la respuesta?); el servicio real valida el comportamiento (¿el SMS generado suena natural? ¿Textract leyó bien una factura arrugada de verdad?).

**Conceptos clave:** distinguir qué se puede verificar con confianza localmente frente a lo que requiere el servicio real.

Un stub (usado por cloud local para Bedrock) es una implementación que devuelve respuestas predefinidas y deterministas, útil para verificar que la aplicación maneja correctamente la estructura esperada de una respuesta (¿el código extrae correctamente el campo de texto generado de la respuesta JSON? ¿maneja correctamente un código de error?); un mock, en el sentido más estricto usado en testing (Módulo 9 de varios tracks de esta Academia), típicamente además verifica que se invocó de una forma específica esperada (con ciertos argumentos, un número específico de veces). En la práctica de cloud local, "stub" describe con más precisión el comportamiento: una respuesta fija y predecible, sin verificación de la forma exacta de la invocación en sí misma.

Documentar explícitamente qué partes de la arquitectura de IA se pueden probar localmente con el stub (la estructura del contrato de integración: parseo de request/response, manejo de errores de API, flujo completo de la aplicación) frente a qué partes requieren necesariamente el modelo real de AWS para una validación completa (la calidad y relevancia real del contenido generado, el comportamiento ante prompts ambiguos o adversariales, los límites reales de tokens y su impacto en respuestas truncadas) es una práctica de ingeniería madura que evita la falsa confianza de asumir que pasar pruebas contra el stub garantiza que el sistema de IA completo funcionará correctamente en producción sin ninguna validación adicional contra el servicio real.

**Analogía:** un stub es como un guion de práctica con respuestas fijas y predecibles para ensayar el protocolo de una conversación; un mock añade además la verificación de que se siguieron exactamente los pasos esperados del guion. Documentar qué se prueba localmente frente a qué requiere el entorno real es como distinguir entre un simulacro de emergencia (que verifica el protocolo de procedimiento) y el manejo real de una emergencia genuina (que pone a prueba capacidades que el simulacro no puede replicar completamente).

**¿Por qué es importante?** Un stub devuelve respuestas fijas deterministas sin verificar la forma de invocación (a diferencia de un mock más estricto); documentar qué se prueba localmente frente a lo que requiere el modelo real evita la falsa confianza de asumir cobertura completa solo por pasar pruebas contra el stub.

**Diagrama:**

```mermaid
flowchart LR
    A["Stub Bedrock (cloud local)"] --> A1["verifica: estructura de request/response, manejo de errores de API"]
    B["Bedrock real (AWS)"] --> B1["verifica: calidad del contenido generado, comportamiento ante prompts reales"]
```

---

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Separa pruebas del cliente de IA con stub, errores simulados y evaluación del modelo real. Una respuesta mal formada debe ser rechazada antes de convertirse en una decisión sobre una entrega.

#### Paso 4 · Demostración guiada
```bash
# Lo que SÍ confirma el stub de Floci (estructura del contrato):
aws bedrock-runtime invoke-model --model-id anthropic.claude-sonnet-5 \
  --body '{"prompt":"test","max_tokens":10}' --cli-binary-format raw-in-base64-out stub.json
cat stub.json
```
Resultado esperado: confirmás que tu código recibe y parsea correctamente la forma del JSON — eso es exactamente lo que el stub puede validar con confianza, ni más ni menos.
#### Paso 5 · Práctica guiada
Pista: afirmá en tu documentación interna que "ya validamos localmente que el SMS generado suena natural y profesional" basándote solo en la respuesta del stub de Floci — ese es el fallo deliberado: el stub nunca varía su texto, así que no probaste nada sobre la calidad real del lenguaje generado, solo sobre si tu código sabe leer la respuesta.
#### Paso 6 · Práctica independiente
Armá una tabla de dos columnas ("se prueba localmente con el stub" / "necesita el servicio real") y clasificá: parseo de la respuesta de Bedrock, calidad del texto del SMS, forma del JSON de Textract, precisión del OCR sobre una foto real borrosa, manejo de errores HTTP de la API, tiempo de respuesta real bajo carga.
#### Paso 7 · Cierre
Entregá la validación de contrato del Paso 4, la afirmación incorrecta corregida del Paso 5, y la tabla de límites del Paso 6; explicá por qué pasar todas las pruebas contra el stub nunca es suficiente para decir "esto ya está probado" sin matices. Siguiente paso: seguridad. Errores comunes: confundir mock con modelo y no medir coste. Fuente oficial: https://docs.aws.amazon.com/bedrock/latest/userguide/model-evaluation.html.

### Tema 4: Gobierno de IA y ML: fichas de modelo, umbrales por grupo y una puerta antes de publicar · Avanzado · 45 min

**Prerrequisito:** tema «Bedrock Runtime y respuestas stub» de este módulo.

**Al finalizar podrás:** exigir una ficha de modelo completa, comprobar que el error no es peor para un grupo (por ejemplo, zonas rurales) y bloquear la publicación si el prompt de sistema contiene datos personales.

**¿Por qué es importante?** Un modelo con buen promedio puede fallar sistemáticamente con un grupo de usuarios. Y un prompt con datos de ejemplo reales filtra información. Sin una puerta antes de publicar, esos problemas llegan a producción.

#### Paso 1 · Objetivo y preparación

Usa Python 3.10 o superior. Crea `academia-labs/cloud/gobierno-ia`. En un proyecto real, la ficha viene del registro de modelos (SageMaker Model Registry, MLflow) y las métricas de la evaluación.

#### Paso 2 · Contexto y caso real

El estimador de tiempos de RutaFlow tenía un error medio de 6 minutos y se aprobó. Los clientes rurales recibían estimaciones 15 minutos equivocadas porque había pocos datos de esas zonas. Medir por grupo lo habría mostrado antes de publicar.

#### Paso 3 · Teoría, modelo mental y analogía

**Conceptos clave:** gobierno de IA, ficha de modelo (*model card*), responsable, métrica por grupo, umbral, datos personales en prompts, registro de modelos, aprobación.

Una **puerta de publicación** revisa cada versión de modelo antes de usarla:

1. **Ficha completa:** propósito, datos de entrenamiento, responsable y limitaciones conocidas. Sin ficha no hay publicación.
2. **Métricas por grupo:** el promedio general no basta. Se mide para cada grupo relevante (zona, tipo de cliente) y cada uno debe cumplir su umbral.
3. **Datos personales:** prompts de sistema, ejemplos y registros no deben contener datos reales de personas.
4. **Registro y aprobación:** la versión, sus métricas y quién la aprobó quedan guardadas para auditar después.

Los servicios de la nube ayudan: registros de modelos con estados de aprobación, guardrails que filtran datos personales en Bedrock, y monitoreo de la calidad en producción.

**Analogía:** es el control de calidad de un medicamento: no basta con que funcione en promedio, debe funcionar para cada grupo de pacientes, con su prospecto (la ficha) y su lote registrado. La analogía falla en que un modelo puede empeorar con el tiempo sin que nadie lo cambie, por eso también se monitorea después.

**Límite de uso:** la puerta revisa lo que mides: si un grupo no está en los datos de evaluación, no aparece. Las reglas de datos personales con expresiones regulares son una primera barrera, no una garantía.

```mermaid
flowchart LR
    M["versión del modelo"] --> F{"¿ficha completa?"}
    F -->|no| X["BLOQUEADO"]
    F -->|sí| G{"¿cada grupo cumple su umbral?"}
    G -->|no| X
    G -->|sí| P{"¿prompt sin datos personales?"}
    P -->|no| X
    P -->|sí| A["APROBADO + registro"]
```

#### Paso 4 · Demostración guiada desde cero

Archivo `academia-labs/cloud/gobierno-ia/puerta_modelo.py`:

```python
import json
import re

# Ficha del modelo que el equipo quiere publicar (en la vida real viene del registro de modelos).
ficha = json.loads("""{
  "nombre": "estimador-tiempo-entrega", "version": "3",
  "proposito": "estimar minutos de entrega por parada",
  "datos_entrenamiento": "entregas 2025 anonimizadas",
  "responsable": "equipo-datos",
  "metricas": {"error_medio_min": 6.2, "error_medio_min_zona_rural": 14.8},
  "prompt_sistema": "Responde con minutos. Ejemplo: cliente Ana Pérez, cédula 1020304050."
}""")

REQUISITOS = ["proposito", "datos_entrenamiento", "responsable"]
UMBRALES = {"error_medio_min": 8.0, "error_medio_min_zona_rural": 12.0}  # el rural no puede quedar atrás
PII = re.compile(r"\b\d{8,10}\b")  # números que parecen documentos de identidad

problemas = []
problemas += [f"falta '{c}' en la ficha" for c in REQUISITOS if not ficha.get(c)]
problemas += [f"{m} = {ficha['metricas'][m]} supera {u}" for m, u in UMBRALES.items() if ficha["metricas"][m] > u]
if PII.search(ficha["prompt_sistema"]):
    problemas.append("el prompt de sistema contiene datos personales")

print(f"{ficha['nombre']} v{ficha['version']}: {'BLOQUEADO' if problemas else 'APROBADO'}")
for p in problemas:
    print(" -", p)
```

Ejecútalo:

```bash
cd academia-labs/cloud/gobierno-ia
python3 puerta_modelo.py
```

**Explicación por bloques:** La ficha incluye propósito, datos, responsable, métricas y el prompt de sistema. `REQUISITOS` revisa que la ficha esté completa. `UMBRALES` tiene un límite por métrica, incluida la de zona rural, para que ese grupo no quede atrás. `PII` busca números de 8 a 10 dígitos, que en Colombia suelen ser cédulas. El modelo cumple el promedio general (6,2 < 8) pero falla el rural (14,8 > 12) y su prompt incluye un nombre y una cédula de ejemplo: queda bloqueado con los dos motivos.

![Captura de terminal: el modelo queda bloqueado porque el error en zona rural supera el umbral y el prompt contiene datos personales](content/figures/cloud/gobierno-ia-ml.svg)

**Resultado esperado:**

```text
estimador-tiempo-entrega v3: BLOQUEADO
 - error_medio_min_zona_rural = 14.8 supera 12.0
 - el prompt de sistema contiene datos personales
```

**Fallo deliberado:** borra la métrica `error_medio_min_zona_rural` de `UMBRALES` y de la ficha. **Error esperado:** la puerta muestra solo el problema del prompt y, una vez corregido, aprueba el modelo aunque falle en zonas rurales. **Diagnóstico:** lo que no se mide por grupo no se ve. Define con el negocio qué grupos importan y exige su métrica.

#### Paso 5 · Práctica guiada

1. **Reproducción:** ejecuta la puerta y explica los dos motivos del bloqueo.
2. **Variación:** corrige el prompt con un ejemplo ficticio y vuelve a ejecutar.
3. **Diagnóstico:** reproduce el fallo deliberado sin la métrica rural.
4. **Integración:** agrega un campo `limitaciones` obligatorio y un umbral para clientes empresariales.
5. **Diseño:** escribe quién aprueba los modelos en RutaFlow y qué se guarda en el registro de cada aprobación.

**Pista:** si una métrica general se ve bien, pregunta para qué grupo podría estar mal.

#### Paso 6 · Práctica independiente

Registra la versión en MLflow o en SageMaker Model Registry con estado «pendiente», y cambia el estado a «aprobado» solo si la puerta pasa, desde el mismo script.

#### Paso 7 · Cierre

- [ ] Nombras los cuatro controles de la puerta.
- [ ] La puerta bloquea con los dos motivos esperados.
- [ ] Reprodujiste el riesgo de no medir por grupo.
- [ ] Hay un registro de aprobaciones.

Si fallas dos o más, vuelve al Paso 3. **Errores comunes:** aprobar por el promedio, usar datos reales en prompts de ejemplo y no registrar quién aprobó cada versión. **Siguiente paso:** el tema «Stub vs mock, y qué probar localmente» prueba estos modelos sin llamar al servicio real.

**Transferencia al proyecto integrador «RutaFlow»:** agrega la puerta de publicación al pipeline de modelos de RutaFlow con métricas por zona y revisión de datos personales.

**Fuente oficial:** [NIST — AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) y [Amazon SageMaker — Model Registry](https://docs.aws.amazon.com/sagemaker/latest/dg/model-registry.html).

## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** construir una API que procesa documentos con Textract, guarda el texto en DynamoDB y genera un resumen con Bedrock.

**Requisitos previos:** Módulo 19 completado.

| Paso | Acción | Comando | Explicación |
|---|---|---|---|
| 1 | Invocar un modelo de Bedrock Runtime | `aws bedrock-runtime invoke-model` | Observa la respuesta stub determinista |
| 2 | Extraer texto de una imagen con Textract | `aws textract analyze-document --feature-types TABLES FORMS` | OCR + estructura |
| 3 | Transcribir un audio con Transcribe | `aws transcribe start-transcription-job` | Proceso asíncrono |
| 4 | Escribir una prueba de contrato para el stub | Ver Tema 3 | Verifica estructura, no contenido exacto |
| 5 | Documentar qué partes requieren AWS real | Ver Tema 3 | Contratos locales vs validación real |

**Verificación:** el laboratorio se considera exitoso si la API procesa correctamente un documento (extrae texto, lo guarda, genera un resumen), y si la prueba de contrato verifica la estructura de la respuesta del stub sin depender de un contenido exacto no determinista.

**Errores comunes y soluciones**

- **Asumir que pasar pruebas contra el stub de Bedrock garantiza calidad del contenido generado en producción.** Documenta explícitamente qué requiere validación contra el modelo real.
- **Escribir aserciones sobre el contenido exacto de una respuesta de IA real esperando determinismo.** Los modelos reales no son deterministas; verifica estructura, no contenido exacto, en pruebas automatizadas.
- **Confundir un stub simple con un mock que verifica invocaciones.** Distingue el propósito de cada uno según lo que necesitas verificar.

---
