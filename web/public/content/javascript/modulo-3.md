# Módulo 3: Objetos, prototipos y clases


## Aprende construyendo

### Tema 1: Prototype chain y Object.create

#### Paso 1 · Objetivo y preparación

Al finalizar podrás crear objetos que delegan métodos, recorrer su cadena y distinguir propiedades propias, heredadas y sombreadas.

**Conocimiento previo:** objetos, funciones, `this` y lectura de diagramas.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Varias entregas del proyecto comparten comportamiento. La delegación evita copiar el mismo método y explica el mecanismo real que después utiliza `class`.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** prototipo, cadena de prototipos, herencia por delegación, `Object.create`.

Todo objeto en JavaScript tiene un enlace interno (accesible mediante `Object.getPrototypeOf()`, e internamente conocido como `[[Prototype]]`) hacia otro objeto, llamado su prototipo, del cual hereda propiedades y métodos por delegación: cuando se accede a una propiedad que no existe directamente en el objeto, el motor de JavaScript busca automáticamente en su prototipo, y si tampoco está ahí, continúa subiendo por la cadena de prototipos hasta llegar a `Object.prototype` (el prototipo raíz de prácticamente todos los objetos), o hasta encontrar la propiedad, o hasta llegar a `null` (el final de la cadena) sin encontrarla, devolviendo entonces `undefined`.

`Object.create(prototipo)` es la forma más directa y explícita de crear un objeto con un prototipo específico elegido deliberadamente: `Object.create(animalProto)` crea un objeto nuevo cuyo prototipo es exactamente `animalProto`, heredando por delegación cualquier método definido ahí (como `hablar()`), sin necesidad de copiar ese método individualmente a cada instancia. Esta es la diferencia fundamental entre herencia por delegación (JavaScript) y herencia por copia (otros modelos): el método `hablar()` existe en un único lugar (`animalProto`), y cada objeto que lo hereda simplemente delega la búsqueda hacia ese lugar compartido en tiempo de ejecución, en vez de tener su propia copia independiente del método.

Es importante notar que la cadena de prototipos afecta la lectura de propiedades pero no su escritura: asignar una propiedad a un objeto (`perro.nombre = "Rex"`) siempre crea (o sobreescribe) esa propiedad directamente en el objeto mismo, sin modificar el prototipo compartido; solo cuando se lee una propiedad que no existe directamente en el objeto, el motor consulta el prototipo. Esto explica por qué modificar un método en el prototipo compartido (`animalProto.hablar = function() {...}`) afecta instantáneamente a todos los objetos que lo heredan (porque todos delegan a la misma referencia compartida), mientras que asignar una propiedad directamente en una instancia específica no afecta a ninguna otra instancia.

Este modelo de "herencia por delegación" es fundamentalmente distinto del modelo de "herencia por clase" presente en lenguajes como Java o C++, donde una instancia recibe una copia completa de la estructura definida por su clase en el momento de su creación. En JavaScript, incluso cuando se usa la sintaxis de `class` (Tema 2), el mecanismo subyacente sigue siendo exactamente este mismo sistema de prototipos: `class` es, literalmente, una capa de sintaxis más legible construida encima del mismo mecanismo de prototipos que `Object.create` expone directamente.

**Analogía:** la cadena de prototipos es como un sistema de bibliotecas conectadas: si un libro que buscas no está en tu biblioteca local (el objeto), automáticamente se consulta la biblioteca regional conectada (su prototipo), y si tampoco está ahí, se consulta la biblioteca nacional (el prototipo del prototipo), y así sucesivamente, sin que ninguna biblioteca individual necesite tener una copia física de cada libro disponible en el sistema completo.

**Diagrama:**

```mermaid
flowchart LR
    GUIA["guia (propiedades propias)"] --> PROTO["guiaProto (métodos compartidos)"] --> OBJECT["Object.prototype"] --> NULL["null"]
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `ejemplo-prototipos`, ejecuta `npm init -y`, crea `src` y después `src/prototipos.js`:

```bash
mkdir ejemplo-prototipos
cd ejemplo-prototipos
npm init -y
mkdir src
```

```javascript
const guiaProto = {
  describir() { // se comparte y usa la instancia receptora
    return `${this.numero}: ${this.estado}`;
  },
};

const guia = Object.create(guiaProto);
guia.numero = 'RF-40';
guia.estado = 'creado';

console.log(guia.describir());
console.log(Object.hasOwn(guia, 'describir'));
console.log(Object.getPrototypeOf(guia) === guiaProto);
```

```bash
node src/prototipos.js
```

**Resultado esperado:** `RF-40: creado`, `false` y `true`.

**Fallo deliberado:** asigna `guia.describir = 'texto'` y vuelve a invocarla. El `TypeError` ocurre porque una propiedad propia sombrea el método heredado; elimina esa propiedad para recuperar la delegación.

#### Paso 5 · Práctica guiada

Crea dos guías y modifica `guiaProto.describir`. **Pista:** predice cuáles observan el cambio si una de ellas tiene un método propio.

#### Paso 6 · Práctica independiente

Implementa `imprimirCadena(objeto)` que liste cada nivel hasta `null`, sin usar `__proto__`. Explica en qué nivel vive `toString`.

#### Paso 7 · Cierre y evidencia

Ya entiendes herencia como delegación dinámica. El siguiente tema expresa el mismo mecanismo con sintaxis de clases. **Evidencia:** demuestra el resultado inicial, el shadowing, el cambio compartido y la cadena completa. Fuente oficial: [MDN — inheritance and prototype chain](https://developer.mozilla.org/es/docs/Web/JavaScript/Inheritance_and_the_prototype_chain).

**Errores comunes:** confundir delegación con copia; modificar `Object.prototype`; usar `__proto__`; asumir que escribir una propiedad cambia el prototipo.

**Transferencia al proyecto integrador «Seguimiento público accesible»:** Distingue propiedades propias de los datos de seguimiento de las heredadas. Prueba un objeto con prototipo inesperado y valida campos explícitos antes de convertirlo en un modelo público.

### Tema 2: class, extends y super

#### Paso 1 · Objetivo y preparación

Al finalizar podrás implementar una jerarquía pequeña con `class`, `extends` y `super`, y decidir cuándo composición representa mejor el dominio.

**Conocimiento previo:** prototype chain, `this`, constructores y validación.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** El proyecto modela envíos normales y expresos. Heredar solo es correcto si el subtipo conserva todo el contrato del envío base; una característica opcional suele modelarse mejor con composición.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** azúcar sintáctica sobre prototipos, herencia con `extends`, `super`.

La sintaxis `class`, introducida en ES6, no crea un mecanismo de herencia nuevo o distinto del sistema de prototipos ya existente: es, precisamente, "azúcar sintáctica" (una forma más legible de escribir algo que ya era posible antes, de forma más verbosa, con funciones constructoras y manipulación manual de `prototype`). Cuando se define `class Animal { constructor(nombre) { this.nombre = nombre; } hablar() {...} }`, el método `hablar` se almacena internamente en `Animal.prototype`, exactamente en el mismo lugar donde se habría colocado manualmente con la sintaxis de funciones constructoras anterior a ES6, y cada instancia creada con `new Animal(...)` hereda ese método por la misma delegación de prototipos descrita en el Tema 1.

`extends` establece la relación de herencia entre clases, configurando internamente que el prototipo de la clase hija apunte a un objeto cuyo prototipo, a su vez, es el prototipo de la clase padre, formando una cadena de prototipos de dos (o más) niveles. `class Perro extends Animal {...}` significa que las instancias de `Perro` heredan tanto los métodos definidos directamente en `Perro` como los heredados de `Animal`, resolviéndose por la misma búsqueda ascendente en la cadena de prototipos.

`super` cumple dos funciones distintas según el contexto donde se usa: dentro del `constructor` de una clase hija, `super(argumentos)` invoca el `constructor` de la clase padre (obligatorio invocarlo antes de usar `this` en el constructor de la hija, una regla estricta impuesta por el lenguaje); dentro de un método normal de la clase hija, `super.metodo()` invoca explícitamente la versión de ese método definida en la clase padre, permitiendo "extender" el comportamiento heredado en vez de reemplazarlo completamente (como se ve en `Perro.hablar()`, que invoca `super.hablar()` y añade contenido adicional al resultado).

Comparar la implementación de una jerarquía `Animal`/`Perro` usando funciones constructoras con `.prototype` (el estilo anterior a ES6) frente a la misma jerarquía usando `class` es un ejercicio revelador: ambas producen exactamente el mismo comportamiento en tiempo de ejecución y la misma estructura de cadena de prototipos, confirmando de forma tangible que `class` es, efectivamente, solo una forma más legible de expresar el mismo mecanismo subyacente, sin introducir ningún modelo de herencia fundamentalmente nuevo.

**Analogía:** `class` es como un formulario estandarizado y con plantilla clara para rellenar una solicitud, mientras que la sintaxis anterior de funciones constructoras y `.prototype` es como rellenar la misma solicitud a mano libre en una hoja en blanco: el contenido final que se procesa (el mecanismo de prototipos) es exactamente el mismo, pero el formulario estandarizado (`class`) es más legible y menos propenso a errores de formato.

**Diagrama:**

```mermaid
classDiagram
    class Envio {
      +numero
      +describir()
    }
    class EnvioExpress {
      +prioridad
      +describir()
    }
    Envio <|-- EnvioExpress
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `ejemplo-clases`, ejecuta `npm init -y`, crea `src` y después `src/clases.js`:

```bash
mkdir ejemplo-clases
cd ejemplo-clases
npm init -y
mkdir src
```

```javascript
class Envio {
  constructor(numero) {
    if (!numero) throw new TypeError('Número requerido');
    this.numero = numero;
  }
  describir() { return `Envío ${this.numero}`; }
}

class EnvioExpress extends Envio {
  constructor(numero, prioridad) {
    super(numero); // inicializa this mediante el constructor base
    this.prioridad = prioridad;
  }
  describir() { return `${super.describir()} · prioridad ${this.prioridad}`; }
}

console.log(new EnvioExpress('RF-41', 'alta').describir());
```

```bash
node src/clases.js
```

**Resultado esperado:** `Envío RF-41 · prioridad alta`.

**Fallo deliberado:** usa `this.prioridad` antes de `super(numero)`. JavaScript lanza `ReferenceError` porque una clase derivada no dispone de `this` hasta ejecutar el constructor base.

#### Paso 5 · Práctica guiada

Agrega `EnvioRefrigerado` con temperatura y extiende la descripción. **Pista:** llama `super` antes de tocar `this` y conserva la validación base.

#### Paso 6 · Práctica independiente

Refactoriza prioridad como objeto `politicaEntrega` inyectado en `Envio`. Compara pruebas, extensión y posibilidad de combinar refrigeración con prioridad; justifica herencia o composición.

#### Paso 7 · Cierre y evidencia

Ya sabes que `class` organiza prototipos y que `extends` expresa un contrato fuerte. El siguiente tema presenta valores derivados con getters. **Evidencia:** demuestra el resultado, el fallo antes de `super` y ambas alternativas de diseño. Fuente oficial: [MDN — classes](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Classes).

**Errores comunes:** usar `this` antes de `super`; construir jerarquías profundas; confundir “tiene” con “es”; olvidar que los métodos continúan en el prototipo.

**Transferencia al proyecto integrador «Seguimiento público accesible»:** Implementa una abstracción pequeña para clientes de seguimiento solo si comparten contrato. Prueba una implementación HTTP y otra falsa sin exigir herencia a los objetos de datos.

### Tema 3: Getters, setters y propiedades computadas

#### Paso 1 · Objetivo y preparación

Al finalizar podrás exponer valores derivados con getters, validar escrituras deliberadas y construir claves dinámicas sin duplicar estado.

**Conocimiento previo:** clases, arrays, objetos y métodos de transformación.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** El proyecto calcula peso total desde paquetes. Guardar simultáneamente paquetes y total permite que se contradigan; un getter deriva el valor desde una única fuente de verdad.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** propiedades de acceso, `get`/`set`, claves computadas.

Un getter (`get nombre() {...}`) y un setter (`set nombre(valor) {...}`) definen propiedades que, aunque se acceden con la sintaxis normal de propiedad (`objeto.nombre`, sin paréntesis), en realidad ejecutan una función cada vez que se leen o se asignan respectivamente. Esto permite ejecutar lógica adicional de forma transparente para quien consume el objeto: un getter puede calcular un valor derivado sobre la marcha (en vez de almacenarlo y arriesgarse a que quede desincronizado), y un setter puede validar un valor antes de aceptarlo, como se ve en `CuentaBancaria`, donde el getter `saldo` expone el valor del campo privado `#saldo` de forma controlada, sin permitir asignación directa (no existe un `set saldo`, así que `cuenta.saldo = 1000` simplemente no tendría efecto o lanzaría error en modo estricto).

Las propiedades computadas permiten usar el valor de una variable (o el resultado de una expresión) como el nombre de una clave dentro de un objeto literal, usando la sintaxis de corchetes: `{ [clave]: valor }` crea una propiedad cuyo nombre es el valor de la variable `clave` en el momento de evaluar el literal, no literalmente el texto `"clave"`. Esto es especialmente útil cuando el nombre de una propiedad debe determinarse dinámicamente en tiempo de ejecución, por ejemplo al construir un objeto de conteo donde la clave es una palabra extraída de un texto que no se conoce de antemano.

`Object.groupBy()`, una adición relativamente reciente al lenguaje, resuelve directamente un patrón extremadamente común que antes requería escribir manualmente un `reduce`: agrupar los elementos de un array según el resultado de una función aplicada a cada uno, produciendo un objeto donde cada clave es un valor de agrupación posible y cada valor es un array de los elementos que pertenecen a ese grupo. `Object.fromEntries()` hace la operación inversa a `Object.entries()`: convierte un array de pares `[clave, valor]` de vuelta en un objeto, particularmente útil al combinarse con métodos de array como `map` o `filter` sobre las entradas de un objeto existente, antes de reconstruirlo.

Combinar destructuring anidado con estas herramientas permite extraer directamente valores de estructuras de datos complejas y profundamente anidadas en una sola expresión declarativa, evitando accesos manuales encadenados como `usuario.direccion.ciudad`, y en su lugar escribiendo `const { direccion: { ciudad } } = usuario;`, extrayendo directamente `ciudad` como una variable local independiente.

**Analogía:** un getter es como un cajero automático que, en vez de simplemente entregarte un saldo guardado estáticamente, recalcula ese saldo en tiempo real cada vez que lo consultas, garantizando que nunca esté desincronizado con las transacciones más recientes; una propiedad computada es como escribir una etiqueta para un archivador usando el contenido de un post-it que tienes en la mano, en vez de escribir el texto literal "post-it" en la etiqueta.

**Diagrama:**

```mermaid
flowchart LR
    INPUT["movimientos"] --> GETTER["get total: cálculo derivado"] --> VIEW["lectura como propiedad"]
    KEY["estado dinámico"] --> COMPUTED["{ [estado]: cantidad }"]
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `ejemplo-propiedades`, ejecuta `npm init -y`, crea `src` y después `src/propiedades.js`:

```bash
mkdir ejemplo-propiedades
cd ejemplo-propiedades
npm init -y
mkdir src
```

```javascript
class Manifiesto {
  #paquetes = [];

  agregar(paquete) {
    if (!Number.isFinite(paquete.pesoKg) || paquete.pesoKg <= 0) {
      throw new TypeError('Peso positivo requerido');
    }
    this.#paquetes.push({ ...paquete });
  }

  get pesoTotal() { // se calcula al leer; no se almacena otra copia
    return this.#paquetes.reduce((total, paquete) => total + paquete.pesoKg, 0);
  }
}

const manifiesto = new Manifiesto();
manifiesto.agregar({ guia: 'RF-42', pesoKg: 2 });
manifiesto.agregar({ guia: 'RF-43', pesoKg: 1.5 });
console.log(manifiesto.pesoTotal);
```

```bash
node src/propiedades.js
```

**Resultado esperado:** `3.5`.

**Fallo deliberado:** agrega un setter `pesoTotal` que guarde otro valor y asigna `100`. Ahora paquetes y total pueden contradecirse. Elimina el setter: un dato derivado no debe admitir una escritura sin significado de dominio.

#### Paso 5 · Práctica guiada

Agrega el getter `cantidadPaquetes`. **Pista:** derívalo de `#paquetes.length`; no mantengas un contador adicional.

#### Paso 6 · Práctica independiente

Agrupa entregas por estado usando `{ [estado]: cantidad }` o `Object.groupBy` si tu runtime lo soporta. Implementa una alternativa compatible y compara el resultado sin mutar entradas.

#### Paso 7 · Cierre y evidencia

Ya distingues propiedades derivadas de operaciones que cambian estado. El siguiente tema impone esa frontera con campos privados. **Evidencia:** demuestra el resultado `3.5`, la contradicción deliberada, su corrección y la agrupación. Fuente oficial: [MDN — getters](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Functions/get).

**Errores comunes:** ejecutar red dentro de un getter; almacenar un valor derivado; crear setters genéricos sin invariantes; asumir soporte universal de APIs recientes.

**Transferencia al proyecto integrador «Seguimiento público accesible»:** Deriva la etiqueta visible de una entrega sin efectos laterales en el getter. Leerla dos veces debe producir el mismo resultado sin lanzar dos consultas ni modificar el historial.

**Límites y decisión de uso:** Un getter que consulta red o modifica estado hace costosa e impredecible una lectura aparente. Mantén cálculos baratos y sin efectos o utiliza un método explícito que comunique trabajo asíncrono y posibles fallos.

### Tema 4: Encapsulación con campos privados (#campo)

#### Paso 1 · Objetivo y preparación

Al finalizar podrás proteger una transición con `#campo`, exponer lectura controlada y diferenciar privacidad real de la convención `_campo`.

**Conocimiento previo:** clases, getters, errores y máquina de estados.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Una entrega del proyecto no debe convertirse en entregada dos veces ni saltarse reglas mediante asignación directa. El motor puede impedir el acceso al estado y obligar a usar operaciones válidas.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** campos privados reales, diferencia con convención `_campo`, encapsulación impuesta por el motor.

Antes de la introducción de campos privados reales (sintaxis `#campo`) en una versión relativamente reciente del lenguaje, la única forma de señalar que una propiedad "debería" tratarse como privada era una convención puramente visual: anteponer un guion bajo (`_saldo`), sin ninguna protección real impuesta por el motor de JavaScript. Cualquier código externo podía acceder o modificar `instancia._saldo` directamente, sin ningún error ni restricción; la convención dependía enteramente de la disciplina voluntaria de quien consumía la clase, sin ninguna garantía técnica real.

Los campos privados con `#` son fundamentalmente distintos: son encapsulación real, impuesta directamente por el motor de JavaScript, no una simple convención de nomenclatura. Intentar acceder a `instancia.#saldo` desde fuera del cuerpo de la clase donde `#saldo` fue declarado no solo falla silenciosamente, sino que produce un `SyntaxError` en tiempo de análisis del código (no siquiera llega a ejecutarse), porque `#saldo` ni siquiera es una propiedad accesible mediante la sintaxis normal de acceso a propiedades fuera del scope léxico de la clase que lo define.

Esta diferencia tiene una implicación de diseño importante: los campos privados solo pueden accederse y modificarse a través de la interfaz pública que la propia clase decide exponer deliberadamente (métodos públicos, getters, setters), lo que fuerza a cualquier consumidor de la clase a pasar por las validaciones y la lógica que esos métodos públicos implementan, en vez de poder saltárselas accediendo directamente a la propiedad interna, como sí era técnicamente posible (aunque desaconsejado) con la convención `_saldo`.

Combinar campos privados con getters (Tema 3) es un patrón extremadamente común y recomendado: el campo permanece completamente inaccesible desde fuera (`#saldo`), mientras que un getter público (`get saldo()`) expone su valor de forma controlada y de solo lectura, sin exponer nunca una forma de asignación directa que evite las validaciones del método `depositar()`, garantizando así que el estado interno de cualquier instancia solo pueda cambiar a través de caminos explícitamente validados por la propia clase.

`Object.freeze` ofrece una protección distinta y complementaria, a nivel de objeto en vez de clase: congela un objeto existente impidiendo agregar, eliminar o reasignar sus propiedades de primer nivel. `Object.seal` es más permisivo: impide agregar o eliminar propiedades, pero sí permite reasignar las que ya existen. Ninguno de los dos es recursivo: congelar un objeto no congela los objetos anidados dentro de él, una distinción fácil de pasar por alto y que conviene verificar explícitamente:

```javascript
const configuracion = Object.freeze({ reintentos: 3, limites: { porMinuto: 60 } });
configuracion.reintentos = 10; // ignorado en modo no estricto, TypeError en modo estricto
console.log(configuracion.reintentos); // 3: el nivel superior sí quedó protegido

configuracion.limites.porMinuto = 999; // el freeze es superficial: el objeto anidado no está congelado
console.log(configuracion.limites.porMinuto); // 999: la mutación anidada sí tuvo efecto
```

**Analogía:** la convención `_campo` es como un cartel de "prohibido el paso" colocado sobre una puerta sin cerradura, que cualquiera podría ignorar y cruzar de todas formas; un campo privado `#campo` es una puerta con una cerradura real cuya llave literalmente no existe fuera del edificio donde se definió, haciendo el acceso no autorizado no solo desaconsejado sino técnicamente imposible.

**Diagrama:**

```mermaid
flowchart LR
    CALLER["consumidor"] --> API["métodos públicos validados"] --> PRIVATE["#estado privado"]
    CALLER -. "acceso directo rechazado" .-> PRIVATE
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `ejemplo-encapsulacion`, ejecuta `npm init -y`, crea `src` y después `src/encapsulacion.js`:

```bash
mkdir ejemplo-encapsulacion
cd ejemplo-encapsulacion
npm init -y
mkdir src
```

```javascript
class Entrega {
  #estado;

  constructor(estado = 'EN_RUTA') { this.#estado = estado; }
  get estado() { return this.#estado; }

  confirmar() {
    if (this.#estado !== 'EN_RUTA') {
      throw new Error(`No se puede confirmar desde ${this.#estado}`);
    }
    this.#estado = 'ENTREGADA';
  }
}

const entrega = new Entrega();
entrega.confirmar();
console.log(entrega.estado);
```

```bash
node src/encapsulacion.js
```

**Resultado esperado:** `ENTREGADA`.

**Fallo deliberado:** llama `confirmar()` por segunda vez; recibe `No se puede confirmar desde ENTREGADA`. En `src/acceso-privado.js` intenta `entrega.#estado`: el archivo ni siquiera se analiza y produce `SyntaxError`.

#### Paso 5 · Práctica guiada

Agrega `cancelar()` permitido solo desde `EN_RUTA`. **Pista:** concentra la transición dentro de la clase y prueba confirmar después de cancelar.

#### Paso 6 · Práctica independiente

Modela `CREADA → ASIGNADA → EN_RUTA → ENTREGADA` con métodos de dominio. Prueba cada transición válida y dos saltos inválidos sin añadir un setter público.

#### Paso 7 · Cierre y evidencia

Completaste objetos y clases con invariantes impuestas por el motor. El siguiente módulo transforma colecciones de entregas. **Evidencia:** demuestra el resultado, la segunda confirmación, el `SyntaxError`, la corrupción de `_estado` y la máquina completa. Fuente oficial: [MDN — private elements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements).

**Errores comunes:** confundir `_` con privacidad; probar sintaxis privada en el mismo archivo principal; exponer setters que evaden reglas; intentar acceder a privados desde subclases.

---

**Transferencia al proyecto integrador «Seguimiento público accesible»:** Protege el controlador de peticiones pendientes con un campo privado. Prueba su interfaz pública y confirma que consultar una nueva guía cancela la anterior sin exponer el mecanismo interno.

### Tema 5: Symbol y objetos iterables propios

#### Paso 1 · Objetivo y preparación
Al finalizar podrás crear claves únicas con `Symbol`, implementar el protocolo de iteración con `Symbol.iterator` y con generadores, y lograr que tus objetos funcionen con `for...of`, spread y desestructuración. Prerrequisitos: Tema 2 de este módulo (clases) y Módulo 6, Tema 5 (generadores).

#### Paso 2 · Contexto y caso real
El seguimiento de RutaFlow muestra las paradas de una ruta. Si la clase `Ruta` es iterable, cualquier parte del código la recorre con `for...of` sin conocer cómo guarda sus datos. Así funcionan en la realidad `Map`, `Set`, los `NodeList` del DOM y los streams.

#### Paso 3 · Teoría, modelo mental y analogía
Un `Symbol` es un valor primitivo único: dos `Symbol('a')` nunca son iguales, y como clave de objeto no aparece en `Object.keys` ni en `JSON.stringify`. `Symbol.for` usa un registro global compartido. JavaScript define **símbolos bien conocidos** que activan comportamientos: si un objeto tiene un método `[Symbol.iterator]` que devuelve un **iterador** (un objeto con `next()` que retorna `{ value, done }`), el objeto es **iterable**. Un generador (`function*`) crea ese iterador automáticamente.

**Analogía:** `Symbol.iterator` es el enchufe estándar que `for...of`, el spread y la desestructuración saben usar.

**Diagrama:**

```mermaid
sequenceDiagram
    participant F as for...of
    participant R as Ruta
    participant I as iterador
    F->>R: [Symbol.iterator]()
    R-->>F: iterador
    F->>I: next()
    I-->>F: value y done false
    F->>I: next()
    I-->>F: done true
```

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema se reproduce en una **carpeta vacía**, como **proyecto nuevo**, sin estado de otros temas.

```bash
mkdir iterables && cd iterables
```

Crea `iterables.js`:

```javascript
// Una ruta de reparto que se puede recorrer con for...of, spread y desestructuración
class Ruta {
  #paradas = [];
  agregar(...paradas) {
    this.#paradas.push(...paradas);
    return this;
  }
  // Protocolo de iteración: un método con la clave Symbol.iterator que devuelve un iterador
  [Symbol.iterator]() {
    let i = 0;
    const paradas = this.#paradas;
    return {
      next() {
        return i < paradas.length
          ? { value: `${i + 1}. ${paradas[i++]}`, done: false }
          : { value: undefined, done: true };
      },
    };
  }
  // Un generador produce un iterador sin escribir next() a mano
  *pendientesDesde(indice) {
    for (let i = indice; i < this.#paradas.length; i++) yield this.#paradas[i];
  }
  get [Symbol.toStringTag]() {
    return 'Ruta';
  }
}

const ruta = new Ruta().agregar('Depósito', 'Chapinero', 'Usaquén', 'Suba');
for (const parada of ruta) console.log(parada);
console.log([...ruta].length, 'paradas');
const [origen, siguiente] = ruta;
console.log('Desestructurada:', origen, '|', siguiente);
console.log('Pendientes:', [...ruta.pendientesDesde(2)]);
console.log(Object.prototype.toString.call(ruta));

// Symbol: claves únicas que no chocan con otras propiedades
const ID_INTERNO = Symbol('idInterno');
const envio = { guia: 'G-1', [ID_INTERNO]: 98765 };
console.log(Object.keys(envio), JSON.stringify(envio), envio[ID_INTERNO]);
console.log(Symbol('a') === Symbol('a'), Symbol.for('a') === Symbol.for('a'));
```

**Ejecuta el ejemplo:**

```bash
node iterables.js
```

**Resultado esperado:**

```text
1. Depósito
2. Chapinero
3. Usaquén
4. Suba
4 paradas
Desestructurada: 1. Depósito | 2. Chapinero
Pendientes: [ 'Usaquén', 'Suba' ]
[object Ruta]
[ 'guia' ] {"guia":"G-1"} 98765
false true
```

El mismo objeto se recorrió con `for...of`, con spread (`[...ruta]`) y con desestructuración. El símbolo `ID_INTERNO` no apareció en `Object.keys` ni en el JSON.

**Fallo deliberado:** Renombra el método `[Symbol.iterator]()` a `iterator()`. Obtienes `TypeError: ruta is not iterable`: el nombre debe ser exactamente el símbolo bien conocido, no un texto parecido.

#### Paso 5 · Práctica guiada
Agrega a `Ruta` un generador `*conDistancia(km)` que entregue pares `[parada, kmAcumulados]`, sumando `km` en cada parada. **Pista:** usa `yield [parada, acumulado]` dentro de un `for` y recórrelo con `for (const [parada, km] of ruta.conDistancia(3))`.

#### Paso 6 · Práctica independiente
Crea un iterable infinito de números de guía (`BO-000001`, `BO-000002`, …) y toma solo los primeros 5 con desestructuración, explicando por qué no se cuelga.

#### Paso 7 · Cierre y evidencia
Entrega como evidencia la salida real del Paso 4 y la explicación del fallo deliberado. **¿Por qué es importante?** porque el protocolo de iteración es la base de `for...of`, `Array.from`, `Promise.all` con iterables y los iteradores asíncronos de streams.
**Fuente oficial:** [MDN: Iteration protocols](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Iteration_protocols), [MDN: Symbol](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Symbol).
**Conceptos clave:** `Symbol`, `Symbol.for`, símbolos bien conocidos, protocolo de iteración, iterador, `next()`, generador, `Symbol.toStringTag`.
**Cuándo no usarlo:** si tu clase solo envuelve un array, devolver `this.#paradas[Symbol.iterator]()` o exponer una copia es más simple que escribir `next()` a mano.

**Transferencia al proyecto integrador «Seguimiento público accesible»:** haz iterable el historial de eventos de un envío para mostrarlo en la línea de tiempo pública.
Como **siguiente** paso, aplica lo aprendido en el proyecto integrador del track y compara el resultado con lo que esperabas.
**Errores comunes:** nombrar el método `iterator()` en vez de usar la clave `[Symbol.iterator]`, lo que produce `TypeError: ... is not iterable` porque ningún texto parecido activa el protocolo; escribir `next()` a mano cuando un generador (`function*`) ya produce ese iterador sin ese código repetitivo.

## Construcción guiada del capítulo

**Objetivo del laboratorio:** construir una jerarquía de clases con herencia real y encapsulación mediante campos privados, comparándola explícitamente con el modelo de prototipos subyacente.

**Requisitos previos:** Módulos 0-2 completados, entorno con soporte de campos privados (Node.js reciente o navegador moderno).

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear herencia con `Object.create` | Ver Tema 1 | Verifica que `hablar()` se hereda, no se copia |
| 2 | Definir `Animal` y `Perro extends Animal` | Ver Tema 2 | `Perro.hablar()` debe invocar `super.hablar()` |
| 3 | Añadir campo privado `#saldo` a `CuentaBancaria` | Ver Tema 4 | Expón un getter `saldo` y un método `depositar()` validado |
| 4 | Recorrer la cadena de prototipos | `Object.getPrototypeOf(instanciaDePerro)` repetidamente hasta `null` | Verifica que llega hasta `Object.prototype` |
| 5 | Crear una propiedad computada | `{ [claveDinamica]: valor }` | Verifica que la clave real es el valor de la variable, no su nombre literal |
| 6 | Comparar el estilo pre-ES6 con `class` | Implementa `Animal`/`Perro` con funciones constructoras y `.prototype` manualmente | Confirma que el comportamiento es idéntico al de `class` |

**Verificación:** el laboratorio se considera exitoso si `new Perro("Rex").hablar()` invoca correctamente el método heredado extendido con `super`, si `cuenta.#saldo` fuera de la clase produce un `SyntaxError`, y si la implementación pre-ES6 con `.prototype` produce exactamente el mismo comportamiento observable que la versión con `class`.

**Errores comunes y soluciones**

- **Olvidar invocar `super()` en el constructor de una clase hija antes de usar `this`.** JavaScript lanza un `ReferenceError` explícito si se intenta usar `this` antes de invocar `super()`; siempre invoca `super(...)` como la primera línea del constructor de la hija.
- **Confundir `_campo` (convención) con `#campo` (privado real) en términos de protección real.** Recuerda que `_campo` es solo una señal visual sin ninguna protección técnica; solo `#campo` es verdaderamente inaccesible desde fuera de la clase.
- **Intentar usar una propiedad computada sin corchetes.** `{ clave: valor }` crea una propiedad literalmente llamada `"clave"`; se necesita `{ [clave]: valor }` para que el nombre real sea el valor de la variable `clave`.

---
