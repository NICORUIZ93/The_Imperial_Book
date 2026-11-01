# Módulo 7: Records, sealed classes y pattern matching


**Proyecto del módulo:** crea un proyecto Maven o Gradle desde cero, pega el código del tema y corre las pruebas; las equivalencias entre ambos sistemas están en el Módulo 8, Tema 4.

## Aprende construyendo

### Tema 1: record — modelos inmutables sin boilerplate · Básico · 45 min

**Prerrequisito:** JDK 27 y un editor. Comprueba `java --version`.

**Al terminar podrás:** modelar una entidad inmutable con `record`, con constructor compacto que valida sus invariantes.

#### Aprende

Una guía de entrega (número, peso, estado) no debería cambiar sus datos una vez creada; cualquier "actualización" real debería producir una nueva instancia, nunca mutar la existente en un lugar donde otro código todavía la referencia.

**¿Por qué es importante?** `record` elimina el boilerplate que una clase POJO tradicional requeriría para constructor, getters, `equals`, `hashCode` y `toString`, mientras impone inmutabilidad estructural como parte del diseño del lenguaje.

`record Punto(int x, int y) {}` declara una clase inmutable completa en una única línea: el compilador genera automáticamente un constructor que acepta ambos componentes, métodos de acceso con el mismo nombre que cada componente (`p.x()`, `p.y()`, en vez de la convención `getX()`/`getY()` de una clase tradicional), y sobreescribe `equals()`, `hashCode()` y `toString()` basándose en el valor de todos los componentes declarados, reemplazando por completo el boilerplate que una clase POJO (Plain Old Java Object) tradicional requeriría escribir manualmente (o generar con un IDE, o delegar a una librería externa como Lombok) para lograr exactamente el mismo resultado.

Los componentes de un record son inherentemente inmutables (no existe ningún método generado automáticamente para modificar `x` o `y` después de construir el `Punto`), reflejando la intención de diseño de que un record modele datos que, una vez creados, no cambian — cualquier "modificación" real requiere construir una nueva instancia del record con los valores actualizados, en vez de mutar la instancia existente, el mismo principio de inmutabilidad estudiado de forma más general para signals en el Módulo 2 del track de Angular, aquí aplicado como una característica estructural del propio lenguaje Java para modelar datos.

**Analogía:** un record es como un formulario impreso con campos ya fijados en tinta permanente en el momento de imprimirse: puedes leer cualquier campo cuantas veces quieras, pero no puedes tachar y reescribir un valor existente; si necesitas datos distintos, imprimes un formulario completamente nuevo con los valores correctos, en vez de modificar el existente.

`record Guia(String numero, double pesoKg) {}` genera automáticamente constructor, getters (`numero()`, `pesoKg()`), `equals`/`hashCode`/`toString`, sin boilerplate manual. La analogía: un formulario impreso con campos en tinta permanente — para datos distintos, imprimes uno nuevo, no tachas el existente.

**Conceptos clave:** generación automática de constructor/getters/equals/hashCode/toString, inmutabilidad.

Cada entidad de solo-datos del proyecto integrador de este track (una guía, una tarifa, una dirección) que no necesite identidad mutable debería modelarse como `record`, no como una clase tradicional con getters/setters manuales.

**Cuándo no usarlo:** un `record` no es apropiado para una entidad que genuinamente necesita mutar su estado a lo largo del tiempo (por ejemplo, una entidad gestionada por un ORM que actualiza campos en la base de datos); para esos casos, una clase tradicional con campos mutables sigue siendo la herramienta correcta.

**Implicación práctica:** `record` elimina el boilerplate de constructor/getters/`equals`/`hashCode`/`toString` mientras impone inmutabilidad estructural, de modo que "cambiar" un dato siempre significa construir una instancia nueva, nunca mutar la existente en un lugar donde otro código ya la referencia.

**Código del ejemplo:**

```java
record Punto(int x, int y) {}
// genera automáticamente: constructor, getters (x(), y()), equals, hashCode y toString

Punto p = new Punto(3, 4);
p.x(); // 3
```

#### Practica

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-record-guia
cd ejemplo-record-guia
mkdir -p src/main/java/academia/records
```

**Crea** `Guia.java` como `record` con un constructor compacto que valide `numero` no vacío y `pesoKg` positivo. Incluye también el `record Destinatario` que usarás en la práctica independiente y un `Main` que cree dos instancias con los mismos valores y confirme `equals()` por valor:

```java
package academia.records;

import java.util.Objects;

record Destinatario(String nombre, String telefono) {}

record Guia(String numero, double pesoKg, Destinatario destinatario) {
    Guia {
        if (numero == null || numero.isBlank()) {
            throw new IllegalArgumentException("El número de guía es obligatorio");
        }
        if (pesoKg <= 0) {
            throw new IllegalArgumentException("El peso debe ser positivo: " + pesoKg);
        }
        Objects.requireNonNull(destinatario, "El destinatario es obligatorio");
    }
}

final class Main {
    public static void main(String[] args) {
        Destinatario ana = new Destinatario("Ana", "555-0101");
        Guia original = new Guia("G-001", 12.5, ana);
        Guia copia = new Guia("G-001", 12.5, new Destinatario("Ana", "555-0101"));

        System.out.println(original);
        System.out.println("Iguales: " + original.equals(copia));

        try {
            new Guia("", 12.5, ana);
        } catch (IllegalArgumentException e) {
            System.out.println("Rechazada: " + e.getMessage());
        }
    }
}
```

**Ejecuta el ejemplo:**

```bash
javac -d out src/main/java/academia/records/Guia.java
java -cp out academia.records.Main
```

**Resultado esperado:** imprime `Guia[numero=G-001, pesoKg=12.5, destinatario=Destinatario[nombre=Ana, telefono=555-0101]]`, luego `Iguales: true` y finalmente `Rechazada: El número de guía es obligatorio`. La igualdad es por valor: las dos instancias son objetos distintos en memoria pero `equals()` devuelve `true` porque todos sus componentes coinciden.

**Fallo deliberado:** intenta asignar directamente `guia.pesoKg = 10` dentro del `main` y recompila.

**Pista:** los componentes de un record no tienen setters y el compilador rechaza la asignación con `pesoKg has private access in Guia`, porque el acceso generado solo permite leer. **Resultado esperado:** confirmas que la única forma de "cambiar" un valor es construir una nueva instancia.

**Si falla.** Si el compilador no acepta la declaración del constructor compacto, revisa que no repitas la lista de parámetros ni la asignación de campos dentro de él. Si `equals()` devuelve `false`, alguno de los componentes difiere aunque parezca el mismo dato. Si el record no se puede ejecutar como clase principal, recuerda que `Main` debe declarar `public static void main(String[] args)`.

#### Aplica

Agrega un segundo record `Destinatario` y anídalo dentro de `Guia`; escribe una prueba que confirme que dos `Guia` con el mismo `Destinatario` (mismos valores) son `equals()`, aunque sean instancias distintas.

**Checklist de salida.**

- [ ] `Guia.java` compila con `javac -d out` sin setters.
- [ ] El constructor compacto rechaza un número vacío con `IllegalArgumentException`.
- [ ] El constructor compacto rechaza un peso no positivo.
- [ ] Dos `Guia` con los mismos valores imprimen `Iguales: true`.
- [ ] El record anidado `Destinatario` también se compara por valor.
- [ ] Explicas cómo se "actualiza" una guía sin mutar la instancia original.

**Si falla.** Si la prueba de igualdad falla con un `Destinatario` anidado, compara los dos objetos impresos con `toString()` antes de cambiar el modelo. Si el constructor compacto no valida, confirma que la comprobación está dentro del bloque `Guia { ... }` y no en un constructor auxiliar.

Guarda `Guia`, la validación del constructor compacto y la prueba de igualdad por valor; como siguiente paso estudia sealed interfaces.

**Errores comunes:** usar un `record` para una entidad que genuinamente necesita mutar su estado (un ORM que actualiza campos), intentar agregar un setter a un componente del record, y validar invariantes fuera del constructor compacto en vez de dentro de él.

**Fuente oficial:** [dev.java: Records](https://dev.java/learn/classes-objects/records/) y [JEP 409: Sealed Classes](https://openjdk.org/jeps/409).

---

### Tema 2: sealed — jerarquías cerradas y exhaustividad · Intermedio · 45 min

**Prerrequisito:** JDK 27 y un editor. Comprueba `java --version`.

**Al terminar podrás:** cerrar una jerarquía de estados con `sealed`/`permits`, de modo que agregar un estado nuevo sin actualizar el código existente falle en compilación.

#### Aprende

Una entrega tiene un conjunto fijo de estados posibles (creada, en tránsito, entregada); si el código que procesa esos estados no se entera cuando alguien agrega un estado nuevo (cancelada), el nuevo estado queda silenciosamente sin manejar en producción.

**¿Por qué es importante?** `sealed` permite que el compilador verifique exhaustividad en un switch sin necesidad de una rama `default`, detectando en tiempo de compilación cualquier caso nuevo agregado a la jerarquía que se haya olvidado cubrir en algún switch existente.

`sealed interface Forma permits Circulo, Cuadrado {}` declara explícitamente, mediante la cláusula `permits`, exactamente qué clases o interfaces tienen permitido implementar o extender `Forma`, una restricción verificada por el compilador: ningún otro código, en ningún otro lugar del proyecto, puede crear una implementación adicional no listada en esa cláusula `permits`, a diferencia de una interfaz normal sin `sealed`, que cualquier clase en cualquier lugar puede implementar libremente sin ninguna restricción del compilador.

Esta restricción deliberada habilita una capacidad adicional en el pattern matching de switch (Tema 3): dado que el compilador conoce exactamente el conjunto completo y cerrado de implementaciones posibles de una sealed interface, puede verificar en tiempo de compilación que un switch sobre esa interfaz cubre absolutamente todos los casos posibles, sin necesidad de una rama `default` como red de seguridad — si en el futuro se agrega una nueva implementación a la lista `permits` pero se olvida agregar su caso correspondiente en algún switch existente en el código, el compilador falla inmediatamente en ese punto, señalando exactamente dónde falta cubrir el nuevo caso, en vez de dejar ese olvido como un bug silencioso que solo se manifestaría en producción cuando efectivamente se procese un objeto de ese nuevo tipo no contemplado.

**Analogía:** `sealed` es como una lista cerrada y oficial de sucursales autorizadas de una franquicia, donde no se permite abrir una sucursal nueva no autorizada explícitamente en esa lista; esto permite que cualquier proceso que dependa de conocer todas las sucursales existentes (como un switch exhaustivo) pueda confiar con certeza en que esa lista está efectivamente completa y no puede haber una sucursal adicional no contemplada apareciendo por sorpresa.

`sealed interface EstadoEntrega permits Creada, EnTransito, Entregada {}` restringe qué tipos pueden implementar la interfaz, verificado por el compilador. La analogía: una lista cerrada y oficial de sucursales autorizadas de una franquicia, donde no se permite abrir una nueva sin actualizar esa lista.

**Conceptos clave:** `permits`, lista explícita de implementaciones válidas, verificación de exhaustividad.

Cada conjunto cerrado de estados del proyecto integrador de este track (estado de una entrega, tipo de notificación, rol de usuario) debería modelarse como `sealed`, para que el compilador obligue a manejar un estado nuevo en cada switch existente.

**Cuándo no usarlo:** `sealed` no tiene sentido para un conjunto de tipos genuinamente abierto a extensión externa (por ejemplo, un plugin que terceros pueden implementar); en ese caso una interfaz normal, sin restricción de `permits`, es la elección correcta.

**Implicación práctica:** `sealed` convierte el olvido de manejar un estado nuevo en un error de compilación inmediato en cada switch existente, en vez de un bug silencioso que solo se descubre en producción cuando ese estado nuevo efectivamente ocurre.

**Código del ejemplo:**

```java
sealed interface Forma permits Circulo, Cuadrado {}
record Circulo(double radio) implements Forma {}
record Cuadrado(double lado) implements Forma {}
```

#### Practica

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-sealed-estados
cd ejemplo-sealed-estados
mkdir -p src/main/java/academia/estados
```

**Crea** `EstadoEntrega.java` como `sealed interface` con tres records implementándola (`Creada`, `EnTransito`, `Entregada`), y un método que use un `switch` exhaustivo sobre esos estados sin rama `default`:

```java
package academia.estados;

sealed interface EstadoEntrega permits Creada, EnTransito, Entregada {}

record Creada(String numero) implements EstadoEntrega {}

record EnTransito(String numero, double avanceKm) implements EstadoEntrega {}

record Entregada(String numero, String recibidoPor) implements EstadoEntrega {}

final class Main {
    static String describir(EstadoEntrega estado) {
        return switch (estado) {
            case Creada c -> "Creada " + c.numero();
            case EnTransito e -> "En tránsito " + e.numero() + " (" + e.avanceKm() + " km)";
            case Entregada e -> "Entregada " + e.numero() + " a " + e.recibidoPor();
        };
    }

    public static void main(String[] args) {
        System.out.println(describir(new Creada("E-001")));
        System.out.println(describir(new EnTransito("E-002", 4.5)));
        System.out.println(describir(new Entregada("E-003", "Ana")));
    }
}
```

**Ejecuta el ejemplo:**

```bash
javac -d out src/main/java/academia/estados/EstadoEntrega.java
java -cp out academia.estados.Main
```

**Resultado esperado:** `Creada E-001`, `En tránsito E-002 (4.5 km)` y `Entregada E-003 a Ana`. El `switch` no tiene `default` y compila porque el compilador sabe que `permits` agota exactamente esos tres tipos.

**Fallo deliberado:** agrega un cuarto record `Cancelada implements EstadoEntrega` a la cláusula `permits` sin actualizar el `switch` existente y recompila.

**Pista:** el compilador señala exactamente qué switch no cubre el caso nuevo, con un mensaje del tipo `the switch expression does not cover all possible input values`. **Resultado esperado:** agregar la rama faltante restaura la compilación.

**Si falla.** Si el compilador rechaza un tipo no listado en `permits`, es el comportamiento esperado: solo los tipos nombrados pueden implementar la interfaz sellada. Si el `switch` no compila aunque parezca completo, revisa que los tres records estén declarados en el mismo archivo o paquete y que la interfaz los nombre en `permits`.

#### Aplica

Intenta declarar una quinta implementación de `EstadoEntrega` en otro archivo sin agregarla a `permits`; confirma que el compilador la rechaza inmediatamente.

**Checklist de salida.**

- [ ] `EstadoEntrega.java` compila con `javac -d out`.
- [ ] El `switch` de `describir` no tiene rama `default`.
- [ ] Las tres salidas describen correctamente cada estado.
- [ ] Agregar `Cancelada` a `permits` rompe la compilación del switch existente.
- [ ] Añadir la rama de `Cancelada` restaura la compilación.
- [ ] Una implementación en otro archivo fuera de `permits` es rechazada.

**Si falla.** Si una implementación externa compila, la interfaz no es `sealed` o el tipo sí figura en `permits`. Si agregar `Cancelada` no rompe nada, el `switch` tiene una rama `default` que está ocultando el caso faltante.

Guarda la jerarquía sellada, el error de compilación al agregar un estado nuevo sin manejarlo, y la corrección; como siguiente paso estudia pattern matching.

**Errores comunes:** declarar una jerarquía abierta (sin `sealed`) cuando el conjunto de casos es en realidad fijo y conocido, agregar una implementación nueva a `permits` sin revisar qué switches existentes dejaron de ser exhaustivos, y usar `sealed` para un conjunto de tipos que legítimamente terceros deberían poder extender.

**Fuente oficial:** [dev.java: Records](https://dev.java/learn/classes-objects/records/) y [JEP 409: Sealed Classes](https://openjdk.org/jeps/409).

---

### Tema 3: Pattern matching exhaustivo y para instanceof · Intermedio · 45 min

**Prerrequisito:** JDK 27 y un editor. Comprueba `java --version`.

**Al terminar podrás:** calcular si una entrega puede reprogramarse según su estado sellado usando pattern matching, sin casteo manual.

#### Aprende

Calcular si una entrega puede reprogramarse depende de su estado exacto (no se puede reprogramar una ya `Entregada`); expresar esa lógica con casteos manuales anidados es más verboso y propenso a errores que un switch con pattern matching.

**¿Por qué es importante?** El pattern matching exhaustivo garantiza, verificado por el compilador, que ningún caso posible de una sealed interface quede sin cubrir; el pattern matching para instanceof elimina la redundancia y el riesgo del casteo manual clásico.

Un `switch` con pattern matching extrae directamente el valor ya tipado de cada rama, y el compilador verifica exhaustividad contra la jerarquía `sealed` (Tema 2), sin necesitar `default`. La analogía: verificar la identidad de alguien y recibir simultáneamente su credencial ya lista para usar, sin un paso adicional redundante.

```java
double area(Forma forma) {
    return switch (forma) {
        case Circulo c -> Math.PI * c.radio() * c.radio();
        case Cuadrado q -> q.lado() * q.lado();
    };
}
```

Este switch combina pattern matching (extrayendo directamente `c`/`q` ya tipados correctamente según cada caso, sin casteo manual explícito) con la verificación de exhaustividad habilitada por `sealed` (Tema 2): el compilador verifica que este switch efectivamente cubre absolutamente todos los casos posibles de la sealed interface `Forma` (`Circulo` y `Cuadrado`, y ningún otro caso posible dado que `permits` los restringe exactamente a esos dos), permitiendo omitir por completo una rama `default`, dado que no existe ningún caso adicional posible que esa rama tendría que cubrir.

```java
if (obj instanceof Circulo c) {
    System.out.println(c.radio());
}
```

Este pattern matching para `instanceof` reemplaza el patrón clásico anterior (`if (obj instanceof Circulo) { Circulo c = (Circulo) obj; ... }`, que requería un casteo manual explícito y redundante inmediatamente después de la verificación `instanceof`) con una única expresión que verifica el tipo y simultáneamente declara una variable ya correctamente tipada (`c`) disponible directamente dentro del bloque donde la verificación resultó verdadera, eliminando la redundancia y el riesgo de un casteo manual incorrecto que el patrón clásico anterior conllevaba.

**Analogía:** un switch exhaustivo verificado por el compilador es como un formulario de clasificación que garantiza automáticamente que cada categoría posible de un conjunto cerrado y conocido tiene su propio casillero correspondiente, sin necesidad de un casillero genérico de "otros" como respaldo; pattern matching para instanceof es como verificar la identidad de alguien y recibir simultáneamente su credencial ya lista para usar, en vez de verificar la identidad y luego tener que solicitar la credencial por separado en un paso adicional redundante.

**Conceptos clave:** switch sin default verificado, eliminación del casteo manual clásico.

Cada regla de negocio del proyecto integrador de este track que dependa del estado exacto de una entidad sellada se beneficiará de este mismo patrón: switch exhaustivo, sin `default`, verificado por el compilador.

**Cuándo no usarlo:** agregar una rama `default` a un switch exhaustivo sobre una sealed interface, "por si acaso", anula justamente la verificación de exhaustividad que `sealed` habilita — solo omite `default` cuando genuinamente quieres que el compilador te obligue a cubrir cada caso nuevo.

**Implicación práctica:** Un switch exhaustivo sin `default`, verificado contra una jerarquía `sealed`, convierte un estado nuevo sin manejar en un error de compilación inmediato, mientras que un `default` oculta ese mismo olvido dejándolo pasar en silencio.

#### Practica

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-pattern-matching
cd ejemplo-pattern-matching
mkdir -p src/main/java/academia/patrones
```

**Crea** `CalculadoraReprogramacion.java` con un método `puedeReprogramarse(EstadoEntrega estado)` que use un `switch` exhaustivo sobre la jerarquía sellada del Tema 2 (`Creada` y `EnTransito` devuelven `true`, `Entregada` devuelve `false`):

```java
package academia.patrones;

sealed interface EstadoEntrega permits Creada, EnTransito, Entregada {}

record Creada(String numero) implements EstadoEntrega {}

record EnTransito(String numero, double avanceKm) implements EstadoEntrega {}

record Entregada(String numero, String recibidoPor) implements EstadoEntrega {}

public final class CalculadoraReprogramacion {
    static boolean puedeReprogramarse(EstadoEntrega estado) {
        return switch (estado) {
            case Creada c -> true;
            case EnTransito e -> true;
            case Entregada e -> false;
        };
    }

    public static void main(String[] args) {
        System.out.println("Creada: " + puedeReprogramarse(new Creada("E-001")));
        System.out.println("En tránsito: " + puedeReprogramarse(new EnTransito("E-002", 3.0)));
        System.out.println("Entregada: " + puedeReprogramarse(new Entregada("E-003", "Ana")));
    }
}
```

**Ejecuta el ejemplo:**

```bash
javac -d out src/main/java/academia/patrones/CalculadoraReprogramacion.java
java -cp out academia.patrones.CalculadoraReprogramacion
```

**Resultado esperado:** `Creada: true`, `En tránsito: true` y `Entregada: false`, sin ningún `default` y sin ningún casteo manual.

**Fallo deliberado:** agrega el estado `Cancelada` (del Tema 2) a la jerarquía sin actualizar este switch y recompila.

**Pista:** el compilador señala que `puedeReprogramarse` no cubre `Cancelada`. **Resultado esperado:** agregar esa rama restaura la compilación exhaustiva.

**Si falla.** Si el switch compila con `Cancelada` sin agregar su rama, existe un `default` que debes eliminar para recuperar la verificación. Si el patrón `case Entregada e` no compila, confirma que `Entregada` es un record accesible desde el mismo paquete.

#### Aplica

Reescribe una comprobación equivalente usando el patrón clásico (`instanceof` + casteo manual) y compara la legibilidad con la versión de pattern matching; documenta en una frase cuál preferirías mantener.

**Checklist de salida.**

- [ ] `CalculadoraReprogramacion.java` compila y ejecuta.
- [ ] `Creada` y `EnTransito` devuelven `true`.
- [ ] `Entregada` devuelve `false`.
- [ ] El switch no usa `default` ni casteos manuales.
- [ ] Agregar `Cancelada` sin su rama rompe la compilación.
- [ ] La versión clásica con `instanceof` + cast produce el mismo resultado.

**Si falla.** Si la versión clásica devuelve un resultado distinto, revisa que el `else` final cubra el caso restante en vez de asumir un tipo. Si el compilador advierte sobre una variable de patrón sin usar, es una advertencia del editor y no un error de compilación.

Guarda ambas versiones (pattern matching y casteo clásico) y el error de exhaustividad al agregar `Cancelada`; como siguiente paso estudia módulos y JPMS.

**Errores comunes:** agregar una rama `default` "por si acaso" a un switch exhaustivo sobre una sealed interface (anula la verificación de exhaustividad que `sealed` habilita), usar el casteo manual clásico (`instanceof` + cast) donde pattern matching ya elimina esa redundancia, y olvidar que un switch con pattern matching debe cubrir la jerarquía completa para omitir `default`.

**Fuente oficial:** [dev.java: Records](https://dev.java/learn/classes-objects/records/) y [JEP 409: Sealed Classes](https://openjdk.org/jeps/409).

---

### Tema 4: Unnamed variables y patterns (_, Java 22) · Avanzado · 50 min

**Prerrequisito:** JDK 22+ (el ejemplo se compila con JDK 27) y Tema 2 de este módulo. Comprueba `java --version`.

**Al terminar podrás:** usar el patrón `_` (unnamed variables, Java 22) para descartar explícitamente un componente de un record pattern que no necesitas, y en un bloque `catch` que no necesita la excepción.

#### Aprende

Al deconstruir un record `Paquete(Dimensiones dim, String destino)` con pattern matching, un método solo necesita `destino`; nombrar la parte que no usas con un identificador real genera una advertencia de "variable no utilizada" que el equipo aprendió a ignorar — y esa misma advertencia ignorada por costumbre ocultó, en un cambio reciente, una variable genuinamente olvidada en otro método completamente distinto.

**¿Por qué es importante?** Porque el lenguaje puede hacer que estados imposibles sean difíciles de representar, y también que lo deliberadamente ignorado sea indistinguible de lo olvidado si no existe una sintaxis reservada para expresar esa intención.

Las unnamed patterns (`_`, finalizadas en Java 22) permiten descartar explícitamente un binding de un pattern match (record pattern, catch, o lambda) que no se va a usar, dejando una sintaxis reservada exclusivamente para "esto es deliberado", distinta de cualquier variable nombrada. La analogía: una casilla de formulario marcada "N/A" frente a una casilla vacía — nadie puede distinguir si la dejaron vacía a propósito o si se olvidaron de completarla.

```java
try {
    return Integer.parseInt(texto);
} catch (NumberFormatException _) {
    return 0; // no necesitamos el detalle de la excepción, solo saber que ocurrió
}
```

Esta sintaxis también aplica a bloques `catch`, lambdas con parámetros no usados, y bucles `for` tradicionales con un índice no usado; en todos los casos, `_` deja una señal explícita e inconfundible de que ese binding es deliberadamente ignorado, distinta de cualquier variable nombrada (que el compilador y los linters tratan como potencialmente usada en otra parte).

**Analogía:** `_` es como una casilla de formulario marcada explícitamente "N/A"; una variable nombrada sin usar es como una casilla vacía — nadie puede distinguir con certeza si fue dejada vacía a propósito o si simplemente se olvidó completarla.

**Conceptos clave:** unnamed variables, unnamed patterns, _, catch sin binding, descartar un componente de un record pattern, text blocks (`"""`).

Cada deconstrucción del proyecto integrador de este track que no necesite todos los componentes de un record pattern debería usar `_` para los que descarta, en vez de nombrarlos igual sin usarlos.

**Cuándo no usarlo:** si existe cualquier posibilidad de que el binding se use más adelante en el mismo bloque, nómbralo normalmente; `_` no es una variable y el compilador rechaza cualquier intento de leerlo.

**Implicación práctica:** `_` elimina la ambigüedad entre "deliberadamente ignorado" y "olvidado", reduciendo el ruido de advertencias de variables no utilizadas que puede ocultar advertencias legítimas.

**Código del ejemplo:**

```java
String resumen(Paquete paquete) {
    return switch (paquete) {
        case Paquete(Dimensiones _, String destino) -> "Destino: " + destino;
    };
}
```

```mermaid
flowchart LR
  P["Paquete(dim, destino)"] --> D{necesito dim?}
  D -->|no| U["_ (descartado explícito)"]
  D -->|sí| N["var dim (nombrado)"]
```

#### Practica

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-unnamed-patterns
cd ejemplo-unnamed-patterns
mkdir -p src/main/java/academia/patrones
```

**Crea** `src/main/java/academia/patrones/ExtractorDestino.java`. El programa reúne los dos usos de `_` (record pattern y `catch`) y el text block de la consulta:

```java
package academia.patrones;

record Dimensiones(double ancho, double alto) {}

record Paquete(Dimensiones dim, String destino) {}

public final class ExtractorDestino {
    static String resumen(Paquete paquete) {
        return switch (paquete) {
            case Paquete(Dimensiones _, String destino) -> "Destino: " + destino;
        };
    }

    static int entero(String texto) {
        try {
            return Integer.parseInt(texto);
        } catch (NumberFormatException _) {
            return 0;
        }
    }

    public static void main(String[] args) {
        System.out.println(resumen(new Paquete(new Dimensiones(30, 20), "Centro")));
        System.out.println("Entero: " + entero("42") + " / " + entero("abc"));

        String consulta = """
            SELECT numero, estado
            FROM entregas
            WHERE estado = 'EN_RUTA'
            """;
        System.out.println(consulta);
    }
}
```

**Ejecuta el ejemplo** directamente con `javac`:

```bash
javac -d out src/main/java/academia/patrones/ExtractorDestino.java
java -cp out academia.patrones.ExtractorDestino
```

Resultado esperado: el compilador acepta `_` como un marcador explícito de "este componente del record pattern es deliberadamente ignorado", sin generar ninguna advertencia de variable no utilizada, y sin que `_` quede disponible como variable dentro del bloque. La salida es `Destino: Centro`, `Entero: 42 / 0` y las tres líneas de la consulta.

Además, Java 15 introdujo los **text blocks** (`"""`) para escribir texto multilínea sin concatenar ni escapar comillas. Declara en el mismo archivo una consulta de ejemplo:
```java
String consulta = """
    SELECT numero, estado
    FROM entregas
    WHERE estado = 'EN_RUTA'
    """;
```
Resultado esperado: `consulta` contiene las tres líneas separadas por salto de línea, sin ningún `\n` ni `+` explícito en el código; Java elimina automáticamente la sangría común a todas las líneas, tomando como referencia la sangría de la comilla de cierre. **Fallo deliberado:** desalinea la comilla de cierre `""";` moviéndola una columna más a la izquierda que el texto interior. El compilador deja de eliminar correctamente la sangría incidental y cada línea del resultado aparece con un espacio extra al inicio que no estaba en la intención original — la sangría del delimitador de cierre, y no la del texto, es la que determina cuánto se recorta.

**Equivalente con Maven o Gradle** (el arquetipo genera un proyecto nuevo; si lo usas, copia el archivo dentro de `app/` antes de ejecutar las pruebas):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

**Fallo deliberado:** nombra la parte descartada con un identificador real sin uso (`Dimensiones dimensionesSinUsar`) en varios métodos distintos del proyecto, "para que quede más descriptivo".

**Pista:** el linter ahora reporta "variable no utilizada" en cada uno de esos métodos junto con las advertencias legítimas de variables genuinamente olvidadas, y el equipo termina ignorando TODAS las advertencias de esa categoría por volumen, incluyendo la que señalaba un error real. **Resultado esperado:** volver a `_` deja el reporte del linter únicamente con las advertencias legítimas.

**Si falla.** Si `_` no compila en un record pattern, el proyecto está apuntando a una versión de Java anterior a la 22: revisa `--release` en `javac` o `maven.compiler.release` en `pom.xml`. Si el compilador rechaza una segunda `_` en el mismo bloque, es correcto: `_` no es una variable reutilizable. Si el text block imprime una línea vacía al inicio, la comilla de apertura `"""` debe ir seguida inmediatamente de un salto de línea.

#### Aplica

Corrige el fallo anterior reemplazando cada binding deliberadamente descartado por `_`, y confirma que el linter ahora reporta únicamente las advertencias de variables genuinamente olvidadas, sin el ruido de las deliberadamente ignoradas.

**Checklist de salida.**

- [ ] `ExtractorDestino.java` compila con `javac -d out`.
- [ ] El record pattern usa `Dimensiones _` sin advertencia de variable no utilizada.
- [ ] El bloque `catch (NumberFormatException _)` compila y devuelve `0`.
- [ ] El text block imprime las tres líneas sin `\n` explícito en el código.
- [ ] Mover la comilla de cierre altera la sangría del resultado.
- [ ] El linter no reporta advertencias sobre los bindings descartados con `_`.

**Si falla.** Si el text block conserva espacios al inicio, la comilla de cierre está más a la izquierda que el texto. Si `_` aparece en una expresión como `System.out.println(_)`, el compilador lo rechaza: es un marcador, no un identificador. Si el linter sigue reportando una variable descartada, quedó un nombre real sin reemplazar.

Entregá el record pattern con `_` de la demostración, el text block de la consulta SQL con su fallo de sangría corregido, el ruido de advertencias por nombrar variables descartadas y la señal limpia del linter tras el fallo deliberado; explicá por qué una sintaxis reservada exclusivamente para "descartado a propósito" reduce el ruido que oculta advertencias legítimas. Siguiente paso: aplica records, sealed interfaces, pattern matching, text blocks y unnamed variables juntos en el dominio del proyecto integrador (Módulo 13).

**Errores comunes:** nombrar bindings descartados con nombres reales que generan ruido de lint, usar `_` para un binding que SÍ se usa más adelante (no compila), asumir que `_` es una variable utilizable (es un marcador, no un identificador), y desalinear la comilla de cierre de un text block esperando que la sangría se ajuste sola.

**Fuente oficial:** [JEP 456: Unnamed Variables & Patterns](https://openjdk.org/jeps/456) y [Unnamed Variables and Patterns](https://docs.oracle.com/en/java/javase/22/language/unnamed-variables-and-patterns.html).

---


## Construcción guiada del capítulo

**Objetivo del laboratorio:** modelar un dominio inmutable con records y sealed interfaces, con pattern matching exhaustivo.

**Requisitos previos:** Módulos 0-6 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Definir `Punto` como record | Ver Tema 1 | Verifica los métodos generados automáticamente |
| 2 | Definir `Forma` como sealed interface | Ver Tema 2 | Con `Circulo` y `Cuadrado` como records |
| 3 | Escribir un switch exhaustivo sin `default` | Ver Tema 3 | Verifica el error del compilador si falta un caso |
| 4 | Usar pattern matching para instanceof | Ver Tema 3 | Sin casteo manual |
| 5 | Escribir un text block para SQL multilínea | Ver Tema 4 | Con `"""`, cuidando la sangría de la comilla de cierre |
| 6 | Descartar un componente de un record pattern con `_` | Ver Tema 4 | Sin ruido de lint por variables no utilizadas |

**Verificación:** el laboratorio se considera exitoso si agregar una nueva implementación a `permits` sin actualizar el switch existente produce un error de compilación (no un bug silencioso), si el modelo de dominio es completamente inmutable, y si el linter no reporta ninguna advertencia sobre los componentes descartados con `_`.

**Errores comunes y soluciones**

- **Agregar una rama `default` innecesaria a un switch exhaustivo sobre una sealed interface.** Omítela para que el compilador verifique exhaustividad real.
- **Intentar mutar un componente de un record.** Los records son inmutables; construye una nueva instancia con los valores actualizados.
- **Usar el casteo manual clásico donde pattern matching para instanceof sería más claro.** Prefiere `if (obj instanceof Tipo variable)`.
- **Nombrar un binding descartado con un identificador real.** Usa `_` para que el linter no mezcle ese ruido con advertencias legítimas de variables olvidadas.

---
