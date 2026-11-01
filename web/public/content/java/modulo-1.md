# Módulo 1: Programación orientada a objetos


**Proyecto del módulo:** crea un proyecto Maven o Gradle desde cero, pega el código del tema y corre las pruebas; las equivalencias entre ambos sistemas están en el Módulo 8, Tema 4.

## Aprende construyendo

### Tema 1: Clases, objetos, constructores y encapsulación · Básico · 40 min

**Prerrequisito:** JDK 27, Maven y un editor. Comprueba `java --version`.

**Al terminar podrás:** diseñar una clase que valida sus invariantes en el constructor, de forma que ninguna instancia inválida pueda existir.

#### Aprende

En un caso real de entregas, una guía sin número o con peso fuera de rango no debería poder crearse nunca, en vez de crearse y luego validarse por separado en cada punto donde se use.

**¿Por qué es importante?** Porque un constructor que valida sus invariantes es la única garantía real de que ningún objeto inválido llegue a existir en el sistema, sin depender de que cada consumidor recuerde validar por su cuenta antes de usarlo.

El constructor es la única puerta de entrada para crear un objeto: si valida ahí, ningún consumidor puede construir una instancia inválida y "completarla después".

**Analogía:** el constructor es como el control de calidad en la línea de ensamblaje: se rechaza la pieza defectuosa antes de que salga de fábrica, no después de instalarla.

**Conceptos clave:** invariantes, constructor, encapsulación.

**Código del ejemplo:**

```java
package academia.entregas;

public final class Guia {
    private final String numero;
    private final double pesoKg;

    public Guia(String numero, double pesoKg) {
        if (numero == null || numero.isBlank()) {
            throw new IllegalArgumentException("El número de guía no puede estar vacío");
        }
        if (pesoKg <= 0 || pesoKg > 50) {
            throw new IllegalArgumentException("El peso debe estar entre 0 y 50 kg");
        }
        this.numero = numero;
        this.pesoKg = pesoKg;
    }

    public static void main(String[] args) {
        Guia guia = new Guia("RF-1", 12.5);
        System.out.println("Creada: " + guia.numero + " (" + guia.pesoKg + " kg)");
    }
}
```

Los campos son `private final`: no hay setters que puedan romper el invariante después de construir, y el constructor rechaza cualquier valor que lo viole antes de que el objeto exista.

**Cuándo no usarlo:** para un objeto puramente de transporte de datos sin ninguna regla de negocio que proteger (un DTO que solo cruza una frontera de serialización), validar cada campo en el constructor es esfuerzo sin beneficio real; resérvalo para entidades de dominio donde un estado inválido tendría consecuencias reales.

#### Practica

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

**Resultado esperado:** `Creada: RF-1 (12.5 kg)`.

**Fallo deliberado:** en `main`, sustituye `new Guia("RF-1", 12.5)` por `new Guia("", 10)`, recompila y ejecuta. El constructor lanza `IllegalArgumentException` y la guía nunca llega a existir; repite con `new Guia("RF-1", 0)`.

Después de observar el fallo, restaura los argumentos válidos. **Pista:** ambas construcciones inválidas deben fallar desde el constructor, antes de que exista una instancia a medias; si el objeto se crea y el error aparece después, la validación está en el lugar equivocado. **Resultado esperado:** ninguna instancia inválida llega a existir.

**Si falla.** Si `javac` no encuentra `Guia.java`, revisa que la ruta incluya `src/main/java/academia/entregas` y que el paquete del archivo coincida. Si `java` no encuentra la clase, comprueba que `-cp` apunta a `out` y que ejecutas el nombre completo `academia.entregas.Guia`. Si la guía vacía se crea sin lanzar nada, la comparación del número está mal: `isBlank()` cubre también una cadena de solo espacios.

#### Aplica

Escribe `GuiaTest` con un caso válido y tres casos inválidos (número vacío, peso cero, peso mayor a 50); confirma que los tres lanzan excepción desde el constructor, no desde un método `validar()` separado.

**Checklist de salida.**

- [ ] `Guia.java` compila con `javac -d out` y conserva el paquete `academia.entregas`.
- [ ] `java -cp out academia.entregas.Guia` imprime `Creada: RF-1 (12.5 kg)`.
- [ ] `new Guia("", 10)` y `new Guia("RF-1", 0)` lanzan `IllegalArgumentException` desde el constructor.
- [ ] `GuiaTest` cubre un caso válido y tres inválidos.
- [ ] Ningún setter permite modificar `numero` o `pesoKg` después de construir.
- [ ] Explicas por qué la validación no debe vivir en un método `validar()` separado.

**Si falla.** Si `GuiaTest` compila pero no ejecuta, confirma que el runner o el `main` de la prueba esté configurado; una clase de prueba no se ejecuta sola. Si una construcción inválida no lanza excepción, ese caso no está llegando al constructor o la condición no cubre el valor.

Guarda la clase, la prueba, la salida y el fallo diagnosticado. Esta misma disciplina (validar en el constructor, no exponer setters que rompan el invariante) es la que aplicarás a cada entidad del proyecto integrador de este track.

**Errores comunes:** validar en un método separado en vez del constructor, exponer setters que rompan el invariante después de construir, y confiar en que "nadie va a pasar un valor inválido".

**Fuente oficial:** [dev.java: clases y objetos](https://dev.java/learn/classes-objects/) y [The Java Tutorials: Interfaces and Inheritance](https://docs.oracle.com/javase/tutorial/java/IandI/).

### Tema 2: Herencia y sobreescritura · Intermedio · 1 h

**Prerrequisito:** JDK 27, Maven y un editor. Comprueba `java --version`.

**Al terminar podrás:** demostrar polimorfismo de subtipo con `extends`/`@Override`, y diagnosticar el error de olvidar `@Retention(RUNTIME)` en una anotación propia.

#### Aprende

Un sistema de reparto trata conductores y vehículos de forma polimórfica (todos "hablan"/operan igual desde afuera), pero cada tipo concreto responde distinto; además, auditar acciones sensibles (confirmar una entrega) requiere una anotación propia correctamente configurada para que un interceptor pueda descubrirla.

**¿Por qué es importante?** Porque el polimorfismo de subtipo permite que el mismo código funcione correctamente con cualquier subclase futura sin modificarse, y una anotación propia sin la retención correcta falla en silencio para quien la consume por reflexión, aunque el código compile sin ningún error.

El tipo real del objeto en tiempo de ejecución decide qué versión sobreescrita se ejecuta, no el tipo declarado de la variable.

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

**Conceptos clave:** `extends`, `@Override`, polimorfismo de subtipo.

**Código del ejemplo:**

```java
class Animal {
    String hablar() { return "..."; }
}
class Perro extends Animal {
    @Override
    String hablar() { return "Guau"; }
}
```

**Implicación práctica:** El polimorfismo de subtipo permite que el mismo código que opera sobre una referencia `Animal` ejecute automáticamente el comportamiento específico de la subclase real en tiempo de ejecución, sin necesidad de conocer de antemano esa subclase concreta.

**Cuándo no usarlo:** crear una anotación propia con reflexión agrega una capa de indirección; para una única llamada de auditoría en un único lugar, invocar directamente el código de registro es más simple y más fácil de rastrear que una anotación que un interceptor debe descubrir.

**Transferencia al proyecto integrador «Motor de asignación de entregas»:** Sustituye dos estrategias de asignación mediante un contrato común. Prueba ambas con el mismo conjunto de entregas y verifica invariantes compartidas sin depender de detalles de una subclase.

#### Practica

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
        Animal animal = new Perro();
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

#### Aplica

Agrega una tercera subclase de `Animal` (por ejemplo `Gato`) y confirma que invocar `hablar()` sobre las tres referencias `Animal` ejecuta la versión correcta de cada una; agrega una segunda anotación propia con `@Target(ElementType.FIELD)`.

**Checklist de salida.**

- [ ] `java -cp out academia.animales.Main` imprime `Guau` mediante una referencia `Animal`.
- [ ] `@Override` está presente y el compilador acepta la sobreescritura.
- [ ] `Auditoria` imprime `true` con `@Retention(RUNTIME)`.
- [ ] Al quitar la retención y recompilar, `Auditoria` imprime `false` y explicas por qué.
- [ ] La tercera subclase responde con su propia versión de `hablar()`.
- [ ] La segunda anotación declara `@Target(ElementType.FIELD)` y compila.

**Si falla.** Si la tercera subclase no cambia la salida, revisa que el objeto real sea de esa subclase y no una instancia de `Animal`. Si la segunda anotación no compila, su `@Target` debe incluir `ElementType.FIELD` y su uso debe estar sobre un campo, no sobre un método.

Guarda las clases, la anotación, la salida del polimorfismo y el diagnóstico del fallo de retención.

**Errores comunes:** herencia por reutilización sin relación "es un" real, olvidar `@Override`, y anotaciones sin la retención correcta para su consumidor.

**Fuente oficial:** [dev.java: clases y objetos](https://dev.java/learn/classes-objects/) y [The Java Tutorials: Interfaces and Inheritance](https://docs.oracle.com/javase/tutorial/java/IandI/).

### Tema 3: Interfaces, clases abstractas y cuándo usar cada una · Intermedio · 50 min

**Prerrequisito:** JDK 27, Maven y un editor. Comprueba `java --version`.

**Al terminar podrás:** elegir entre interfaz y clase abstracta según si existe comportamiento compartido real, e implementar ambas con una jerarquía `Forma`.

#### Aprende

El sistema necesita que tipos no relacionados (un `Pajaro` y un `Avion`, por ejemplo) cumplan un contrato común (`Volador`) sin compartir jerarquía; y necesita que figuras geométricas relacionadas (`Circulo`, `Cuadrado`) compartan una implementación común (`describir()`) además de un método propio (`area()`).

**¿Por qué es importante?** Elegir entre clase abstracta e interfaz según si existe comportamiento compartido real (clase abstracta) o solo un contrato puro (interfaz) produce un diseño de jerarquía de clases más claro y correctamente alineado con la relación real entre los tipos involucrados.

Una interfaz es un contrato puro sin implementación; una clase abstracta combina comportamiento compartido real con métodos que cada subclase debe completar.

Una interfaz (`interface Volador { void volar(); }`) define un contrato puro: qué métodos debe tener cualquier clase que la implemente, sin proporcionar ninguna implementación propia por defecto (salvo métodos `default` explícitamente marcados como tales, un caso especial más avanzado), permitiendo que clases completamente no relacionadas entre sí en su jerarquía de herencia (una clase `Pajaro` y una clase `Avion`, por ejemplo, sin ninguna relación de herencia común) implementen el mismo contrato `Volador`, algo que Java permite hacer con múltiples interfaces simultáneamente (`class Pajaro implements Volador, Comestible`), a diferencia de la herencia de clases, donde Java solo permite extender una única superclase.

Una clase abstracta (`abstract class Forma { abstract double area(); void describir() {...} }`) es apropiada en cambio cuando existe comportamiento genuinamente compartido entre subclases relacionadas entre sí (el método `describir()`, con una implementación concreta compartida por todas las subclases de `Forma`), combinado con métodos abstractos que cada subclase concreta debe implementar por su cuenta (`area()`, sin implementación en la clase abstracta, dado que el cálculo específico depende de qué forma geométrica concreta sea cada subclase). La elección entre ambas se resume en si existe comportamiento compartido real que valga la pena centralizar (clase abstracta) frente a un contrato puro que clases potencialmente no relacionadas deben cumplir (interfaz).

**Analogía:** una interfaz es como un contrato de servicio que múltiples empresas completamente distintas y no relacionadas entre sí pueden firmar, comprometiéndose a ofrecer ciertos servicios específicos sin que el contrato les dicte cómo implementarlos internamente; una clase abstracta es como una franquicia que comparte cierta infraestructura y procedimientos comunes reales entre todas sus sucursales, dejando que cada sucursal específica implemente únicamente los detalles particulares de su operación local.

**Conceptos clave:** contrato sin implementación, comportamiento compartido parcial, múltiple implementación de interfaces.

**Código del ejemplo:**

```java
interface Volador {
    void volar();
}
class Pajaro implements Volador {
    public void volar() { System.out.println("Vuela"); }
}

abstract class Forma {
    abstract double area();              // sin implementación: cada subclase la define
    void describir() { System.out.println("Área: " + area()); } // con implementación, compartida
}
```

**Implicación práctica:** Elegir mal entre interfaz y clase abstracta duplica comportamiento compartido real entre subclases relacionadas, o fuerza una relación de herencia innecesaria donde solo hacía falta un contrato puro.

**Transferencia al proyecto integrador «Motor de asignación de entregas»:** Define una interfaz de asignación y decide qué comportamiento merece una base abstracta. Una implementación falsa debe poder probar el consumidor sin heredar campos que no necesita.

#### Practica

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-interfaz-abstracta
cd ejemplo-interfaz-abstracta
mkdir -p src/main/java/academia/formas
```

**Crea** `src/main/java/academia/formas/Formas.java`: pega el código del ejemplo con `package academia.formas;` al inicio y añade debajo las subclases concretas y el `main`:

```java
final class Circulo extends Forma {
    private final double radio;
    Circulo(double radio) { this.radio = radio; }
    double area() { return Math.PI * radio * radio; }
}

final class Cuadrado extends Forma {
    private final double lado;
    Cuadrado(double lado) { this.lado = lado; }
    double area() { return lado * lado; }
}

final class MainFormas {
    public static void main(String[] args) {
        Forma circulo = new Circulo(2);
        Forma cuadrado = new Cuadrado(3);
        circulo.describir();
        cuadrado.describir();
        new Pajaro().volar();
    }
}
```

**Ejecuta el ejemplo** (compila el archivo y ejecuta `describir()` sobre cada forma):

```bash
javac -d out src/main/java/academia/formas/Formas.java
java -cp out academia.formas.MainFormas
```

**Resultado esperado:** dos líneas de área (`12.566370614359172` y `9.0`) y luego `Vuela`.

**Fallo deliberado:** añade `Forma forma = new Forma();` dentro del `main` y recompila. El compilador rechaza la instanciación directa con un error del tipo "Forma is abstract; cannot be instantiated", porque una clase abstracta exige una subclase concreta.

**Pista:** borra esa línea después de leer el error. **Resultado esperado:** el compilador rechaza la instanciación directa y exige una subclase concreta.

**Si falla.** Si `javac` dice que `Forma` no es abstracta o que falta `area()`, revisa que `Circulo` y `Cuadrado` la implementen. Si `MainFormas` no se encuentra, comprueba que está en el mismo archivo y paquete. Si el área del círculo no coincide, recuerda que `Math.PI` multiplica el radio al cuadrado, no el diámetro.

**También puedes verificar el toolchain dentro de un proyecto Maven:**

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

#### Aplica

Agrega una segunda implementación de `Volador` (por ejemplo `Avion`, sin relación de herencia con `Pajaro`) y una tercera subclase de `Forma` (`Triangulo`); confirma que `describir()` funciona igual para las tres sin reescribirlo.

**Checklist de salida.**

- [ ] `Formas.java` compila con `javac -d out` y conserva el paquete `academia.formas`.
- [ ] `java -cp out academia.formas.MainFormas` imprime las dos áreas y `Vuela`.
- [ ] `new Forma()` no compila y sabes explicar por qué.
- [ ] `Avion` implementa `Volador` sin heredar de `Pajaro`.
- [ ] `Triangulo` implementa `area()` y reutiliza `describir()` sin reescribirlo.
- [ ] Distingues qué comportamiento pertenece a la interfaz y cuál a la clase abstracta.

**Si falla.** Si `Avion` no compila, revisa que declare `implements Volador` y que `volar()` sea público. Si `Triangulo` no reutiliza `describir()`, está heredando de otra clase o no extiende `Forma`. Si la salida mezcla áreas, comprueba que cada subclase calcula con sus propias dimensiones.

Guarda las clases, la salida de `describir()` para cada forma y el error de instanciación directa.

**Errores comunes:** usar clase abstracta cuando bastaba una interfaz, y duplicar comportamiento compartido en cada implementación de una interfaz en vez de centralizarlo en una clase abstracta.

**Fuente oficial:** [dev.java: clases y objetos](https://dev.java/learn/classes-objects/) y [The Java Tutorials: Interfaces and Inheritance](https://docs.oracle.com/javase/tutorial/java/IandI/).

### Tema 4: Sobrecarga vs sobreescritura, y modificadores de acceso · Intermedio · 55 min

**Prerrequisito:** JDK 27, Maven y un editor. Comprueba `java --version`.

**Al terminar podrás:** distinguir sobrecarga (varias firmas, mismo nombre) de sobreescritura (Tema 2), y aplicar los cuatro niveles de visibilidad de Java.

#### Aprende

Un servicio de tarifas necesita `sumar` para enteros y para decimales sin duplicar el nombre del método; y necesita que solo ciertas clases del mismo paquete puedan acceder a un campo interno, mientras otras partes del sistema no.

**¿Por qué es importante?** Sobrecarga y sobreescritura resuelven problemas distintos (múltiples formas de invocar un método según sus argumentos, frente a redefinir el comportamiento heredado); los modificadores de acceso controlan con precisión granular quién puede ver y usar cada miembro de una clase.

La sobrecarga se resuelve en tiempo de compilación según los tipos de los argumentos; la sobreescritura, en tiempo de ejecución según el tipo real del objeto.

La sobrecarga (overload) define múltiples métodos con el mismo nombre pero distintas firmas (distinto número o tipo de parámetros) dentro de la misma clase: `int sumar(int a, int b)` y `double sumar(double a, double b)` son dos métodos distintos que el compilador resuelve según los tipos de los argumentos pasados en cada llamada específica, una decisión tomada en tiempo de compilación; la sobreescritura (override, Tema 2) redefine el comportamiento de un método heredado con exactamente la misma firma en una subclase, una decisión resuelta en tiempo de ejecución según el tipo real del objeto.

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

**Fallo deliberado:** crea `src/main/java/academia/tarifas/Otra.java` con una clase del mismo paquete que intente leer `tarifa.saldo`, y compila junto a `Tarifa.java`:

```java
package academia.tarifas;

final class Otra {
    static double leer(Tarifa tarifa) {
        return tarifa.saldo;
    }
}
```

El compilador informa que `saldo` tiene acceso `private`: el campo solo es visible dentro de `Tarifa`, aunque `Otra` esté en el mismo paquete. Cambia `private` por `protected` y comprueba que el mismo paquete sí accede.

**Pista:** el campo sin modificador (package-private) también sería accesible desde `Otra`; la diferencia entre ambos aparece al intentar acceder desde otro paquete. **Resultado esperado:** distingues qué nivel de visibilidad permite cada acceso.

**Si falla.** Si `javac` exige un archivo por clase pública, recuerda que solo `Tarifa` es pública en `Tarifa.java` y `Main` es package-private. Si ambas llamadas imprimen `5`, revisa que los literales decimales tengan punto. Si el error de acceso no aparece, confirma que recompilaste después de cambiar el modificador.

**También puedes verificar el toolchain dentro de un proyecto Maven:**

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

#### Aplica

Agrega una tercera sobrecarga de `sumar` que reciba tres argumentos, y una clase en otro paquete que confirme que el campo `protected` es accesible solo desde una subclase.

**Checklist de salida.**

- [ ] `Tarifa.java` compila y `Main` imprime `5` y `6.25`.
- [ ] La tercera sobrecarga recibe tres argumentos y se resuelve sin ambigüedad.
- [ ] Acceder a `saldo` desde otra clase no compila mientras sea `private`.
- [ ] `descuento` es accesible desde una subclase en otro paquete.
- [ ] Una clase no subclase en otro paquete no accede a `descuento`.
- [ ] Explicas la diferencia entre sobrecarga y sobreescritura con un ejemplo de cada una.

**Si falla.** Si la sobrecarga de tres argumentos no se resuelve, revisa el número de argumentos y sus tipos. Si la subclase en otro paquete no compila, `Tarifa` debe ser `public` y no `final`, y `descuento` debe seguir siendo `protected`. Si una no subclase accede a `descuento`, el campo es `public` o está en el mismo paquete por error.

Guarda las sobrecargas, la salida de cada resolución y el error de acceso al campo `private`.

**Errores comunes:** confundir sobrecarga con sobreescritura, hacer todo `public` por comodidad, y setters sin reglas que rompan invariantes.

**Fuente oficial:** [dev.java: clases y objetos](https://dev.java/learn/classes-objects/) y [The Java Tutorials: Interfaces and Inheritance](https://docs.oracle.com/javase/tutorial/java/IandI/).

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
