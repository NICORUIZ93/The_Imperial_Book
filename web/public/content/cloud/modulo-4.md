# Módulo 4: Bases de datos NoSQL con DynamoDB


## Aprende construyendo

### Tema 1: Qué es NoSQL y cuándo usarlo

#### Paso 1 · Objetivo y preparación
Al finalizar podrás comprobar en vivo, con datos reales, por qué DynamoDB no obliga a un esquema fijo. Prerrequisitos: Módulo 1 (`floci start`, `eval $(floci env)`).
#### Paso 2 · Contexto y caso real
El proyecto integrador RutaFlow (`examples/rutaflow/cloud/template.yaml`) guarda el historial de cada envío en la tabla `ShipmentEvents`. Cada evento es distinto (un "creado" trae datos distintos a un "entregado" con foto), y eso es justo lo que una tabla SQL de columnas fijas obligaría a forzar con columnas vacías o una tabla aparte por tipo de evento. Esta flexibilidad de esquema es exactamente por qué RutaFlow elige DynamoDB: eventos reales nunca son iguales.
#### Paso 3 · Teoría, modelo mental y analogía
Una tabla SQL es un archivador con carpetas idénticas; DynamoDB es una caja de fichas donde cada ficha trae solo los campos que le corresponden, mientras comparta la clave que las ordena.

**Error real que deberías ver:**
```error-output
An error occurred (ValidationException) when calling the PutItem operation: One or more parameter values were invalid: Missing the key sequence in the item
```

**Diagnosis:**
1. **Qué sucedió:** Intentaste insertar un item sin uno de los atributos de clave primaria.
2. **Por qué sucede:** En DynamoDB, los atributos que forman la clave primaria (`shipmentId` y `sequence` en `ShipmentEvents`) son OBLIGATORIOS en cada item. A diferencia de SQL donde cada fila hereda la estructura de la tabla, en DynamoDB cada item debe traer explícitamente sus atributos clave.
3. **Qué buscar en logs:** Revisar el comando `put-item` —¿incluye `shipmentId` Y `sequence`? Si solo uno falta, obtendrás este error.

**Comando que produce el error:**
```bash
# ❌ INCORRECTO: falta 'sequence'
aws dynamodb put-item --table-name ShipmentEvents --item \
  '{"shipmentId":{"S":"env-4471"},"tipo":{"S":"creado"}}'

# ✅ CORRECTO: ambas claves presentes
aws dynamodb put-item --table-name ShipmentEvents --item \
  '{"shipmentId":{"S":"env-4471"},"sequence":{"N":"1"},"tipo":{"S":"creado"}}'
```

**Fix inmediato:**
Asegúrate que CADA `put-item` incluye AMBOS atributos de clave primaria: `shipmentId` (string) y `sequence` (número). Los atributos adicionales (`tipo`, `origen`, etc) son opcionales, pero la clave es obligatoria siempre.

**Learning:**
Este error refuerza la regla principal de DynamoDB: mientras SQL obtiene su estructura de la definición de tabla (todas las filas heredan columnas), DynamoDB obtiene su estructura del contenido de cada item. Solo la clave primaria es contractual; todo lo demás es flexible. Intentar insertar sin clave es como firmar un contrato sin nombre — DynamoDB lo rechaza porque no puede ordenar/encontrar el item después.

**Trade-off mencionado en RutaFlow:**
En operaciones batch (múltiples inserciones simultáneas), si una falla por clave incompleta, las demás proceden — ninguna se rollback. Por eso el validar estructura antes de batch es crítico en operaciones de sincronización de datos.

---

**Conceptos clave:** NoSQL, esquema flexible, escalado horizontal, base de datos relacional (SQL) vs no relacional.

NoSQL es un término amplio que agrupa bases de datos que no siguen el modelo relacional tradicional de tablas fijas con esquema rígido y relaciones definidas mediante claves foráneas. DynamoDB, en concreto, es una base de datos de clave-valor y documentos: cada registro (llamado item) se identifica por una clave primaria, y su estructura de atributos no tiene que ser idéntica a la de otros items en la misma tabla, a diferencia de una tabla SQL donde todas las filas comparten exactamente las mismas columnas definidas de antemano.

Esta flexibilidad de esquema tiene una ventaja práctica importante: puedes añadir atributos nuevos a items nuevos sin necesidad de una migración de esquema que afecte a los items existentes. Si hoy tus items de "tarea" tienen los atributos `id`, `titulo` y `estado`, y mañana decides añadir un atributo `prioridad` solo a las tareas nuevas, no necesitas ejecutar ningún `ALTER TABLE` ni actualizar retroactivamente los items antiguos: simplemente empiezas a incluir ese atributo en los items nuevos, y los antiguos siguen funcionando exactamente igual sin ese atributo.

La otra característica definitoria de DynamoDB es su diseño para escalar horizontalmente de forma prácticamente ilimitada: en vez de depender de un único servidor cada vez más potente (escalado vertical, el enfoque típico de muchas bases de datos relacionales tradicionales), DynamoDB distribuye automáticamente los datos de una tabla entre múltiples particiones subyacentes según la clave primaria, de forma que el rendimiento se mantiene consistente incluso cuando el volumen de datos y de peticiones crece varios órdenes de magnitud.

Esto no significa que NoSQL sea "mejor" que SQL de forma general: es una elección de herramienta según el problema. Una base de datos relacional sigue siendo la opción más natural cuando necesitas consultas complejas con múltiples joins entre tablas, transacciones ACID complejas que abarcan muchas entidades relacionadas, o cuando la estructura de tus datos y sus relaciones son estables y bien conocidas de antemano. DynamoDB brilla cuando el patrón de acceso a los datos es predecible y se puede diseñar alrededor de una clave de acceso principal (por ejemplo, "dame todas las tareas de este usuario"), cuando necesitas escalar a un volumen muy grande con latencia predecible, o cuando el esquema de tus datos cambia con frecuencia entre distintos tipos de item.

**Analogía:** una base de datos relacional es como un archivador de oficina con carpetas de formato idéntico y estrictamente numeradas, donde cada carpeta tiene exactamente las mismas pestañas en el mismo orden; añadir una pestaña nueva significa rehacer todas las carpetas existentes. DynamoDB es como una caja de fichas donde cada ficha puede tener información distinta escrita en ella —algunas con más datos, otras con menos—, siempre que todas compartan un identificador único (la clave) que te permite encontrarlas rápidamente.

**¿Por qué es importante?** Elegir entre SQL y NoSQL es una de las decisiones de arquitectura más frecuentes al diseñar un sistema nuevo, y elegir mal puede generar fricción constante más adelante: forzar un esquema NoSQL a comportarse como relacional (haciendo muchos "joins" manuales en el código de aplicación) es tan problemático como forzar una base relacional a comportarse como NoSQL (con columnas genéricas tipo `atributo1`, `atributo2` para simular flexibilidad de esquema).

**Diagrama:**

```mermaid
flowchart LR
    subgraph SQL["Base de datos relacional (SQL) — esquema fijo, todas las filas tienen las mismas columnas"]
        direction TB
        R1["id=1, titulo=A, estado=pendiente"]
        R2["id=2, titulo=B, estado=hecho"]
    end
    subgraph DDB["DynamoDB (NoSQL)"]
        direction TB
        D1["id: 1 · titulo: A · estado: pendiente"]
        D2["id: 2 · titulo: B · estado: hecho · prioridad: alta (atributo extra)"]
    end
```

#### Paso 4 · Demostración guiada
```bash
aws dynamodb create-table --table-name ShipmentEvents \
  --attribute-definitions AttributeName=shipmentId,AttributeType=S AttributeName=sequence,AttributeType=N \
  --key-schema AttributeName=shipmentId,KeyType=HASH AttributeName=sequence,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
aws dynamodb put-item --table-name ShipmentEvents --item \
  '{"shipmentId":{"S":"env-4471"},"sequence":{"N":"1"},"tipo":{"S":"creado"},"origen":{"S":"bodega-norte"}}'
aws dynamodb put-item --table-name ShipmentEvents --item \
  '{"shipmentId":{"S":"env-4471"},"sequence":{"N":"2"},"tipo":{"S":"entregado"},"fotoKey":{"S":"envio-4471/entrega-001.jpg"},"firmaCliente":{"BOOL":true}}'
```
Resultado esperado: ambos `put-item` terminan sin error, aunque el segundo item trae dos atributos (`fotoKey`, `firmaCliente`) que el primero ni siquiera tiene — `create-table` nunca los declaró, porque no son parte de la clave.
#### Paso 5 · Práctica guiada
Pista: intentá un `put-item` sin `sequence` (solo `shipmentId`) — ese es el fallo deliberado: `ValidationException: One or more parameter values were invalid: Missing the key sequence in the item`. A diferencia de los atributos normales, los de la clave primaria no son opcionales.
#### Paso 6 · Práctica independiente
Agregá un tercer evento (`sequence: 3`, `tipo: en_ruta`) con un atributo que ningún evento anterior tenga (por ejemplo `conductorId`), y confirmá con `get-item` que los tres eventos conviven en la misma tabla sin que ninguno necesite los atributos de los otros dos.
#### Paso 7 · Cierre
Entregá los tres `put-item`, el error de clave incompleta del Paso 5, y una frase explicando por qué ninguno de los tres eventos tiene la misma forma. Siguiente paso: tablas, items y atributos en detalle. Errores comunes: modelar como SQL sin patrón de acceso. Fuente oficial: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html.

### Tema 2: Tablas, items y atributos

#### Paso 1 · Objetivo y preparación
Al finalizar vas a distinguir, sobre la tabla `ShipmentEvents` que ya creaste, qué es obligatorio en un item y qué no. Prerrequisitos: Módulo 1 (`floci start`, `eval $(floci env)`), Tema 1 de este módulo.
#### Paso 2 · Contexto y caso real
`ShipmentEvents` ya existe en tu Floci local con el mismo esquema declarado en `examples/rutaflow/cloud/template.yaml` — acá vas a inspeccionar esa definición del proyecto integrador RutaFlow y confirmar qué parte de un item es realmente fija. Solo la clave primaria es obligatoria; todo lo demás varía por evento.
#### Paso 3 · Teoría, modelo mental y analogía
La tabla es el archivador completo; cada evento de envío es un expediente (item); cada dato del evento (`tipo`, `origen`, `fotoKey`) es un campo (atributo) dentro de ese expediente.

#### Profundización · Diseño: Clave de partición para consulta operacional

**Escenario real:** RutaFlow necesita una consulta frecuente en el operador de logística:

> "Dame TODOS los envíos que están en estado `pendiente` en este momento"

Hoy la tabla `ShipmentEvents` usa `shipmentId` (HASH) + `sequence` (RANGE). Con esa clave, NO puedes resolver esta consulta eficientemente sin un Scan completo de millones de eventos.

**Tu tarea (sin mirar solución):**

1. **Analiza:** ¿Cuál es la mejor clave de partición (HASH) + ordenación (RANGE) si quisieras soportar `estado = pendiente` como primer filtro eficiente?
2. **Decide:** ¿Usarías la clave primaria para este patrón, o un GSI? (Pista: mira Tema 5)
3. **Diseña:** Escribe la estructura `HASH: __, RANGE: __` que RutaFlow elegiría para esta tabla alternativa o índice
4. **Estima:** Si tienes 1M de eventos, ¿cuántos examinaría una Query eficiente vs un Scan?

**Escribe tu respuesta:**
```
Clave elegida (Primaria o GSI): ________
HASH: ________
RANGE: ________ (o NONE si solo HASH)
Justificación en 2 líneas: ________
Unidades de lectura Scan vs Query: ________ vs ________
```

<details>
<summary>SOLUCIÓN — Lee solo después de intentar</summary>

> **Respuesta esperada:**
>
> **Clave elegida:** GSI `EstadoIndex` (no cambias la primaria, que necesita `shipmentId`)
>
> **HASH:** `estado`  
> **RANGE:** `sequence` (o `timestamp`, para ordenar temporalmente)
>
> **Justificación:**  
> - Query `estado = :pendiente` te lleva directamente a TODOS los eventos pendientes sin examinar completados/entregados.
> - RANGE por `sequence`/`timestamp` te da los eventos en orden cronológico dentro de ese estado.
>
> **Costo:**  
> - **Scan:** 1,000,000 items × 1 = 1M unidades de lectura  
> - **Query con GSI:** ~50,000 items pendientes × 1 = 50k unidades (20x más barato)
>
> **En producción:** RutaFlow consulta esta operación decenas de veces por minuto. Scan sería inaceptable (~30 segundos, $100/mes). Query es ~50ms, $0.20/mes.

</details>

**Conceptos clave:** tabla, item, atributo, capacidad, sin límite de items por tabla.

En DynamoDB, una tabla es el contenedor de nivel superior, similar en concepto a una tabla SQL, pero sin esquema de columnas fijo. Un item es cada registro individual dentro de la tabla, equivalente conceptualmente a una fila en SQL, pero cuya única estructura obligatoria es tener los atributos que forman la clave primaria de la tabla; todos los demás atributos son opcionales y pueden variar libremente entre items distintos de la misma tabla, como viste en el Tema 1. Un atributo es cada par nombre-valor dentro de un item, equivalente conceptualmente a una celda en una fila SQL, aunque el valor de un atributo puede ser, a su vez, una estructura anidada compleja (una lista o un mapa, como verás en el Tema 3).

Una tabla en DynamoDB no tiene un límite práctico de número de items: puede crecer desde unos pocos registros hasta miles de millones, sin que eso requiera un rediseño de la tabla en sí, precisamente porque DynamoDB reparte automáticamente los datos entre particiones internas según la clave primaria a medida que la tabla crece. Esta es una diferencia operativa importante frente a muchas bases de datos relacionales tradicionales, donde el crecimiento masivo de una sola tabla puede eventualmente requerir estrategias manuales de particionado (sharding) diseñadas explícitamente por el equipo de ingeniería.

Cada tabla se define, como mínimo, especificando el nombre de sus atributos de clave primaria y su tipo de dato; no se define de antemano ningún otro atributo. Esto se refleja directamente en el comando de creación de una tabla, que solo requiere especificar el esquema de la clave (`AttributeDefinitions` y `KeySchema`), sin necesidad de declarar ningún otro campo que los items vayan a tener eventualmente.

Un item completo se representa, tanto en la API de DynamoDB como en la AWS CLI, como un objeto JSON donde cada atributo se anota explícitamente con su tipo de dato (por ejemplo, `{"S": "texto"}` para una cadena, `{"N": "42"}` para un número). Esta anotación explícita de tipos —que puede parecer verbosa al principio comparada con JSON puro— es necesaria porque DynamoDB necesita saber, por ejemplo, si `"42"` debe tratarse como el número 42 (para permitir operaciones matemáticas y comparaciones numéricas correctas) o como el texto literal "42".

**Analogía:** si una tabla SQL es como una hoja de cálculo con columnas fijas donde cada fila debe rellenar cada columna (aunque sea con un valor vacío), una tabla DynamoDB es como una carpeta de fichas de contacto donde cada ficha puede tener campos distintos: algunas personas tienen "teléfono de trabajo" anotado, otras no, y eso no rompe nada, mientras todas las fichas compartan al menos el campo obligatorio que usas para ordenarlas y encontrarlas (el nombre, en esta analogía; la clave primaria, en DynamoDB).

**¿Por qué es importante?** Entender que solo la clave primaria es obligatoria, y que todo lo demás es flexible por item, es la base para diseñar correctamente tablas DynamoDB: en vez de pensar "qué columnas necesito", el diseño en DynamoDB empieza por pensar "cómo voy a acceder a estos datos", una diferencia de enfoque que vas a ver reforzada en el Tema 4 (claves) y el Tema 6 (Query vs Scan) de este mismo módulo.

**Diagrama:**

```mermaid
flowchart TD
    T["Tabla: Tareas (clave primaria: id)"]
    T --> I1["Item 1: id t-001, Comprar leche, pendiente"]
    T --> I2["Item 2: id t-002, Pagar factura, hecho, prioridad alta"]
```

Solo "id" es obligatorio en todos los items; el resto de atributos varía libremente.

#### Paso 4 · Demostración guiada
```bash
aws dynamodb list-tables
aws dynamodb describe-table --table-name ShipmentEvents --query "Table.KeySchema"
aws dynamodb get-item --table-name ShipmentEvents \
  --key '{"shipmentId":{"S":"env-4471"},"sequence":{"N":"1"}}'
```
Resultado esperado: `describe-table` muestra solo dos entradas en `KeySchema` (`shipmentId` HASH, `sequence` RANGE) — nunca vas a ver `tipo`, `origen` ni `fotoKey` ahí, porque esos atributos viven en los items, no en la definición de la tabla.
#### Paso 5 · Práctica guiada
Pista: pedí un `get-item` con una clave que no existe (`sequence: 99`) para provocar el fallo deliberado — no es una excepción, es la respuesta correcta de DynamoDB: un JSON sin la clave `Item`. Confundir "no hay error" con "sí hay dato" es el error real acá.
#### Paso 6 · Práctica independiente
Insertá un evento nuevo con un atributo que no usaste antes (por ejemplo `intentosEntrega: {"N":"2"}`) y recuperalo con `get-item`, confirmando que la tabla no tuvo que cambiar para aceptarlo.
#### Paso 7 · Cierre
Entregá el `describe-table`, el `get-item` vacío del Paso 5 y el `get-item` con el atributo nuevo del Paso 6; explicá por qué ninguno de los tres pasos requirió tocar la definición de la tabla. Siguiente paso: tipos de dato. Errores comunes: atributos innecesarios y capacidad sin medir. Fuente oficial: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html.

### Tema 3: Tipos de datos — S, N, B, BOOL, NULL, L, M

#### Paso 1 · Objetivo y preparación
Al finalizar podrás modelar un evento de entrega real con tipos anidados (lista y mapa). Prerrequisitos: Módulo 1 (`floci start`, `eval $(floci env)`), Temas 1-2 de este módulo.
#### Paso 2 · Contexto y caso real
Un evento de tipo `entregado` en el proyecto integrador RutaFlow necesita guardar la ubicación GPS (dos números relacionados: lat, lon) y la lista de fotos subidas — ninguno de los dos encaja bien como un atributo escalar suelto. Ver `examples/rutaflow/cloud/template.yaml` para el esquema real de ShipmentEvents que usa exactamente estos tipos anidados.
#### Paso 3 · Teoría, modelo mental y analogía
`M` es un sub-formulario anidado dentro del evento; `L` es una lista de elementos relacionados que puede crecer sin límite fijo de cuántos hay.

#### Profundización · Diseño: Estructura anidada para metadatos de foto

**Escenario real:** RutaFlow necesita guardar metadatos de CADA foto tomada en la entrega:

```
Foto 1: { formato: "jpg", tamaño: 1243 bytes, timestamp: "2026-10-06T14:23:15Z", resolucion: "1920x1080" }
Foto 2: { formato: "webp", tamaño: 891 bytes, timestamp: "2026-10-06T14:23:22Z", resolucion: "1920x1080" }
```

Hoy guardás un `L` de strings con rutas (`fotos: ["envio-4471/entrega-001.jpg", ...]`). Pero necesitás consultar "fotos tomadas después de las 14:23" sin procesar en la aplicación.

**Tu tarea (sin mirar solución):**

1. **Diseña:** Cómo guardaías la lista de fotos con sus metadatos — escribe la estructura `M` anidada completa
2. **Elige tipos:** Cada campo del mapa ¿es `S`, `N`, `L`, o `M`?
3. **Consulta:** Escribe el `ProjectionExpression` que necesitarías para extraer SOLO las fotos posteriores a cierta hora (sin traerlas todas)
4. **Trade-off:** ¿Cuál es la desventaja de anidar todo en un mapa vs tener columnas separadas?

**Estructura esperada:**
```json
{
  "shipmentId": { "S": "env-4471" },
  "fotos": {
    "L": [
      {
        "M": {
          "ruta": { "S": "envio-4471/entrega-001.jpg" },
          "formato": { "S": "jpg" },
          "tamaño": { "N": "1243" },
          "timestamp": { "S": "2026-10-06T14:23:15Z" },
          "resolucion": { "S": "1920x1080" }
        }
      },
      ...
    ]
  }
}
```

<details>
<summary>SOLUCIÓN — Lee solo después de intentar</summary>

> **Respuesta:**
>
> **Tipos en el mapa:**
> - `ruta`, `formato`, `timestamp`, `resolucion` → `S` (string)
> - `tamaño` → `N` (número, para permitir comparación `tamaño > :limite`)
>
> **ProjectionExpression:** No existe una forma eficiente de filtrar elementos dentro de `L` sin procesar en aplicación (DynamoDB no indexa atributos anidados dentro de listas).
>
> **Trade-off:**
> - **Ventaja de `M` anidado:** Modela perfectamente "una foto con sus metadatos". Fácil de procesar en código.
> - **Desventaja:** No puedes hacer Query `timestamp > :hora` sobre el mapa anidado. Necesitarías un índice adicional o procesamiento en aplicación.
> - **Solución en producción:** Si necesitás filtrar por timestamp, considera una tabla separada `FotoMetadata` con `shipmentId` (HASH) + `timestamp` (RANGE).

</details>

### Fallo Deliberado: Números guardados como strings en DynamoDB

**Error real que deberías observar:**
```error-output
# Sin error en put-item (DynamoDB lo acepta)
# Pero error cuando intentas ordenar:
aws dynamodb query --table-name ShipmentEvents \
  --key-condition-expression "shipmentId = :id AND #s BETWEEN :start AND :end" \
  --expression-attribute-names '{"#s":"sequence"}' \
  --expression-attribute-values '{":id":{"S":"env-4471"},":start":{"N":"1"},":end":{"N":"10"}}' 

# El problema: si guardaste sequence como {"S":"2"} en vez de {"N":"2"},
# el BETWEEN falla en comparar números correctamente (ordena "10" < "2" lexicográficamente)
```

**Diagnosis:**
1. **Qué sucedió:** Guardaste un valor numérico usando tipo `S` (string) en lugar de `N` (número), y luego intentaste hacer queries que asumen tipo numérico.
2. **Por qué sucede:** DynamoDB NO valida que usaste el tipo correcto al guardar — es flexible. Acepta `{"S":"42"}` aunque sea un número. Pero cuando luego intentas Query/Scan con comparaciones numéricas, asume que el tipo declarado es correcto, y hace comparación lexicográfica (texto) en lugar de numérica.
3. **Qué buscar en logs:** En el comando de guardado, busca `{"S":"número"}` en lugar de `{"N":"número"}`.

**Comparación:**
```bash
# ❌ INCORRECTO: tipo mismatch
aws dynamodb put-item --table-name ShipmentEvents --item \
  '{"shipmentId":{"S":"env-4471"},"sequence":{"S":"2"}}'  # String, no número!

# ✅ CORRECTO: tipo correcto
aws dynamodb put-item --table-name ShipmentEvents --item \
  '{"shipmentId":{"S":"env-4471"},"sequence":{"N":"2"}}'  # Número
```

**El error que genera:**
```bash
# Si guardaste sequence como S y luego haces:
aws dynamodb query --table-name ShipmentEvents \
  --key-condition-expression "sequence BETWEEN :s1 AND :s10" \
  --expression-attribute-values '{":s1":{"N":"1"},":s10":{"N":"10"}}'

# Resultado INCORRECTO: ordena lexicográficamente
# Devuelve: "1", "10", "2", "3", etc. (como strings)
# Esperado: 1, 2, 3, ..., 10 (números)
```

**Fix inmediato:**
Revisa la escritura de datos — asegúrate que números van como `{"N":"valor"}`, NO como `{"S":"valor"}`.

**Fix si ya guardaste mal:**
Necesitas hacer un scan + reescritura:
```bash
# Scan para traer items problemáticos
aws dynamodb scan --table-name ShipmentEvents \
  --projection-expression "shipmentId, #s" \
  --expression-attribute-names '{"#s":"sequence"}' > items.json

# Reescribir con tipo correcto (script en Python):
python3 << 'EOF'
import json, boto3
ddb = boto3.client('dynamodb')

for item in json.load(open('items.json'))['Items']:
    # Fijar: convertir sequence de S a N
    shipmentId = item['shipmentId']
    sequence_value = item['sequence'].get('S') or item['sequence'].get('N')
    
    ddb.put_item(TableName='ShipmentEvents', Item={
        'shipmentId': shipmentId,
        'sequence': {'N': str(sequence_value)}  # Fuerza N
    })
EOF
```

**Learning:**
Este error refuerza que en DynamoDB los tipos son críticos para operaciones de rango (BETWEEN, > , <). A diferencia de SQL donde el tipo se valida en tiempo de inserción, DynamoDB lo deja flexible y falla más tarde en queries. Validar tipos en la aplicación ANTES de insertar es esencial.

**Límites y Trade-offs:**
DynamoDB no proporciona validación de esquema automática — es un beneficio (flexibilidad) que requiere disciplina en la aplicación (validación manual de tipos). RutaFlow usa `boto3` con type hints para evitar este error:
```python
# Tipo correcto desde el inicio
event = {
    'shipmentId': {'S': shipment_id},
    'sequence': {'N': str(sequence)},  # Fuerza string → N
}
```

---

**Conceptos clave:** tipo escalar, tipo de conjunto, tipo de documento, `S` (string), `N` (number), `B` (binary), `BOOL`, `NULL`, `L` (list), `M` (map).

DynamoDB define un conjunto específico de tipos de datos que cada atributo debe declarar explícitamente. Los tipos escalares representan un único valor: `S` para cadenas de texto (strings), `N` para números (DynamoDB los almacena y transmite como texto para preservar precisión exacta, pero los trata como valores numéricos para comparaciones y operaciones matemáticas), `B` para datos binarios codificados en base64, `BOOL` para valores verdadero/falso, y `NULL` para representar explícitamente la ausencia de un valor (distinto de simplemente omitir el atributo).

Los tipos de documento permiten estructuras anidadas más complejas dentro de un mismo atributo. `L` (lista) es una colección ordenada de valores que pueden ser de tipos distintos entre sí (una lista puede mezclar strings, números y hasta otros mapas), similar a un array en JSON. `M` (mapa) es una colección de pares clave-valor anidados, similar a un objeto JSON anidado; es el tipo que usarías, por ejemplo, para guardar una dirección completa (calle, ciudad, código postal) como un único atributo estructurado dentro de un item, en vez de aplanarla en atributos separados como `direccion_calle`, `direccion_ciudad`.

También existen tipos de conjunto (`SS` para conjunto de strings, `NS` para conjunto de números, `BS` para conjunto de binarios), que representan colecciones de valores únicos del mismo tipo, sin orden garantizado y sin duplicados permitidos —a diferencia de una lista (`L`), que sí permite duplicados y mantiene el orden de inserción—. Un conjunto de strings sería apropiado, por ejemplo, para guardar las etiquetas únicas asociadas a un item, donde no importa el orden y no tiene sentido repetir la misma etiqueta dos veces.

Elegir el tipo correcto no es solo una cuestión de corrección formal: tiene implicaciones prácticas reales. Guardar un número como `S` en vez de `N` (por ejemplo, `{"S": "42"}` en vez de `{"N": "42"}`) impide hacer comparaciones numéricas correctas en consultas posteriores (ordenaría "10" antes que "9", porque compararía los textos carácter por carácter, no los valores numéricos). Del mismo modo, decidir entre aplanar la estructura de un item en atributos escalares separados o anidarla en un mapa (`M`) afecta a cómo de fácil es consultar o actualizar partes específicas de esa estructura más adelante.

**Analogía:** los tipos de datos de DynamoDB son como las distintas casillas de un formulario de papel bien diseñado: una casilla de texto libre (`S`), una casilla numérica que solo acepta cifras y permite sumarlas (`N`), una casilla de sí/no (`BOOL`), y un recuadro más grande donde puedes adjuntar una lista completa de elementos relacionados (`L`) o un sub-formulario anidado con sus propios campos (`M`). Usar la casilla equivocada —escribir un número en la casilla de texto libre— no rompe el formulario visualmente, pero impide procesarlo automáticamente más adelante de forma correcta.

**¿Por qué es importante?** Elegir el tipo de dato correcto desde el primer diseño de la tabla evita errores sutiles que aparecen más adelante, típicamente al intentar ordenar o comparar valores numéricos que fueron guardados incorrectamente como texto. Es un error común entre quien llega a DynamoDB desde una base de datos relacional, donde el tipo de columna se define una única vez a nivel de tabla, no atributo por atributo dentro de cada item.

**Diagrama:**

```mermaid
flowchart TD
    I["Item con distintos tipos de dato"]
    I --> A1["id: S = &quot;t-001&quot;"]
    I --> A2["prioridad: N = 3"]
    I --> A3["completada: BOOL = false"]
    I --> A4["etiquetas: L"]
    A4 --> A4a["S = &quot;urgente&quot;"]
    A4 --> A4b["S = &quot;casa&quot;"]
    I --> A5["direccion: M"]
    A5 --> A5a["ciudad: S = &quot;Bogotá&quot;"]
    A5 --> A5b["cp: S = &quot;110111&quot;"]
```

#### Paso 4 · Demostración guiada
```bash
aws dynamodb put-item --table-name ShipmentEvents --item \
  '{"shipmentId":{"S":"env-4471"},"sequence":{"N":"4"},"tipo":{"S":"entregado"},
    "ubicacion":{"M":{"lat":{"N":"4.6097"},"lon":{"N":"-74.0817"}}},
    "fotos":{"L":[{"S":"envio-4471/entrega-001.jpg"},{"S":"envio-4471/entrega-002.jpg"}]}}'
aws dynamodb get-item --table-name ShipmentEvents \
  --key '{"shipmentId":{"S":"env-4471"},"sequence":{"N":"4"}}'
```
Resultado esperado: el `get-item` devuelve `ubicacion` como un `M` con `lat`/`lon` anidados y `fotos` como un `L` con dos strings — ambos navegables sin necesidad de una tabla separada.
#### Paso 5 · Práctica guiada
Pista: guardá `lat` como texto (`{"S":"4.6097"}`) en vez de número para provocar el fallo deliberado: el `put-item` no rechaza el string, pero una comparación o un rango numérico posterior sobre ese campo (por ejemplo "entregas dentro de este radio") dejaría de funcionar correctamente, sin que DynamoDB avise nada en el momento de guardar.
#### Paso 6 · Práctica independiente
Agregá un evento con una lista de incidencias (`L` de strings, por ejemplo `["direccion_incorrecta","reintentar"]`) y confirmá que podés leerla completa con `get-item`.
#### Paso 7 · Cierre
Entregá el `get-item` del evento con `ubicacion`/`fotos`, el intento con `lat` como string y una frase explicando por qué DynamoDB lo acepta sin error aunque sea un problema real. Siguiente paso: claves. Errores comunes: mezclar tipos y no validar nulos. Fuente oficial: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingFormat.html.

### Tema 4: Clave primaria simple (HASH) vs compuesta (HASH + RANGE)

#### Paso 1 · Objetivo y preparación
Al finalizar vas a comprobar en la propia tabla `ShipmentEvents` por qué necesita clave compuesta y no una clave simple. Prerrequisitos: Módulo 1 (`floci start`, `eval $(floci env)`), Temas 1-3 de este módulo.
#### Paso 2 · Contexto y caso real
El proyecto integrador RutaFlow declara en `template.yaml` exactamente este diseño: `shipmentId` como partición (HASH) y `sequence` como ordenación (RANGE) — porque un mismo envío tiene muchos eventos (creado, en_ruta, entregado...) y hay que poder pedirlos todos, en orden, con una sola consulta eficiente.
#### Paso 3 · Teoría, modelo mental y analogía
`shipmentId` agrupa; `sequence` ordena dentro del grupo — como un expediente médico organizado por paciente (partición) y fecha de consulta (ordenación): muchas consultas, mismo paciente, cada una distinguible por su fecha.

#### Profundización · Diseño: Clave simple vs compuesta

**Escenario hipotético:** Imagina que RutaFlow, en vez de guardar múltiples eventos por envío, solo guardara el ESTADO ACTUAL de cada envío (sin histórico).

**Tu tarea:**

1. **Diseña tabla A:** Solo eventos recientes (UN estado por envío) — ¿cuál sería la clave? (HASH o HASH+RANGE?)
2. **Diseña tabla B:** Histórico completo (TODOS los eventos de cada envío) — ¿cuál sería la clave?
3. **Escribe las dos formas:**
   - Tabla A: `clave = ________`
   - Tabla B: `HASH = ________, RANGE = ________`
4. **Compa crítica:** ¿Qué consulta solo puede resolver Tabla B? ¿Y Tabla A?

[SOLUCIÓN]

> **Tabla A (solo estado actual):**  
> `shipmentId` (HASH alone) — un envío, un estado.
>
> **Tabla B (histórico):**  
> `HASH: shipmentId, RANGE: sequence` — múltiples eventos, ordenados.
>
> **Consultas que solo Tabla B resuelve:**  
> - "Todos los eventos de este envío en orden cronológico" → Query `shipmentId = :id` devuelve la lista histórica
>
> **Consultas que ambas resuelven:**  
> - "Estado actual del envío X" → Tabla A: Get con `shipmentId`. Tabla B: Query con rango = MAX(sequence).
>
> **Por qué RutaFlow elige Tabla B:**  
> Auditoría: operadores necesitan ver qué pasó, cuándo, en qué orden. Un estado actual no basta.

**Conceptos clave:** clave de partición (HASH), clave de ordenación (RANGE), unicidad de la clave primaria, patrón de acceso.

DynamoDB ofrece dos formas de definir la clave primaria de una tabla. La primera es una clave simple, formada únicamente por un atributo de partición (HASH), que debe ser único para cada item en toda la tabla: no puede haber dos items con el mismo valor de clave de partición. Este es el equivalente más cercano a una clave primaria autoincremental de una tabla SQL tradicional: un identificador único por registro.

La segunda es una clave compuesta, formada por un atributo de partición (HASH) más un atributo de ordenación (RANGE). En este esquema, la combinación de ambos valores debe ser única, pero el valor de la clave de partición por sí solo puede repetirse en múltiples items, siempre que cada uno tenga un valor distinto de clave de ordenación. Esto habilita un patrón extremadamente común y potente: agrupar múltiples items relacionados bajo la misma clave de partición, y usar la clave de ordenación para diferenciarlos y, de paso, para consultarlos en un rango ordenado.

Un ejemplo concreto aclara esto: si diseñas una tabla de pedidos con clave de partición `usuario_id` y clave de ordenación `fecha_pedido`, puedes tener múltiples pedidos del mismo usuario (misma clave de partición) cada uno con una fecha distinta (clave de ordenación distinta), y además puedes consultar eficientemente "todos los pedidos del usuario X entre estas dos fechas" aprovechando que la clave de ordenación permite consultas por rango, algo que una clave simple no permitiría de forma nativa y eficiente.

La elección entre clave simple y compuesta depende directamente de tu patrón de acceso principal a los datos, no de una preferencia estética. Si tu caso de uso es "necesito buscar un único registro por su identificador único" (por ejemplo, una tabla de usuarios donde consultas por `usuario_id`), una clave simple es suficiente y más sencilla. Si tu caso de uso incluye "necesito todos los registros relacionados con este identificador, opcionalmente en un rango o en un orden concreto" (por ejemplo, todos los pedidos de un usuario, todos los mensajes de una conversación, todas las versiones de un documento), una clave compuesta es casi siempre la elección correcta, precisamente porque habilita el uso eficiente de Query (que verás en el Tema 6) sobre ese grupo de items relacionados.

**Analogía:** una clave simple es como el número de identificación de una persona en un archivo de ciudadanos: único, sin ambigüedad, y suficiente para encontrar exactamente a esa persona. Una clave compuesta es como el sistema de un archivo de expedientes médicos organizado por paciente (clave de partición) y fecha de consulta (clave de ordenación): puedes tener muchas consultas del mismo paciente, cada una en una fecha distinta, y el sistema te permite pedir eficientemente "todas las consultas de este paciente entre enero y marzo" sin tener que revisar el archivo completo.

**¿Por qué es importante?** La elección de clave primaria es, con diferencia, la decisión de diseño más importante al modelar una tabla DynamoDB, porque no es trivial de cambiar después: cambiar el esquema de clave de una tabla existente con datos reales normalmente implica crear una tabla nueva y migrar todos los items, no una simple modificación in situ. Pensarlo bien desde el principio, basándote en cómo vas a consultar los datos y no solo en cómo vas a guardarlos, evita ese coste de migración más adelante.

**Diagrama:**

```mermaid
flowchart LR
    subgraph SIMP["Clave simple (solo HASH) — Tabla: Usuarios — cada id es único"]
        direction TB
        U1["id (HASH) = u-001"]
        U2["id (HASH) = u-002"]
    end
    subgraph COMP["Clave compuesta (HASH + RANGE) — Tabla: Pedidos"]
        direction TB
        P1["usuario_id=u-001, fecha_pedido=2026-01-05"]
        P2["usuario_id=u-001, fecha_pedido=2026-02-14 ← mismo HASH, distinto RANGE"]
        P3["usuario_id=u-002, fecha_pedido=2026-01-20"]
    end
```

#### Paso 4 · Demostración guiada
```bash
aws dynamodb query --table-name ShipmentEvents \
  --key-condition-expression "shipmentId = :id" \
  --expression-attribute-values '{":id":{"S":"env-4471"}}'
```
Resultado esperado: devuelve los 4 eventos que ya insertaste de `env-4471` (sequence 1, 2, 3, 4), en orden por `sequence` — exactamente el patrón de acceso que una clave simple (solo `shipmentId`) no podría resolver, porque no podría tener más de un item por envío.
#### Paso 5 · Práctica guiada
Pista: insertá un evento con `shipmentId: env-4471` y `sequence: 2` (un valor que ya existe) pero con `tipo` distinto — ese es el fallo deliberado: no hay ninguna `Exception`, `put-item` sobrescribe en silencio el evento original. La clave compuesta exige unicidad en la combinación, pero no te avisa si repetís una por error.
#### Paso 6 · Práctica independiente
Creá un segundo envío completo (`shipmentId: env-5002`, con sus propios `sequence` 1 y 2) y confirmá con `query` que pedir los eventos de `env-4471` nunca devuelve nada de `env-5002`, aunque estén en la misma tabla.
#### Paso 7 · Cierre
Entregá el `query` de `env-4471`, la sobrescritura silenciosa del Paso 5 y el `query` que separa ambos envíos; explicá qué patrón de acceso justifica la clave compuesta acá. Siguiente paso: índices. Errores comunes: clave caliente y consultas no previstas. Fuente oficial: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html.

### Tema 5: Índices secundarios globales (GSI) y locales (LSI)

#### Paso 1 · Objetivo y preparación
Al finalizar vas a crear y usar el índice `EstadoIndex` que ya está declarado en `template.yaml` sobre `ShipmentEvents`. Prerrequisitos: Módulo 1 (`floci start`, `eval $(floci env)`), Tema 4 de este módulo.
#### Paso 2 · Contexto y caso real
Un operador del proyecto integrador RutaFlow necesita "todos los envíos con estado `entregado`" sin saber de antemano ningún `shipmentId` — la clave primaria (`shipmentId` + `sequence`) no resuelve esto sin revisar la tabla entera. El proyecto integrador declara el GSI `EstadoIndex` (partición `estado`, ordenación `sequence`) justo para este patrón de acceso operacional.
#### Paso 3 · Teoría, modelo mental y analogía
El índice principal de `ShipmentEvents` es el índice de un libro ordenado por envío; `EstadoIndex` es un índice alfabético adicional al final del mismo libro, ordenado por un criterio totalmente distinto.

**Conceptos clave:** índice secundario global (GSI), índice secundario local (LSI), clave de partición alternativa, proyección de atributos.

La clave primaria de una tabla define el único camino de acceso directo y eficiente a sus items usando Query, pero en la práctica casi ninguna aplicación necesita consultar sus datos por un único criterio de acceso. Los índices secundarios resuelven este problema, permitiendo consultas eficientes usando un atributo distinto al de la clave primaria original, sin necesidad de recurrir a un Scan completo de la tabla.

Un índice secundario global (GSI) define una clave de partición (y opcionalmente una de ordenación) completamente distinta a la de la tabla base, y se comporta, a efectos prácticos, como una vista alternativa de la tabla, con su propia capacidad de lectura y escritura, que se actualiza automáticamente (de forma asíncrona) cada vez que se modifica un item en la tabla base. Un GSI puede crearse en cualquier momento sobre una tabla existente, y puede usar cualquier atributo de la tabla como su nueva clave de partición, sin ninguna restricción de que ese atributo tenga relación con la clave primaria original.

Un índice secundario local (LSI), en cambio, mantiene la misma clave de partición que la tabla base, pero define una clave de ordenación alternativa distinta a la original. Esto permite, por ejemplo, sobre la tabla de pedidos del Tema 4 (partición `usuario_id`, ordenación `fecha_pedido`), crear un LSI que use la misma partición `usuario_id` pero una ordenación alternativa por `monto_total`, permitiendo consultar eficientemente "los pedidos del usuario X ordenados por monto" sin tener que hacerlo por fecha. Una restricción importante de los LSI, a diferencia de los GSI, es que deben definirse en el momento de crear la tabla, no se pueden añadir después sobre una tabla ya existente.

En la práctica, los GSI son mucho más usados que los LSI en el desarrollo moderno con DynamoDB, precisamente por su flexibilidad (se pueden añadir en cualquier momento, y permiten cambiar completamente la clave de partición, no solo la de ordenación). Los LSI tienen un caso de uso más estrecho: cuando necesitas una consistencia de lectura fuerte sobre la consulta alternativa (los GSI, al actualizarse de forma asíncrona, solo ofrecen consistencia eventual) y estás dispuesto a aceptar la restricción de definirlo desde la creación de la tabla.

**Analogía:** la tabla base con su clave primaria es como el índice principal de un libro, ordenado por número de capítulo. Un GSI es como añadir, en cualquier momento, un índice alfabético por tema al final del libro, que te permite buscar por un criterio completamente distinto sin tener que hojear el libro entero. Un LSI es como un índice secundario dentro de un mismo capítulo, que reordena solo ese capítulo por un criterio distinto (por ejemplo, por fecha en vez de por número de página), pero que debes decidir incluir cuando imprimes el libro por primera vez, no después.

**¿Por qué es importante?** El diseño de índices secundarios es lo que hace posible que una tabla DynamoDB, pese a tener una única clave primaria "principal", soporte en la práctica múltiples patrones de consulta eficientes distintos. Sin índices, cualquier consulta que no coincida exactamente con la clave primaria original requeriría un Scan completo, ineficiente a gran escala, como vas a ver en detalle en el siguiente tema.

#### Profundización · Diseño: GSI vs LSI — Consistencia vs Flexibilidad

**Escenario:** RutaFlow necesita "todos los eventos entregados de ESTA bodega, en los últimos 7 días" — una consulta que NO usa `shipmentId`.

**Tu tarea:**

1. **Análisis:** ¿Qué índice necesitás? (GSI o LSI?)
2. **Diseño:**
   - Propón HASH y RANGE para este patrón
3. **Trade-off:**
   - GSI es asíncrono (eventual consistency) — ¿cuándo acepta RutaFlow eso?
   - LSI es síncrono (strong consistency) — ¿cuál es su límite de tamaño?
4. **Decisión:** Para tracking de entregas, ¿cuál elegirías y por qué?

[SOLUCIÓN]

> **Índice necesario:** GSI (LSI requiere misma HASH que tabla, i.e., `shipmentId`, que no queremos)
>
> **Diseño propuesto:**  
> `HASH: bodega, RANGE: timestamp DESC`
>
> **Trade-off:**
> - **GSI (asíncrono, eventual):** Hay ~1-5 seg de delay. Aceptable para reportes operacionales ("entregas hoy"), NO para facturación en tiempo real.
> - **LSI (síncrono, strong):** Tamaño máximo 10GB por HASH valor. Si una bodega tiene millones de eventos históricos, se agota.
>
> **Por qué RutaFlow elige GSI:**  
> Dashboards operacionales toleran delay. Factor crítico es flexibilidad: GSI permite cambiar la clave en cualquier momento.

**Diagrama:**

```mermaid
flowchart LR
    Primary["Tabla base<br/>HASH: shipmentId<br/>RANGE: sequence"]
    Primary -->|"eventual consistency"| GSI["GSI EstadoIndex<br/>HASH: estado<br/>RANGE: sequence"]
    Primary -->|"strong consistency"| LSI["LSI opcional<br/>Misma HASH<br/>RANGE distinto<br/>Límite 10GB"]
```

```mermaid
flowchart TD
    BASE["Tabla base: Pedidos (HASH: usuario_id, RANGE: fecha_pedido)"]
    BASE --> GSI["GSI por estado: HASH estado, RANGE fecha_pedido"]
    GSI --> GP["permite consultar pedidos enviados por fecha"]
    BASE --> LSI["LSI por monto: HASH usuario_id, RANGE monto_total"]
    LSI --> LP["permite consultar pedidos del usuario ordenados por monto"]
```

#### Paso 4 · Demostración guiada
```bash
aws dynamodb update-table --table-name ShipmentEvents \
  --attribute-definitions AttributeName=shipmentId,AttributeType=S AttributeName=sequence,AttributeType=N AttributeName=estado,AttributeType=S \
  --global-secondary-index-updates '[{"Create":{"IndexName":"EstadoIndex","KeySchema":[{"AttributeName":"estado","KeyType":"HASH"},{"AttributeName":"sequence","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"}}}]'
aws dynamodb put-item --table-name ShipmentEvents --item \
  '{"shipmentId":{"S":"env-4471"},"sequence":{"N":"4"},"tipo":{"S":"entregado"},"estado":{"S":"entregado"}}'
aws dynamodb query --table-name ShipmentEvents --index-name EstadoIndex \
  --key-condition-expression "estado = :e" --expression-attribute-values '{":e":{"S":"entregado"}}'
```
Resultado esperado: la `query` sobre `EstadoIndex` devuelve el evento de `env-4471` sin que el comando mencione `shipmentId` en ningún lado — encontraste el envío por su estado, no por su clave primaria.
#### Paso 5 · Práctica guiada
Pista: repetí la misma `query` pero con `--index-name EstadoIndex2` (un nombre que no existe) para provocar el fallo deliberado: `ValidationException: The table does not have the specified index`. El nombre del índice no es cosmético, es parte de la consulta.
#### Paso 6 · Práctica independiente
Agregá un evento `entregado` para `env-5002` y confirmá con la misma `query` sobre `EstadoIndex` que ahora devuelve los eventos `entregado` de ambos envíos, ordenados por `sequence` dentro de ese estado.
#### Paso 7 · Cierre
Entregá la creación del índice, la `query` exitosa, el error de índice inexistente del Paso 5 y la `query` con dos envíos del Paso 6; explicá qué pregunta resuelve `EstadoIndex` que la clave primaria no resuelve. Siguiente paso: consultas. Errores comunes: indexar todo y olvidar capacidad. Fuente oficial: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html.

### Tema 6: Query vs Scan

#### Paso 1 · Objetivo y preparación
Al finalizar vas a medir, con números reales, la diferencia de costo entre Query y Scan sobre `ShipmentEvents`. Prerrequisitos: Módulo 1 (`floci start`, `eval $(floci env)`), Temas 2 y 4 de este módulo.
#### Paso 2 · Contexto y caso real
La API de tracking del proyecto integrador RutaFlow (`examples/rutaflow/cloud/functions/`) pide "los eventos de este envío" decenas de veces por minuto en producción — tiene que resolverlo con Query, no con un Scan de toda la tabla de eventos de todos los envíos. Esta diferencia de eficiencia es lo que permite que RutaFlow escale sin deuda operacional.
#### Paso 3 · Teoría, modelo mental y analogía
Query va directo a la partición de un envío; Scan recorre evento por evento de todos los envíos, sin importar cuál buscás.

#### Profundización · Diseño y decisión (Ejercicio sin solución visible)

**Escenario real:** RutaFlow necesita agregar una nueva consulta operacional:

> "Dame todos los envíos que llegaron HOY a la bodega norte, independientemente de su estado"

**Información de diseño:**
- La tabla `ShipmentEvents` está definida con clave primaria: `shipmentId` (HASH) + `sequence` (RANGE)
- Ya existe un índice: `EstadoIndex` con `estado` (HASH) + `sequence` (RANGE)
- En producción, hay millones de envíos. Un Scan completo sería inaceptable (costo + latencia)

**Tu tarea:**
1. Diseña un GSI nuevo que habilite esta consulta eficiente (sin Scan)
2. Decide qué atributo es HASH y cuál es RANGE
3. Explica por qué esta clave permite una Query eficiente
4. Estima el costo operacional si usaras Scan vs Query para 1M de envíos

**Restricción:** No puedes cambiar la clave primaria de la tabla (hay datos históricos).

**Escribe tu respuesta:**
```
Nombre del GSI: ________
HASH: ________
RANGE: ________
Justificación: ________
Costo estimado Scan vs Query: ________
```

<details>
<summary>SOLUCIÓN — Lee solo después de intentar</summary>

> **Respuesta esperada:**
>
> **Nombre:** `PorBodegaYFecha` o `RastreoOperacional`
>
> **HASH:** `bodega` (ej. "bodega-norte", "bodega-sur")  
> **RANGE:** `timestamp` o `fecha` (ISO 8601 del evento)
>
> **Justificación:**  
> La Query `bodega = :bodega AND timestamp BETWEEN :inicio AND :fin` te lleva directamente a los eventos de esa bodega en ese rango de fechas, sin examinar otros envíos. El costo de lectura es proporcional a los eventos que realmente coinciden, no al tamaño total de la tabla.
>
> **Costo:**  
> - **Scan:** 1,000,000 items examinados = 1,000,000 unidades de lectura (caro, lento)
> - **Query con GSI:** ~5,000 items examinados (si el promedio de entregas por bodega/día es 5k) = 5,000 unidades de lectura (250x más barato)
>
> **En producción:** La diferencia entre Scan y Query bien diseñado es la diferencia entre una consulta que tarda 30 segundos y cuesta $100/mes vs una que tarda 50ms y cuesta $0.40/mes.

</details>

**Conceptos clave:** Query, Scan, coste de lectura, eficiencia de acceso, filtro posterior vs filtro de clave.

Query es la operación de lectura eficiente de DynamoDB: requiere especificar un valor exacto de clave de partición (y, opcionalmente, una condición sobre la clave de ordenación, como un rango o una comparación), y DynamoDB usa internamente su conocimiento de cómo están particionados los datos para ir directamente a la partición correcta y devolver únicamente los items que coinciden, sin necesidad de examinar el resto de la tabla. El coste de una Query (en unidades de capacidad de lectura, y por tanto en tiempo y en dinero en una cuenta real) es proporcional a la cantidad de datos que realmente coinciden con la condición, no al tamaño total de la tabla.

Scan, en cambio, examina absolutamente todos los items de la tabla, uno por uno, sin usar la clave de partición como filtro de acceso. Puedes aplicar un filtro adicional a un Scan (por ejemplo, "solo los items donde `estado` sea `pendiente`"), pero ese filtro se aplica después de leer cada item completo de la tabla, no antes: DynamoDB primero lee (y cobra) por examinar cada item de la tabla entera, y solo después descarta los que no cumplen el filtro. Esto significa que el coste de un Scan es proporcional al tamaño total de la tabla, sin importar cuántos items terminen realmente coincidiendo con tu filtro.

Esta diferencia, que puede parecer poco relevante en una tabla pequeña de laboratorio con unos pocos items, se vuelve crítica a medida que una tabla crece a miles o millones de items en un sistema real: un Scan sobre una tabla de un millón de items para encontrar los diez que cumplen un filtro específico examina —y cobra por— el millón de items completo, mientras que una Query bien diseñada, usando el atributo correcto como clave de partición, accede directamente solo a los items relevantes.

La implicación práctica de esto para el diseño de tablas es directa: el objetivo al diseñar la clave primaria (y los índices secundarios, del Tema 5) de una tabla DynamoDB es anticipar tus patrones de consulta más frecuentes, y modelar la clave de forma que esas consultas frecuentes puedan resolverse con Query, reservando Scan únicamente para operaciones poco frecuentes donde el coste de examinar la tabla completa es aceptable (por ejemplo, una exportación completa ocasional, o una tabla deliberadamente pequeña que sabes que nunca va a crecer significativamente).

**Analogía:** Query es como consultar el índice de un libro para ir directamente a la página del tema que buscas. Scan es como leer el libro completo, página por página, para encontrar las menciones de ese mismo tema, sin usar el índice en absoluto. Ambos métodos encuentran la información correcta, pero uno escala perfectamente con libros de cualquier tamaño, y el otro se vuelve progresivamente más lento cuanto más grueso es el libro.

**¿Por qué es importante?** Depender de Scan como estrategia principal de consulta es uno de los errores de diseño más comunes y más costosos al empezar a trabajar con DynamoDB, especialmente entre quienes vienen de un mundo SQL donde una consulta con `WHERE` sobre cualquier columna es igual de "barata" independientemente de si esa columna es la clave primaria o no. En DynamoDB, esa suposición simplemente no aplica, y diseñar bien la clave primaria y los índices desde el principio es lo que evita depender de Scan más adelante.

**Diagrama:**

```mermaid
flowchart LR
    Q["Query usuario_id = u-001; lee solo items de esa particion"]
    S["Scan estado pendiente; examina todos los items de la tabla"]
```

---

#### Paso 4 · Demostración guiada

En `examples/rutaflow/cloud/template.yaml` (líneas 45-60), ShipmentEvents está definida con clave primaria shipmentId+sequence. Aquí mides el costo de ambas operaciones:

```bash
aws dynamodb scan --table-name ShipmentEvents --select COUNT
aws dynamodb query --table-name ShipmentEvents \
  --key-condition-expression "shipmentId = :id" \
  --expression-attribute-values '{":id":{"S":"env-4471"}}' --select COUNT
```
Resultado esperado: el `scan` reporta `ScannedCount` igual al total de eventos de TODOS los envíos que creaste en este módulo (`env-4471` y `env-5002` juntos); la `query` reporta `ScannedCount` igual solo a los eventos de `env-4471` — la diferencia es exactamente el costo que pagarías de más con Scan en una tabla real con miles de envíos.
#### Paso 5 · Práctica guiada
Pista: agregá `--filter-expression "tipo = :t" --expression-attribute-values '{":t":{"S":"entregado"}}'` al `scan` del Paso 4 para provocar el fallo deliberado de rendimiento: `Count` baja (solo los eventos `entregado`), pero `ScannedCount` se queda igual de alto — el filtro se aplicó después de leer la tabla completa, no antes.
#### Paso 6 · Práctica independiente
Repetí la comparación `scan` vs `query` después de insertar 5 eventos más de `env-5002`, y confirmá que el `ScannedCount` de la `query` sobre `env-4471` no cambió, mientras que el del `scan` sí.
#### Paso 7 · Cierre
Entregá los dos `ScannedCount` del Paso 4, el `scan` con filtro del Paso 5 y la comparación del Paso 6; explicá en una frase por qué RutaFlow no podría usar Scan para su API de tracking en producción. Siguiente paso: seguridad. Errores comunes: filtrar después de leer y no paginar. Fuente oficial: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html.

## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** crear una tabla de tareas con clave primaria simple, realizar operaciones CRUD completas, y comparar directamente el comportamiento de Query frente a Scan.

**Requisitos previos:** Floci corriendo con el servicio DynamoDB activo, AWS CLI configurada contra `http://localhost:4566`.

### Laboratorio 4.1 — CRUD completo

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crear la tabla | `aws dynamodb create-table --table-name Tareas --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST` | Crea una tabla con clave primaria simple `id` de tipo string | Un JSON con `TableDescription` y `TableStatus: ACTIVE` (o `CREATING`) |
| 2 | Insertar un item | `aws dynamodb put-item --table-name Tareas --item '{"id":{"S":"t-001"},"titulo":{"S":"Comprar leche"},"estado":{"S":"pendiente"}}'` | Crea un item nuevo con tres atributos | Sin salida (comando exitoso) |
| 3 | Obtener el item por su clave | `aws dynamodb get-item --table-name Tareas --key '{"id":{"S":"t-001"}}'` | Recupera el item completo por su clave primaria | Un JSON con `Item` conteniendo los tres atributos |
| 4 | Actualizar un atributo | `aws dynamodb update-item --table-name Tareas --key '{"id":{"S":"t-001"}}' --update-expression "SET estado = :nuevo" --expression-attribute-values '{":nuevo":{"S":"hecho"}}'` | Modifica solo el atributo `estado`, sin tocar los demás | Sin salida (a menos que uses `--return-values ALL_NEW`) |
| 5 | Confirmar la actualización | `aws dynamodb get-item --table-name Tareas --key '{"id":{"S":"t-001"}}'` | Verifica que `estado` cambió a `hecho` | El JSON muestra `"estado":{"S":"hecho"}` |
| 6 | Eliminar el item | `aws dynamodb delete-item --table-name Tareas --key '{"id":{"S":"t-001"}}'` | Elimina el item de la tabla | Sin salida (comando exitoso) |
| 7 | Confirmar que ya no existe | `aws dynamodb get-item --table-name Tareas --key '{"id":{"S":"t-001"}}'` | El item ya no debería existir | Un JSON vacío, sin clave `Item` |

### Laboratorio 4.2 — Query vs Scan

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Insertar varios items de prueba | Repite `put-item` con `id: t-002, t-003, t-004`, variando `estado` entre `pendiente` y `hecho` | Prepara datos suficientes para comparar ambas operaciones | Cuatro items en total en la tabla (incluyendo uno nuevo con `id: t-001` si lo recreaste) |
| 2 | Ejecutar un Scan completo | `aws dynamodb scan --table-name Tareas` | Devuelve todos los items de la tabla, sin usar ninguna clave como filtro de acceso | Un JSON con `Items` conteniendo los cuatro items y `Count: 4` |
| 3 | Ejecutar una Query por clave exacta | `aws dynamodb query --table-name Tareas --key-condition-expression "id = :valor" --expression-attribute-values '{":valor":{"S":"t-002"}}'` | Devuelve únicamente el item cuya clave coincide exactamente | Un JSON con `Items` conteniendo solo el item `t-002` y `Count: 1` |
| 4 | Comparar el campo `ScannedCount` de ambas respuestas | Revisa el campo `ScannedCount` en la salida del Scan del paso 2 frente al de la Query del paso 3 | `ScannedCount` indica cuántos items examinó DynamoDB internamente antes de aplicar cualquier filtro | El Scan reporta `ScannedCount: 4` (examinó toda la tabla); la Query reporta `ScannedCount: 1` (fue directo al item) |

**Comprobación visual:** revisa **Cloud Explorer → Database** para conocer el modelo unificado. DynamoDB está conectado desde la versión 0.1.0, y desde la versión 0.5.0 el explorer también permite crear registros NoSQL directamente desde la UI — si tu versión es anterior a 0.5.0, esa creación visual puede no estar disponible todavía y debés verificar el changelog en github.com/floci-io/floci-ui/releases. En cualquier versión, para este laboratorio `get-item`, `query`, `scan` y sus contadores siguen siendo la verificación autoritativa; no reemplaces esa evidencia por una captura de pantalla.

**Verificación:** el laboratorio se considera exitoso si, tras el paso 7 del Laboratorio 4.1, `get-item` devuelve un resultado vacío confirmando el borrado, y si, en el Laboratorio 4.2, el `ScannedCount` de la Query es igual al número de items que realmente coinciden, mientras que el del Scan es igual al total de items de la tabla, evidenciando la diferencia de eficiencia entre ambas operaciones. Registra también esta limitación visual como parte del diagnóstico, no como fallo del runtime.

**Errores comunes y soluciones**

- **`ValidationException: One or more parameter values were invalid` en `put-item`.** Casi siempre significa que el JSON del `--item` no anota correctamente los tipos de dato (por ejemplo, escribir `{"titulo":"texto"}` en vez de `{"titulo":{"S":"texto"}}`). Revisa que cada atributo tenga su tipo explícito.
- **`ResourceNotFoundException` al ejecutar cualquier operación sobre la tabla.** La tabla todavía se está creando (el estado `CREATING` puede tardar unos segundos incluso en Floci), o el nombre está mal escrito. Espera con `aws dynamodb wait table-exists --table-name Tareas` antes de operar sobre ella.
- **`update-item` no falla pero el atributo no cambia.** Revisa que el nombre del atributo en `--update-expression` no sea una palabra reservada de DynamoDB (como `status` o `name`); si lo es, debes usar un `ExpressionAttributeNames` para referenciarlo de forma segura en vez de escribirlo directamente en la expresión.
- **Confundir `Count` con `ScannedCount` en la salida de Query o Scan.** `Count` es cuántos items se devolvieron después de aplicar cualquier filtro; `ScannedCount` es cuántos items se examinaron internamente antes del filtro. En una Query sin filtro adicional ambos suelen coincidir; en un Scan con filtro, `ScannedCount` casi siempre será mayor que `Count`, y esa diferencia es precisamente la evidencia del coste oculto de un Scan filtrado.

---

## Referencia: ¿Cuándo usar SQL vs NoSQL vs Serverless?

Después de completar este módulo + Módulo 5 (Lambda), tienes todas las herramientas para elegir qué usar en arquitectura real. Aquí está la matriz de decisión que RutaFlow usa:

| Aspecto | Base SQL (RDS) | NoSQL (DynamoDB) | Serverless (Lambda) |
|---------|---|---|---|
| **Escalado** | Vertical (servidor más grande) | Horizontal (automático, sin ops) | Automático, sin servidores |
| **Esquema** | Fijo, cambios requieren migration | Flexible, sin migration | N/A (es código, no data) |
| **Transacciones ACID** | Sí, multi-tabla | Sí, limitadas a 1 tabla | Requiere coordinación externa |
| **Latencia P50** | 1-5ms (local) | <1ms (particionado) | 50-2000ms (depende cold start) |
| **Costo en producción** | Reserva fija + uso | Pago por request + almacenamiento | Pago por invocación + ejecución |
| **Caso de uso ideal** | Datos relacionados, esquema estable | Eventos, log, datos de acceso predecible | Procesamiento de eventos, APIs |
| **¿Gestión operacional?** | Sí (parches, backups, réplicas) | Mínima (AWS lo maneja) | Ninguna (AWS lo maneja) |
| **Ejemplo en RutaFlow** | Datos de clientes, direcciones | ShipmentEvents, rastreo en tiempo real | confirmar-entrega, procesar colas |

**La decisión de RutaFlow:**
- **RDS:** Datos de clientes y direcciones (relacionados, esquema estable)
- **DynamoDB:** Eventos de envío (OLTP de altísima concurrencia, acceso predecible por shipmentId)
- **Lambda:** Procesamiento de eventos (confirmación de entrega cuando llega mensaje a cola)

Ninguna de las tres es "mejor" en general — es una elección según el problema. La arquitectura completa de RutaFlow las usa TODAS las tres en conjunto.

---
