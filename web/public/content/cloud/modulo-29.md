# Módulo 29: FinOps y gobierno de cuenta — Cost Explorer, Pricing, BCM Data Exports, Resource Groups Tagging y STS


## Aprende construyendo

### Tema 1: Cost Explorer — costos sintetizados a partir de tu estado real

#### Paso 1 · Objetivo y preparación
Al finalizar vas a comprobar que el costo sintetizado de Floci cambia cuando creás y borrás un bucket real, en vez de devolver números inventados. Prerrequisitos: Módulo 2 completo.
#### Paso 2 · Contexto y caso real
RutaFlow quiere estimar, mientras desarrolla, cuánto costaría en AWS real la infraestructura que va acumulando módulo a módulo (S3, DynamoDB, Lambda) — sin esperar a tener una cuenta de AWS real ni una tarjeta de crédito de por medio.
#### Paso 3 · Teoría, modelo mental y analogía
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

#### Paso 4 · Demostración guiada
**Desde cero:** parte de una carpeta vacía, ejecuta el comando que aparece debajo y escribe el archivo que se muestra a continuación con el contenido de este tema.
```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
aws s3 mb s3://demo-costo-antes
aws ce get-cost-and-usage --time-period Start=2026-01-01,End=2026-02-01 \
  --granularity MONTHLY --metrics UnblendedCost --group-by Type=DIMENSION,Key=SERVICE
```
Resultado esperado: el desglose incluye `S3` con un costo distinto de cero, reflejando el bucket que acabás de crear — la prueba de que Cost Explorer sintetiza sobre tu estado real, no sobre datos inventados.
#### Paso 5 · Práctica guiada
Pista: repetí la consulta con `--time-period Start=2026-02-01,End=2026-01-01` (fecha de fin anterior a la de inicio) — ese es el fallo deliberado: la API rechaza el rango con un error de validación, porque un período que termina antes de empezar no tiene ningún significado posible.
#### Paso 6 · Práctica independiente
Eliminá el bucket (`aws s3 rb s3://demo-costo-antes`) y volvé a consultar `get-cost-and-usage` — confirmá que el costo de S3 bajó en la siguiente consulta, reflejando que ya no existe.
#### Paso 7 · Cierre
Entregá el costo reflejado tras crear el bucket del Paso 4, el rango inválido rechazado del Paso 5, y el costo actualizado tras borrarlo del Paso 6; explicá por qué estos números nunca deberían usarse para un presupuesto real. Siguiente paso: precios. Errores comunes: mezclar fechas y no etiquetar recursos. Fuente oficial: https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html.

### Tema 2: Pricing — catálogo de tarifas de referencia

#### Paso 1 · Objetivo y preparación
Al finalizar vas a consultar el catálogo de tarifas que el Tema 1 usa por detrás para sintetizar el costo de la infraestructura de RutaFlow. Prerrequisitos: Tema 1 de este módulo.
#### Paso 2 · Contexto y caso real
Antes de decidir si el nodo de reparto (Módulo 21) corre en `t3.micro` o en algo más grande, RutaFlow necesita saber el precio real de referencia por tipo de instancia y región, no una estimación de memoria.
#### Paso 3 · Teoría, modelo mental y analogía
La API de Pricing es un catálogo con filtros: elegís servicio, tipo y región, y te devuelve la tarifa vigente — no una base de datos exhaustiva de cada variante posible.

**Conceptos clave:** `GetProducts`, `DescribeServices`, instantánea de precios.

El servicio Pricing es el catálogo de tarifas del que Cost Explorer obtiene sus números: `DescribeServices` lista qué servicios tienen precios catalogados y qué atributos puedes consultar sobre ellos (por ejemplo, tipo de instancia o región), y `GetProducts` devuelve las ofertas de producto que coinciden con los filtros que apliques. La instantánea incluida en Floci es intencionalmente mínima —EC2, S3 y Lambda para `us-east-1`, con un puñado de tipos de instancia representativos— suficiente para ejercitar el análisis del formato de respuesta y la lógica de filtrado de tu código, no una base de datos de precios exhaustiva. Si necesitas cobertura más amplia, puedes apuntar Floci a tu propia instantánea de precios con `FLOCI_SERVICES_PRICING_SNAPSHOT_PATH`.

Un detalle de formato importante: AWS devuelve `GetProducts` como un arreglo de strings, donde cada string es en realidad un objeto JSON serializado que tienes que volver a parsear — un patrón algo inusual de la API real que Floci replica fielmente para que tu código de parseo funcione idéntico contra ambos.

**Analogía:** la instantánea de precios incluida es como una lista de precios de referencia de los productos más comunes de una tienda, útil para hacer cálculos aproximados rápidos, sin pretender ser el catálogo completo de cada variante y promoción disponible.

**¿Por qué es importante?** Entender que Pricing es deliberadamente una instantánea mínima —no un espejo completo y actualizado de las tarifas reales de AWS— evita que confíes en sus números para decisiones de presupuesto reales: para eso, siempre consulta la API de Pricing contra AWS real o la consola de precios oficial.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-29/tema-2-pricing.sh — ejecutar con: bash tema-2-pricing.sh
aws pricing describe-services --service-code AmazonEC2
aws pricing get-products --service-code AmazonEC2 \
  --filters 'Type=TERM_MATCH,Field=instanceType,Value=t3.micro' 'Type=TERM_MATCH,Field=regionCode,Value=us-east-1' \
  --query 'PriceList[0]' --output text
```

`--service-code` es la bandera que identifica el servicio de AWS a consultar (aquí, EC2); `--filters` es la bandera que acota la búsqueda a una combinación específica de atributos (tipo de instancia y región).

**Resultado esperado:** `describe-services` confirma qué atributos son filtrables para EC2; `get-products` devuelve un string que es en realidad JSON serializado — cópialo y pásalo por `python -m json.tool` para confirmarlo.

**Modifica esto:** repite la consulta cambiando `instanceType` a un valor que no existe en la instantánea (por ejemplo `x9.enorme`) y confirma que `PriceList` vuelve vacío en vez de fallar con error.

**Cuándo no usarlo:** no confíes en este catálogo para cotizar un presupuesto real; solo cubre EC2, S3 y Lambda en `us-east-1` con tipos representativos, no el catálogo completo de AWS.

**Cómo crece tu proyecto:** este catálogo es la fuente que consulta el Tema 1 para sintetizar el costo estimado de la infraestructura del proyecto.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Construye una estimación del almacenamiento de evidencias indicando región, unidad y volumen. Conserva la tarifa consultada y la fecha; cambiar una hipótesis debe modificar el cálculo de manera trazable.

#### Paso 4 · Demostración guiada
**Desde cero:** parte de una carpeta vacía, ejecuta el comando que aparece debajo y escribe el archivo que se muestra a continuación con el contenido de este tema.
```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
aws pricing describe-services --service-code AmazonEC2
aws pricing get-products --service-code AmazonEC2 \
  --filters 'Type=TERM_MATCH,Field=instanceType,Value=t3.micro' 'Type=TERM_MATCH,Field=regionCode,Value=us-east-1' \
  --query 'PriceList[0]' --output text
```
Resultado esperado: `get-products` devuelve un string que es en realidad JSON serializado — pasalo por `python3 -m json.tool` para confirmar la tarifa real de `t3.micro` en `us-east-1`, el mismo tipo de instancia que usa `demo-lc` del Módulo 21.
#### Paso 5 · Práctica guiada
Pista: repetí la consulta filtrando por `Field=instanceType,Value=x9.enorme` (un tipo que no existe en la instantánea) — ese es el fallo deliberado: `PriceList` vuelve vacío en vez de fallar con un error, porque la instantánea de Floci es intencionalmente mínima, no un espejo completo de AWS real.
#### Paso 6 · Práctica independiente
Repetí la consulta cambiando `regionCode` a otra región cubierta por la instantánea y compará el precio devuelto — documentá si la diferencia (o su ausencia) te sorprendió.
#### Paso 7 · Cierre
Entregá la tarifa real de `t3.micro` del Paso 4, el `PriceList` vacío del Paso 5, y la comparación entre regiones del Paso 6; explicá por qué esta instantánea mínima nunca debería usarse para cotizar un presupuesto real. Siguiente paso: exportación. Errores comunes: precio sin unidad y moneda incorrecta. Fuente oficial: https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/price-changes.html.

### Tema 3: BCM Data Exports — reportes de costo en formato estándar

#### Paso 1 · Objetivo y preparación
Al finalizar vas a generar el reporte de costo de RutaFlow en formato FOCUS, el estándar que una herramienta externa de FinOps podría consumir directamente. Prerrequisitos: Temas 1-2 de este módulo.
#### Paso 2 · Contexto y caso real
Si RutaFlow algún día compara su costo en AWS, Azure y GCP (Módulo 8) con una sola herramienta externa, esa herramienta necesita los tres reportes en el mismo formato estándar, no tres PDFs distintos con estructura libre.
#### Paso 3 · Teoría, modelo mental y analogía
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

#### Paso 4 · Demostración guiada
```bash
aws s3 mb s3://demo-facturacion
aws bcm-data-exports create-export --export \
  '{"Name":"demo-reporte","DataQuery":{"QueryStatement":"SELECT * FROM COST_AND_USAGE_REPORT"},"DestinationConfigurations":{"S3Destination":{"S3Bucket":"demo-facturacion","S3Prefix":"focus","S3Region":"us-east-1","S3OutputConfigurations":{"Format":"PARQUET","Compression":"PARQUET","OutputType":"CUSTOM","Overwrite":"OVERWRITE_REPORT"}}},"RefreshCadence":{"Frequency":"SYNCHRONOUS"}}'
aws s3 ls s3://demo-facturacion/focus/ --recursive
```
Resultado esperado: `create-export` devuelve un `ExportArn`; `s3 ls` muestra un archivo `.parquet` real generado por el motor DuckDB sidecar, siguiendo el esquema FOCUS 1.2 — el mismo formato que usarías para comparar costos entre proveedores.
#### Paso 5 · Práctica guiada
Pista: cambiá `"Format"` a `"CSV"` — ese es el fallo deliberado: `create-export` falla con `ValidationException`, porque solo Parquet está implementado en Floci hoy, aunque la documentación de AWS real mencione otros formatos.
#### Paso 6 · Práctica independiente
Descargá el archivo `.parquet` generado y confirmá con alguna herramienta local (por ejemplo, leerlo con `duckdb` o `pandas`) que sus columnas siguen el esquema FOCUS, no una estructura ad hoc inventada por Floci.
#### Paso 7 · Cierre
Entregá el export FOCUS generado del Paso 4, el formato CSV rechazado del Paso 5, y la validación de columnas del Paso 6; explicá por qué la estandarización del esquema es lo que permite comparar costos entre proveedores distintos. Siguiente paso: tags. Errores comunes: exportar sin retención y no validar columnas. Fuente oficial: https://docs.aws.amazon.com/cur/latest/userguide/what-is-data-exports.html.

### Tema 4: Resource Groups Tagging API — descubrimiento centralizado por etiqueta

#### Paso 1 · Objetivo y preparación
Al finalizar vas a etiquetar con `Proyecto=rutaflow` recursos de dos servicios distintos y a descubrirlos con una sola consulta. Prerrequisitos: Módulos 2 y 4.
#### Paso 2 · Contexto y caso real
RutaFlow tiene recursos repartidos entre S3, DynamoDB, SQS y más — auditar "todo lo que pertenece a este proyecto" consultando cada servicio por separado y cruzando resultados a mano no escala.
#### Paso 3 · Teoría, modelo mental y analogía
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

#### Paso 4 · Demostración guiada
**Desde cero:** parte de una carpeta vacía, ejecuta el comando que aparece debajo y escribe el archivo que se muestra a continuación con el contenido de este tema.
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
Resultado esperado: `get-resources` devuelve ambos ARNs —el bucket `demo-facturacion` y la tabla `ShipmentEvents`— en una sola respuesta, aunque pertenecen a servicios completamente distintos.
#### Paso 5 · Práctica guiada
Pista: probá `tag-resources --resource-arn-list arn:aws:s3:::este-bucket-no-existe --tags Proyecto=rutaflow` — ese es el fallo deliberado (al revés de lo que esperarías): la llamada se acepta sin error, porque el servicio no valida que el ARN corresponda a un recurso real en otro servicio emulado; la etiqueta queda "flotando" sobre un recurso que nunca existió.
#### Paso 6 · Práctica independiente
Usá `get-tag-keys` y `get-tag-values` para auditar qué claves y valores de etiqueta existen actualmente, y confirmá que `Proyecto`/`rutaflow` aparece en ambos listados — documentá qué política obligatoria impondrías (por ejemplo, "todo recurso nuevo debe tener `Proyecto` desde su creación") para que esto no dependa de acordarse después.
#### Paso 7 · Cierre
Entregá el descubrimiento cruzado del Paso 4, el ARN inexistente aceptado sin validar del Paso 5, y la política propuesta del Paso 6; explicá por qué ese comportamiento de "aceptar ARNs arbitrarios" es útil y riesgoso a la vez. Siguiente paso: identidad. Errores comunes: claves inconsistentes y tags ausentes en recursos nuevos. Fuente oficial: https://docs.aws.amazon.com/resourcegroupstagging/latest/APIReference/Welcome.html.

### Tema 5: STS en profundidad — identidad temporal y aislamiento multi-cuenta

#### Paso 1 · Objetivo y preparación
Al finalizar vas a confirmar en qué cuenta simulada está operando tu sesión antes de desplegar nada, y a comprobar el aislamiento entre dos cuentas distintas. Prerrequisitos: Módulo 7 completo.
#### Paso 2 · Contexto y caso real
Antes de que un pipeline de CI despliegue cambios de RutaFlow, necesita confirmar con certeza que está apuntando a la cuenta correcta (dev, no una de otro equipo) — el mismo smoke test que correría contra AWS real.
#### Paso 3 · Teoría, modelo mental y analogía
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

#### Paso 4 · Demostración guiada
**Desde cero:** parte de una carpeta vacía, ejecuta el comando que aparece debajo y escribe el archivo que se muestra a continuación con el contenido de este tema.
```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
aws sts get-caller-identity
AWS_ACCESS_KEY_ID=222222222222 AWS_SECRET_ACCESS_KEY=test \
  aws sts get-caller-identity --query 'Account' --output text
```
Resultado esperado: la primera llamada confirma la cuenta por defecto (`000000000000`); la segunda, con un `AWS_ACCESS_KEY_ID` de 12 dígitos distinto, devuelve `222222222222` — la prueba de que Floci resuelve la cuenta directamente desde ese identificador.
#### Paso 5 · Práctica guiada
Pista: creá una tabla DynamoDB usando las credenciales de la cuenta `222222222222`, y después intentá leerla con las credenciales por defecto de `000000000000` — ese es el fallo deliberado si lo esperás ver: `ResourceNotFoundException`, porque esa tabla simplemente no existe en la cuenta `000000000000`; el aislamiento multi-cuenta es real, no cosmético.
#### Paso 6 · Práctica independiente
Documentá, para un pipeline real de RutaFlow, por qué el primer paso antes de cualquier despliegue debería ser `get-caller-identity` — qué desastre evitaría detectar a tiempo que el pipeline apunta a la cuenta equivocada.
#### Paso 7 · Cierre
Entregá las dos identidades confirmadas del Paso 4, el aislamiento entre cuentas del Paso 5, y la justificación del smoke test del Paso 6; explicá por qué las credenciales temporales de alcance limitado son el principio de seguridad central que atraviesa todo este módulo. Siguiente paso: gobierno. Errores comunes: operar cuenta equivocada y no validar región. Fuente oficial: https://docs.aws.amazon.com/cli/latest/reference/sts/get-caller-identity.html.

## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** consultar el costo sintetizado de tus recursos actuales en Floci y exportarlo en formato FOCUS/Parquet, y luego etiquetar recursos de al menos dos servicios distintos y descubrirlos todos con una sola consulta de Resource Groups Tagging API.

**Requisitos previos:** al menos un bucket S3 y una tabla DynamoDB de módulos anteriores, y un bucket adicional para recibir la exportación de BCM Data Exports.

### Laboratorio 29.1 — Costo sintetizado y exportación FOCUS

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Consulta el costo agrupado por servicio | `aws ce get-cost-and-usage --time-period Start=2026-01-01,End=2026-02-01 --granularity MONTHLY --metrics UnblendedCost --group-by Type=DIMENSION,Key=SERVICE` | Refleja el costo sintetizado de tus recursos actuales | Un desglose con al menos S3 y DynamoDB si los tienes creados |
| 2 | Consulta el catálogo de precios de EC2 | `aws pricing get-products --service-code AmazonEC2 --filters 'Type=TERM_MATCH,Field=instanceType,Value=t3.micro' 'Type=TERM_MATCH,Field=regionCode,Value=us-east-1'` | Confirma la fuente de tarifas que usa Cost Explorer | Un `PriceList` con al menos una oferta de producto |
| 3 | Crea el bucket de exportación | `aws s3 mb s3://mi-facturacion` | Destino de la exportación FOCUS | Confirmación de creación |
| 4 | Crea la exportación | `aws bcm-data-exports create-export --export '{"Name":"reporte-mensual","DataQuery":{"QueryStatement":"SELECT * FROM COST_AND_USAGE_REPORT"},"DestinationConfigurations":{"S3Destination":{"S3Bucket":"mi-facturacion","S3Prefix":"focus","S3Region":"us-east-1","S3OutputConfigurations":{"Format":"PARQUET","Compression":"PARQUET","OutputType":"CUSTOM","Overwrite":"OVERWRITE_REPORT"}}},"RefreshCadence":{"Frequency":"SYNCHRONOUS"}}'` | Genera el reporte en formato FOCUS/Parquet de inmediato | Un `ExportArn` |
| 5 | Verifica el archivo generado | `aws s3 ls s3://mi-facturacion/focus/ --recursive` | Confirma que el Parquet real se escribió | Un archivo `.parquet` |

### Laboratorio 29.2 — Descubrimiento centralizado por etiqueta

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Etiqueta tu bucket S3 | `aws resourcegroupstaggingapi tag-resources --resource-arn-list arn:aws:s3:::curso-cloud-local --tags Proyecto=academia` | Añade una etiqueta común a un recurso S3 | `FailedResourcesMap` vacío |
| 2 | Etiqueta tu tabla DynamoDB | `aws resourcegroupstaggingapi tag-resources --resource-arn-list arn:aws:dynamodb:us-east-1:000000000000:table/mi-tabla --tags Proyecto=academia` | La misma etiqueta en un servicio completamente distinto | `FailedResourcesMap` vacío |
| 3 | Descubre ambos con una sola consulta | `aws resourcegroupstaggingapi get-resources --tag-filters Key=Proyecto,Values=academia` | Cruza servicios sin consultarlos por separado | Ambos ARNs (S3 y DynamoDB) en la respuesta |
| 4 | Verifica tu identidad de llamada | `aws sts get-caller-identity` | Confirma cuenta, usuario y ARN actuales | Tu `Account`, `UserId` y `Arn` |

**Verificación:** el laboratorio se considera exitoso si `s3 ls` confirma un archivo `.parquet` real generado por la exportación FOCUS, y si `get-resources` con el filtro `Proyecto=academia` devuelve tanto el ARN de tu bucket S3 como el de tu tabla DynamoDB en una sola respuesta, confirmando el descubrimiento cruzado entre servicios.

**Errores comunes y soluciones**

- **`get-cost-and-usage` devuelve costos en cero para un servicio que sí tienes en uso.** Revisa el Tema 1: solo los servicios con un enumerador de precio implementado (EC2, S3, Lambda) generan costo real; el resto aparece en el catálogo con cantidad cero — comportamiento esperado, no un error.
- **`create-export` falla con `ValidationException` en el formato.** Revisa que uses exactamente `"Format": "PARQUET"` y `"Compression": "PARQUET"`; CSV y GZIP todavía no están implementados en Floci.
- **`get-resources` no encuentra un recurso recién etiquetado.** Confirma que el ARN usado en `tag-resources` coincide exactamente —carácter por carácter, incluyendo la región y cuenta— con el que aparecería en `get-resources`; un ARN mal formado se acepta pero no se cruza correctamente.
- **`assume-role` con un AKID que no tiene 12 dígitos no aísla la cuenta esperada.** Revisa el Tema 5: solo un `AWS_ACCESS_KEY_ID` de exactamente 12 dígitos se usa directamente como ID de cuenta; cualquier otro formato cae al `FLOCI_DEFAULT_ACCOUNT_ID`.

---
