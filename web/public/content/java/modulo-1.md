# Módulo 1: Programación orientada a objetos

En el Módulo 0 trabajamos con variables, condiciones, bucles, arreglos y métodos. Eso permite resolver problemas pequeños, pero cuando el programa crece aparece una dificultad nueva: los datos y las reglas que los gobiernan quedan dispersos. La programación orientada a objetos propone organizar el código alrededor de tipos que representan conceptos del dominio. Cada objeto agrupa estado y comportamiento, y expone operaciones que protegen sus invariantes.

**Entorno de referencia verificado en esta máquina (2026-05-22):**

```bash
java -version
javac -version
```

```text
openjdk version "27.0.1.0.2" 2026-09-15
javac 27.0.1.0.2
```

## Aprende construyendo

### Tema 1: Clases, objetos, constructores y encapsulación · Básico · 40 min

Supongamos que necesitamos modelar una cuenta bancaria. No alcanza con guardar un número en una variable `double saldo`: también hay que saber quién es el titular, permitir depósitos y retiros, y evitar que el saldo quede en un estado inválido. El problema exige agrupar datos y comportamiento, y controlar cómo se modifica el estado.

#### Clases y objetos

Una **clase** es un tipo de referencia que define la estructura y el comportamiento de sus instancias. En ella se declaran campos, constructores y métodos. Un **objeto** es una instancia concreta de una clase, creada con `new`. La clase describe qué es una cuenta; el objeto representa una cuenta particular, con su propio estado.

Esta distinción es importante. La clase `Cuenta` no tiene saldo por sí misma; define que las cuentas tendrán saldo. El objeto creado con `new Cuenta("Ada", 100)` sí tiene un estado concreto en memoria. Confundir clase con objeto suele llevar a errores de diseño, como usar campos estáticos para datos que deberían pertenecer a cada instancia.

#### Constructores e invariantes

Un **constructor** es una rutina especial que se ejecuta durante la creación del objeto. Tiene el mismo nombre de la clase y no declara tipo de retorno. Su función principal es dejar el objeto en un estado inicial válido. Si una cuenta no puede existir sin titular o con saldo inicial negativo, esa regla debe verificarse en el constructor.

A estas reglas las llamamos invariantes: condiciones que deben cumplirse para que el objeto sea válido. El constructor es el primer punto donde se protegen. Si no se declara ningún constructor, Java genera uno por defecto sin parámetros; en cuanto se declara un constructor propio, ese constructor por defecto deja de generarse.

La referencia `this` apunta al objeto actual. Se usa con frecuencia para desambiguar entre el campo y el parámetro, como en `this.titular = titular`.

#### Encapsulación

La **encapsulación** consiste en ocultar la representación interna del objeto y exponer solo operaciones controladas. En Java, esto se logra normalmente declarando los campos como `private` y ofreciendo métodos públicos para interactuar con ellos. No se trata de “poner getters y setters por costumbre”, sino de impedir que cualquier parte del programa modifique el estado sin pasar por las reglas del dominio.

Si `saldo` fuera público, cualquier código podría asignar `-999` y el objeto quedaría inválido. Con `saldo` privado, solo los métodos `depositar` y `retirar` pueden modificarlo, y en ellos se verifican las condiciones.

#### Ejemplo desde cero

```bash
mkdir -p /tmp/java-m1-t1 && cd /tmp/java-m1-t1
```

Creamos `Cuenta.java`:

```java
public class Cuenta {
    private String titular;
    private double saldo;

    public Cuenta(String titular, double saldoInicial) {
        if (titular == null || titular.isBlank()) {
            throw new IllegalArgumentException("Titular inválido");
        }
        if (saldoInicial < 0) {
            throw new IllegalArgumentException("Saldo inicial inválido");
        }
        this.titular = titular;
        this.saldo = saldoInicial;
    }

    public String getTitular() { return titular; }
    public double getSaldo() { return saldo; }

    public void depositar(double monto) {
        if (monto <= 0) {
            throw new IllegalArgumentException("Monto inválido");
        }
        saldo += monto;
    }

    public void retirar(double monto) {
        if (monto <= 0) {
            throw new IllegalArgumentException("Monto inválido");
        }
        if (monto > saldo) {
            throw new IllegalStateException("Saldo insuficiente");
        }
        saldo -= monto;
    }

    public static void main(String[] args) {
        Cuenta c = new Cuenta("Ada", 100);
        c.depositar(50);
        c.retirar(30);
        System.out.println(c.getTitular());
        System.out.println(c.getSaldo());
        try {
            c.retirar(500);
        } catch (IllegalStateException e) {
            System.out.println(e.getMessage());
        }
    }
}
```

#### Recorrido del código

Los campos `titular` y `saldo` son `private`. Eso impide que se modifiquen directamente desde fuera de la clase. El constructor recibe los datos necesarios y valida las invariantes antes de asignarlos. Si el titular es nulo o está en blanco, lanza `IllegalArgumentException`; lo mismo ocurre si el saldo inicial es negativo. El objeto solo llega a existir en un estado válido si pasa esas validaciones.

Los métodos `getTitular` y `getSaldo` exponen lectura controlada. `depositar` y `retirar` exponen operaciones de negocio. Ambos rechazan montos no positivos. Además, `retirar` comprueba que haya saldo suficiente; si no lo hay, lanza `IllegalStateException` porque el problema no es el argumento aislado, sino el estado actual del objeto frente a esa operación.

En `main` se crea un objeto con `new`, se ejecutan operaciones válidas y luego se prueba un retiro imposible. El `try/catch` permite observar el error como parte de la verificación.

#### Ejecución y salida real

```bash
javac Cuenta.java
java Cuenta
```

Salida real observada (JDK 27, 2026-05-22):

```text
Ada
120.0
Saldo insuficiente
```

#### Errores frecuentes

Si los campos son públicos, cualquier código puede romper el estado del objeto. La corrección es hacerlos privados y exponer operaciones que validen reglas.

Si el constructor no valida, el objeto puede nacer inválido. Un objeto inválido es más peligroso que una excepción temprana, porque propaga el error a otras partes del sistema.

Si se usa `IllegalArgumentException` y `IllegalStateException` indistintamente, se pierde precisión. Un argumento inválido indica un problema en el dato recibido; un estado ilegal indica que la operación no es válida para el estado actual.

#### Verificación

La verificación mínima es ejecutar el programa y confirmar el saldo final `120.0` y el mensaje `Saldo insuficiente`. Como prueba adicional, conviene intentar crear una cuenta con saldo negativo y observar la excepción.


### Tema 2: Herencia y sobreescritura · Básico · 40 min

Una empresa tiene empleados fijos y empleados por hora. Ambos comparten datos y comportamientos, como el nombre y la capacidad de calcular un salario mensual, pero el cálculo concreto cambia según el tipo. Copiar y pegar la clase y modificar algunos métodos funcionaría al principio, pero duplicaría reglas y haría difícil mantener el sistema.

#### Herencia

La **herencia** permite definir una clase a partir de otra. La clase base, o superclase, contiene estado y comportamiento común; las subclases extienden o especializan ese comportamiento. En Java se expresa con `extends`. Una subclase hereda los miembros accesibles de la superclase y puede agregar campos o métodos propios.

La herencia modela una relación “es un”. Un `EmpleadoFijo` es un `Empleado`; un `EmpleadoPorHora` también lo es. Esa relación debe ser verdadera en el dominio. Usar herencia solo para reutilizar código, cuando no existe una relación conceptual clara, suele producir jerarquías rígidas y difíciles de corregir.

El constructor de la subclase debe garantizar que la parte heredada quede correctamente inicializada. Para eso se usa `super(...)`, que invoca al constructor de la superclase. Si la superclase no tiene constructor sin argumentos, la llamada a `super(...)` debe hacerse explícitamente.

#### Sobreescritura

La **sobreescritura** ocurre cuando una subclase define un método con la misma firma que uno visible de la superclase. En tiempo de ejecución, el método ejecutado depende del tipo real del objeto, no del tipo de la variable que lo referencia. Este comportamiento es la base del polimorfismo por herencia.

La anotación `@Override` no es obligatoria, pero sí recomendable. Le indica al compilador que la intención es sobreescribir un método existente. Si la firma no coincide, el compilador genera un error en vez de crear un método nuevo por accidente.

La sobreescritura debe respetar el contrato del método base. Si `salarioMensual()` representa el salario mensual del empleado, una subclase no debería devolver un valor con otra semántica sin dejarlo claro. La herencia no solo reutiliza código; también compromete un comportamiento.

#### Ejemplo desde cero

```bash
mkdir -p /tmp/java-m1-t2 && cd /tmp/java-m1-t2
```

Creamos `Herencia.java`:

```java
class Empleado {
    protected final String nombre;

    Empleado(String nombre) {
        this.nombre = nombre;
    }

    double salarioMensual() {
        return 0;
    }

    String descripcion() {
        return nombre + ": " + salarioMensual();
    }
}

class EmpleadoFijo extends Empleado {
    private final double mensual;

    EmpleadoFijo(String nombre, double mensual) {
        super(nombre);
        this.mensual = mensual;
    }

    @Override
    double salarioMensual() {
        return mensual;
    }
}

class EmpleadoPorHora extends Empleado {
    private final double horas;
    private final double tarifa;

    EmpleadoPorHora(String nombre, double horas, double tarifa) {
        super(nombre);
        this.horas = horas;
        this.tarifa = tarifa;
    }

    @Override
    double salarioMensual() {
        return horas * tarifa;
    }
}

public class Herencia {
    public static void main(String[] args) {
        Empleado e1 = new EmpleadoFijo("Ada", 2000);
        Empleado e2 = new EmpleadoPorHora("Grace", 80, 20);
        System.out.println(e1.descripcion());
        System.out.println(e2.descripcion());
    }
}
```

#### Recorrido del código

`Empleado` define el estado común `nombre` y un comportamiento común `descripcion()`. El método `salarioMensual()` devuelve 0 como implementación base simple; en un diseño más estricto podría ser abstracto, lo que veremos en el siguiente tema. Lo relevante aquí es que la superclase establece un punto de extensión.

`EmpleadoFijo` y `EmpleadoPorHora` llaman a `super(nombre)` para inicializar la parte heredada. Cada una agrega los campos que necesita y sobreescribe `salarioMensual()`. La anotación `@Override` hace explícita la intención.

En `main`, las variables se declaran como `Empleado`, pero apuntan a objetos concretos de subclases distintas. Cuando se invoca `descripcion()`, ese método está definido en `Empleado`, pero dentro llama a `salarioMensual()`. La versión ejecutada de `salarioMensual()` es la del objeto real: la del fijo o la del empleado por hora. Ese despacho dinámico es la base del polimorfismo.

#### Ejecución y salida real

```bash
javac Herencia.java
java Herencia
```

Salida real observada (JDK 27, 2026-05-22):

```text
Ada: 2000.0
Grace: 1600.0
```

#### Errores frecuentes

Usar herencia cuando la relación no es “es un” genera diseños frágiles. Si una clase solo quiere reutilizar utilidades de otra, la composición suele ser mejor.

Olvidar `super(...)` en una subclase cuya superclase no tiene constructor vacío produce un error de compilación. La subclase debe inicializar explícitamente la parte base.

Sobreescribir un método con una firma ligeramente distinta sin `@Override` crea un método nuevo en vez de reemplazar el anterior. El programa compila, pero el comportamiento no es el esperado. `@Override` evita ese error.

#### Verificación

La verificación consiste en ejecutar el ejemplo y confirmar que cada empleado calcula su salario según su propia regla, aunque ambos se usen a través del tipo `Empleado`.


### Tema 3: Interfaces, clases abstractas y polimorfismo · Intermedio · 45 min

En el tema anterior, todas las subclases heredaban de una clase concreta `Empleado`. Eso funciona cuando hay comportamiento común para compartir. Pero a veces lo que queremos compartir no es una implementación, sino un contrato: la promesa de que ciertos objetos pueden responder a una operación. Además, puede haber clases que no deberían instanciarse directamente porque están incompletas. Ahí entran las interfaces, las clases abstractas y el polimorfismo.

#### Interfaces como contrato

Una **interfaz** define un contrato. Indica qué métodos debe ofrecer un tipo, sin imponer necesariamente cómo se implementan. En Java, una clase implementa una interfaz con `implements`. Si declara implementar la interfaz, debe proporcionar implementaciones para sus métodos abstractos, salvo que la clase sea abstracta.

Las interfaces son útiles cuando distintos tipos, posiblemente sin relación de herencia, deben poder usarse de forma uniforme. Por ejemplo, una factura y un recibo pueden ser “pagables”, aunque sus reglas internas sean distintas. El código que cobra, imprime o totaliza no necesita conocer la clase concreta; le basta con depender del contrato `Pagable`.

#### Clases abstractas

Una **clase abstracta** puede contener tanto implementación compartida como métodos abstractos sin implementación. No se puede instanciar directamente. Se usa cuando existe una relación “es un” y, además, hay comportamiento o estado común que conviene compartir. A diferencia de una interfaz, una clase abstracta puede tener campos, constructores y métodos concretos.

La elección entre interfaz y clase abstracta no es una guerra. Una interfaz expresa capacidad o contrato; una clase abstracta expresa una base común incompleta. También pueden combinarse: una clase abstracta puede implementar una interfaz y dejar ciertos detalles a las subclases.

#### Polimorfismo

El **polimorfismo** permite tratar objetos de distintos tipos concretos a través de un tipo común. La llamada `p.total()` puede ejecutar la implementación de `Factura` o de `Recibo`, dependiendo del objeto real. El código que usa `Pagable` no cambia cuando se agrega un nuevo tipo pagable, siempre que ese tipo cumpla el contrato.

Esta propiedad reduce el acoplamiento. El método `imprimir(Pagable p)` no conoce los detalles de cada documento. Solo sabe que puede pedir el total. Ese es el valor práctico del polimorfismo: permite extender el sistema agregando clases nuevas con menor impacto en el código existente.

#### Ejemplo desde cero

```bash
mkdir -p /tmp/java-m1-t3 && cd /tmp/java-m1-t3
```

Creamos `Polimorfismo.java`:

```java
interface Pagable {
    double total();
}

abstract class Documento implements Pagable {
    protected final String id;

    Documento(String id) {
        this.id = id;
    }

    String id() {
        return id;
    }
}

class Factura extends Documento {
    private final double monto;

    Factura(String id, double monto) {
        super(id);
        this.monto = monto;
    }

    @Override
    public double total() {
        return monto * 1.21;
    }
}

class Recibo extends Documento {
    private final double monto;

    Recibo(String id, double monto) {
        super(id);
        this.monto = monto;
    }

    @Override
    public double total() {
        return monto;
    }
}

public class Polimorfismo {
    static void imprimir(Pagable p) {
        System.out.println(p.total());
    }

    public static void main(String[] args) {
        imprimir(new Factura("F1", 100));
        imprimir(new Recibo("R1", 100));
    }
}
```

#### Recorrido del código

`Pagable` declara el contrato `total()`. No dice cómo se calcula; solo dice que todo pagable debe poder devolver un total. `Documento` es abstracta porque representa una base común: tiene un `id` y un constructor, pero no tiene sentido instanciar “un documento genérico” sin saber qué tipo es. Además, implementa `Pagable`, lo que obliga a sus subclases concretas a definir `total()`.

`Factura` y `Recibo` heredan de `Documento`. Ambas comparten el `id`, pero calculan el total de forma distinta. La factura aplica un impuesto; el recibo devuelve el monto tal cual. El método `imprimir` recibe `Pagable`, no `Factura` ni `Recibo`. Por eso puede trabajar con ambos sin conocer sus diferencias internas.

#### Ejecución y salida real

```bash
javac Polimorfismo.java
java Polimorfismo
```

Salida real observada (JDK 27, 2026-05-22):

```text
121.0
100.0
```

La misma llamada `imprimir(p)` produce resultados distintos porque el objeto real es distinto. El código cliente no cambió.

#### Errores frecuentes

Usar una clase abstracta cuando solo se necesita un contrato puede forzar una jerarquía innecesaria. Si no hay estado o implementación común real, una interfaz suele ser más flexible.

Hacer que el código dependa de clases concretas por todas partes elimina el beneficio del polimorfismo. Si un método solo necesita `total()`, su parámetro debería ser `Pagable`, no `Factura`.

Implementar una interfaz pero no respetar su contrato semántico también es un error. El compilador verifica la firma, pero no puede garantizar que el significado sea correcto.

#### Verificación

La verificación consiste en ejecutar el ejemplo y comprobar que la factura devuelve 121.0 y el recibo 100.0. Una prueba adicional es agregar una nueva clase que implemente `Pagable` y confirmar que `imprimir` funciona sin modificarse.


### Tema 4: Sobrecarga, sobreescritura y modificadores de acceso · Intermedio · 35 min

Los términos sobrecarga y sobreescritura se parecen, pero describen mecanismos distintos. Confundirlos lleva a errores comunes: creer que se está sobreescribiendo un método cuando en realidad se creó otro, o no entender por qué Java elige una implementación en tiempo de compilación y otra en tiempo de ejecución. Los modificadores de acceso completan el cuadro, porque determinan qué métodos pueden verse y, por lo tanto, qué puede sobreescribirse o invocarse.

#### Sobrecarga

La **sobrecarga** ocurre cuando una misma clase define varios métodos con el mismo nombre pero distinta lista de parámetros. El compilador decide cuál invocar según los argumentos presentes en la llamada. Es una resolución en tiempo de compilación. El tipo de retorno por sí solo no basta para sobrecargar un método.

La sobrecarga es útil cuando una operación tiene el mismo significado conceptual, pero acepta distintas formas de entrada. Por ejemplo, `sumar(int, int)` y `sumar(double, double)` representan la misma operación con tipos distintos. Lo que no conviene es usar sobrecarga para métodos que hacen cosas conceptualmente diferentes solo porque el nombre parece cómodo.

#### Sobreescritura

La **sobreescritura** ocurre entre una superclase y una subclase. El método en la subclase tiene la misma firma que el de la superclase. La decisión de qué implementación ejecutar se toma en tiempo de ejecución según el tipo real del objeto. Esto es despacho dinámico.

La sobreescritura requiere visibilidad compatible. Un método privado no se sobreescribe porque no es visible para la subclase; lo que ocurre es una definición independiente. Un método `protected` puede sobreescribirse con `protected` o `public`, pero no con una visibilidad más restrictiva. La anotación `@Override` ayuda a detectar errores de firma.

#### Modificadores de acceso

Los **modificadores de acceso** controlan desde dónde se puede acceder a un miembro. `private` limita el acceso a la propia clase. La ausencia de modificador, conocida como package-private, limita el acceso al mismo paquete. `protected` permite acceso en el mismo paquete y en subclases. `public` permite acceso desde cualquier lugar.

Estos modificadores no son solo sintaxis; son parte del diseño. Exponer demasiado crea acoplamiento y permite usos indebidos. Exponer demasiado poco impide extensiones legítimas. La regla práctica es empezar con la visibilidad más restrictiva posible y ampliarla solo cuando haya una razón clara.

#### Ejemplo desde cero

```bash
mkdir -p /tmp/java-m1-t4 && cd /tmp/java-m1-t4
```

Creamos `Sobrecarga.java`:

```java
class Calculadora {
    int sumar(int a, int b) { return a + b; }
    double sumar(double a, double b) { return a + b; }
    int sumar(int a, int b, int c) { return a + b + c; }
}

class Base {
    protected String tipo() { return "base"; }
}

class Derivada extends Base {
    @Override
    public String tipo() { return "derivada"; }
}

public class Sobrecarga {
    public static void main(String[] args) {
        Calculadora c = new Calculadora();
        System.out.println(c.sumar(1, 2));
        System.out.println(c.sumar(1.5, 2.5));
        System.out.println(c.sumar(1, 2, 3));

        Base b = new Derivada();
        System.out.println(b.tipo());
    }
}
```

#### Recorrido del código

En `Calculadora`, el método `sumar` aparece tres veces con distintas listas de parámetros. Cuando se llama `c.sumar(1, 2)`, el compilador selecciona la versión `int, int`. Cuando se llama con `1.5, 2.5`, selecciona `double, double`. No hay magia en tiempo de ejecución: la decisión quedó resuelta por los tipos de los argumentos.

En la jerarquía `Base`/`Derivada`, el método `tipo()` tiene la misma firma. `Derivada` lo sobreescribe y amplía la visibilidad a `public`, lo cual es permitido. La variable `b` se declara como `Base`, pero el objeto real es `Derivada`. Por eso, `b.tipo()` imprime `derivada`. Aquí la decisión se toma en tiempo de ejecución.

#### Ejecución y salida real

```bash
javac Sobrecarga.java
java Sobrecarga
```

Salida real observada (JDK 27, 2026-05-22):

```text
3
4.0
6
derivada
```

#### Errores frecuentes

Creer que cambiar solo el tipo de retorno sobrecarga un método es un error. La lista de parámetros debe ser diferente.

Escribir un método en la subclase con una firma casi igual y sin `@Override` puede ocultar un intento fallido de sobreescritura. El compilador, con `@Override`, detecta el problema.

Reducir la visibilidad al sobreescribir, por ejemplo de `protected` a `private`, no está permitido. Rompería el contrato esperado por quienes usan la superclase.

#### Verificación

La verificación consiste en ejecutar el programa y confirmar que cada llamada a `sumar` usa la variante esperada y que `b.tipo()` resuelve a la implementación de `Derivada`.


### Tema 5: `record` — modelos inmutables sin boilerplate · Intermedio · 35 min

En muchos programas aparecen clases cuyo propósito principal es transportar datos: un punto con coordenadas, una respuesta DTO, una clave compuesta, un resultado de consulta. Antes de los records, ese tipo de clase requería escribir constructor, getters, `equals`, `hashCode` y `toString`, o depender de herramientas externas. El código era correcto, pero repetitivo y propenso a inconsistencias.

#### Qué es un record

Un **record** es un tipo especial de clase, introducido como característica final en Java 16, diseñado para modelar datos de forma compacta. Al declarar `public record Punto(int x, int y)`, Java genera automáticamente un constructor canónico, métodos de acceso con los nombres de los componentes (`x()`, `y()`), y implementaciones de `equals`, `hashCode` y `toString` basadas en los componentes.

Los componentes de un record son finales en su semántica: el record está pensado para ser inmutable. Esto no significa que cualquier objeto alcanzado desde un componente sea inmutable; si un componente es una lista mutable, el contenido de esa lista puede cambiar. La inmutabilidad superficial del record es una garantía importante, pero no sustituye el diseño cuidadoso de los datos que contiene.

#### Constructores y validación

El constructor canónico es el que recibe todos los componentes. Se puede declarar explícitamente en forma compacta para validar o normalizar datos. En un constructor compacto, no se escriben los parámetros ni las asignaciones a los componentes; Java realiza esas asignaciones al final. Esto permite verificar invariantes sin repetir todo el constructor.

Los records también pueden declarar métodos adicionales, métodos estáticos, constructores alternativos y constantes. Lo que no pueden hacer es extender otra clase, porque ya extienden implícitamente `java.lang.Record`. Sí pueden implementar interfaces.

#### Cuándo usar records y cuándo no

Un record es adecuado cuando el objeto representa principalmente un valor o un dato: su identidad está dada por sus componentes y conviene que sea transparente y predecible. No es adecuado cuando el objeto tiene identidad mutable, ciclo de vida complejo, invariantes que dependen de cambios de estado a lo largo del tiempo o herencia de implementación. En esos casos, una clase normal sigue siendo la herramienta correcta.

#### Ejemplo desde cero

```bash
mkdir -p /tmp/java-m1-t5 && cd /tmp/java-m1-t5
```

Creamos `Punto.java`:

```java
public record Punto(int x, int y) {
    public Punto {
        if (x < 0 || y < 0) {
            throw new IllegalArgumentException("Coordenada inválida");
        }
    }

    public int suma() {
        return x + y;
    }

    public static void main(String[] args) {
        Punto p = new Punto(2, 3);
        System.out.println(p.x());
        System.out.println(p.y());
        System.out.println(p.suma());
        System.out.println(p);
        try {
            new Punto(-1, 0);
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
        }
    }
}
```

#### Recorrido del código

La declaración `public record Punto(int x, int y)` define dos componentes. Java genera los accesores `x()` e `y()`, no `getX()` o `getY()`. También genera `equals` y `hashCode` basados en `x` e `y`, y un `toString` legible.

El constructor compacto `public Punto { ... }` valida que las coordenadas no sean negativas. Si la validación falla, lanza una excepción y el record no se crea en un estado inválido. Si pasa, Java asigna automáticamente los componentes. El método `suma()` es un comportamiento adicional; los records pueden tener lógica, siempre que no contradigan su naturaleza de valor.

En `main`, `System.out.println(p)` usa el `toString` generado, que muestra el nombre del record y sus componentes.

#### Ejecución y salida real

```bash
javac Punto.java
java Punto
```

Salida real observada (JDK 27, 2026-05-22):

```text
2
3
5
Punto[x=2, y=3]
Coordenada inválida
```

#### Errores frecuentes

Intentar tratar un record como una clase mutable y buscar setters es un error de modelo. Si el dato debe cambiar con el tiempo, un record no es la opción adecuada.

Asumir que un record hace inmutable todo lo que contiene es otro error. Si un componente es una colección mutable, conviene copiarla defensivamente o usar una colección inmutable.

Usar records para entidades JPA suele ser problemático, porque JPA espera características que no encajan bien con la inmutabilidad y el diseño de records. Para DTOs de transferencia, en cambio, suelen ser una buena opción.

#### Verificación

La verificación consiste en ejecutar el ejemplo, confirmar que los accesores y el `toString` funcionan, y comprobar que una coordenada inválida provoca la excepción esperada.


### Tema 6: Constructores flexibles (Java 25) · Avanzado · 30 min

Los constructores tienen una responsabilidad delicada: deben dejar el objeto en un estado válido. En versiones clásicas de Java, una subclase debía llamar a `super(...)` o `this(...)` como primera sentencia del constructor. Esa regla impedía validar o normalizar argumentos antes de invocar al constructor de la superclase, lo que obligaba a duplicar validaciones o a usar patrones incómodos. Java 25 introduce constructores flexibles, que permiten ejecutar cierta lógica antes de la llamada a `super(...)`, siempre que el objeto todavía no haya sido inicializado de forma insegura.

#### La regla clásica y su limitación

Antes de Java 25, el constructor de una subclase debía comenzar con `super(...)` o `this(...)`. Si no se escribía explícitamente, el compilador intentaba insertar `super()` sin argumentos. Esto garantizaba un orden de inicialización simple, pero tenía un costo práctico: si querías validar un parámetro antes de pasarlo a la superclase, no podías hacerlo directamente en el constructor.

Por ejemplo, si `CuentaPremium` recibe `puntos` y debe asegurarse de que no sean negativos antes de construir la parte base, la regla clásica obligaba a mover la validación a un método estático auxiliar o a repetir lógica. El código funcionaba, pero la intención quedaba menos clara.

#### Constructores flexibles en Java 25

Con constructores flexibles, Java permite ejecutar sentencias antes de `super(...)` o `this(...)`, dentro de una fase inicial donde todavía no se puede usar el objeto en construcción de forma insegura. La idea no es relajar la seguridad, sino permitir validación y preparación de argumentos en el lugar natural.

Esto es especialmente útil cuando la validación depende de los parámetros que se van a pasar al constructor de la superclase. El código queda más directo: primero se comprueba que los datos son válidos, después se inicializa la superclase.

Conviene usar esta característica con moderación. El constructor sigue siendo un lugar de inicialización, no un sitio para lógica de negocio compleja, acceso a red o efectos secundarios difíciles de seguir. La flexibilidad nueva sirve para expresar mejor invariantes, no para convertir el constructor en un procedimiento largo.

#### Ejemplo desde cero

```bash
mkdir -p /tmp/java-m1-t6 && cd /tmp/java-m1-t6
```

Creamos `FlexMain.java`:

```java
class Cuenta {
    private final String titular;

    Cuenta(String titular) {
        if (titular == null || titular.isBlank()) {
            throw new IllegalArgumentException("Titular obligatorio");
        }
        this.titular = titular;
    }

    String titular() {
        return titular;
    }
}

class CuentaPremium extends Cuenta {
    private final int puntos;

    CuentaPremium(String titular, int puntos) {
        if (puntos < 0) {
            throw new IllegalArgumentException("Puntos inválidos");
        }
        this.puntos = puntos;
        super(titular);
    }

    int puntos() {
        return puntos;
    }
}

public class FlexMain {
    public static void main(String[] args) {
        CuentaPremium c = new CuentaPremium("Ada", 10);
        System.out.println(c.titular());
        System.out.println(c.puntos());
        try {
            new CuentaPremium("", 10);
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
        }
    }
}
```

#### Recorrido del código

`Cuenta` valida el titular en su propio constructor. Esa validación protege la invariante de la superclase. `CuentaPremium` agrega `puntos`, que también debe ser válido. Con constructores flexibles, el constructor de la subclase puede comprobar `puntos < 0` antes de invocar `super(titular)`.

La línea `super(titular)` aparece después de validar `puntos` y asignar el campo propio. La clave es que la lógica previa no usa el objeto de forma insegura; simplemente prepara y valida el estado necesario para construirlo correctamente. Si `puntos` es inválido, el constructor falla antes de delegar en la superclase.

En `main`, se crea una cuenta válida y se imprime su titular y puntos. Después se intenta crear una cuenta con titular vacío; la validación de la superclase lanza `IllegalArgumentException`, que se captura para mostrar el mensaje.

#### Ejecución y salida real

Este ejemplo usa una característica de Java 25. En esta máquina se verificó con JDK 27 compilando con `--release 25`:

```bash
javac --release 25 FlexMain.java
java FlexMain
```

Salida real observada (JDK 27, 2026-05-22):

```text
Ada
10
Titular obligatorio
```

#### Errores frecuentes

Intentar usar esta sintaxis en un compilador o nivel de lenguaje anterior produce errores de compilación. La corrección es usar un JDK compatible y configurar el release adecuado.

Mover demasiada lógica al constructor es otro riesgo. La validación de invariantes es apropiada; cargar datos externos o ejecutar procesos complejos no lo es.

También es un error asumir que la nueva flexibilidad elimina la necesidad de `super(...)`. La superclase sigue teniendo que inicializarse correctamente; lo que cambia es el momento en que se puede colocar parte de la lógica previa.

#### Verificación

La verificación consiste en compilar con `--release 25`, ejecutar el ejemplo y confirmar que la cuenta válida se crea y que la cuenta inválida falla con el mensaje esperado.

## Cierre del módulo

Este módulo introdujo las bases de la programación orientada a objetos en Java. Las clases y objetos permiten modelar conceptos del dominio; los constructores y la encapsulación protegen invariantes; la herencia y la sobreescritura reutilizan y especializan comportamiento; las interfaces y clases abstractas definen contratos y bases comunes; la sobrecarga, la sobreescritura y los modificadores de acceso precisan cómo se resuelven y exponen los miembros; los records simplifican los modelos de datos inmutables; y los constructores flexibles mejoran la forma de validar antes de inicializar la superclase. Con esta base, el siguiente módulo puede entrar en excepciones, colecciones y genéricos con un modelo de diseño más sólido.
