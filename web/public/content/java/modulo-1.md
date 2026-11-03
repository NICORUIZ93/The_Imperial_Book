# Módulo 1: Programación orientada a objetos


## Aprende construyendo

### Tema 1: Clases, objetos, constructores y encapsulación

**Duración estimada:** 35 min.
**¿Por qué es importante?** Las clases agrupan datos y operaciones; la encapsulación permite impedir que una guía de entrega quede en un estado imposible.
**Prerrequisitos:** M0 T1. Proyecto continuo: crear el modelo inicial de una guía del motor de asignación. Trabaja desde `java-motor-poo/` con JDK 21 o posterior.

#### Subtema 1.1: Crea una clase e instancia objetos · 10 min

**1. Contexto**
El motor recibe muchas guías. Una clase describe qué datos guarda cada guía y permite crear varias con esa misma forma.

**2. Hazlo tú**
Crea `java-motor-poo/src/Guia.java`:

```java
public final class Guia {
    String numero;
    String destino;

    Guia(String numero, String destino) {
        this.numero = numero;
        this.destino = destino;
    }

    public static void main(String[] args) {
        Guia primera = new Guia("RF-101", "Medellin");
        Guia segunda = new Guia("RF-102", "Envigado");
        System.out.println(primera.numero + " -> " + primera.destino);
        System.out.println(segunda.numero + " -> " + segunda.destino);
    }
}
```

Desde `java-motor-poo/`, ejecuta:

```bash
mkdir -p out
javac -d out src/Guia.java
java -cp out Guia
```

**Resultado esperado:** `RF-101 -> Medellin` y `RF-102 -> Envigado`.

**Fallo deliberado:** cambia `new Guia("RF-101", "Medellin")` por `new Guia("RF-101")`. **Error esperado:** `javac` indica que el constructor requiere dos argumentos. **Diagnóstico:** definimos un constructor con número y destino; la llamada debe entregar ambos.

**3. Entiende**
`Guia` es la clase; `primera` y `segunda` son objetos distintos creados con `new`. El constructor recibe valores iniciales y asigna esos valores a cada objeto.

**4. Cierra**
Señala cuáles dos líneas crean los objetos y qué diferencia sus datos.

#### Subtema 1.2: Protege los datos con encapsulación · 10 min

**1. Contexto**
Si cualquier código puede reemplazar el destino directamente, una guía puede cambiar sin pasar por las reglas del modelo.

**2. Hazlo tú**
Reemplaza `java-motor-poo/src/Guia.java` por este archivo completo:

```java
public final class Guia {
    private final String numero;
    private String destino;

    public Guia(String numero, String destino) {
        this.numero = numero;
        this.destino = destino;
    }

    public String getNumero() {
        return numero;
    }

    public String getDestino() {
        return destino;
    }

    public void cambiarDestino(String nuevoDestino) {
        destino = nuevoDestino;
    }

    public static void main(String[] args) {
        Guia guia = new Guia("RF-101", "Medellin");
        guia.cambiarDestino("Envigado");
        System.out.println(guia.getNumero() + " -> " + guia.getDestino());
    }
}
```

Compila y ejecuta con los mismos comandos del subtema 1.1.

**Resultado esperado:** `RF-101 -> Envigado`.

**Fallo deliberado:** en `main`, intenta asignar `guia.numero = "RF-999"`. **Error esperado:** `numero has private access in Guia`. **Diagnóstico:** `private` limita el acceso al interior de la clase y `final` impide cambiar ese identificador después de construir el objeto.

**3. Entiende**
Los campos privados esconden el estado interno. Los métodos públicos forman una interfaz pequeña para leer datos o pedir un cambio; no hace falta publicar cada campo.

**4. Cierra**
Identifica qué campo no se puede cambiar y qué método permite cambiar el destino.

#### Subtema 1.3: Rechaza guías inválidas desde el constructor · 15 min

**1. Contexto**
La guía debe tener identificador y destino. Rechazar esos datos al crearla evita que el resto del programa tenga que revisar el mismo error una y otra vez.

**2. Hazlo tú**
Reemplaza `java-motor-poo/src/Guia.java` por este archivo completo:

```java
public final class Guia {
    private final String numero;
    private String destino;

    public Guia(String numero, String destino) {
        if (numero == null || numero.isBlank()) {
            throw new IllegalArgumentException("El numero es obligatorio");
        }
        if (destino == null || destino.isBlank()) {
            throw new IllegalArgumentException("El destino es obligatorio");
        }
        this.numero = numero;
        this.destino = destino;
    }

    public String getNumero() { return numero; }
    public String getDestino() { return destino; }

    public void cambiarDestino(String nuevoDestino) {
        if (nuevoDestino == null || nuevoDestino.isBlank()) {
            throw new IllegalArgumentException("El destino es obligatorio");
        }
        destino = nuevoDestino;
    }

    public static void main(String[] args) {
        Guia guia = new Guia("RF-101", "Medellin");
        System.out.println(guia.getNumero() + " -> " + guia.getDestino());
        try {
            new Guia("", "Envigado");
        } catch (IllegalArgumentException error) {
            System.out.println("Rechazada: " + error.getMessage());
        }
    }
}
```

Desde `java-motor-poo/`, ejecuta:

```bash
javac -d out src/Guia.java
java -cp out Guia
```

**Resultado esperado:** `RF-101 -> Medellin` y `Rechazada: El numero es obligatorio`.

**Fallo deliberado:** quita el primer `if` del constructor y ejecuta de nuevo. **Error esperado:** la guía con número vacío se imprime como si fuera válida. **Diagnóstico:** sin validar en el punto de creación, ningún método impide construir el estado inválido; restaura la condición y vuelve a ejecutar.

**3. Entiende**
Una regla que siempre debe cumplirse es un invariante. El constructor la comprueba antes de asignar el estado y el método de cambio aplica una validación equivalente cuando ese estado se actualiza.

**4. Cierra**
Entrega el archivo, la salida válida y el fallo reproducido. Para una clase que solo transporta datos sin reglas propias puede bastar una validación en la frontera; protege aquí el modelo porque el número y destino son necesarios para operar la guía.

**Hito del tema:**

- [ ] Creé dos objetos distintos a partir de `Guia`.
- [ ] Protegí campos privados y leí datos mediante métodos públicos.
- [ ] Rechacé valores vacíos al construir y al cambiar el destino.
- [ ] Reproduje un estado inválido al quitar la validación y expliqué la causa.

**Fuentes oficiales:** [clases y objetos en dev.java](https://dev.java/learn/classes-objects/) y [herencia y clases en Java](https://docs.oracle.com/javase/tutorial/java/IandI/).

### Tema 2: Herencia y sobreescritura

**Duración estimada:** 40 min.
**¿Por qué es importante?** La herencia expresa una relación entre tipos y el polimorfismo permite que una misma operación use el comportamiento del objeto concreto. También practicarás cómo el compilador verifica una sobreescritura y cómo una herramienta de auditoría puede leer metadatos de un método.
**Prerrequisitos:** M1 T1. Proyecto continuo: el motor permitirá distintos tipos de vehículo y dejará preparada una acción de entrega auditable.

#### Subtema 2.1: Extiende una clase y hereda su comportamiento · 10 min

**1. Contexto**
Una bicicleta de reparto comparte con otros vehículos un identificador y una operación de entrega.

**2. Hazlo tú**
Crea `java-motor-poo/src/EntregaDemo.java` con este archivo completo:

```java
class Vehiculo {
    String codigo;
    Vehiculo(String codigo) { this.codigo = codigo; }
    String entregar() { return codigo + " entrega paquete"; }
}

class Bicicleta extends Vehiculo {
    Bicicleta(String codigo) { super(codigo); }
}

public class EntregaDemo {
    public static void main(String[] args) {
        Bicicleta bici = new Bicicleta("BI-7");
        System.out.println(bici.entregar());
    }
}
```

Desde `java-motor-poo/`, ejecuta:

```bash
mkdir -p out
javac -d out src/EntregaDemo.java
java -cp out EntregaDemo
```

**Resultado esperado:** `BI-7 entrega paquete`.

**Fallo deliberado:** cambia `super(codigo)` por `super()`. **Error esperado:** el constructor de `Vehiculo` requiere un `String`. **Diagnóstico:** como definimos un constructor propio en la clase base, la subclase debe llamarlo con `super(codigo)`.

**3. Entiende**
`extends` declara que `Bicicleta` es una clase más específica de `Vehiculo`. `super(codigo)` llama al constructor base para inicializar el código compartido; la subclase hereda `entregar()`.

**4. Cierra**
Dibuja la relación entre ambas clases y marca qué inicializa el constructor base.

#### Subtema 2.2: Sobrescribe una operación · 10 min

**1. Contexto**
Una bicicleta y una furgoneta pueden completar la misma tarea de formas diferentes; el nombre de la operación común permite tratarlas de manera uniforme.

**2. Hazlo tú**
Reemplaza `java-motor-poo/src/EntregaDemo.java` por este archivo completo:

```java
class Vehiculo {
    String codigo;
    Vehiculo(String codigo) { this.codigo = codigo; }
    String entregar() { return codigo + " entrega paquete"; }
}

class Bicicleta extends Vehiculo {
    Bicicleta(String codigo) { super(codigo); }
    @Override
    String entregar() { return codigo + " entrega en bicicleta"; }
}

public class EntregaDemo {
    public static void main(String[] args) {
        Bicicleta bici = new Bicicleta("BI-7");
        System.out.println(bici.entregar());
    }
}
```

Compila y ejecuta con los comandos del subtema 2.1.

**Resultado esperado:** `BI-7 entrega en bicicleta`.

**Fallo deliberado:** cambia el nombre del método de la subclase a `entregarr` y deja `@Override`. **Error esperado:** `method does not override or implement a method from a supertype`. **Diagnóstico:** los nombres no coinciden; `@Override` hace que el compilador detecte el error de escritura.

**3. Entiende**
Sobrescribir reemplaza el comportamiento heredado para esa subclase. `@Override` no crea el polimorfismo; le pide al compilador que compruebe que realmente estás sobrescribiendo un método existente.

**4. Cierra**
Entrega la salida y el error del nombre mal escrito, luego restaura `entregar`.

#### Subtema 2.3: Observa el polimorfismo con varios vehículos · 10 min

**1. Contexto**
El asignador puede operar sobre una lista de vehículos sin preguntar en cada línea qué clase concreta recibió.

**2. Hazlo tú**
Reemplaza `java-motor-poo/src/EntregaDemo.java` por este archivo completo:

```java
import java.util.List;

class Vehiculo {
    String codigo;
    Vehiculo(String codigo) { this.codigo = codigo; }
    String entregar() { return codigo + " entrega paquete"; }
}

class Bicicleta extends Vehiculo {
    Bicicleta(String codigo) { super(codigo); }
    @Override String entregar() { return codigo + " entrega en bicicleta"; }
}

class Furgoneta extends Vehiculo {
    Furgoneta(String codigo) { super(codigo); }
    @Override String entregar() { return codigo + " entrega en furgoneta"; }
}

public class EntregaDemo {
    public static void main(String[] args) {
        List<Vehiculo> flota = List.of(
            new Bicicleta("BI-7"), new Furgoneta("FU-2"));
        for (Vehiculo vehiculo : flota) {
            System.out.println(vehiculo.entregar());
        }
    }
}
```

Compila y ejecuta:

```bash
javac -d out src/EntregaDemo.java
java -cp out EntregaDemo
```

**Resultado esperado:** `BI-7 entrega en bicicleta` y `FU-2 entrega en furgoneta`.

**Fallo deliberado:** quita `@Override` y cambia accidentalmente el método de `Furgoneta` a `entregarr`. **Error esperado:** la lista imprime para esa furgoneta el comportamiento base `FU-2 entrega paquete`. **Diagnóstico:** sin `@Override`, el método nuevo compila pero no reemplaza `entregar`; restaura la anotación para que el compilador detecte el fallo.

**3. Entiende**
La variable tiene tipo `Vehiculo`, pero cada objeto conserva su tipo concreto. Java selecciona el método sobrescrito según el objeto en tiempo de ejecución.

**4. Cierra**
Explica por qué el ciclo `for` no necesita distinguir bicicleta de furgoneta y conserva la salida de ambas.

#### Subtema 2.4: Declara una anotación que pueda leer una auditoría · 10 min

**1. Contexto**
Un interceptor puede leer metadatos de `confirmar` para registrar una acción sensible sin mezclar esa tarea con la regla de negocio.

**2. Hazlo tú**
Reemplaza `java-motor-poo/src/EntregaDemo.java` por este archivo completo:

```java
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.annotation.ElementType;
import java.lang.reflect.Method;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Auditable {
    String accion();
}

class ServicioEntrega {
    @Auditable(accion = "confirmar-entrega")
    public void confirmar() { }
}

public class EntregaDemo {
    public static void main(String[] args) throws Exception {
        Method metodo = ServicioEntrega.class.getMethod("confirmar");
        Auditable marca = metodo.getAnnotation(Auditable.class);
        System.out.println(marca.accion());
    }
}
```

Desde `java-motor-poo/`, compila y ejecuta:

```bash
javac -d out src/EntregaDemo.java
java -cp out EntregaDemo
```

**Resultado esperado:** `confirmar-entrega`.

**Fallo deliberado:** elimina `@Retention(RetentionPolicy.RUNTIME)` y ejecuta otra vez. **Error esperado:** `NullPointerException` al leer `marca.accion()`, porque la reflexión devuelve `null`. **Diagnóstico:** sin retención `RUNTIME`, la anotación no está disponible para inspección durante la ejecución; restaura la política y vuelve a ejecutar.

**3. Entiende**
Una anotación describe metadatos; no hace nada por sí sola. `@Target` limita su uso a métodos y `@Retention(RUNTIME)` permite que un interceptor la descubra mediante reflexión. Una acción aislada también puede invocar una auditoría directa; la anotación tiene sentido cuando un componente común interpreta muchas marcas.

**4. Cierra**
Entrega la salida, la excepción reproducida y una frase que explique qué componente debe leer la anotación para que tenga efecto.

**Hito del tema:**

- [ ] Extendí `Vehiculo` y llamé al constructor base con `super`.
- [ ] Sobrescribí `entregar` y usé `@Override` para descubrir un error de escritura.
- [ ] Ejecuté una lista de tipos distintos y observé despacho polimórfico.
- [ ] Leí `@Auditable` con reflexión y expliqué para qué sirve `RUNTIME`.

**Fuentes oficiales:** [clases y objetos en dev.java](https://dev.java/learn/classes-objects/), [herencia en Java](https://docs.oracle.com/javase/tutorial/java/IandI/subclasses.html) y [política de retención de anotaciones](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/annotation/Retention.html).

**Transferencia al proyecto integrador:** sustituye distintos tipos de vehículo mediante un mismo ciclo de asignación y registra qué acción queda marcada para auditoría.

### Tema 3: Interfaces, clases abstractas y cuándo usar cada una

#### Paso 1 · Objetivo y preparación
Al finalizar podrás elegir entre interfaz y clase abstracta según si existe comportamiento compartido real, e implementar ambas con una jerarquía `Forma`. Prerrequisitos: JDK 25, Maven y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
El sistema necesita que tipos no relacionados (un `Pajaro` y un `Avion`, por ejemplo) cumplan un contrato común (`Volador`) sin compartir jerarquía; y necesita que figuras geométricas relacionadas (`Circulo`, `Cuadrado`) compartan una implementación común (`describir()`) además de un método propio (`area()`).

#### Paso 3 · Teoría, modelo mental y analogía
Una interfaz es un contrato puro sin implementación; una clase abstracta combina comportamiento compartido real con métodos que cada subclase debe completar. La analogía: la interfaz es un contrato de servicio que empresas no relacionadas pueden firmar; la clase abstracta es una franquicia que comparte infraestructura real entre sucursales.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-interfaz-abstracta
cd ejemplo-interfaz-abstracta
mkdir -p src/main/java/academia/formas
```

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

Crea `Volador`/`Pajaro` (interfaz) y `Forma`/`Circulo`/`Cuadrado` (clase abstracta con `area()` abstracto y `describir()` concreto). Compila y ejecuta una clase `Main` que invoque `describir()` sobre un `Circulo` y un `Cuadrado`.

#### Paso 5 · Práctica guiada
Pista: intenta instanciar `new Forma()` directamente para provocar un fallo deliberado de compilación; una clase abstracta no puede instanciarse. Resultado esperado: el compilador rechaza la instanciación directa y exige una subclase concreta.

#### Paso 6 · Práctica independiente
Agrega una segunda implementación de `Volador` (por ejemplo `Avion`, sin relación de herencia con `Pajaro`) y una tercera subclase de `Forma` (`Triangulo`); confirma que `describir()` funciona igual para las tres sin reescribirlo.

#### Paso 7 · Cierre y evidencia
Guarda las clases, la salida de `describir()` para cada forma y el error de instanciación directa; como siguiente paso estudia sobrecarga y modificadores de acceso. Errores comunes: usar clase abstracta cuando bastaba una interfaz, y duplicar comportamiento compartido en cada implementación de una interfaz en vez de centralizarlo en una clase abstracta. Fuentes oficiales: https://dev.java/learn/classes-objects/ y https://docs.oracle.com/javase/tutorial/java/IandI/.
**¿Por qué es importante?** Porque elegir mal entre interfaz y clase abstracta duplica comportamiento compartido real entre subclases relacionadas, o fuerza una relación de herencia innecesaria donde solo hacía falta un contrato puro.
**Evidencia de aprendizaje:** entrega la interfaz `Volador` implementada por tipos no relacionados, la clase abstracta `Forma` con sus subclases concretas, y el error de compilación al intentar instanciar `Forma` directamente.
**Conceptos clave:** contrato sin implementación, comportamiento compartido parcial, múltiple implementación de interfaces.

Una interfaz (`interface Volador { void volar(); }`) define un contrato puro: qué métodos debe tener cualquier clase que la implemente, sin proporcionar ninguna implementación propia por defecto (salvo métodos `default` explícitamente marcados como tales, un caso especial más avanzado), permitiendo que clases completamente no relacionadas entre sí en su jerarquía de herencia (una clase `Pajaro` y una clase `Avion`, por ejemplo, sin ninguna relación de herencia común) implementen el mismo contrato `Volador`, algo que Java permite hacer con múltiples interfaces simultáneamente (`class Pajaro implements Volador, Comestible`), a diferencia de la herencia de clases, donde Java solo permite extender una única superclase.

Una clase abstracta (`abstract class Forma { abstract double area(); void describir() {...} }`) es apropiada en cambio cuando existe comportamiento genuinamente compartido entre subclases relacionadas entre sí (el método `describir()`, con una implementación concreta compartida por todas las subclases de `Forma`), combinado con métodos abstractos que cada subclase concreta debe implementar por su cuenta (`area()`, sin implementación en la clase abstracta, dado que el cálculo específico depende de qué forma geométrica concreta sea cada subclase). La elección entre ambas se resume en si existe comportamiento compartido real que valga la pena centralizar (clase abstracta) frente a un contrato puro que clases potencialmente no relacionadas deben cumplir (interfaz).

**Analogía:** una interfaz es como un contrato de servicio que múltiples empresas completamente distintas y no relacionadas entre sí pueden firmar, comprometiéndose a ofrecer ciertos servicios específicos sin que el contrato les dicte cómo implementarlos internamente; una clase abstracta es como una franquicia que comparte cierta infraestructura y procedimientos comunes reales entre todas sus sucursales, dejando que cada sucursal específica implemente únicamente los detalles particulares de su operación local.

**¿Por qué es importante?** Elegir entre clase abstracta e interfaz según si existe comportamiento compartido real (clase abstracta) o solo un contrato puro (interfaz) produce un diseño de jerarquía de clases más claro y correctamente alineado con la relación real entre los tipos involucrados.

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

**Transferencia al proyecto integrador «Motor de asignación de entregas»:** Define una interfaz de asignación y decide qué comportamiento merece una base abstracta. Una implementación falsa debe poder probar el consumidor sin heredar campos que no necesita.

### Tema 4: Sobrecarga vs sobreescritura, y modificadores de acceso

#### Paso 1 · Objetivo y preparación
Al finalizar podrás distinguir sobrecarga (varias firmas, mismo nombre) de sobreescritura (Tema 2), y aplicar los cuatro niveles de visibilidad de Java. Prerrequisitos: JDK 25, Maven y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
Un servicio de tarifas necesita `sumar` para enteros y para decimales sin duplicar el nombre del método; y necesita que solo ciertas clases del mismo paquete puedan acceder a un campo interno, mientras otras partes del sistema no.

#### Paso 3 · Teoría, modelo mental y analogía
La sobrecarga se resuelve en tiempo de compilación según los tipos de los argumentos; la sobreescritura, en tiempo de ejecución según el tipo real del objeto. La analogía: la sobrecarga es tener varias entradas a un edificio para distinto tipo de visitante; los modificadores de acceso son círculos concéntricos de alcance creciente.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-sobrecarga-visibilidad
cd ejemplo-sobrecarga-visibilidad
mkdir -p src/main/java/academia/tarifas
```

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

Crea `Tarifa.java` con dos métodos `sumar` sobrecargados (`int`/`int` y `double`/`double`) y un campo `private` junto a uno `protected`. Compila y ejecuta una clase `Main` que invoque ambas variantes de `sumar` y muestre cuál se resuelve para cada tipo de argumento.

#### Paso 5 · Práctica guiada
Pista: intenta acceder al campo `private` desde otra clase del mismo paquete para provocar un fallo deliberado de compilación; solo el campo sin modificador (package-private) es accesible ahí. Resultado esperado: distingues qué nivel de visibilidad permite cada acceso.

#### Paso 6 · Práctica independiente
Agrega una tercera sobrecarga de `sumar` que reciba tres argumentos, y una clase en otro paquete que confirme que el campo `protected` es accesible solo desde una subclase.

#### Paso 7 · Cierre y evidencia
Guarda las sobrecargas, la salida de cada resolución y el error de acceso al campo `private`; como siguiente paso estudia colecciones. Errores comunes: confundir sobrecarga con sobreescritura, hacer todo `public` por comodidad, y setters sin reglas que rompan invariantes. Fuentes oficiales: https://dev.java/learn/classes-objects/ y https://docs.oracle.com/javase/tutorial/java/IandI/.
**¿Por qué es importante?** Porque confundir sobrecarga con sobreescritura, o exponer un campo con más visibilidad de la necesaria, son errores de diseño que se vuelven costosos de revertir una vez que otro código ya depende de ellos.
**Evidencia de aprendizaje:** entrega las dos sobrecargas de `sumar`, la resolución correcta de cada una según el tipo del argumento, y el error de compilación al intentar acceder al campo `private` desde otra clase.
**Conceptos clave:** misma firma vs distintas firmas, niveles de visibilidad.

La sobrecarga (overload) define múltiples métodos con el mismo nombre pero distintas firmas (distinto número o tipo de parámetros) dentro de la misma clase: `int sumar(int a, int b)` y `double sumar(double a, double b)` son dos métodos distintos que el compilador resuelve según los tipos de los argumentos pasados en cada llamada específica, una decisión tomada en tiempo de compilación; la sobreescritura (override, Tema 2) redefine el comportamiento de un método heredado con exactamente la misma firma en una subclase, una decisión resuelta en tiempo de ejecución según el tipo real del objeto.

Los modificadores de acceso controlan la visibilidad de un miembro de una clase en círculos concéntricos de alcance creciente: `private` restringe el acceso exclusivamente a la propia clase; sin modificador explícito (package-private, el nivel por defecto cuando no se escribe ninguno) permite acceso desde cualquier clase del mismo paquete; `protected` extiende ese acceso también a subclases, incluso si están en otro paquete distinto; `public` permite acceso desde cualquier lugar sin restricción alguna, la misma jerarquía de visibilidad estudiada de forma más general en el Módulo 4 del track de JavaScript sobre encapsulación, aquí con la sintaxis y granularidad específica de Java.

**Analogía:** la sobrecarga es como tener varias entradas distintas a un mismo edificio, cada una diseñada para un tipo distinto de visitante que llega con diferente equipaje; la sobreescritura es como una sucursal específica de una franquicia que decide atender a sus visitantes de una forma particular y distinta a como lo especifica el manual general de la franquicia, sin cambiar el nombre del procedimiento que sigue.

**¿Por qué es importante?** Sobrecarga y sobreescritura resuelven problemas distintos (múltiples formas de invocar un método según sus argumentos, frente a redefinir el comportamiento heredado); los modificadores de acceso controlan con precisión granular quién puede ver y usar cada miembro de una clase.

**Código del ejemplo:**

```java
int sumar(int a, int b) { return a + b; }
double sumar(double a, double b) { return a + b; } // sobrecarga: mismo nombre, firma distinta

// private (solo la clase) < package-private (mismo paquete) < protected (+ subclases) < public (todos)
```

---

**Transferencia al proyecto integrador «Motor de asignación de entregas»:** Separa sobrecarga de métodos de la sustitución de comportamiento del motor. Prueba llamadas por interfaz y restringe modificadores para impedir que un consumidor altere capacidad sin validación.

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
