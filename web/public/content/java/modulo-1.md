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

**Proyecto integrador:** `Guia` es el primer modelo real del motor de asignación de entregas; los módulos siguientes construyen sobre esta clase protegida. **Práctica:** modifica `Guia.java` para agregar un campo `pesoKg` validado (rechaza valores menores o iguales a cero en el constructor) y repite la ejecución para comprobar que el rechazo funciona igual que con el número vacío.

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

**Transferencia al proyecto integrador:** sustituye distintos tipos de vehículo mediante un mismo ciclo de asignación y registra qué acción queda marcada para auditoría. **Límite:** hereda solo cuando la subclase es realmente un tipo más específico del padre (una bicicleta "es un" vehículo); si solo quieres reutilizar código sin esa relación "es-un", usa composición en vez de herencia. **Práctica:** modifica `Bicicleta` (o el vehículo del ejercicio) para agregar un tercer tipo `Dron` que sobrescriba `entregar` con su propio mensaje, y confirma el despacho polimórfico al recorrer la lista de vehículos.

### Tema 3: Interfaces, clases abstractas y cuándo usar cada una

**Duración estimada:** 35 min.
**¿Por qué es importante?** Una interfaz expresa qué operación ofrece un tipo; una clase abstracta permite compartir estado o código cuando las clases sí tienen una base común.
**Prerrequisitos:** M1 T2. Proyecto continuo: definir el contrato con que el motor programa entregas y compartir solo los datos que todas necesitan.

#### Subtema 3.1: Define un contrato con una interfaz · 10 min

**1. Contexto**
El motor debe solicitar confirmación de entrega tanto a una clase local como a un adaptador externo sin conocer sus detalles internos.

**2. Hazlo tú**
Crea `java-motor-poo/src/ContratoDemo.java` con este archivo completo:

```java
interface Confirmable {
    String confirmar();
}

class EntregaLocal implements Confirmable {
    public String confirmar() { return "Entrega local confirmada"; }
}

class AdaptadorMovil implements Confirmable {
    public String confirmar() { return "Confirmación recibida del móvil"; }
}

public class ContratoDemo {
    static void procesar(Confirmable entrega) {
        System.out.println(entrega.confirmar());
    }

    public static void main(String[] args) {
        procesar(new EntregaLocal());
        procesar(new AdaptadorMovil());
    }
}
```

Desde `java-motor-poo/`, ejecuta:

```bash
mkdir -p out
javac -d out src/ContratoDemo.java
java -cp out ContratoDemo
```

**Resultado esperado:** `Entrega local confirmada` y `Confirmación recibida del móvil`.

**Fallo deliberado:** cambia `implements Confirmable` por `extends Confirmable` en `EntregaLocal`. **Error esperado:** `no interface expected here`. **Diagnóstico:** las clases implementan interfaces con `implements`; `extends` se usa para extender otra clase.

**3. Entiende**
La interfaz declara el método que ambas implementaciones deben ofrecer. `procesar` depende del contrato, así que puede aceptar cualquier implementación sin cambiar su código.

**4. Cierra**
Agrega una implementación `ConfirmacionPrueba` y comprueba que `procesar` funciona sin editarse.

#### Subtema 3.2: Comparte estado y comportamiento con una clase abstracta · 10 min

**1. Contexto**
Las dos modalidades de envío comparten el identificador y la validación de una guía, aunque cada una calcula distinto el tiempo estimado.

**2. Hazlo tú**
Reemplaza `java-motor-poo/src/ContratoDemo.java` por este archivo completo:

```java
abstract class ServicioEntrega {
    private final String guia;

    ServicioEntrega(String guia) {
        if (guia == null || guia.isBlank()) {
            throw new IllegalArgumentException("La guia es obligatoria");
        }
        this.guia = guia;
    }

    String guia() { return guia; }
    abstract int minutosEstimados();
    String resumen() { return guia + ": " + minutosEstimados() + " min"; }
}

class EntregaLocal extends ServicioEntrega {
    EntregaLocal(String guia) { super(guia); }
    int minutosEstimados() { return 45; }
}

public class ContratoDemo {
    public static void main(String[] args) {
        System.out.println(new EntregaLocal("RF-201").resumen());
    }
}
```

Compila y ejecuta con los mismos comandos del subtema 3.1.

**Resultado esperado:** `RF-201: 45 min`.

**Fallo deliberado:** cambia `new EntregaLocal("RF-201")` por `new ServicioEntrega("RF-201")`. **Error esperado:** `ServicioEntrega is abstract; cannot be instantiated`. **Diagnóstico:** la clase base deja pendiente `minutosEstimados`; crea una subclase concreta que complete ese método.

**3. Entiende**
La clase abstracta comparte el campo validado `guia` y el método `resumen`. Cada modalidad debe implementar la operación que depende del tipo de servicio.

**4. Cierra**
Marca qué parte se reutiliza y qué método queda a cargo de cada tipo de entrega.

#### Subtema 3.3: Combina contrato e implementación compartida · 15 min

**1. Contexto**
El motor puede depender de un contrato desacoplado y, cuando dos servicios comparten estado real, reutilizar una base abstracta que también cumple ese contrato.

**2. Hazlo tú**
Reemplaza `java-motor-poo/src/ContratoDemo.java` por este archivo completo:

```java
import java.util.List;

interface Confirmable {
    String confirmar();
}

abstract class ServicioEntrega implements Confirmable {
    private final String guia;
    ServicioEntrega(String guia) { this.guia = guia; }
    abstract int minutosEstimados();
    public String confirmar() { return guia + " confirmada en " + minutosEstimados() + " min"; }
}

class EntregaLocal extends ServicioEntrega {
    EntregaLocal(String guia) { super(guia); }
    int minutosEstimados() { return 45; }
}

class EntregaExpress extends ServicioEntrega {
    EntregaExpress(String guia) { super(guia); }
    int minutosEstimados() { return 20; }
}

public class ContratoDemo {
    static void procesar(List<Confirmable> entregas) {
        for (Confirmable entrega : entregas) {
            System.out.println(entrega.confirmar());
        }
    }

    public static void main(String[] args) {
        procesar(List.of(new EntregaLocal("RF-201"), new EntregaExpress("RF-202")));
    }
}
```

Desde `java-motor-poo/`, compila y ejecuta:

```bash
javac -d out src/ContratoDemo.java
java -cp out ContratoDemo
```

**Resultado esperado:** `RF-201 confirmada en 45 min` y `RF-202 confirmada en 20 min`.

**Fallo deliberado:** quita `minutosEstimados()` de `EntregaExpress`. **Error esperado:** `EntregaExpress is not abstract and does not override abstract method minutosEstimados()`. **Diagnóstico:** una clase concreta debe completar todos los métodos abstractos heredados.

**3. Entiende**
El consumidor recibe `Confirmable`, una capacidad que puede cumplir cualquier objeto. La clase abstracta agrega estado común a esta familia concreta de servicios; el contrato por sí solo no obliga a heredar esa base.

**4. Cierra**
Entrega el archivo y la salida. Justifica por qué `Confirmable` es una interfaz y por qué `ServicioEntrega` sí tiene sentido como clase abstracta.

**Hito del tema:**

- [ ] Implementé una interfaz en dos clases sin relación de herencia entre sí.
- [ ] Usé una clase abstracta para compartir estado validado y un método común.
- [ ] Combiné ambos tipos en un consumidor que depende del contrato.
- [ ] Reproduje el error por no implementar un método abstracto.

**Fuentes oficiales:** [interfaces en dev.java](https://dev.java/learn/interfaces/) y [clases abstractas e interfaces](https://docs.oracle.com/javase/tutorial/java/IandI/abstract.html).

**Transferencia al proyecto integrador:** define un contrato de asignación que admita una implementación real y una falsa para practicar sin heredar datos innecesarios. **Práctica:** modifica `ServicioEntrega` para agregar un segundo método abstracto `costoBase()` y crea una tercera implementación concreta que lo complete junto con `minutosEstimados()`.

### Tema 4: Sobrecarga vs sobreescritura, y modificadores de acceso

**Duración estimada:** 35 min.
**¿Por qué es importante?** La sobrecarga ofrece varias formas de llamar a una operación; la sobreescritura cambia el comportamiento heredado. Los modificadores limitan quién puede usar cada parte del modelo.
**Prerrequisitos:** M1 T2 y M1 T3. Proyecto continuo: calcular tarifas de entrega y proteger los datos de una guía.

#### Subtema 4.1: Sobrecarga según los parámetros · 10 min

**1. Contexto**
El motor calcula una tarifa con distancias enteras o decimales y conserva un nombre de operación fácil de recordar.

**2. Hazlo tú**
Crea el archivo java-motor-poo/src/TarifaDemo.java:

```java
class Tarifa {
    static int calcular(int kilometros) { return kilometros * 1200; }
    static double calcular(double kilometros) { return kilometros * 1200.0; }
}

public class TarifaDemo {
    public static void main(String[] args) {
        System.out.println(Tarifa.calcular(3));
        System.out.println(Tarifa.calcular(2.5));
    }
}
```

Desde java-motor-poo/, compila y ejecuta:

```bash
mkdir -p out
javac -d out src/TarifaDemo.java
java -cp out TarifaDemo
```

**Resultado esperado:** 3600 y 3000.0.

**Fallo deliberado:** agrega una variante calcular(int) que solo cambie el tipo de retorno. **Error esperado:** method calcular(int) is already defined. **Diagnóstico:** el tipo de retorno por sí solo no diferencia dos métodos; cambia la cantidad o los tipos de parámetros.

**3. Entiende**
Las variantes comparten nombre, pero tienen parámetros distintos. El compilador selecciona una según los argumentos de la llamada.

**4. Cierra**
Anota qué firma se eligió en cada llamada y qué la distingue.

#### Subtema 4.2: Compara sobrecarga y sobreescritura · 10 min

**1. Contexto**
Al investigar una llamada, distingue si el compilador eligió otra firma o si un objeto de una subclase cambió la implementación heredada.

**2. Hazlo tú**
Reemplaza java-motor-poo/src/TarifaDemo.java:

```java
class Calculador {
    String calcular(int kilometros) { return "base=" + kilometros; }
}

class CalculadorExpress extends Calculador {
    @Override
    String calcular(int kilometros) { return "express=" + kilometros; }

    String calcular(double kilometros) { return "decimal=" + kilometros; }
}

public class TarifaDemo {
    public static void main(String[] args) {
        Calculador calculador = new CalculadorExpress();
        System.out.println(calculador.calcular(3));
        System.out.println(((CalculadorExpress) calculador).calcular(2.5));
    }
}
```

Compila y ejecuta con los comandos del subtema 4.1.

**Resultado esperado:** express=3 y decimal=2.5.

**Fallo deliberado:** elimina @Override y escribe calcularr en la variante entera. **Resultado erróneo esperado:** base=3. **Diagnóstico:** creaste otro método; no reemplaza calcular. Restaura el nombre y usa @Override para que el compilador detecte errores de firma.

**3. Entiende**
calcular(int) sobrescribe la firma heredada y el objeto decide la implementación durante la ejecución. calcular(double) es una sobrecarga, elegida por los argumentos al compilar.

**4. Cierra**
Clasifica cada llamada y explica si su selección ocurre por firma o por tipo real del objeto.

#### Subtema 4.3: Restringe el acceso a los datos · 15 min

**1. Contexto**
El identificador de una guía debe permanecer privado; el paquete puede compartir un contador interno y una subclase puede especializar el estado protegido.

**2. Hazlo tú**
Crea java-motor-poo/src/modelo/Guia.java:

```java
package modelo;

public class Guia {
    private final String numero;
    int intentos;
    protected String estado = "lista";

    public Guia(String numero) { this.numero = numero; }
    public String numero() { return numero; }
}
```

Crea java-motor-poo/src/modelo/Control.java:

```java
package modelo;

public class Control {
    public static void main(String[] args) {
        Guia guia = new Guia("RF-301");
        guia.intentos++;
        System.out.println(guia.numero() + " intentos=" + guia.intentos);
    }
}
```

Crea java-motor-poo/src/app/Bicicleta.java:

```java
package app;

import modelo.Guia;

public class Bicicleta extends Guia {
    public Bicicleta() { super("RF-302"); }

    public String resumen() {
        return numero() + " estado=" + estado;
    }

    public static void main(String[] args) {
        System.out.println(new Bicicleta().resumen());
    }
}
```

Desde java-motor-poo/, compila y ejecuta:

```bash
javac -d out src/modelo/Guia.java src/modelo/Control.java src/app/Bicicleta.java
java -cp out modelo.Control
java -cp out app.Bicicleta
```

**Resultado esperado:** RF-301 intentos=1 y RF-302 estado=lista.

**Fallo deliberado:** en Bicicleta, intenta leer new Guia("RF-303").estado. **Error esperado:** estado has protected access in Guia. **Diagnóstico:** fuera del paquete, una subclase puede usar el miembro protegido en el contexto de su herencia; una instancia arbitraria de la clase base no queda abierta al acceso.

**3. Entiende**
private limita el miembro a su clase; sin modificador (package-private) lo comparte dentro del paquete; protected permite acceso en el paquete y en subclases con las reglas de Java; public expone el miembro desde otros paquetes. El método numero() da acceso controlado al campo privado.

**4. Cierra**
Ordena los cuatro niveles de menor a mayor alcance y explica por qué leer estado desde this es válido, pero leerlo desde la instancia base no.

**Hito del tema:**

- [ ] Sobrecargué un método con parámetros distintos y comprobé que cambiar solo el retorno no basta.
- [ ] Comparé una sobrecarga con una sobreescritura.
- [ ] Probé private y package-private dentro del paquete.
- [ ] Usé protected desde una subclase externa y describí cuándo conviene public.

**Fuentes oficiales:** [clases y objetos en dev.java](https://dev.java/learn/classes-objects/), [sobrecarga y sobreescritura](https://docs.oracle.com/javase/tutorial/java/IandI/override.html) y [modificadores de acceso de Java](https://docs.oracle.com/javase/tutorial/java/javaOO/accesscontrol.html).

**Transferencia al proyecto integrador:** conserva una interfaz pública pequeña para operar el motor y mantén privados los datos que solo el modelo debe cambiar.

## Construcción guiada del capítulo

**Objetivo del laboratorio:** construir una jerarquía de clases con herencia, una interfaz y una clase abstracta.

**Requisitos previos:** Módulo 0 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Construir `Guia` con invariantes en el constructor | Ver Tema 1 | Impide número y destino vacíos |
| 2 | Extender `Vehiculo` y sobrescribir `entregar()` | Ver Tema 2 | Verifica despacho polimórfico |
| 3 | Combinar `Confirmable` con `ServicioEntrega` abstracto | Ver Tema 3 | Separa capacidad común de estado compartido |
| 4 | Sobrecargar `calcular()` y contrastarlo con `@Override` | Ver Tema 4 | Distingue selección por firma y tipo real |
| 5 | Revisar acceso de campos en `Guia` y `Bicicleta` | Ver Tema 4 | Contrasta `private`, package-private y `protected` |

**Verificación:** el laboratorio se considera exitoso si el motor procesa servicios mediante `Confirmable`, comparte el dato de guía solo donde corresponde y demuestra la diferencia entre sobrecarga, sobreescritura y alcance de los miembros.

**Errores comunes y soluciones**

- **Confundir sobrecarga con sobreescritura.** La sobrecarga define métodos con firmas distintas en la misma clase; la sobreescritura redefine un método heredado con la misma firma exacta.
- **Usar una clase abstracta cuando una interfaz sería más apropiada.** Si no hay comportamiento compartido real entre subclases no relacionadas, prefiere una interfaz.
- **Olvidar `@Override` al sobreescribir un método.** Sin ella, el compilador no verifica que efectivamente estás sobreescribiendo un método existente con la firma correcta.

---
