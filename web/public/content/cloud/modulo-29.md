# Módulo 29: FinOps y gobierno de cuenta — Cost Explorer, Pricing, BCM Data Exports, Resource Groups Tagging y STS


## Aprende construyendo


### Tema 1: Cost Explorer — costos sintetizados a partir de tu estado real · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a comprobar que el costo sintetizado de Floci cambia cuando creás y borrás un bucket real, en vez de devolver números inventados. Prerrequisitos: Módulo 2 completo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a comprobar que el costo sintetizado de Floci cambia cuando creás y borrás un bucket real, en vez de devolver números inventados.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Cost Explorer es un libro contable que agrupa el consumo real por dimensiones (servicio, tag, fecha) — un contador que revisa qué tenés encendido ahora mismo, no una factura ficticia desconectada de tu estado real.

**Conceptos clave:** `GetCostAndUsage`, enumerador de uso de recursos, agrupación por dimensión.

Cost Explorer en Floci no factura dinero real —obviamente, no hay tarjeta de crédito involucrada—, pero tampoco devuelve números inventados al azar: sintetiza sus respuestas a partir del estado real de tus recursos en Floci, multiplicado por la instantánea de precios incluida del servicio Pricing. Esto significa que si creas una tabla DynamoDB o lanzas una instancia EC2 y luego consultas `GetCostAndUsage`, verás ese recurso reflejado en el desglose de costo — y si lo eliminas, tu próxima consulta lo refleja también. Cada servicio de Floci que quiere participar en este reporte de costos implementa un pequeño componente (`ResourceUsageEnumerator`) que describe qué tiene actualmente en uso; los servicios sin un modelo de precio específico simplemente aparecen en el catálogo con cantidad cero, visibles pero sin costo asociado.

Puedes agrupar y filtrar exactamente como en AWS real: por servicio, por tipo de recurso, por rango de fechas y granularidad (diaria, mensual). Lo que todavía no está implementado son las funcionalidades más avanzadas — previsión de costos futuros, recomendaciones de dimensionamiento, o el cálculo completo de utilización de instancias reservadas y planes de ahorro, que devuelven estructuras vacías o en cero.

**Analogía:** Cost Explorer en Floci es como un contador que revisa exactamente qué máquinas tienes encendidas en tu taller ahora mismo y te dice cuánto costarían según la tarifa de mercado, en vez de mostrarte una factura ficticia desconectada de lo que realmente tienes funcionando.

**¿Por qué es importante?** Practicar la lectura de reportes de costo agrupados por servicio y dimensión —la habilidad central de FinOps— sin el riesgo de generar una factura real mientras aprendes es exactamente el tipo de práctica segura que un emulador local debe ofrecer.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-29/tema-1-cost-explorer.sh — ejecutar con: bash tema-1-cost-explorer.sh
aws s3 mb s3://demo-costo-antes 2>/dev/null
aws ce get-cost-and-usage --time-period Start=2026-01-01,End=2026-02-01 \
  --granularity MONTHLY --metrics UnblendedCost --group-by Type=DIMENSION,Key=SERVICE
```

En el comando, `--time-period` es la bandera que acota el rango de fechas a analizar; `--granularity` es la bandera que define si el desglose es diario o mensual; `--metrics` es la bandera que elige qué métrica de costo devolver (aquí, costo no combinado); `--group-by` es la bandera que indica por qué dimensión agrupar la respuesta (aquí, por servicio).

**Resultado esperado:** el desglose incluye `S3` con un costo distinto de cero, reflejando el bucket que acabas de crear — la prueba de que Cost Explorer sintetiza sobre tu estado real, no sobre datos inventados.

**Modifica esto:** elimina el bucket con `aws s3 rb s3://demo-costo-antes` y vuelve a consultar `get-cost-and-usage`: confirma que el costo de S3 cambia en la siguiente consulta.

**Cuándo no usarlo:** no uses estos números para decisiones de presupuesto reales; son sintéticos a partir de una instantánea de precios mínima, no una factura real de AWS.

**Cómo crece tu proyecto:** este reporte te permite estimar, mientras desarrollas, cuánto costaría en AWS real la infraestructura que el proyecto va acumulando módulo a módulo.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Genera el reporte local de costes del entorno de entregas y relaciona sus filas con recursos creados. Etiquétalo como estimación sintetizada: no es una factura ni predice el gasto real.

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
1. Identifica el problema que cost explorer — costos sintetizados a partir de tu estado real resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Cost Explorer — costos sintetizados a partir de tu estado real se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Cost Explorer — costos sintetizados a partir de tu estado real | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses cost explorer — costos sintetizados a partir de tu estado real por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: cost explorer — costos sintetizados a partir de tu estado real funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Cost Explorer — costos sintetizados a partir de tu estado real existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve cost explorer — costos sintetizados a partir de tu estado real en tu contexto?
2. ¿Cómo sabrías que cost explorer — costos sintetizados a partir de tu estado real no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar cost explorer — costos sintetizados a partir de tu estado real?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-29/tema-1-cost-explorer.sh — ejecutar con: bash tema-1-cost-explorer.sh
aws s3 mb s3://demo-costo-antes 2>/dev/null
aws ce get-cost-and-usage --time-period Start=2026-01-01,End=2026-02-01 \
  --granularity MONTHLY --metrics UnblendedCost --group-by Type=DIMENSION,Key=SERVICE
```

```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
aws s3 mb s3://demo-costo-antes
aws ce get-cost-and-usage --time-period Start=2026-01-01,End=2026-02-01 \
  --granularity MONTHLY --metrics UnblendedCost --group-by Type=DIMENSION,Key=SERVICE
```

</details>

### Tema 2: Pricing — catálogo de tarifas de referencia · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a consultar el catálogo de tarifas que el Tema 1 usa por detrás para sintetizar el costo de la infraestructura de RutaFlow. Prerrequisitos: Tema 1 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a consultar el catálogo de tarifas que el Tema 1 usa por detrás para sintetizar el costo de la infraestructura de RutaFlow.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en pricing — catálogo de tarifas de referencia como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que pricing — catálogo de tarifas de referencia resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Pricing — catálogo de tarifas de referencia se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Pricing — catálogo de tarifas de referencia | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses pricing — catálogo de tarifas de referencia por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: pricing — catálogo de tarifas de referencia funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Pricing — catálogo de tarifas de referencia existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve pricing — catálogo de tarifas de referencia en tu contexto?
2. ¿Cómo sabrías que pricing — catálogo de tarifas de referencia no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar pricing — catálogo de tarifas de referencia?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-29/tema-2-pricing.sh — ejecutar con: bash tema-2-pricing.sh
aws pricing describe-services --service-code AmazonEC2
aws pricing get-products --service-code AmazonEC2 \
  --filters 'Type=TERM_MATCH,Field=instanceType,Value=t3.micro' 'Type=TERM_MATCH,Field=regionCode,Value=us-east-1' \
  --query 'PriceList[0]' --output text
```

```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
aws pricing describe-services --service-code AmazonEC2
aws pricing get-products --service-code AmazonEC2 \
  --filters 'Type=TERM_MATCH,Field=instanceType,Value=t3.micro' 'Type=TERM_MATCH,Field=regionCode,Value=us-east-1' \
  --query 'PriceList[0]' --output text
```

</details>

### Tema 3: BCM Data Exports — reportes de costo en formato estándar · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a generar el reporte de costo de RutaFlow en formato FOCUS, el estándar que una herramienta externa de FinOps podría consumir directamente. Prerrequisitos: Temas 1-2 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a generar el reporte de costo de RutaFlow en formato FOCUS, el estándar que una herramienta externa de FinOps podría consumir directamente.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Exportar es pedirle al contador que entregue el reporte siempre en el mismo formato estándar de la industria, no un PDF de formato libre que cada quien interpreta distinto.

**Conceptos clave:** `CreateExport`, formato Parquet, esquema FOCUS, ciclo de vida de ejecución.

BCM Data Exports resuelve la necesidad de sacar tus datos de costo hacia un formato estándar que herramientas de analítica externas puedan consumir directamente: creas una exportación (`CreateExport`) especificando un destino S3 y un formato de salida —Parquet es el único formato de emisión implementado actualmente en Floci—, y el servicio genera archivos siguiendo el esquema FOCUS 1.2 (FinOps Open Cost and Usage Specification), un estándar de la industria para reportes de costo que no es exclusivo de AWS. Cada ejecución exitosa transiciona de `INITIATION_IN_PROCESS` a `DELIVERY_SUCCESS` (o `DELIVERY_FAILURE`), y produce un archivo Parquet real en tu bucket S3 mediante el mismo motor DuckDB sidecar (`floci-duck`) que ya conociste con Athena en el Módulo 19.

Un detalle importante: aunque le pasas una consulta SQL en `DataQuery.QueryStatement`, Floci no evalúa ese SQL —lo almacena fielmente para que tu código de infraestructura funcione sin cambios, pero la forma de salida real está determinada por el esquema FOCUS incluido, no por tu consulta personalizada.

**Analogía:** BCM Data Exports es como pedirle a tu contador que te entregue el reporte financiero siempre en el mismo formato estándar de la industria, en vez de un PDF con formato libre que cada quien interpreta distinto: la estandarización es lo que permite que herramientas externas lo procesen automáticamente sin adaptación caso por caso.

**¿Por qué es importante?** El esquema FOCUS es un estándar cada vez más adoptado en la industria de FinOps precisamente porque permite comparar costos entre proveedores de nube distintos con el mismo formato — practicar su generación aquí te familiariza con un formato que vas a encontrar en herramientas de análisis de costo reales.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-29/tema-3-bcm-export.sh — ejecutar con: bash tema-3-bcm-export.sh
aws s3 mb s3://demo-facturacion
aws bcm-data-exports create-export --export \
  '{"Name":"demo-reporte","DataQuery":{"QueryStatement":"SELECT * FROM COST_AND_USAGE_REPORT"},"DestinationConfigurations":{"S3Destination":{"S3Bucket":"demo-facturacion","S3Prefix":"focus","S3Region":"us-east-1","S3OutputConfigurations":{"Format":"PARQUET","Compression":"PARQUET","OutputType":"CUSTOM","Overwrite":"OVERWRITE_REPORT"}}},"RefreshCadence":{"Frequency":"SYNCHRONOUS"}}'
aws s3 ls s3://demo-facturacion/focus/ --recursive
```

`--export` es la bandera que recibe el objeto JSON completo que describe la exportación: nombre, consulta, destino S3 y formato de salida — es el único argumento del comando, pero concentra toda la configuración.

**Resultado esperado:** `create-export` devuelve un `ExportArn`; `s3 ls` muestra un archivo `.parquet` real generado por el motor DuckDB sidecar, siguiendo el esquema FOCUS 1.2.

**Modifica esto:** cambia `"Format"` a `"CSV"` y confirma que `create-export` falla con `ValidationException` — solo Parquet está implementado en Floci hoy.

**Cuándo no usarlo:** no esperes que el `QueryStatement` que pasaste filtre el contenido del reporte; Floci lo almacena pero no lo evalúa, la salida siempre sigue el esquema FOCUS completo.

**Cómo crece tu proyecto:** este export es el que El proyecto enviaría a una herramienta externa de FinOps para comparar su costo en AWS, Azure y GCP con el mismo formato estándar.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Exporta el coste de laboratorio y valida columnas, moneda y periodo antes de agregarlo. Una fila con unidad distinta debe detectarse en vez de sumarse silenciosamente al total.

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
1. Identifica el problema que bcm data exports — reportes de costo en formato estándar resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| BCM Data Exports — reportes de costo en formato estándar se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar BCM Data Exports — reportes de costo en formato estándar | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses bcm data exports — reportes de costo en formato estándar por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: bcm data exports — reportes de costo en formato estándar funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- BCM Data Exports — reportes de costo en formato estándar existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve bcm data exports — reportes de costo en formato estándar en tu contexto?
2. ¿Cómo sabrías que bcm data exports — reportes de costo en formato estándar no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar bcm data exports — reportes de costo en formato estándar?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-29/tema-3-bcm-export.sh — ejecutar con: bash tema-3-bcm-export.sh
aws s3 mb s3://demo-facturacion
aws bcm-data-exports create-export --export \
  '{"Name":"demo-reporte","DataQuery":{"QueryStatement":"SELECT * FROM COST_AND_USAGE_REPORT"},"DestinationConfigurations":{"S3Destination":{"S3Bucket":"demo-facturacion","S3Prefix":"focus","S3Region":"us-east-1","S3OutputConfigurations":{"Format":"PARQUET","Compression":"PARQUET","OutputType":"CUSTOM","Overwrite":"OVERWRITE_REPORT"}}},"RefreshCadence":{"Frequency":"SYNCHRONOUS"}}'
aws s3 ls s3://demo-facturacion/focus/ --recursive
```

```bash
aws s3 mb s3://demo-facturacion
aws bcm-data-exports create-export --export \
  '{"Name":"demo-reporte","DataQuery":{"QueryStatement":"SELECT * FROM COST_AND_USAGE_REPORT"},"DestinationConfigurations":{"S3Destination":{"S3Bucket":"demo-facturacion","S3Prefix":"focus","S3Region":"us-east-1","S3OutputConfigurations":{"Format":"PARQUET","Compression":"PARQUET","OutputType":"CUSTOM","Overwrite":"OVERWRITE_REPORT"}}},"RefreshCadence":{"Frequency":"SYNCHRONOUS"}}'
aws s3 ls s3://demo-facturacion/focus/ --recursive
```

</details>

### Tema 4: Resource Groups Tagging API — descubrimiento centralizado por etiqueta · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a etiquetar con Proyecto=rutaflow recursos de dos servicios distintos y a descubrirlos con una sola consulta. Prerrequisitos: Módulos 2 y 4.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a etiquetar con Proyecto=rutaflow recursos de dos servicios distintos y a descubrirlos con una sola consulta.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Un tag es una etiqueta contable que conecta un recurso con su responsable o proyecto; Resource Groups Tagging API es la búsqueda universal que cruza todos los servicios a la vez.

**Conceptos clave:** `TagResources`, `GetResources`, filtro de tipo de recurso, ARN arbitrario.

Ya has etiquetado recursos individualmente en varios módulos de este curso — un bucket S3 aquí, una tabla DynamoDB allá. Resource Groups Tagging API resuelve el problema de descubrir todos tus recursos etiquetados de una forma específica, sin importar a qué servicio pertenecen, con una sola consulta: `GetResources` con un filtro como `Key=Environment,Values=dev` te devuelve una lista de ARNs de cualquier servicio —Lambda, EC2, S3, lo que sea— que tenga esa etiqueta, algo que de otra forma requeriría consultar cada servicio por separado y cruzar los resultados tú mismo.

El servicio acepta ARNs de recursos completamente arbitrarios —no valida que el recurso exista realmente en otro servicio emulado antes de aceptar sus etiquetas—, lo que lo hace útil incluso para etiquetar conceptualmente recursos que gestionas fuera de Floci. `GetTagKeys` y `GetTagValues` te permiten además descubrir qué claves y valores de etiqueta existen actualmente en tu cuenta, útil para auditar consistencia de tu esquema de etiquetado (¿todo el mundo usa `Environment` o algunos usan `env`?).

**Analogía:** Resource Groups Tagging API es como un sistema de búsqueda universal en un edificio de oficinas que te permite preguntar "muéstrame todo lo etiquetado como 'urgente'", sin importar si está en el departamento de finanzas, recursos humanos o logística — una sola pregunta que cruza todos los departamentos a la vez.

**¿Por qué es importante?** A medida que una cuenta crece a decenas o cientos de recursos repartidos entre múltiples servicios, tener una forma centralizada de descubrimiento por etiqueta —en vez de recordar consultar cada servicio individualmente— es lo que hace posible auditorías de costo, seguridad o cumplimiento a escala.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-29/tema-4-tagging.sh — ejecutar con: bash tema-4-tagging.sh
aws resourcegroupstaggingapi tag-resources \
  --resource-arn-list arn:aws:s3:::demo-facturacion --tags Proyecto=demo
aws resourcegroupstaggingapi tag-resources \
  --resource-arn-list arn:aws:dynamodb:us-east-1:000000000000:table/demo-entregas --tags Proyecto=demo
aws resourcegroupstaggingapi get-resources --tag-filters Key=Proyecto,Values=demo
```

`--resource-arn-list` es la bandera que indica a qué recurso (o recursos, separados por espacio) aplicar las etiquetas; `--tags` es la bandera con los pares clave-valor a asignar; en la consulta, `--tag-filters` es la bandera que acota la búsqueda a los recursos que tengan la etiqueta indicada.

**Resultado esperado:** `get-resources` devuelve ambos ARNs —el del bucket S3 y el de la tabla DynamoDB— en una sola respuesta, aunque pertenecen a servicios completamente distintos.

**Modifica esto:** usa `get-tag-keys` y `get-tag-values` para auditar qué claves y valores de etiqueta existen en tu cuenta, y confirma que `Proyecto`/`demo` aparece en ambos listados.

**Cuándo no usarlo:** no confíes en `tag-resources` para validar que el recurso existe realmente; acepta ARNs arbitrarios sin verificar el servicio referenciado.

**Cómo crece tu proyecto:** esta etiqueta común permite auditar de un vistazo todos los recursos que pertenecen al proyecto integrador, sin importar el servicio.

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
1. Identifica el problema que resource groups tagging api — descubrimiento centralizado por etiqueta resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Resource Groups Tagging API — descubrimiento centralizado por etiqueta se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Resource Groups Tagging API — descubrimiento centralizado por etiqueta | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses resource groups tagging api — descubrimiento centralizado por etiqueta por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: resource groups tagging api — descubrimiento centralizado por etiqueta funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Resource Groups Tagging API — descubrimiento centralizado por etiqueta existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve resource groups tagging api — descubrimiento centralizado por etiqueta en tu contexto?
2. ¿Cómo sabrías que resource groups tagging api — descubrimiento centralizado por etiqueta no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar resource groups tagging api — descubrimiento centralizado por etiqueta?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-29/tema-4-tagging.sh — ejecutar con: bash tema-4-tagging.sh
aws resourcegroupstaggingapi tag-resources \
  --resource-arn-list arn:aws:s3:::demo-facturacion --tags Proyecto=demo
aws resourcegroupstaggingapi tag-resources \
  --resource-arn-list arn:aws:dynamodb:us-east-1:000000000000:table/demo-entregas --tags Proyecto=demo
aws resourcegroupstaggingapi get-resources --tag-filters Key=Proyecto,Values=demo
```

```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
aws resourcegroupstaggingapi tag-resources \
  --resource-arn-list arn:aws:s3:::demo-facturacion --tags Proyecto=rutaflow
aws resourcegroupstaggingapi tag-resources \
  --resource-arn-list arn:aws:dynamodb:us-east-1:000000000000:table/ShipmentEvents --tags Proyecto=rutaflow
aws resourcegroupstaggingapi get-resources --tag-filters Key=Proyecto,Values=rutaflow
```

</details>

### Tema 5: STS en profundidad — identidad temporal y aislamiento multi-cuenta · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a confirmar en qué cuenta simulada está operando tu sesión antes de desplegar nada, y a comprobar el aislamiento entre dos cuentas distintas. Prerrequisitos: Módulo 7 completo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a confirmar en qué cuenta simulada está operando tu sesión antes de desplegar nada, y a comprobar el aislamiento entre dos cuentas distintas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
`GetCallerIdentity` es mostrar tu credencial actual; `AssumeRole` es cambiar de pase temporalmente, con un alcance distinto al tuyo.

**Conceptos clave:** `GetCallerIdentity`, `AssumeRole`, resolución de cuenta por AKID de 12 dígitos.

Ya usaste STS de forma implícita en el Módulo 7 al hablar de roles IAM, pero vale la pena profundizar en su rol central: `GetCallerIdentity` es la forma más simple y confiable de verificar que tus credenciales funcionan contra un endpoint —AWS real o Floci— antes de ejecutar lógica más compleja, y por eso es una verificación de humo (smoke test) tan común al inicio de pipelines de CI. `AssumeRole` es el mecanismo central para obtener credenciales temporales con permisos distintos a los tuyos —el patrón que ya usaste para dar permisos a instancias EC2 vía IMDS en el Módulo 21—, y Floci también soporta `AssumeRoleWithWebIdentity` (para flujos OIDC) y `AssumeRoleWithSAML` (para federación empresarial).

Recordarás del Módulo 0 que Floci resuelve el ID de cuenta a partir del `AWS_ACCESS_KEY_ID`: si tiene exactamente 12 dígitos, Floci lo usa directamente como cuenta; de lo contrario, cae al `FLOCI_DEFAULT_ACCOUNT_ID` (`000000000000` por defecto). Lo que quizás no viste en detalle es que las credenciales temporales generadas por `AssumeRole` se resuelven correctamente en esta misma cadena: si asumes un rol en la "cuenta" `222222222222`, los recursos que crees con esas credenciales temporales quedan aislados de los de la cuenta `111111111111`, replicando fielmente el aislamiento multi-cuenta de AWS real — el mismo patrón "assume-role-then-provision" que usarías en una organización AWS real con múltiples cuentas.

**Analogía:** `AssumeRole` es como un guardia de seguridad que te entrega una credencial temporal con un nivel de acceso distinto al tuyo habitual —válida solo por un tiempo limitado— después de verificar que tienes permiso para solicitarla, en vez de darte una llave maestra permanente que tendrías que recordar devolver.

**¿Por qué es importante?** El patrón de credenciales temporales con alcance limitado en vez de credenciales permanentes de amplio alcance es el principio de seguridad más importante de todo este curso, y STS es el servicio que lo hace posible en cada rincón de AWS: desde instancias EC2 hasta pipelines de CI/CD multi-cuenta.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-29/tema-5-sts.sh — ejecutar con: bash tema-5-sts.sh
aws sts get-caller-identity
AWS_ACCESS_KEY_ID=222222222222 AWS_SECRET_ACCESS_KEY=test \
  aws sts get-caller-identity --query 'Account' --output text
```

**Resultado esperado:** la primera llamada confirma tu cuenta actual (por defecto `000000000000`); la segunda, con un `AWS_ACCESS_KEY_ID` de 12 dígitos distinto, devuelve `222222222222` — la prueba de que Floci resuelve la cuenta directamente desde ese identificador.

**Modifica esto:** crea un bucket S3 con las credenciales de la cuenta `222222222222` y confirma que no aparece al listar buckets con las credenciales de la cuenta por defecto — el aislamiento multi-cuenta es real, no cosmético.

**Cuándo no usarlo:** no uses `GetCallerIdentity` como sustituto de una prueba de permisos real; confirma que las credenciales son válidas, no que tienen permiso para la acción específica que vas a ejecutar después.

**Cómo crece tu proyecto:** este patrón de aislamiento por cuenta es el que El proyecto usaría para separar completamente el entorno de staging del de producción dentro del mismo Floci.

---

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Asume el rol de prueba del consumidor y registra identidad y expiración sin imprimir el secreto. Comprueba aislamiento entre cuentas del laboratorio y documenta la validación adicional requerida en producción.

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
1. Identifica el problema que sts en profundidad — identidad temporal y aislamiento multi-cuenta resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| STS en profundidad — identidad temporal y aislamiento multi-cuenta se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar STS en profundidad — identidad temporal y aislamiento multi-cuenta | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses sts en profundidad — identidad temporal y aislamiento multi-cuenta por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: sts en profundidad — identidad temporal y aislamiento multi-cuenta funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- STS en profundidad — identidad temporal y aislamiento multi-cuenta existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve sts en profundidad — identidad temporal y aislamiento multi-cuenta en tu contexto?
2. ¿Cómo sabrías que sts en profundidad — identidad temporal y aislamiento multi-cuenta no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar sts en profundidad — identidad temporal y aislamiento multi-cuenta?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-29/tema-5-sts.sh — ejecutar con: bash tema-5-sts.sh
aws sts get-caller-identity
AWS_ACCESS_KEY_ID=222222222222 AWS_SECRET_ACCESS_KEY=test \
  aws sts get-caller-identity --query 'Account' --output text
```

```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
aws sts get-caller-identity
AWS_ACCESS_KEY_ID=222222222222 AWS_SECRET_ACCESS_KEY=test \
  aws sts get-caller-identity --query 'Account' --output text
```

</details>

### Laboratorio 29.1 — Costo sintetizado y exportación FOCUS

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por laboratorio 29.1 — costo sintetizado y exportación focus con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender laboratorio 29.1 — costo sintetizado y exportación focus te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en laboratorio 29.1 — costo sintetizado y exportación focus como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que laboratorio 29.1 — costo sintetizado y exportación focus resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Laboratorio 29.1 — Costo sintetizado y exportación FOCUS se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Laboratorio 29.1 — Costo sintetizado y exportación FOCUS | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses laboratorio 29.1 — costo sintetizado y exportación focus por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: laboratorio 29.1 — costo sintetizado y exportación focus funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Laboratorio 29.1 — Costo sintetizado y exportación FOCUS existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve laboratorio 29.1 — costo sintetizado y exportación focus en tu contexto?
2. ¿Cómo sabrías que laboratorio 29.1 — costo sintetizado y exportación focus no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar laboratorio 29.1 — costo sintetizado y exportación focus?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar laboratorio 29.1 — costo sintetizado y exportación focus.

</details>

### Laboratorio 29.2 — Descubrimiento centralizado por etiqueta

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por laboratorio 29.2 — descubrimiento centralizado por etiqueta con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender laboratorio 29.2 — descubrimiento centralizado por etiqueta te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en laboratorio 29.2 — descubrimiento centralizado por etiqueta como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que laboratorio 29.2 — descubrimiento centralizado por etiqueta resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Laboratorio 29.2 — Descubrimiento centralizado por etiqueta se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Laboratorio 29.2 — Descubrimiento centralizado por etiqueta | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses laboratorio 29.2 — descubrimiento centralizado por etiqueta por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: laboratorio 29.2 — descubrimiento centralizado por etiqueta funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Laboratorio 29.2 — Descubrimiento centralizado por etiqueta existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve laboratorio 29.2 — descubrimiento centralizado por etiqueta en tu contexto?
2. ¿Cómo sabrías que laboratorio 29.2 — descubrimiento centralizado por etiqueta no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar laboratorio 29.2 — descubrimiento centralizado por etiqueta?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar laboratorio 29.2 — descubrimiento centralizado por etiqueta.

</details>
