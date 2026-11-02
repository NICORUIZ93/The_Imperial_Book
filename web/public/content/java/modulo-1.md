# Módulo 1: Programación orientada a objetos


**Proyecto del módulo:** crea un proyecto Maven o Gradle desde cero, pega el código del tema y corre las pruebas; las equivalencias entre ambos sistemas están en el Módulo 8, Tema 4.

## Aprende construyendo

### Tema 1: Clases, objetos, constructores y encapsulación · Básico · 40 min

**Paso 1 · Objetivo y preparación**

**Prerrequisito:** Módulo 0 de Java (clases, `main`, tipos), JDK 27 o posterior y un editor. Comprueba `java --version` y `javac --version`.

**Al finalizar podrás:** distinguir clase de instancia; usar `this`, campos de instancia y estáticos; escribir un constructor que valide invariantes y una sobrecarga que delegue con `this(...)`; y encapsular con `private final` y getters sin setters.

#### Aprende

**Paso 2 · Contexto y caso profesional**

**Caso profesional (escenario de RutaFlow):** una guía sin número o con peso fuera de rango no debe llegar al motor como una instancia válida. El constructor puede rechazar esos datos al crear el objeto, en vez de dejar que cada consumidor recuerde validarlos.

**Paso 3 · Teoría, modelo mental y analogía**

**¿Por qué es importante?** Porque un constructor que valida sus invariantes es la única garantía real de que ningún objeto inválido llegue a existir en el sistema, sin depender de que cada consumidor recuerde validar por su cuenta antes de usarlo.

El constructor es la única puerta de entrada para crear un objeto: si valida ahí, ningún consumidor puede construir una instancia inválida y "completarla después".

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| clase frente a objeto/instancia | Prerrequisito | la clase `Guia` es el molde; `new Guia(...)` crea instancias distintas |
| campos de instancia y `this` | Núcleo | `this.numero` distingue el campo del parámetro homónimo |
| constructor e invariantes | Núcleo | el constructor rechaza datos inválidos antes de crear el objeto |
| constructor por defecto frente a explícito | Diagnóstico | al declarar un constructor, `new Guia()` deja de existir |
| sobrecarga de constructores y `this(...)` | Variante | un constructor corto delega en el principal sin repetir validación |
| encapsulación: `private` y `final` | Núcleo | sin setters, el invariante no se puede romper tras construir |
| getters sin setters | Decisión | se expone lectura, no mutación |
| campos estáticos frente a instancia | Límite | un contador `static` pertenece a la clase, no a cada objeto |
| identidad de objetos (`==`) | Límite | dos instancias con los mismos datos no son `==` |
| cuándo NO imponer invariantes | Decisión | un DTO de transporte no necesita esta disciplina |

Cada fila tiene su explicación individual a continuación.

**Clase frente a objeto/instancia (prerrequisito).** Una **clase** es el molde que describe qué datos y qué comportamiento tendrán los objetos; un **objeto** (o instancia) es cada ejemplar concreto creado con `new`. `Guia` es la clase; `new Guia("RF-1", 12.5)` y `new Guia("RF-2")` son dos objetos independientes, cada uno con sus propios campos.

**Campos de instancia y `this` (núcleo).** Los campos declarados sin `static` pertenecen a **cada instancia**: dos guías tienen su propio `numero` y `pesoKg`. Dentro del constructor, el parámetro `numero` y el campo `numero` se llaman igual; `this.numero` se refiere al **campo del objeto** y `numero` (sin `this`) al parámetro. Sin `this`, la asignación `numero = numero` se asignaría el parámetro a sí mismo y el campo quedaría sin inicializar.

**Constructor e invariantes (núcleo).** El constructor es la única puerta para crear el objeto. Si valida ahí (rechazando número vacío o peso fuera de rango con `IllegalArgumentException`), ningún consumidor puede construir una instancia inválida y "completarla después".

**Constructor por defecto frente a explícito (diagnóstico).** Si una clase **no declara** ningún constructor, Java le da uno sin argumentos (el *por defecto*). Pero en cuanto declaras **uno explícito**, ese por defecto desaparece: con `Guia(String, double)` definido, `new Guia()` ya no compila. Es un error frecuente al añadir el primer constructor con parámetros.

**Sobrecarga de constructores y `this(...)` (variante).** Puedes ofrecer varios constructores con firmas distintas. Para no repetir la validación, un constructor corto delega en el principal con `this(...)`: `Guia(String numero) { this(numero, 1.0); }`. La regla del lenguaje: `this(...)` debe ser la **primera** instrucción del constructor.

**Encapsulación: `private` y `final` (núcleo).** Los campos son `private` (nadie los toca desde fuera) y `final` (no se reasignan tras construir). Juntos garantizan que, una vez validado el objeto, su estado no puede romperse: no hay setter que vuelva a dejar un peso inválido.

**Getters sin setters (decisión).** Para que otros lean el valor, expones **getters** (`numero()`, `pesoKg()`), pero **no setters**. Así permites lectura sin abrir la puerta a una mutación que rompa el invariante. Exponer un setter equivaldría a renunciar a la garantía del constructor.

**Campos estáticos frente a instancia (límite).** Un campo `static` (por ejemplo un contador `creadas`) pertenece a la **clase**, no a cada objeto: todas las instancias comparten el mismo. Se accede como `Guia.creadas()`. No confundas "dato de cada guía" (instancia) con "dato de todas las guías" (estático).

**Identidad de objetos (límite).** `==` entre objetos compara **identidad** (si son el mismo objeto en memoria), no contenido. Dos guías con los mismos datos (`new Guia("RF-1", 12.5)` dos veces) **no** son `==`. Comparar su contenido es trabajo de `equals` (Módulo posterior); por ahora, ten claro que `new` siempre crea un objeto distinto.

**Analogía (con su límite):** el constructor es el control de calidad de la línea de ensamblaje: rechaza la pieza defectuosa antes de que salga de fábrica. La analogía explica la validación de invariantes; no explica `this`, la sobrecarga ni la identidad, que son reglas del lenguaje.

**Conceptos clave:** clase/instancia, `this`, invariantes, constructor por defecto/explícito, `this(...)`, encapsulación, estático/instancia, identidad.

**Código del ejemplo:**

```java
package academia.entregas;

public final class Guia {
    private static int creadas = 0;              // estático: compartido por la clase
    private final String numero;                 // instancia: propio de cada objeto
    private final double pesoKg;

    public Guia(String numero, double pesoKg) {  // constructor principal (valida)
        if (numero == null || numero.isBlank()) {
            throw new IllegalArgumentException("El número de guía no puede estar vacío");
        }
        if (pesoKg <= 0 || pesoKg > 50) {
            throw new IllegalArgumentException("El peso debe estar entre 0 y 50 kg");
        }
        this.numero = numero;                    // this: campo frente a parámetro
        this.pesoKg = pesoKg;
        creadas++;
    }

    public Guia(String numero) { this(numero, 1.0); }  // sobrecarga que delega con this(...)

    public String numero() { return numero; }          // getter, sin setter
    public double pesoKg() { return pesoKg; }
    public static int creadas() { return creadas; }     // dato de la clase

    public static void main(String[] args) {
        Guia a = new Guia("RF-1", 12.5);
        Guia b = new Guia("RF-2");                       // usa el constructor sobrecargado
        System.out.println(a.numero() + " " + a.pesoKg() + " | " + b.numero() + " " + b.pesoKg());
        System.out.println("instancias creadas=" + Guia.creadas());
        Guia otra = new Guia("RF-1", 12.5);
        System.out.println("a==otra? " + (a == otra));   // identidad: objetos distintos
    }
}
```

Los campos son `private final`: no hay setters que rompan el invariante tras construir, y el constructor rechaza cualquier valor inválido antes de que el objeto exista. El contador `creadas` es `static` porque cuenta guías de toda la clase, no de una instancia.

**Cuándo no usarlo:** para un objeto puramente de transporte de datos sin ninguna regla de negocio que proteger (un DTO que solo cruza una frontera de serialización), validar cada campo en el constructor es esfuerzo sin beneficio real; resérvalo para entidades de dominio donde un estado inválido tendría consecuencias reales.

#### Practica

**Paso 4 · Demostración guiada desde cero**

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-guia-invariantes
cd ejemplo-guia-invariantes
mkdir -p src/main/java/academia/entregas
```

**Crea** el archivo `src/main/java/academia/entregas/Guia.java` con el código del ejemplo, incluyendo el paquete y la clase completos; guárdalo antes de compilar.

**Ejecuta el ejemplo** (compila y ejecuta el `main` de la clase):

```bash
javac -d out src/main/java/academia/entregas/Guia.java
java -cp out academia.entregas.Guia
```

**Resultado esperado** (verificado con Temurin 27.0.1):

```text
RF-1 12.5 | RF-2 1.0
instancias creadas=2
a==otra? false
```

Léelo subtema por subtema: `b` usó el constructor sobrecargado (peso por defecto `1.0`); `creadas=2` es el contador estático compartido; y `a==otra` es `false` porque son objetos distintos aunque tengan los mismos datos.

**Fallo deliberado 1 — invariante:** en `main`, sustituye `new Guia("RF-1", 12.5)` por `new Guia("", 10)`, recompila y ejecuta. El constructor lanza `IllegalArgumentException` y la guía nunca llega a existir; repite con `new Guia("RF-1", 0)`.

**Fallo deliberado 2 — constructor por defecto:** añade en `main` la línea `new Guia();`. No compila:

```text
error: constructor Guia in class Guia cannot be applied to given types;
  required: String,double
  found:    no arguments
```

Al declarar constructores con parámetros, el constructor sin argumentos **ya no existe**. Quita la línea para seguir.

Después de observar el fallo, restaura los argumentos válidos. **Pista:** ambas construcciones inválidas deben fallar desde el constructor, antes de que exista una instancia a medias; si el objeto se crea y el error aparece después, la validación está en el lugar equivocado. **Resultado esperado:** ninguna instancia inválida llega a existir.

**Si falla.** Si `javac` no encuentra `Guia.java`, revisa que la ruta incluya `src/main/java/academia/entregas` y que el paquete del archivo coincida. Si `java` no encuentra la clase, comprueba que `-cp` apunta a `out` y que ejecutas el nombre completo `academia.entregas.Guia`. Si la guía vacía se crea sin lanzar nada, la comparación del número está mal: `isBlank()` cubre también una cadena de solo espacios.

**Paso 5 · Práctica guiada**

Restaura los datos válidos y prueba el límite superior: crea `new Guia("RF-2", 50)` y luego `new Guia("RF-3", 50.01)`. Antes de ejecutar, predice cuál construcción se acepta y cuál lanza `IllegalArgumentException`.

**Pista:** el límite está expresado como `pesoKg > 50`; por eso 50 se acepta y cualquier valor mayor se rechaza. Si ambas construcciones se aceptan, revisa la condición del constructor.

#### Aplica

**Paso 6 · Práctica independiente**

Escribe `GuiaTest` con un caso válido y tres casos inválidos (número vacío, peso cero, peso mayor a 50); confirma que los tres lanzan excepción desde el constructor, no desde un método `validar()` separado.

**Paso 7 · Cierre**

**Checklist de salida.**

- [ ] `Guia.java` compila con `javac -d out` y conserva el paquete `academia.entregas`.
- [ ] La ejecución imprime `RF-1 12.5 | RF-2 1.0`, `instancias creadas=2` y `a==otra? false`.
- [ ] El constructor sobrecargado `Guia(String)` delega con `this(numero, 1.0)`.
- [ ] `new Guia("", 10)` y `new Guia("RF-1", 0)` lanzan `IllegalArgumentException` desde el constructor.
- [ ] `new Guia()` no compila porque hay un constructor explícito con parámetros.
- [ ] Ningún setter permite modificar `numero` o `pesoKg` después de construir.
- [ ] `creadas` es estático (dato de la clase) y `a==otra` demuestra identidad, no contenido.

**Si falla.** Si `instancias creadas` no es `2`, el contador no es `static` o se reinicia. Si `a==otra` da `true`, estás comparando la misma referencia, no dos `new`. Si `new Guia()` compila, no declaraste un constructor con parámetros. Si una construcción inválida no lanza excepción, ese caso no llega al constructor.

Guarda `Guia.java`, la salida, el `IllegalArgumentException` y el error de `new Guia()`. Esta disciplina (validar en el constructor, encapsular con `private final`, exponer getters sin setters) es la que aplicarás a cada entidad del proyecto integrador.

**Antes del siguiente tema:** explica qué invariante protege el constructor, por qué `this` es necesario cuando el parámetro y el campo se llaman igual, y en qué se diferencia un campo estático de uno de instancia.

**Errores comunes:** validar en un método separado en vez del constructor; olvidar `this` y asignar el parámetro a sí mismo; exponer setters que rompan el invariante; asumir que `new Guia()` sigue existiendo tras declarar otro constructor; y comparar objetos con `==` esperando comparar contenido.

**Fuentes oficiales revisadas el 2026-11-01:** [dev.java: clases y objetos](https://dev.java/learn/classes-objects/), [JLS 8.8 — constructores (Java SE 27)](https://docs.oracle.com/javase/specs/jls/se27/html/jls-8.html#jls-8.8) y [The Java Tutorials: classes and objects](https://docs.oracle.com/javase/tutorial/java/javaOO/).

### Tema 2: Herencia y sobreescritura · Intermedio · 1 h

**Paso 1 · Objetivo y preparación**

**Prerrequisito:** Tema 1 de este módulo, JDK 27 o posterior y un editor. Comprueba `java --version` y `javac --version`.

**Al finalizar podrás:** usar `extends`/`super`, demostrar dispatch dinámico, sobreescribir métodos de `Object`, hacer downcasting seguro con `instanceof`, limitar la herencia con `sealed`, y diagnosticar el error de olvidar `@Retention(RUNTIME)` en una anotación propia.

#### Aprende

**Paso 2 · Contexto y caso profesional**

**Caso profesional (escenario de RutaFlow):** el motor puede operar con distintos tipos de entrega mediante un tipo común, mientras un componente de auditoría busca una anotación en acciones sensibles. La sobreescritura y la retención de anotaciones resuelven problemas distintos y se probarán por separado.

**Paso 3 · Teoría, modelo mental y analogía**

**¿Por qué es importante?** Porque el polimorfismo de subtipo permite que el mismo código funcione correctamente con cualquier subclase futura sin modificarse, y una anotación propia sin la retención correcta falla en silencio para quien la consume por reflexión, aunque el código compile sin ningún error.

El tipo real del objeto en tiempo de ejecución decide qué versión sobreescrita se ejecuta, no el tipo declarado de la variable.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| `extends` y qué se hereda | Prerrequisito | la subclase usa miembros no privados de la superclase |
| `super(...)` en el constructor | Núcleo | el constructor de la subclase inicializa la parte heredada |
| sobreescritura y `@Override` | Núcleo | la subclase redefine un método con la misma firma |
| polimorfismo de subtipo (dispatch dinámico) | Núcleo | el tipo real decide el método ejecutado |
| `super.metodo()` | Variante | la subclase reutiliza y extiende la versión heredada |
| `Object` y sus métodos | Integración | sobreescribir `toString`/`equals` heredados de `Object` |
| `instanceof` y downcasting | Diagnóstico | refinar el tipo con patrón; un cast inválido lanza `ClassCastException` |
| `final`/`sealed` para limitar herencia | Decisión | impedir o restringir quién puede heredar |
| anotaciones: `@interface`, `@Target`, `@Retention` | Núcleo | metadatos que una herramienta interpreta |
| retención y reflexión | Diagnóstico | sin `RUNTIME`, la reflexión no encuentra la anotación |

El tema tiene dos ejes: la **herencia/polimorfismo** (filas 1–8) y las **anotaciones** (filas 9–10). Cada fila tiene su explicación individual a continuación.

**`extends` y qué se hereda (prerrequisito).** `class Perro extends Animal` hace que `Perro` reciba los miembros **no privados** de `Animal` (campos `protected`/públicos y métodos). Lo `private` de la superclase existe en el objeto pero no es accesible por nombre desde la subclase. Una clase solo puede extender **una** superclase (herencia simple).

**`super(...)` en el constructor (núcleo).** Al construir una subclase, primero debe construirse la parte heredada. `super(nombre)` llama al constructor de la superclase y debe ser la **primera** instrucción del constructor de la subclase; si no lo escribes y la superclase tiene constructor sin argumentos, Java inserta `super()` implícito. Si la superclase solo tiene constructores con parámetros, estás **obligado** a llamar `super(...)` explícitamente.

**Sobreescritura y `@Override` (núcleo).** La subclase redefine un método heredado con la **misma firma** para especializar su comportamiento. `@Override` no es obligatorio, pero pide al compilador que verifique que realmente sobreescribe algo: si escribes mal el nombre o cambias la firma, en vez de crear un método nuevo sin querer, obtienes un error.

**Polimorfismo de subtipo / dispatch dinámico (núcleo).** Cuando invocas un método sobreescrito a través de una referencia de la superclase, se ejecuta la versión del **tipo real** del objeto, decidido en tiempo de ejecución: `Animal a = new Perro(); a.hablar()` ejecuta el `hablar()` de `Perro`. Esto permite que código escrito contra `Animal` funcione con subclases futuras sin tocarse.

**`super.metodo()` (variante).** Dentro de un método sobreescrito, `super.hablar()` invoca la versión **de la superclase**, no la propia. Sirve para extender el comportamiento heredado (hacer algo adicional) en vez de reemplazarlo del todo.

**`Object` y sus métodos (integración).** Toda clase hereda de `Object`, que aporta `toString()`, `equals()`, `hashCode()`, etc. Sobreescribir `toString()` cambia cómo se imprime el objeto; es un caso real de sobreescritura heredada que usarás en casi todas tus clases.

**`instanceof` y downcasting (diagnóstico).** Para tratar una referencia de superclase como su subclase concreta necesitas un *downcast*. Hazlo seguro con el patrón `if (a instanceof Perro p)`: si `a` no es un `Perro`, el bloque no entra. Un cast directo `(Perro) g` sobre un objeto que **no** es `Perro` compila pero lanza `ClassCastException` en ejecución.

**`final`/`sealed` para limitar herencia (decisión).** `final class` impide que alguien herede de tu clase; `sealed class Animal permits Perro, Gato` **restringe** quién puede hacerlo a una lista cerrada, lo que además habilita la comprobación de exhaustividad en un `switch`. Son decisiones de diseño: abres la herencia solo a quien debe extender.

**Anotaciones: `@interface`, `@Target`, `@Retention` (núcleo).** El `@` introduce una **anotación**: metadatos sobre una declaración, no código ejecutable. Declaras una propia con `@interface`; `@Target` limita dónde puede ponerse (método, clase, campo…) y `@Retention` cuánto vive: `SOURCE` (solo en el fuente), `CLASS` (en el `.class`) o `RUNTIME` (accesible por reflexión).

**Retención y reflexión (diagnóstico).** Una herramienta que lee anotaciones en ejecución (un interceptor, un framework) solo las encuentra si su retención es `RUNTIME`. Declarar una anotación sin `@Retention(RUNTIME)` y esperar que la reflexión la vea es un fallo silencioso: el código compila pero `isAnnotationPresent(...)` devuelve `false`.

`class Perro extends Animal` establece que `Perro` hereda todos los miembros no privados de `Animal`, pudiendo además sobreescribir (`@Override`) el comportamiento de métodos heredados para especializarlo: `Animal` define `hablar()` devolviendo `"..."`, y `Perro` sobreescribe ese mismo método para devolver `"Guau"`, de modo que invocar `hablar()` sobre una referencia de tipo `Animal` que en realidad apunta a un objeto `Perro` en tiempo de ejecución invoca la versión sobreescrita de `Perro`, no la de `Animal`, un comportamiento llamado polimorfismo de subtipo: el método que efectivamente se ejecuta se determina por el tipo real del objeto en tiempo de ejecución, no por el tipo declarado de la variable que lo referencia.

La anotación `@Override` no es estrictamente obligatoria para que la sobreescritura funcione, pero es una buena práctica fuertemente recomendada: le pide al compilador que verifique que el método efectivamente sobreescribe uno existente en la superclase con la misma firma exacta, detectando en tiempo de compilación errores comunes como escribir mal el nombre del método (creando accidentalmente un método nuevo no relacionado en vez de sobreescribir el esperado) o usar una firma ligeramente distinta a la de la superclase.

**Enfoque técnico: qué significa `@` en Java.**

El carácter `@` introduce una **anotación**: metadatos asociados a una declaración o a un uso de tipo. Una anotación no es un comentario y tampoco ejecuta comportamiento por sí sola. Su efecto aparece únicamente cuando alguna herramienta la interpreta: el compilador (`@Override`), un procesador durante el build, una librería que usa reflexión en runtime o un framework como Spring. Por eso escribir una anotación cuyo consumidor no está configurado puede compilar y, aun así, no producir el efecto que la persona esperaba.

Java incluye anotaciones del lenguaje como `@Override`, `@Deprecated`, `@SuppressWarnings`, `@SafeVarargs` y `@FunctionalInterface`. También permite declarar anotaciones propias con `@interface`. `@Target` limita dónde se pueden colocar —clase, método, campo, parámetro o uso de tipo— y `@Retention` decide cuánto tiempo existen: solo en el código fuente (`SOURCE`), dentro del archivo `.class` (`CLASS`) o disponibles mediante reflexión durante la ejecución (`RUNTIME`). Esta decisión importa: un framework que inspecciona anotaciones al ejecutar no puede encontrar una anotación retenida únicamente en el código fuente.

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
    String accion();
}

final class EntregaService {
    @Auditable(accion = "confirmar-entrega")
    void confirmar(String entregaId) {
        // La anotación solo describe intención.
        // Un interceptor o componente de auditoría debe interpretarla.
    }
}
```

En este ejemplo, `@Auditable` tiene un elemento obligatorio llamado `accion`. Su retención `RUNTIME` permite que un interceptor la descubra mediante reflexión; `METHOD` impide usarla accidentalmente sobre una clase o un campo. La lógica de auditoría no debe esconder reglas del dominio dentro de la anotación: confirmar una entrega sigue siendo responsabilidad del caso de uso. La anotación sirve para conectar una preocupación transversal —registrar quién realizó una acción— sin mezclar esa infraestructura con la regla principal.

**Error que debes saber diagnosticar:** crear `@Auditable` sin `@Retention(RUNTIME)` y esperar que un interceptor la encuentre. El código compila, pero la consulta por reflexión devuelve que la anotación no existe. Comprueba primero su política de retención, después el `@Target` y finalmente que el procesador, interceptor o framework encargado de interpretarla esté realmente registrado.

**Analogía:** la herencia es como una plantilla base de un formulario que las subclases pueden personalizar, manteniendo la mayoría de los campos originales pero reescribiendo ciertas secciones específicas según sus necesidades particulares; `@Override` es como marcar explícitamente que una sección personalizada efectivamente reemplaza una sección existente de la plantilla original, y no una sección completamente nueva sin relación con la plantilla base.

**Conceptos clave:** `extends`, `super`, `@Override`, dispatch dinámico, `Object`, `instanceof`, `sealed`.

**Código del ejemplo (herencia):**

```java
sealed class Animal permits Perro, Gato {       // sealed: lista cerrada de subclases
    protected final String nombre;
    Animal(String nombre) { this.nombre = nombre; }
    String hablar() { return "..."; }
    @Override public String toString() { return "Animal(" + nombre + ")"; } // override de Object
}
final class Perro extends Animal {
    Perro(String nombre) { super(nombre); }     // super(...): construye la parte heredada
    @Override String hablar() { return "Guau"; }
    String buscar() { return nombre + " busca"; }
    @Override public String toString() { return "Perro(" + nombre + "): " + super.hablar(); }
}
final class Gato extends Animal {
    Gato(String nombre) { super(nombre); }
    @Override String hablar() { return "Miau"; }
}
```

**Implicación práctica:** `Animal a = new Perro("Fido"); a.hablar()` ejecuta el `hablar()` de `Perro` por dispatch dinámico; `super.hablar()` dentro de `Perro.toString()` reutiliza la versión heredada; y `(Perro) a` solo es seguro si `a` es realmente un `Perro` (compruébalo con `instanceof`).

**Cuándo no usarlo:** crear una anotación propia con reflexión agrega una capa de indirección; para una única llamada de auditoría en un único lugar, invocar directamente el código de registro es más simple y más fácil de rastrear que una anotación que un interceptor debe descubrir.

**Transferencia al proyecto integrador «Motor de asignación de entregas»:** Sustituye dos estrategias de asignación mediante un contrato común. Prueba ambas con el mismo conjunto de entregas y verifica invariantes compartidas sin depender de detalles de una subclase.

#### Practica

**Paso 4 · Demostración guiada desde cero**

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-herencia-anotacion
cd ejemplo-herencia-anotacion
mkdir -p src/main/java/academia/animales
```

```bash
mkdir -p src/main/java/academia/auditoria
```

**Crea** `src/main/java/academia/animales/Animal.java` y `Perro.java` con el código del ejemplo, añadiendo `package academia.animales;` al inicio de cada archivo. Después crea `Main.java`:

```java
package academia.animales;

final class Main {
    public static void main(String[] args) {
        Animal animal = new Perro("Fido");
        System.out.println(animal.hablar());
    }
}
```

**Crea** `src/main/java/academia/auditoria/Auditable.java` y `EntregaService.java` con el código de "Enfoque técnico", añadiendo `package academia.auditoria;`. Después crea `Auditoria.java`:

```java
package academia.auditoria;

final class Auditoria {
    public static void main(String[] args) throws Exception {
        var metodo = EntregaService.class.getDeclaredMethod("confirmar", String.class);
        System.out.println(metodo.isAnnotationPresent(Auditable.class));
    }
}
```

**Ejecuta el ejemplo** (compila la jerarquía, ejecuta el polimorfismo e inspecciona la anotación):

```bash
javac -d out src/main/java/academia/animales/Animal.java src/main/java/academia/animales/Perro.java src/main/java/academia/animales/Main.java
java -cp out academia.animales.Main
javac -d out src/main/java/academia/auditoria/Auditable.java src/main/java/academia/auditoria/EntregaService.java src/main/java/academia/auditoria/Auditoria.java
java -cp out academia.auditoria.Auditoria
```

**Resultado esperado:** la primera ejecución imprime `Guau` y la segunda `true`.

**Paso 5 · Práctica guiada**

**Fallo deliberado:** elimina `@Retention(RetentionPolicy.RUNTIME)` de `@Auditable`, recompila `Auditable.java` y `Auditoria.java`, y vuelve a ejecutar. El código compila igual, pero la consulta por reflexión imprime `false`: la anotación ya no está disponible en ejecución, aunque siga presente en el código fuente.

**Pista:** si después de quitar la retención el programa sigue imprimiendo `true`, estás ejecutando una versión anterior de la clase; borra `out` y recompila. **Resultado esperado:** identificas que la causa es la política de retención, no el `@Target`.

**Si falla.** Si `javac` no encuentra `Animal`, revisa que el paquete declarado coincida con la carpeta. Si `Auditoria` lanza `NoSuchMethodException`, el método `confirmar(String)` no existe con esa firma exacta. Si la compilación de la anotación falla, comprueba los imports de `java.lang.annotation`. Si `isAnnotationPresent` devuelve `false` incluso con `RUNTIME`, verifica que recompilaste las dos clases.

**También puedes verificar el toolchain dentro de un proyecto Maven:**

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

El arquetipo valida Maven o Gradle, pero no copia estas clases: pégalas en `src/main/java/academia/...` del proyecto generado para ejecutarlas con `mvn test`.

Ahora reúne los subtemas de herencia en un `Demo` ejecutable. Crea `src/main/java/academia/animales/Demo.java` con las clases `sealed Animal`/`Perro`/`Gato` del ejemplo y este `main`:

```java
public class Demo {
    public static void main(String[] args) {
        Animal a = new Perro("Fido");                 // declarado Animal, real Perro
        System.out.println("dinamico=" + a.hablar()); // dispatch dinámico
        System.out.println("toString=" + a);          // override de Object
        if (a instanceof Perro p) System.out.println("cast=" + p.buscar());  // downcast seguro
        Animal g = new Gato("Tom");
        try { Perro mal = (Perro) g; }                 // cast inválido en runtime
        catch (ClassCastException e) { System.out.println("ClassCastException ok"); }
    }
}
```

```bash
javac -d out src/main/java/academia/animales/Demo.java
java -cp out academia.animales.Demo
```

**Salida esperada (verificada con Temurin 27.0.1):**

```text
dinamico=Guau
toString=Perro(Fido): ...
cast=Fido busca
ClassCastException ok
```

`dinamico=Guau` es el dispatch por tipo real; `toString` usó la sobreescritura de `Object` y, dentro, `super.hablar()` devolvió `...`; `instanceof Perro p` permitió el downcast seguro a `buscar()`; y castear un `Gato` a `Perro` lanzó `ClassCastException`. **Fallo deliberado:** crea `class Loro extends Animal {}` sin añadir `Loro` al `permits`; no compila (`class is not allowed to extend sealed class`). Añádelo a `permits` y declara `Loro` como `final` para resolverlo.

#### Aplica

**Paso 6 · Práctica independiente**

Agrega una segunda anotación propia con `@Target(ElementType.FIELD)` y colócala sobre un campo; confirma que no compila si intentas usarla sobre un método. Explica, en una frase, por qué `@Target` cambia dónde puede aplicarse una anotación.

**Paso 7 · Cierre**

**Checklist de salida.**

- [ ] `Demo` imprime `dinamico=Guau`, `toString=Perro(Fido): ...`, `cast=Fido busca` y `ClassCastException ok`.
- [ ] `super(nombre)` inicializa la parte heredada y `super.hablar()` reutiliza la versión de la superclase.
- [ ] `toString()` sobreescribe el método heredado de `Object`.
- [ ] `instanceof Perro p` hace un downcast seguro; `(Perro) g` sobre un `Gato` lanza `ClassCastException`.
- [ ] Añadir una subclase fuera de `permits` no compila (sealed).
- [ ] `Auditoria` imprime `true` con `@Retention(RUNTIME)`; sin la retención, `false`.

**Si falla.** Si `dinamico` no es `Guau`, el objeto real no es `Perro`. Si el cast no lanza `ClassCastException`, no estás casteando un `Gato` a `Perro`. Si la subclase nueva compila sin estar en `permits`, la clase base no es `sealed`. Si `Auditoria` siempre da `false`, revisa la retención.

Guarda las clases, la salida del polimorfismo, el `ClassCastException`, el error de `sealed` y el diagnóstico del fallo de retención.

**Antes del siguiente tema:** explica por qué el tipo real determina la implementación de `hablar()`, para qué sirve `super(...)` frente a `super.metodo()`, y qué cambia cuando una anotación usa `RUNTIME`.

**Errores comunes:** heredar por reutilización sin una relación "es un" real; olvidar `@Override`; castear sin comprobar `instanceof`; extender una clase `sealed` sin estar en `permits`; y anotaciones sin la retención que su consumidor necesita.

**Fuentes oficiales revisadas el 2026-11-01:** [dev.java: clases y objetos](https://dev.java/learn/classes-objects/), [JLS 8.1.1.2 — clases `sealed` (Java SE 27)](https://docs.oracle.com/javase/specs/jls/se27/html/jls-8.html#jls-8.1.1.2) y [The Java Tutorials: inheritance](https://docs.oracle.com/javase/tutorial/java/IandI/).

### Tema 3: Interfaces, clases abstractas y cuándo usar cada una · Intermedio · 50 min

**Paso 1 · Objetivo y preparación**

**Prerrequisito:** Temas 1–2 de este módulo, JDK 27 o posterior y un editor. Comprueba `java --version` y `javac --version`.

**Al finalizar podrás:** elegir entre interfaz y clase abstracta; usar métodos `default`/`static`; implementar varias interfaces y resolver un `default` en conflicto; y explicar por qué una clase abstracta no se instancia.

#### Aprende

**Paso 2 · Contexto y caso profesional**

**Caso profesional (escenario aplicado):** el modelo necesita que tipos no relacionados como `Pajaro` y `Avion` cumplan un contrato `Volador`, mientras figuras relacionadas pueden compartir comportamiento mediante `Forma`.

**Paso 3 · Teoría, modelo mental y analogía**

**¿Por qué es importante?** Elegir entre clase abstracta e interfaz según si existe comportamiento compartido real (clase abstracta) o solo un contrato puro (interfaz) produce un diseño de jerarquía de clases más claro y correctamente alineado con la relación real entre los tipos involucrados.

Una interfaz es un contrato puro sin implementación; una clase abstracta combina comportamiento compartido real con métodos que cada subclase debe completar.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| interfaz como contrato | Núcleo | `Volador` define `volar()` sin implementarlo |
| métodos `default` y `static` en interfaz | Variante | una interfaz puede traer implementación parcial |
| implementación múltiple | Núcleo | una clase implementa varias interfaces a la vez |
| colisión de `default` (diamante) | Diagnóstico | dos `default` homónimos obligan a resolver con `Interfaz.super` |
| clase abstracta y método abstracto | Núcleo | `Forma` comparte `describir()` y deja `area()` sin implementar |
| clase abstracta no instanciable | Límite | `new Forma()` no compila |
| interfaz frente a clase abstracta | Decisión | contrato puro frente a comportamiento compartido real |
| herencia simple frente a múltiples interfaces | Límite | una sola superclase, varias interfaces |
| interfaz funcional | Integración | una interfaz de un solo método se usa como lambda (Módulo 20) |

Cada fila tiene su explicación individual a continuación.

**Interfaz como contrato (núcleo).** `interface Volador { void volar(); }` declara **qué** debe ofrecer quien la implemente, sin decir **cómo**. Clases sin relación de herencia entre sí (`Pajaro`, `Avion`) pueden cumplir el mismo contrato.

**Métodos `default` y `static` en interfaz (variante).** Una interfaz puede traer implementación: un método `default` da un comportamiento que las clases heredan sin escribirlo (y pueden sobreescribir), y un método `static` pertenece a la interfaz misma (`Volador.nulo()`). Esto permite evolucionar una interfaz sin romper a sus implementadores.

**Implementación múltiple (núcleo).** Una clase puede implementar **varias** interfaces: `class Pato implements Volador, Nadador`. A diferencia de la herencia de clases (una sola superclase), aquí no hay límite, porque las interfaces son contratos, no estado heredado.

**Colisión de `default` (diamante, diagnóstico).** Si dos interfaces aportan un `default` con la **misma firma**, la clase que implementa ambas está **obligada** a resolver el conflicto sobreescribiendo el método; dentro puede elegir una versión con `Volador.super.descripcion()`. Si no lo resuelve, no compila. Es la forma controlada en que Java evita el "problema del diamante".

**Clase abstracta y método abstracto (núcleo).** `abstract class Forma` combina comportamiento **compartido real** (`describir()`, ya implementado) con métodos **abstractos** (`area()`, que cada subclase concreta define). Sirve cuando hay código común que vale la pena centralizar entre subclases relacionadas.

**Clase abstracta no instanciable (límite).** No puedes hacer `new Forma()`: una clase abstracta no se instancia directamente (`error: Forma is abstract; cannot be instantiated`). Solo se crean objetos de sus subclases concretas, que completan los métodos abstractos.

**Interfaz frente a clase abstracta (decisión).** Usa **interfaz** cuando solo necesitas un contrato que tipos potencialmente no relacionados deban cumplir; usa **clase abstracta** cuando haya comportamiento compartido real entre subclases emparentadas. Elegir mal duplica código común o fuerza una herencia que no corresponde.

**Herencia simple frente a múltiples interfaces (límite).** Una clase extiende **una** superclase pero implementa **muchas** interfaces. Si necesitas "combinar" capacidades de orígenes distintos, se hace con interfaces, no con herencia múltiple de clases (que Java no permite).

**Interfaz funcional (integración).** Una interfaz con un **único** método abstracto (como `Volador` si solo tuviera `volar()`) es una *interfaz funcional* y puede implementarse con una lambda. Es el puente hacia el Módulo 20; aquí basta reconocer que `Volador.nulo()` devuelve una lambda `() -> {}` que cumple el contrato.

**Analogía (con su límite):** una interfaz es como un contrato de servicio que empresas distintas y no relacionadas pueden firmar, sin que les dicte cómo implementarlo; una clase abstracta es como una franquicia que comparte infraestructura real entre sus sucursales y deja que cada una complete sus detalles. La analogía ayuda a decidir cuál usar; no explica el conflicto de `default` ni por qué una abstracta no se instancia, que son reglas del lenguaje.

**Conceptos clave:** contrato sin implementación, `default`/`static`, implementación múltiple, diamante, clase abstracta no instanciable.

**Código del ejemplo:**

```java
interface Volador {
    void volar();                                          // contrato
    default String descripcion() { return "puede volar"; } // default: implementación en la interfaz
    static Volador nulo() { return () -> {}; }             // static de interfaz
}
interface Nadador {
    default String descripcion() { return "puede nadar"; }
}

abstract class Forma {
    abstract double area();                                // cada subclase la define
    void describir() { System.out.println("area=" + area()); } // compartido
}
final class Circulo extends Forma {
    private final double r;
    Circulo(double r) { this.r = r; }
    @Override double area() { return Math.PI * r * r; }
}

// Implementa DOS interfaces con un default homónimo: debe resolver el diamante.
final class Pato implements Volador, Nadador {
    @Override public void volar() {}
    @Override public String descripcion() {
        return Volador.super.descripcion() + " y " + Nadador.super.descripcion();
    }
}
```

**Implicación práctica:** `Circulo` reutiliza `describir()` de la clase abstracta y solo define `area()`; `Pato` combina dos contratos y resuelve el `default` en conflicto con `Interfaz.super`. Elegir mal entre interfaz y clase abstracta duplica comportamiento compartido o fuerza una herencia innecesaria.

**Transferencia al proyecto integrador «Motor de asignación de entregas»:** Define una interfaz de asignación y decide qué comportamiento merece una base abstracta. Una implementación falsa debe poder probar el consumidor sin heredar campos que no necesita.

#### Practica

**Paso 4 · Demostración guiada desde cero**

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-interfaz-abstracta
cd ejemplo-interfaz-abstracta
mkdir -p src/main/java/academia/formas
```

**Crea** `src/main/java/academia/formas/Formas.java`: pega el código del ejemplo (las interfaces `Volador`/`Nadador`, la `abstract class Forma`, `Circulo` y `Pato`) con `package academia.formas;` al inicio, y añade este `main`:

```java
public final class Formas {
    public static void main(String[] args) {
        Forma f = new Circulo(2);
        f.describir();                                  // reutiliza describir(), define area()
        System.out.println(new Pato().descripcion());   // diamante resuelto
        System.out.println(Volador.nulo().descripcion()); // static + lambda
    }
}
```

**Ejecuta el ejemplo:**

```bash
javac -d out src/main/java/academia/formas/Formas.java
java -cp out academia.formas.Formas
```

**Salida esperada (verificada con Temurin 27.0.1):**

```text
area=12.566370614359172
puede volar y puede nadar
puede volar
```

Léela subtema por subtema: `Circulo` reutilizó `describir()` de la abstracta y aportó su `area()`; `Pato` resolvió el `default` en conflicto combinando ambas interfaces con `Interfaz.super`; y `Volador.nulo()` (método `static`) devolvió una lambda cuyo `default descripcion()` imprime `puede volar`.

**Paso 5 · Práctica guiada**

**Fallo deliberado 1 — abstracta no instanciable:** añade `Forma forma = new Forma();` dentro del `main` y recompila:

```text
error: Forma is abstract; cannot be instantiated
```

Borra esa línea: una clase abstracta exige una subclase concreta.

**Fallo deliberado 2 — diamante sin resolver:** en `Pato`, elimina la sobreescritura de `descripcion()`. No compila, porque hereda dos `default` homónimos de `Volador` y `Nadador` y el compilador exige que la clase resuelva el conflicto. Restaura el método con `Volador.super.descripcion()`.

**Si falla.** Si `javac` dice que falta `area()`, revisa que `Circulo` la implemente. Si no aparece el error del diamante, confirma que ambas interfaces declaran `descripcion()` como `default`. Si el área no coincide, recuerda que `Math.PI` multiplica el radio al cuadrado.

**También puedes verificar el toolchain dentro de un proyecto Maven:**

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

#### Aplica

**Paso 6 · Práctica independiente**

Agrega una segunda implementación de `Volador` (por ejemplo `Avion`, sin relación de herencia con `Pajaro`) y una tercera subclase de `Forma` (`Triangulo`); confirma que `describir()` funciona igual para las tres sin reescribirlo.

**Paso 7 · Cierre**

**Checklist de salida.**

- [ ] `Formas.java` compila con `javac -d out` y conserva el paquete `academia.formas`.
- [ ] La ejecución imprime `area=12.566...`, `puede volar y puede nadar` y `puede volar`.
- [ ] `new Forma()` no compila (`Forma is abstract; cannot be instantiated`).
- [ ] Quitar la sobreescritura de `descripcion()` en `Pato` no compila (diamante sin resolver).
- [ ] `Circulo` define `area()` y reutiliza `describir()` sin reescribirlo.
- [ ] Distingues qué va en la interfaz (`default`/`static`) y qué en la clase abstracta.

**Si falla.** Si no aparece el error de abstracta, revisa que `Forma` sea `abstract`. Si no aparece el del diamante, confirma que ambas interfaces declaran `descripcion()` como `default`. Si el área no coincide, `Math.PI` multiplica el radio al cuadrado.

Guarda las clases, la salida de `describir()`/`descripcion()`, el error de instanciación directa y el del diamante.

**Antes del siguiente tema:** justifica qué relación expresa `implements Volador`, por qué una abstracta no se instancia, y cómo se resuelve un `default` en conflicto.

**Errores comunes:** usar clase abstracta cuando bastaba una interfaz; duplicar comportamiento compartido en cada implementación en vez de centralizarlo; intentar `new` sobre una abstracta; y dejar sin resolver dos `default` homónimos.

**Fuentes oficiales revisadas el 2026-11-01:** [dev.java: interfaces](https://dev.java/learn/interfaces/), [JLS 9.4 — métodos de interfaz y `default` (Java SE 27)](https://docs.oracle.com/javase/specs/jls/se27/html/jls-9.html#jls-9.4) y [The Java Tutorials: interfaces](https://docs.oracle.com/javase/tutorial/java/IandI/).

### Tema 4: Sobrecarga vs sobreescritura, y modificadores de acceso · Intermedio · 55 min

**Paso 1 · Objetivo y preparación**

**Prerrequisito:** Temas 1–3 de este módulo, JDK 27 o posterior y un editor. Comprueba `java --version` y `javac --version`.

**Al finalizar podrás:** distinguir sobrecarga de sobreescritura; predecir qué sobrecarga resuelve el compilador; usar covarianza del tipo de retorno; y aplicar los cuatro niveles de visibilidad con criterio de mínimo privilegio.

#### Aprende

**Paso 2 · Contexto y caso profesional**

**Caso profesional (escenario de RutaFlow):** un servicio de tarifas necesita aceptar cantidades de tipos distintos sin duplicar el nombre del método, y mantener campos internos fuera del alcance de consumidores que no deben modificarlos.

**Paso 3 · Teoría, modelo mental y analogía**

**¿Por qué es importante?** Sobrecarga y sobreescritura resuelven problemas distintos (múltiples formas de invocar un método según sus argumentos, frente a redefinir el comportamiento heredado); los modificadores de acceso controlan con precisión granular quién puede ver y usar cada miembro de una clase.

La sobrecarga se resuelve en tiempo de compilación según los tipos de los argumentos; la sobreescritura, en tiempo de ejecución según el tipo real del objeto.

La sobrecarga (overload) define múltiples métodos con el mismo nombre pero distintas firmas (distinto número o tipo de parámetros) dentro de la misma clase: `int sumar(int a, int b)` y `double sumar(double a, double b)` son dos métodos distintos que el compilador resuelve según los tipos de los argumentos pasados en cada llamada específica, una decisión tomada en tiempo de compilación; la sobreescritura (override, Tema 2) redefine el comportamiento de un método heredado con exactamente la misma firma en una subclase, una decisión resuelta en tiempo de ejecución según el tipo real del objeto.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| sobrecarga: misma firma de nombre, distinta de parámetros | Núcleo | `sumar(int,int)` y `sumar(double,double)` coexisten |
| resolución de sobrecarga (compilación) | Diagnóstico | `tipo(5)`, `tipo(5L)`, `tipo("x")` eligen `int`/`long`/`Object` |
| sobreescritura (compárese con Tema 2) | Prerrequisito | misma firma exacta, resuelta por tipo real |
| covarianza del tipo de retorno | Variante | la subclase puede devolver un subtipo del retorno heredado |
| `private` | Núcleo | solo la propia clase; acceder desde fuera no compila |
| package-private (sin modificador) | Núcleo | visible en el mismo paquete |
| `protected` | Núcleo | mismo paquete y subclases (aun en otro paquete) |
| `public` | Núcleo | accesible desde cualquier lugar |
| mínimo privilegio | Decisión | exponer lo menos posible para proteger invariantes |

Cada fila tiene su explicación individual a continuación.

**Sobrecarga (núcleo).** Varios métodos con el **mismo nombre** y **distinta lista de parámetros** (número o tipos) en la misma clase. El tipo de retorno **no** distingue una sobrecarga: cambiar solo el retorno no compila. `sumar(int,int)` y `sumar(double,double)` son dos métodos distintos.

**Resolución de sobrecarga en compilación (diagnóstico).** El compilador elige la sobrecarga por los **tipos de los argumentos**, siguiendo un orden: primero coincidencia exacta, luego ampliación (*widening*, `int→long`), luego autoboxing, y por último varargs. Por eso `tipo(5)` elige `int`, `tipo(5L)` elige `long` y `tipo("x")` elige `Object`. Entender este orden evita sorpresas cuando una llamada acaba en una sobrecarga que no esperabas.

**Sobreescritura (prerrequisito, del Tema 2).** Redefine un método heredado con la **misma firma exacta**; se resuelve en ejecución por el tipo real. La clave para no confundirla con la sobrecarga: sobrecarga = distinta firma en la misma clase (compilación); sobreescritura = misma firma en una subclase (ejecución).

**Covarianza del tipo de retorno (variante).** Al sobreescribir, la subclase puede declarar un tipo de retorno **más específico** que el heredado: si `Base.crear()` devuelve `Object`, `Sub.crear()` puede devolver `String` (subtipo). Esto es legal y útil; lo contrario (un retorno más general) no lo es.

**`private` (núcleo).** Visible **solo dentro de la propia clase**. Acceder a un miembro `private` desde otra clase no compila (`has private access`). Es el nivel que protege los invariantes del Tema 1.

**Package-private / sin modificador (núcleo).** Si no escribes modificador, el miembro es visible desde **cualquier clase del mismo paquete**, pero no desde otros paquetes. Es el nivel por defecto; útil para colaboración interna de un paquete.

**`protected` (núcleo).** Amplía el acceso del package-private a las **subclases, incluso en otro paquete**. Sirve para miembros que una subclase legítimamente necesita, sin abrirlos a todo el mundo.

**`public` (núcleo).** Accesible desde **cualquier lugar**. Resérvalo para la API que de verdad quieres ofrecer; todo lo público es un compromiso que otros pueden depender.

**Mínimo privilegio (decisión).** Expón el **menor** nivel de visibilidad que el diseño requiera: empieza en `private` y amplía solo cuando haya una razón. Hacer todo `public` "por comodidad" rompe la encapsulación y vuelve costoso cambiar la implementación después.

Los modificadores de acceso controlan la visibilidad de un miembro de una clase en círculos concéntricos de alcance creciente: `private` restringe el acceso exclusivamente a la propia clase; sin modificador explícito (package-private, el nivel por defecto cuando no se escribe ninguno) permite acceso desde cualquier clase del mismo paquete; `protected` extiende ese acceso también a subclases, incluso si están en otro paquete distinto; `public` permite acceso desde cualquier lugar sin restricción alguna, la misma jerarquía de visibilidad estudiada de forma más general en el Módulo 4 del track de JavaScript sobre encapsulación, aquí con la sintaxis y granularidad específica de Java.

**Analogía:** la sobrecarga es como tener varias entradas distintas a un mismo edificio, cada una diseñada para un tipo distinto de visitante que llega con diferente equipaje; la sobreescritura es como una sucursal específica de una franquicia que decide atender a sus visitantes de una forma particular y distinta a como lo especifica el manual general de la franquicia, sin cambiar el nombre del procedimiento que sigue. Los modificadores de acceso son círculos concéntricos de alcance creciente.

**Conceptos clave:** misma firma vs distintas firmas, niveles de visibilidad.

**Código del ejemplo:**

```java
int sumar(int a, int b) { return a + b; }
double sumar(double a, double b) { return a + b; } // sobrecarga: mismo nombre, firma distinta

// private (solo la clase) < package-private (mismo paquete) < protected (+ subclases) < public (todos)
```

**Implicación práctica:** Confundir sobrecarga con sobreescritura, o exponer un campo con más visibilidad de la necesaria, son errores de diseño que se vuelven costosos de revertir una vez que otro código ya depende de ellos.

**Transferencia al proyecto integrador «Motor de asignación de entregas»:** Separa sobrecarga de métodos de la sustitución de comportamiento del motor. Prueba llamadas por interfaz y restringe modificadores para impedir que un consumidor altere capacidad sin validación.

#### Practica

**Paso 4 · Demostración guiada desde cero**

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-sobrecarga-visibilidad
cd ejemplo-sobrecarga-visibilidad
mkdir -p src/main/java/academia/tarifas
```

**Crea** `src/main/java/academia/tarifas/Tarifa.java` con las dos sobrecargas y los campos de distinta visibilidad:

```java
package academia.tarifas;

public class Tarifa {
    private double saldo;
    protected double descuento;

    int sumar(int a, int b) { return a + b; }
    double sumar(double a, double b) { return a + b; }
}

final class Main {
    public static void main(String[] args) {
        Tarifa tarifa = new Tarifa();
        System.out.println(tarifa.sumar(2, 3));
        System.out.println(tarifa.sumar(2.5, 3.75));
    }
}
```

**Ejecuta el ejemplo** (compila y observa qué sobrecarga se resuelve para cada tipo de argumento):

```bash
javac -d out src/main/java/academia/tarifas/Tarifa.java
java -cp out academia.tarifas.Main
```

**Resultado esperado:** `5` y `6.25`, cada uno resuelto por la versión `int` o `double` correspondiente.

Ahora comprueba la **resolución de sobrecarga** y la **covarianza de retorno**. Añade a `Tarifa` tres sobrecargas `tipo` y una jerarquía con retorno covariante, y este `main`:

```java
public class Demo {
    static String tipo(int x)    { return "int"; }
    static String tipo(long x)   { return "long"; }
    static String tipo(Object x) { return "Object"; }
    static class Base { Object crear() { return "base"; } }
    static class Sub extends Base { @Override String crear() { return "sub"; } } // covarianza
    public static void main(String[] args) {
        System.out.println("tipo(5)=" + tipo(5));       // exacto: int
        System.out.println("tipo(5L)=" + tipo(5L));     // long
        System.out.println("tipo(\"x\")=" + tipo("x")); // Object
        System.out.println("covarianza=" + new Sub().crear());
    }
}
```

```bash
javac -d out src/main/java/academia/tarifas/Demo.java
java -cp out academia.tarifas.Demo
```

**Salida esperada (verificada con Temurin 27.0.1):**

```text
tipo(5)=int
tipo(5L)=long
tipo("x")=Object
covarianza=sub
```

`tipo(5)` eligió el `int` exacto (no `long` ni `Object`); `tipo(5L)` el `long`; `tipo("x")` el `Object`. La covarianza permitió que `Sub.crear()` devuelva `String` (subtipo de `Object`).

**Paso 5 · Práctica guiada**

**Fallo deliberado — acceso `private`:** crea una clase del mismo paquete que intente leer un campo `private` de `Tarifa`:

```java
package academia.tarifas;
final class Otra {
    static double leer(Tarifa tarifa) { return tarifa.saldo; }  // saldo es private
}
```

Compílala junto a `Tarifa.java`:

```text
error: saldo has private access in Tarifa
```

El campo solo es visible dentro de `Tarifa`, aunque `Otra` esté en el mismo paquete. Cambia `private` por package-private (quita el modificador) y comprueba que el mismo paquete sí accede; con `protected`, además lo verían las subclases de otro paquete.

**Si falla.** Si no ves el error de acceso, recompilaste sin el cambio. Si `tipo(5)` elige `Object`, falta la sobrecarga `int` exacta. Si la covarianza no compila, el retorno de la subclase no es subtipo del heredado.

**También puedes verificar el toolchain dentro de un proyecto Maven:**

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

#### Aplica

**Paso 6 · Práctica independiente**

Agrega una tercera sobrecarga de `sumar` que reciba tres argumentos, y una clase en otro paquete que confirme que el campo `protected` es accesible solo desde una subclase.

**Paso 7 · Cierre**

**Checklist de salida.**

- [ ] `Tarifa` resuelve `sumar(int,int)`→`5` y `sumar(double,double)`→`6.25`.
- [ ] `tipo(5)`→`int`, `tipo(5L)`→`long`, `tipo("x")`→`Object` (resolución por tipo).
- [ ] La covarianza permite que `Sub.crear()` devuelva `String` en vez de `Object`.
- [ ] Acceder a un campo `private` desde otra clase no compila (`has private access`).
- [ ] `protected` es accesible desde una subclase en otro paquete; package-private no.
- [ ] Distingues sobrecarga (compilación, misma clase) de sobreescritura (ejecución, subclase).

**Si falla.** Si `tipo(5)` elige `Object`, falta la sobrecarga `int`. Si la covarianza no compila, el retorno no es subtipo. Si no ves el error de `private`, recompilaste sin el cambio. Si la subclase de otro paquete no ve `protected`, `Tarifa` debe ser `public` y no `final`.

Guarda las sobrecargas, la salida de cada resolución, la covarianza y el error de acceso al campo `private`.

**Antes del siguiente tema:** explica por qué `sumar(int,int)` y `sumar(double,double)` son sobrecargas, qué debe mantenerse igual para que sea sobreescritura, y en qué orden resuelve el compilador una sobrecarga.

**Errores comunes:** confundir sobrecarga con sobreescritura; creer que el tipo de retorno distingue una sobrecarga; hacer todo `public` por comodidad; y exponer campos con más visibilidad de la necesaria.

**Fuentes oficiales revisadas el 2026-11-01:** [JLS 15.12.2 — resolución de sobrecarga (Java SE 27)](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.12.2), [JLS 6.6 — control de acceso (Java SE 27)](https://docs.oracle.com/javase/specs/jls/se27/html/jls-6.html#jls-6.6) y [The Java Tutorials: access control](https://docs.oracle.com/javase/tutorial/java/javaOO/accesscontrol.html).

## Construcción guiada del capítulo

**Objetivo del laboratorio:** construir una jerarquía de clases con herencia, una interfaz y una clase abstracta.

**Requisitos previos:** Módulo 0 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Construir `Guia` con invariantes en el constructor | Ver Tema 1 | Impide número vacío y peso inválido |
| 2 | Crear `Animal` y `Perro` con `@Override` | Ver Tema 2 | Verifica el polimorfismo de subtipo |
| 3 | Definir `Volador` e implementarla en `Pajaro` | Ver Tema 3 | Contrato puro sin implementación |
| 4 | Crear `Forma` abstracta con `Circulo`/`Cuadrado` | Ver Tema 3 | Comportamiento compartido + métodos abstractos |
| 5 | Sobrecargar `sumar()` con distintas firmas | Ver Tema 4 | Compara con sobreescritura |
| 6 | Aplicar `private`/`protected`/`public` | Ver Tema 4 | Explica cuándo usar cada uno |

**Verificación:** el laboratorio se considera exitoso si invocar un método sobre una referencia `Animal` que apunta a un `Perro` ejecuta correctamente la versión sobreescrita, y si la jerarquía distingue apropiadamente qué comportamiento pertenece a una interfaz frente a una clase abstracta.

**Errores comunes y soluciones**

- **Confundir sobrecarga con sobreescritura.** La sobrecarga define métodos con firmas distintas en la misma clase; la sobreescritura redefine un método heredado con la misma firma exacta.
- **Usar una clase abstracta cuando una interfaz sería más apropiada.** Si no hay comportamiento compartido real entre subclases no relacionadas, prefiere una interfaz.
- **Olvidar `@Override` al sobreescribir un método.** Sin ella, el compilador no verifica que efectivamente estás sobreescribiendo un método existente con la firma correcta.

---
