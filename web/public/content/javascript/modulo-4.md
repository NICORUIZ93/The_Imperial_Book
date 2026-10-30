# Módulo 4: Arrays y estructuras de datos funcionales


## Aprende construyendo

### Tema 1: map, filter, reduce, find, some/every

#### Paso 1 · Objetivo y preparación

Al finalizar podrás elegir el método de array según la intención y construir un pipeline que calcule la carga activa sin mutar entregas.

**Conocimiento previo:** funciones flecha, arrays, objetos y valores booleanos.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** El tablero del proyecto debe seleccionar guías activas, transformar sus datos y obtener totales. Usar un método con propósito claro permite leer la operación sin descifrar un bucle genérico.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** transformación (map), selección (filter), acumulación (reduce), búsqueda y comprobación booleana.

`map`, `filter` y `reduce` son los tres métodos funcionales fundamentales sobre arrays, y cada uno resuelve una intención distinta y bien delimitada. `map` transforma cada elemento de un array en otro valor, produciendo un array nuevo de la misma longitud; su uso correcto implica que la función pasada siempre devuelve un valor (si no se necesita un valor de retorno, probablemente no se necesita `map`, sino `forEach`). `filter` selecciona un subconjunto de elementos que cumplen una condición booleana, produciendo un array potencialmente más corto; `reduce` acumula todos los elementos de un array en un único valor final (que puede ser un número, un objeto, otro array, o cualquier estructura), siendo la herramienta más general y potente de las tres, capaz de expresar tanto `map` como `filter` si fuera necesario, aunque usar la herramienta más específica disponible produce código más legible.

Encadenar estos métodos (`array.filter(...).map(...)`) es un patrón extremadamente común que expresa un pipeline de transformación de datos de forma declarativa: primero seleccionar los elementos relevantes, luego transformarlos, en una única expresión legible de izquierda a derecha, en vez de un bucle imperativo con variables intermedias mutables. Es importante notar el coste de rendimiento de encadenar múltiples métodos: cada uno recorre el array completo de forma independiente, produciendo un array intermedio nuevo en cada paso; para arrays extremadamente grandes donde el rendimiento es crítico, un único `reduce` que haga todo el trabajo en una sola pasada puede ser preferible, aunque a costa de menor legibilidad.

`find` devuelve el primer elemento que cumple una condición (o `undefined` si ninguno la cumple), útil cuando se busca un único elemento específico en vez de una colección completa. `some` devuelve `true` si al menos un elemento cumple la condición; `every` devuelve `true` solo si todos los elementos la cumplen. Estos dos últimos son particularmente útiles para validaciones: `usuarios.every(u => u.activo)` responde directamente a la pregunta "¿están todos los usuarios activos?" sin necesidad de un bucle explícito con una bandera booleana manual.

Dominar cuándo usar cada uno de estos métodos frente a un bucle `for` tradicional es una señal de madurez en JavaScript funcional: los métodos funcionales comunican la intención directamente en el nombre del método (transformar, filtrar, acumular, buscar, comprobar), mientras que un bucle `for` genérico requiere leer el cuerpo completo para inferir qué se está haciendo realmente con los datos.

**Analogía:** `map` es como una línea de producción que transforma cada pieza que pasa por ella según una regla fija, produciendo una pieza nueva por cada una que entra; `filter` es un control de calidad que descarta las piezas que no cumplen un estándar; `reduce` es una prensa que combina todas las piezas que sobrevivieron en un único producto final consolidado.

**Diagrama:**

```mermaid
flowchart LR
    RAW["guías recibidas"] --> FILTER["filter: solo EN_RUTA"] --> MAP["map: extraer peso"] --> REDUCE["reduce: sumar carga"]
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea el ejemplo independiente y guarda `src/pipeline.js`:

```bash
mkdir ejemplo-arrays
cd ejemplo-arrays
npm init -y
mkdir src
```

```javascript
const guias = [
  { codigo: 'RF-101', estado: 'EN_RUTA', pesoKg: 2 },
  { codigo: 'RF-102', estado: 'ENTREGADA', pesoKg: 1.5 },
  { codigo: 'RF-103', estado: 'EN_RUTA', pesoKg: 3 }
];

const activas = guias.filter(guia => guia.estado === 'EN_RUTA');
const pesos = activas.map(guia => guia.pesoKg);
const cargaTotal = pesos.reduce((total, peso) => total + peso, 0);
console.log({ activas: activas.length, pesos, cargaTotal });
```

Ejecuta `node src/pipeline.js`. Resultado esperado: `{ activas: 2, pesos: [2, 3], cargaTotal: 5 }`. **Fallo deliberado:** quita el valor inicial de `reduce` y observa cómo el primer elemento se usa como acumulador; diagnostica la salida y corrígelo restaurando `0`.

#### Paso 5 · Práctica guiada

Usa `find` para localizar `RF-103`. **Pista:** prueba también `RF-999` y valida `undefined` antes de leer una propiedad.

#### Paso 6 · Práctica independiente

Calcula el peso promedio de guías activas en una sola pasada y en un pipeline legible. Compara resultados, caso vacío y trade-off de claridad frente a recorridos.

#### Paso 7 · Cierre y evidencia

Ya eliges transformación, selección, acumulación, búsqueda o comprobación según la pregunta. El siguiente tema elige estructuras por unicidad y tipo de clave. **Evidencia:** demuestra el resultado del tablero, el fallo de `reduce` y ambas versiones del promedio. Fuente oficial: [MDN — Array](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array).

**Errores comunes:** usar `map` sin retornar; omitir valor inicial en `reduce`; usar `filter` para buscar uno; encadenar pasadas costosas sin medir.

**Transferencia al proyecto integrador «Seguimiento público accesible»:** Filtra eventos públicos, localiza el más reciente y calcula cantidades por estado sin mutar la respuesta. Prueba historial vacío y duplicado, conservando una salida esperada para cada caso.

### Tema 2: Set y Map frente a Array y Object

#### Paso 1 · Objetivo y preparación

Al finalizar podrás escoger `Array`, `Object`, `Set` o `Map` según orden, duplicados, forma y claves dinámicas.

**Conocimiento previo:** arrays, objetos, iterables y comparación por referencia.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** El proyecto recibe escaneos repetidos y busca guías por número. `Set` expresa unicidad local y `Map` evita recorrer toda la lista en cada consulta.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** valores únicos (`Set`), claves de cualquier tipo (`Map`), orden de inserción garantizado.

`Set` almacena una colección de valores únicos, rechazando automáticamente duplicados en el momento de la inserción; convertir un array con duplicados a `Set` y de vuelta a array (`[...new Set(array)]`) es la forma idiomática y más concisa de eliminar duplicados en JavaScript moderno, reemplazando patrones anteriores más verbosos basados en `filter` combinado con `indexOf`. `Map` es una colección de pares clave-valor que, a diferencia de un objeto literal plano, acepta claves de cualquier tipo (no solo strings o symbols: un objeto, una función, o cualquier valor puede ser una clave de `Map`), y garantiza mantener el orden de inserción de forma predecible y bien especificada por el lenguaje.

La elección entre `Map` y un objeto plano para almacenar pares clave-valor depende del contexto: un objeto plano es apropiado cuando las claves son conocidas de antemano y fijas (representando la forma de un registro estructurado, como `{nombre, edad}`); `Map` es preferible cuando las claves son dinámicas y determinadas en tiempo de ejecución (por ejemplo, contando ocurrencias de palabras de un texto arbitrario), porque `Map` no tiene el riesgo de colisión con propiedades heredadas del prototipo de `Object` (como `toString` o `constructor`, que técnicamente podrían coincidir accidentalmente con una clave dinámica si se usara un objeto plano sin cuidado adicional).

`Map` también expone directamente su tamaño mediante la propiedad `size` (mientras que un objeto plano requiere `Object.keys(obj).length`, una operación adicional), y es directamente iterable con `for...of`, produciendo pares `[clave, valor]` en cada iteración sin necesidad de convertirlo primero a un array de entradas como se requeriría con `Object.entries()`. Estas diferencias, aunque parecen menores, tienen impacto real en la legibilidad y en la ausencia de casos límite inesperados al trabajar con datos verdaderamente dinámicos.

`Set` y `Map` no reemplazan a `Array` y `Object` de forma universal; cada estructura tiene su lugar según la naturaleza del problema: `Array` para colecciones ordenadas donde el índice numérico importa y puede haber duplicados, `Object` para registros con forma fija y conocida, `Set` para colecciones donde la unicidad es la propiedad central, y `Map` para diccionarios verdaderamente dinámicos donde las claves no se conocen de antemano.

Desde ECMAScript 2026, `Set` incorpora métodos de composición que antes requerían convertir a array y recombinar a mano: `union`, `intersection`, `difference`, `symmetricDifference`, `isSubsetOf`, `isSupersetOf` e `isDisjointFrom`. Todos devuelven un nuevo `Set` (o un booleano, en los de comparación) sin mutar los originales, aplicando directamente operaciones de teoría de conjuntos que antes exigían combinar `filter` con `.has()`:

```javascript
const enRuta = new Set(['RF-101', 'RF-102', 'RF-103']);
const conIncidencia = new Set(['RF-102', 'RF-104']);
console.log([...enRuta.difference(conIncidencia)]); // ['RF-101', 'RF-103']
console.log(enRuta.isDisjointFrom(new Set(['RF-999']))); // true
```

**Analogía:** un objeto plano es como un formulario impreso con campos fijos predefinidos (nombre, edad, dirección); un `Map` es como una libreta en blanco donde puedes escribir cualquier tipo de etiqueta en cualquier página sin restricción previa de formato; un `Set` es como una lista de invitados que automáticamente rechaza cualquier nombre que ya esté escrito, garantizando que nadie aparezca dos veces.

**Diagrama:**

```mermaid
flowchart TD
    NEED{"¿Qué representa el dato?"}
    NEED -->|"secuencia y duplicados"| ARRAY["Array"]
    NEED -->|"registro de forma fija"| OBJECT["Object"]
    NEED -->|"valores únicos"| SET["Set"]
    NEED -->|"claves dinámicas"| MAP["Map"]
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `ejemplo-set-map` y después guarda `src/index.js`:

```bash
mkdir ejemplo-set-map
cd ejemplo-set-map
npm init -y
mkdir src
```

```javascript
const escaneos = ['RF-101', 'RF-101', 'RF-102'];
const unicos = new Set(escaneos);
const porCodigo = new Map([
  ['RF-101', { estado: 'EN_RUTA' }],
  ['RF-102', { estado: 'ENTREGADA' }]
]);
console.log([...unicos], porCodigo.get('RF-101'), porCodigo.has('RF-999'));
```

Ejecuta `node src/index.js`. Resultado esperado: dos códigos únicos, el objeto de `RF-101` y `false`. **Fallo deliberado:** intenta `porCodigo['RF-101']`; obtendrás `undefined` porque `Map` se consulta con `get`, no con corchetes.

#### Paso 5 · Práctica guiada

Cuenta escaneos por código con `Map`. **Pista:** usa `(conteos.get(codigo) ?? 0) + 1` y verifica que `RF-101` queda en dos.

#### Paso 6 · Práctica independiente

Implementa un índice por objeto conductor como clave de `Map` y demuestra que dos objetos con iguales propiedades son claves distintas. Decide si el dominio necesita identidad u otro ID estable.

#### Paso 7 · Cierre y evidencia

Ya eliges estructuras por semántica y no por costumbre. El siguiente tema actualiza estructuras anidadas sin destruir versiones anteriores. **Evidencia:** demuestra el resultado, la búsqueda ausente, el conteo y la diferencia de identidad. Fuente oficial: [MDN — keyed collections](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Keyed_collections).

**Errores comunes:** creer que `Set` deduplica objetos por contenido; usar objeto plano con claves arbitrarias; leer `Map` con corchetes; tratar unicidad en memoria como restricción persistente.

**Transferencia al proyecto integrador «Seguimiento público accesible»:** Deduplica eventos por identificador y mantén su acceso directo en un Map. Inserta dos eventos con igual contenido pero distinto id y verifica que no los elimina por una comparación incorrecta.

### Tema 3: Inmutabilidad y actualización de estructuras anidadas

#### Paso 1 · Objetivo y preparación

Al finalizar podrás actualizar estructuras anidadas sin modificar versiones anteriores y decidir cuándo normalizar el estado.

**Conocimiento previo:** spread, referencias, `Map` y comparación de objetos.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** El proyecto necesita conservar estados anteriores para auditoría y para que la interfaz detecte cambios por referencia. Una copia superficial incompleta puede borrar país o mutar una dirección compartida.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** inmutabilidad, spread anidado, normalización de datos.

Actualizar datos sin mutar el original —crear una nueva copia con el cambio aplicado, en vez de modificar directamente la estructura existente— es una práctica central del JavaScript moderno, especialmente en el contexto de frameworks como React (que detectan cambios comparando referencias de objetos, un mecanismo que depende directamente de la inmutabilidad para funcionar correctamente y de forma eficiente). El operador spread permite esta actualización inmutable de forma concisa: `{...usuario, edad: 30}` crea un objeto nuevo con todas las propiedades de `usuario` copiadas superficialmente, sobreescribiendo solo `edad`, sin modificar el objeto `usuario` original en absoluto.

El caso de estructuras anidadas requiere spread en cada nivel de anidamiento que se quiera actualizar de forma inmutable, porque el spread es superficial (shallow): `{...usuario, direccion: {...usuario.direccion, ciudad: "Bogotá"}}` es necesario para actualizar `ciudad` sin mutar `usuario.direccion` original, porque un simple `{...usuario, direccion: {ciudad: "Bogotá"}}` reemplazaría todo el objeto `direccion` completo, perdiendo cualquier otra propiedad que tuviera (como `pais` o `codigoPostal`) que no se mencionó explícitamente en el nuevo literal.

Este requisito de "spread en cada nivel" es, precisamente, la razón por la que estructuras de datos profundamente anidadas se vuelven progresivamente más incómodas de actualizar de forma inmutable con spread manual, y por la que existen bibliotecas especializadas (como Immer, ampliamente usada en el ecosistema React) que permiten escribir código que parece mutar directamente el estado, mientras internamente producen una nueva copia inmutable de forma transparente. Independientemente de si se usa spread manual o una biblioteca, el principio subyacente —el estado anterior nunca se modifica directamente— facilita enormemente comparar versiones de un estado (por referencia, extremadamente rápido) y depurar bugs (el estado anterior sigue intacto para inspeccionar y comparar).

La normalización de datos es una técnica relacionada: en vez de anidar profundamente datos relacionados (por ejemplo, un array de pedidos donde cada uno contiene un objeto completo de cliente duplicado), normalizar significa almacenar cada entidad una sola vez (indexada por su id, típicamente en un `Map` u objeto), y referenciar esa entidad por su id desde otras estructuras, evitando duplicación de datos y facilitando actualizaciones consistentes cuando una entidad compartida cambia.

**Analogía:** actualizar sin mutar es como fotocopiar un documento completo, corregir solo la línea necesaria en la fotocopia, y conservar el original intacto en el archivo; mutar directamente sería como escribir la corrección directamente sobre el documento original con tinta, perdiendo para siempre la posibilidad de comparar la versión anterior con la nueva.

**Diagrama:**

```mermaid
flowchart LR
    OLD["estado anterior"] --> COPY["copia de cada nivel modificado"] --> NEW["estado nuevo"]
    OLD -. "permanece intacto" .-> CHECK["comparación y auditoría"]
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea el ejemplo independiente y guarda `src/index.js`:

```bash
mkdir ejemplo-inmutabilidad
cd ejemplo-inmutabilidad
npm init -y
mkdir src
```

```javascript
const anterior = { codigo: 'RF-101', destino: { ciudad: 'Bogotá', pais: 'CO' } };
const siguiente = {
  ...anterior,
  destino: { ...anterior.destino, ciudad: 'Medellín' }
};
console.log(anterior.destino.ciudad, siguiente.destino.ciudad);
console.log(anterior.destino === siguiente.destino);
```

Ejecuta `node src/index.js`. Resultado esperado: `Bogotá Medellín` y `false`. **Fallo deliberado:** usa `{ ...anterior, destino: { ciudad: 'Medellín' } }`; desaparecerá `pais`. Diagnostica la copia superficial y restaura el spread interno.

#### Paso 5 · Práctica guiada

Actualiza `codigoPostal` sin cambiar ciudad ni país. **Pista:** necesitas spread en el objeto raíz y en `destino`; comprueba qué referencias deben cambiar.

#### Paso 6 · Práctica independiente

Normaliza tres entregas como `{ byId, allIds }`, actualiza una sola entidad y demuestra que las otras conservan su referencia. Explica cuándo la normalización compensa la complejidad.

#### Paso 7 · Cierre y evidencia

Ya conservas historia y copias únicamente niveles modificados. El siguiente tema asocia metadatos sin retener objetos. **Evidencia:** demuestra el resultado, la pérdida de país, su corrección y la actualización normalizada. Fuente oficial: [MDN — spread syntax](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Spread_syntax).

**Errores comunes:** creer que spread clona profundamente; reemplazar un objeto parcial perdiendo campos; usar `Object.freeze` esperando congelación profunda; normalizar sin necesidad.

**Transferencia al proyecto integrador «Seguimiento público accesible»:** Actualiza una guía dentro del estado sin modificar el snapshot previo. Una prueba debe comparar ambos historiales y demostrar que los consumidores pueden detectar el cambio de referencia.

### Tema 4: WeakMap y WeakSet

#### Paso 1 · Objetivo y preparación

Al finalizar podrás asociar metadatos débiles a objetos y explicar por qué no se pueden enumerar ni usar como almacenamiento de negocio.

**Conocimiento previo:** `Map`, `Set`, referencias y noción básica de recolección de basura.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** El proyecto puede asociar diagnósticos temporales a objetos de lectura. Un `Map` los mantendría vivos; `WeakMap` no impide su recolección cuando desaparecen las demás referencias.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** referencias débiles, prevención de fugas de memoria, claves no enumerables.

`WeakMap` y `WeakSet` son variantes de `Map` y `Set` con una diferencia crucial: mantienen referencias "débiles" a sus claves (en el caso de `WeakMap`) o a sus valores (en el caso de `WeakSet`), lo que significa que si no existe ninguna otra referencia activa a un objeto usado como clave, el recolector de basura puede liberar la memoria de ese objeto, y su entrada correspondiente en el `WeakMap`/`WeakSet` desaparece automáticamente, sin necesidad de eliminarla manualmente. Un `Map` normal, en cambio, mantiene una referencia "fuerte" a sus claves, impidiendo que el recolector de basura las libere mientras el `Map` siga existiendo, incluso si ninguna otra parte del programa las necesita ya.

Esta diferencia tiene una aplicación práctica concreta: asociar metadatos adicionales a objetos (por ejemplo, datos de caché o de seguimiento) sin impedir que esos objetos se liberen de memoria cuando ya no se necesiten en ningún otro lugar del programa. Usar un `Map` normal para este propósito crearía una fuga de memoria silenciosa: los objetos nunca se liberarían mientras el `Map` exista, aunque el resto del programa ya no tenga ninguna otra referencia a ellos, porque el propio `Map` los mantendría vivos artificialmente.

Una limitación importante de `WeakMap` y `WeakSet` es que no son iterables y no exponen un método para conocer su tamaño (`size`): precisamente porque sus contenidos pueden desaparecer automáticamente en cualquier momento (cuando el recolector de basura decide liberar una clave sin otras referencias), permitir iterar sobre ellos o consultar su tamaño produciría un comportamiento no determinista e impredecible, así que el lenguaje deliberadamente no expone esas capacidades para estas estructuras.

En la práctica cotidiana, `WeakMap` y `WeakSet` son herramientas de uso relativamente especializado (frameworks y bibliotecas internas los usan con frecuencia para asociar metadatos a objetos DOM sin impedir su recolección cuando se eliminan de la página), pero entender su existencia y su propósito específico —prevenir fugas de memoria en asociaciones de metadatos— es valioso incluso si su uso directo en código de aplicación cotidiano es menos frecuente que `Map` y `Set` normales.

**Analogía:** un `Map` normal es como una lista de invitados a un evento que, una vez escrita, obliga a mantener reservado el lugar de cada invitado indefinidamente aunque cancelen su asistencia; un `WeakMap` es como una lista que automáticamente borra el nombre de un invitado en cuanto esa persona deja de existir en cualquier otro registro del sistema, liberando su lugar sin intervención manual.

**Diagrama:**

```mermaid
flowchart LR
    OBJECT["objeto de vida corta"] --> APP["referencia de la aplicación"]
    OBJECT -. "clave débil" .-> WEAK["WeakMap: metadatos"]
    APP -->|"se elimina"| GC["elegible para recolección"]
    WEAK -. "no impide liberar" .-> GC
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea el ejemplo independiente y guarda `src/index.js`:

```bash
mkdir ejemplo-weak
cd ejemplo-weak
npm init -y
mkdir src
```

```javascript
const diagnosticos = new WeakMap();
const guia = { codigo: 'RF-101' };
diagnosticos.set(guia, { revisado: true });
console.log(diagnosticos.get(guia));
console.log(diagnosticos.has(guia));
```

Ejecuta `node src/index.js`. Resultado esperado: el objeto `{ revisado: true }` y `true`. **Fallo deliberado:** ejecuta `diagnosticos.set('RF-102', {})`; aparecerá `TypeError` porque las claves deben ser objetos. No intentes verificar la recolección de basura; su momento no es determinista.

#### Paso 5 · Práctica guiada

Usa `WeakSet` para marcar objetos ya validados. **Pista:** solo admite objetos; prueba primero una cadena y diagnostica el `TypeError`.

#### Paso 6 · Práctica independiente

Compara una asociación de diagnósticos con `Map` y `WeakMap`. Documenta cuál permite listar, cuál conoce tamaño y cuál conviene para auditoría persistente. No intentes forzar el recolector.

#### Paso 7 · Cierre y evidencia

Ya reservas colecciones débiles para metadatos no enumerables de objetos vivos. El siguiente tema usa operaciones inmutables modernas sobre arrays. **Evidencia:** demuestra el resultado, el fallo de iteración, la clave primitiva rechazada y la tabla comparativa. Fuente oficial: [MDN — WeakMap](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/WeakMap).

**Errores comunes:** esperar `size`; usar claves primitivas; guardar información que debe listarse; afirmar cuándo ocurrirá la recolección.

**Transferencia al proyecto integrador «Seguimiento público accesible»:** Asocia metadatos internos a elementos del widget sin almacenarlos en una lista global permanente. Desmonta una instancia y revisa que no queda una colección fuerte que retenga todos sus nodos.

### Tema 5: Métodos inmutables modernos

#### Paso 1 · Objetivo y preparación

Al finalizar podrás ordenar, invertir, insertar y reemplazar elementos sin modificar el plan original, verificando compatibilidad del runtime.

**Conocimiento previo:** inmutabilidad, métodos de array, funciones comparadoras y versiones de Node.js.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** El proyecto compara distintas propuestas de ruta para una entrega. Si `sort()` altera el plan original, se pierde la referencia necesaria para auditar la decisión.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `toSorted`, `toReversed`, `toSpliced`, `with`, inmutabilidad nativa de array.

Los métodos tradicionales `sort()`, `reverse()` y `splice()` de `Array` mutan el array original directamente, un comportamiento que ha causado bugs sutiles durante décadas cuando un desarrollador asume incorrectamente que estos métodos, como `map` o `filter`, producen un array nuevo sin afectar al original. Versiones relativamente recientes del lenguaje introdujeron contrapartes inmutables explícitas: `toSorted()`, `toReversed()` y `toSpliced()` realizan exactamente la misma operación que sus contrapartes mutables, pero devuelven un array completamente nuevo, dejando el original completamente intacto.

El método `with(indice, valorNuevo)` resuelve otro patrón común de forma inmutable: reemplazar el elemento en una posición específica de un array sin mutar el original, algo que anteriormente requería una combinación algo verbosa de spread y slicing manual (`[...arr.slice(0, i), nuevoValor, ...arr.slice(i+1)]`). Con `with`, la misma operación se expresa de forma directa y legible: `arr.with(2, "nuevo")` devuelve un array nuevo con el elemento en el índice 2 reemplazado, sin tocar `arr` en absoluto.

La introducción de estos métodos refleja una tendencia deliberada en la evolución reciente del lenguaje: proporcionar alternativas inmutables nativas para las operaciones de array más comunes que tradicionalmente solo tenían contrapartes mutables, reduciendo la necesidad de recordar manualmente "cuáles métodos mutan y cuáles no" (una fuente histórica de confusión, dado que `map`/`filter` no mutan pero `sort`/`reverse`/`splice` sí, sin ninguna señal sintáctica que distinga unos de otros salvo memorizar la documentación).

Adoptar estos métodos modernos en código nuevo, cuando el entorno de ejecución los soporta (verificar la compatibilidad del entorno objetivo, especialmente si se necesita soportar navegadores más antiguos), simplifica el razonamiento sobre inmutabilidad: si el objetivo es no mutar nunca los arrays originales, usar consistentemente los métodos con prefijo `to` (o `with`) elimina el riesgo de invocar accidentalmente su contraparte mutante y producir un bug sutil de estado compartido inesperado.

**Analogía:** los métodos mutables tradicionales son como escribir directamente sobre un documento original con un bolígrafo permanente; los nuevos métodos inmutables son como usar siempre una fotocopiadora que produce automáticamente una copia nueva con el cambio aplicado, dejando el documento original archivado sin ninguna marca.

**Diagrama:**

```mermaid
flowchart LR
    ORIGINAL["array original"] --> TOSORTED["toSorted"] --> SORTED["copia ordenada"]
    ORIGINAL --> WITH["with"] --> REPLACED["copia con reemplazo"]
    ORIGINAL -. "sin cambios" .-> VERIFY["verificación"]
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea el ejemplo independiente y guarda `src/copias.js`:

```bash
mkdir ejemplo-metodos-inmutables
cd ejemplo-metodos-inmutables
npm init -y
mkdir src
```

```javascript
const paradas = ['Bogotá', 'Cali', 'Medellín'];
const ordenadas = paradas.toSorted();
const invertidas = paradas.toReversed();
const sinCali = paradas.toSpliced(1, 1);
const corregidas = paradas.with(1, 'Palmira');

console.log({ paradas, ordenadas, invertidas, sinCali, corregidas });
```

```bash
node src/copias.js
```

**Resultado esperado:** `paradas` conserva su orden original y cada método produce un array distinto. **Fallo deliberado:** reemplaza `toSorted()` por `sort()`; el array original aparecerá ordenado y demostrará la mutación. En un runtime antiguo, `toSorted is not a function` indica falta de compatibilidad, no un error del algoritmo.

#### Paso 5 · Práctica guiada

Elimina la segunda parada con `toSpliced`. **Pista:** compara longitud, contenido y referencia del original antes y después.

#### Paso 6 · Práctica independiente

Construye cuatro versiones usando `toSorted`, `toReversed`, `toSpliced` y `with`. Añade una alternativa compatible para cada operación y prueba que ninguna muta `paradas`.

#### Paso 7 · Cierre y evidencia

Completaste colecciones funcionales conservando versiones auditables. El siguiente módulo explica cuándo se ejecutan tareas y microtareas. **Evidencia:** demuestra el resultado, la mutación con `sort`, las cuatro copias y la compatibilidad. Fuente oficial: [MDN — copying array methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted).

**Errores comunes:** usar comparador booleano; asumir soporte sin revisar versión; creer que el array nuevo clona objetos internos; confundir `splice` con `toSpliced`.

---

**Transferencia al proyecto integrador «Seguimiento público accesible»:** Ordena una copia del historial para mostrar lo más reciente primero. Verifica que otra vista conserva el orden original recibido de la API y que la operación no altera su arreglo compartido.

## Construcción guiada del capítulo

**Objetivo del laboratorio:** construir un pipeline de transformación de datos completo (CSV en string → JSON agregado) usando exclusivamente métodos funcionales inmutables.

**Requisitos previos:** Módulos 0-3 completados, Node.js o consola del navegador.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Agrupar pedidos por cliente con `reduce` | Ver Tema 1 | Verifica el total agregado por cada cliente |
| 2 | Filtrar y transformar en una sola expresión | `filter(...).map(...)` | Obtén solo nombres de clientes con monto > 100 |
| 3 | Eliminar duplicados con `Set` | `[...new Set(array)]` | Compáralo con la alternativa `filter` + `indexOf` |
| 4 | Contar palabras con `Map` | Ver Tema 2 | Explica por qué `Map` es preferible a un objeto plano aquí |
| 5 | Actualizar un objeto anidado sin mutar | Ver Tema 3 | Verifica que el original permanece intacto tras la actualización |
| 6 | Construir el pipeline CSV→JSON completo | string → `split` → `map` a objetos → `filter` → `reduce` a resumen | Verifica el resultado final agregado |

**Verificación:** el laboratorio se considera exitoso si el pipeline CSV→JSON produce el resumen agregado correcto, y si se verifica explícitamente (comparando referencias con `===`) que ninguna estructura original fue mutada durante el proceso.

**Errores comunes y soluciones**

- **Usar `sort()` o `reverse()` esperando que no muten el array original.** Estas mutan; usa `toSorted()`/`toReversed()`, o `[...arr].sort()` como alternativa compatible con entornos más antiguos.
- **Actualizar un objeto anidado con spread superficial en un solo nivel.** Verifica que se aplica spread en cada nivel de anidamiento que se modifica, o el resto de propiedades de ese nivel se perderá.
- **Usar un objeto plano para contar ocurrencias dinámicas y toparse con colisiones de nombres con métodos heredados.** Usa `Map` en su lugar para claves verdaderamente dinámicas y arbitrarias.

---
