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

#### Clases

Una **clase** es un tipo de referencia que define la estructura y el comportamiento que tendrán sus instancias. En ella se declaran campos, constructores y métodos. Sirve para modelar conceptos del dominio con un lugar claro donde viven los datos y las reglas que los gobiernan. Se usa cuando hay datos y comportamiento relacionados que conviene tratar como una unidad, por ejemplo una cuenta, un pedido o un usuario. No conviene usar una clase como contenedor de responsabilidades no relacionadas; cuando una clase acumula demasiadas tareas, se vuelve difícil de entender, probar y modificar.

En el ejemplo, `Cuenta` define qué datos tiene una cuenta y qué operaciones se permiten sobre ella. El error común es crear “clases Dios” que saben hacer todo. La verificación es simple: la clase debe compilar y sus instancias deben poder ejecutar el comportamiento definido.

#### Objetos

Un **objeto** es una instancia concreta de una clase, creada con la expresión `new`. Mientras la clase es la definición, el objeto es una entidad concreta en ejecución, con identidad, estado y comportamiento. Sirve para representar valores concretos del dominio: no “una cuenta en general”, sino la cuenta de Ada con saldo 100.

Se usa cada vez que se necesita una entidad concreta. No debe confundirse la clase con el objeto: la clase `Cuenta` no tiene saldo propio; el objeto creado por `new Cuenta("Ada", 100)` sí. Otro error común es usar campos `static` para datos que deberían pertenecer a cada instancia; eso hace que todos los objetos compartan el mismo estado. La verificación se observa al crear dos objetos distintos y comprobar que sus estados son independientes.

#### Constructores

Un **constructor** es una rutina especial que se ejecuta durante la creación del objeto. Tiene el mismo nombre de la clase y no declara tipo de retorno. Su propósito es inicializar el objeto y dejarlo en un estado válido. Se usa cuando el objeto requiere datos obligatorios o validación inicial.

El constructor establece invariantes: condiciones que deben cumplirse para que el objeto sea válido. Si una cuenta no puede existir sin titular o con saldo inicial negativo, esa regla se verifica en el constructor. Si no se declara ningún constructor, Java genera uno por defecto sin parámetros; cuando se declara un constructor propio, el constructor por defecto deja de generarse. La referencia `this` apunta al objeto actual y se usa para desambiguar campos y parámetros, como en `this.titular = titular`.

No conviene poner en el constructor trabajo excesivo o ajeno a la inicialización, como acceso a red o lógica de negocio compleja. El error común es permitir que el constructor termine con un objeto inválido. La verificación consiste en intentar crear un objeto con datos inválidos y confirmar que falla de forma temprana.

#### Encapsulación

La **encapsulación** consiste en ocultar la representación interna del objeto y exponer solo operaciones controladas. En Java se logra habitualmente declarando campos `private` y ofreciendo métodos públicos que aplican reglas. Sirve para proteger invariantes y reducir el acoplamiento: otros componentes dependen del comportamiento del objeto, no de su estructura interna.

Se usa casi siempre que el estado puede cambiar. No es buena práctica exponer campos mutables como `public` solo por comodidad. Si `saldo` fuera público, cualquier código podría asignar `-999`. Con `saldo` privado, solo `depositar` y `retirar` pueden modificarlo, y esas operaciones validan las reglas. El error común es generar getters y setters ciegos para todo; encapsular no es exponer todo con otro nombre, sino exponer operaciones con sentido. La verificación es intentar modificar el estado por una vía inválida y confirmar que la API no lo permite.

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

La clase `Cuenta` define el tipo. La línea `new Cuenta("Ada", 100)` crea un objeto concreto con estado inicial. El constructor valida las invariantes antes de asignar: rechaza titular inválido y saldo inicial negativo. La palabra `this` distingue el campo del parámetro.

Los campos `titular` y `saldo` son `private`, por lo que el estado no puede modificarse directamente desde fuera. Los métodos `depositar` y `retirar` son la interfaz controlada de modificación. Usan `IllegalArgumentException` cuando el dato recibido es inválido, y `IllegalStateException` cuando la operación no es válida para el estado actual, como retirar más de lo disponible.

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

Si el constructor no valida, el objeto puede nacer inválido. Es preferible fallar temprano en la construcción que propagar un estado corrupto.

Si se usa `IllegalArgumentException` y `IllegalStateException` indistintamente, se pierde precisión diagnóstica. El primero indica un problema en el dato recibido; el segundo, un problema en el estado actual del objeto.

#### Verificación

La verificación mínima es ejecutar el programa y confirmar el saldo final `120.0` y el mensaje `Saldo insuficiente`. Como prueba adicional, se puede intentar `new Cuenta("Ada", -1)` y confirmar que el constructor rechaza el estado inválido.


### Tema 2: Herencia y sobreescritura · Básico · 40 min

Una empresa tiene empleados fijos y empleados por hora. Ambos comparten datos y comportamientos, como el nombre y la capacidad de calcular un salario mensual, pero el cálculo concreto cambia según el tipo. Copiar y pegar la clase y modificar algunos métodos funcionaría al principio, pero duplicaría reglas y haría difícil mantener el sistema.

#### Herencia

La **herencia** permite definir una clase a partir de otra mediante `extends`. La superclase contiene estado y comportamiento común; la subclase hereda los miembros accesibles y puede agregar campos, métodos o especializaciones. Su propósito es reutilizar y modelar una relación “es un”: un `EmpleadoFijo` es un `Empleado`.

Se usa cuando existe esa relación conceptual y hay comportamiento o estado común real. No se usa solo para reutilizar código cuando la relación no es “es un”; en esos casos, la composición suele ser más flexible. El riesgo típico es crear jerarquías rígidas donde un cambio en la base afecta a todas las subclases. La verificación se observa cuando una subclase puede usarse donde se espera la superclase y conserva el comportamiento común.

El constructor de la subclase debe inicializar la parte heredada. Si la superclase no tiene constructor sin argumentos, la subclase debe invocar `super(...)` explícitamente. Omitirlo produce un error de compilación.

#### Sobreescritura

La **sobreescritura** ocurre cuando una subclase define un método con la misma firma que un método visible de la superclase. Su propósito es especializar el comportamiento manteniendo el contrato. Se usa cuando el tipo base define una operación, pero cada subtipo la implementa de forma distinta, como `salarioMensual()`.

La sobreescritura se resuelve en tiempo de ejecución según el tipo real del objeto, no según el tipo de la variable. Esto permite que `Empleado e = new EmpleadoFijo(...)` ejecute la implementación de `EmpleadoFijo`. No debe usarse para cambiar el significado del contrato base sin dejarlo claro; si la superclase promete “salario mensual”, la subclase no debe devolver otro concepto.

La anotación `@Override` es recomendable. No cambia el comportamiento en ejecución, pero hace que el compilador verifique que realmente se está sobreescribiendo un método existente. El error común es escribir una firma ligeramente distinta y crear un método nuevo sin darse cuenta. La verificación es compilar con `@Override` y ejecutar con variables del tipo base para observar el despacho dinámico.

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

`Empleado` es la superclase. Define el estado común `nombre` y el método `descripcion()`, que depende de `salarioMensual()`. Ese diseño deja un punto de extensión: las subclases pueden especializar el cálculo sin reescribir la descripción.

`EmpleadoFijo` y `EmpleadoPorHora` heredan de `Empleado`. Ambas llaman a `super(nombre)` para inicializar la parte base. Cada una agrega sus propios campos y sobreescribe `salarioMensual()`. La anotación `@Override` asegura que la firma coincide con el método base.

En `main`, las variables son de tipo `Empleado`, pero los objetos reales son de tipos concretos distintos. Al invocar `descripcion()`, Java ejecuta el método definido en `Empleado`, pero la llamada interna a `salarioMensual()` se resuelve según el objeto real. Ese despacho dinámico es el efecto observable de la sobreescritura.

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

Usar herencia cuando no hay relación “es un” crea acoplamiento innecesario. Si solo se quiere reutilizar código, conviene evaluar composición.

Olvidar `super(...)` cuando la superclase no tiene constructor vacío impide compilar. La subclase debe inicializar explícitamente la base.

Cambiar accidentalmente la firma de un método que se quería sobreescribir genera un método nuevo. Con `@Override`, el compilador detecta el problema.

#### Verificación

La verificación consiste en ejecutar el ejemplo y confirmar que cada empleado calcula su salario con su propia regla, aunque se invoque desde el tipo `Empleado`.


### Tema 3: Interfaces, clases abstractas y polimorfismo · Intermedio · 45 min

Un sistema de cobros puede recibir facturas, recibos y más adelante notas de crédito. Si el código que cobra conoce cada clase concreta, cada nuevo documento obliga a modificar el cobrador. Además, algunas clases comparten datos y comportamiento, pero no tiene sentido instanciarlas por sí mismas: “documento genérico” no es un objeto de negocio válido. Este tema separa tres conceptos que se apoyan entre sí: interfaz como contrato, clase abstracta como base incompleta y polimorfismo como uso uniforme de implementaciones distintas.

#### Interfaz

**Definición formal.** Una interfaz es un tipo de referencia que declara un contrato de comportamiento. En Java se define con `interface` y una clase la implementa con `implements`. La interfaz indica qué métodos debe ofrecer un tipo; las clases implementadoras proveen el comportamiento concreto, o quedan abstractas si no lo hacen.

**Para qué sirve.** Sirve para desacoplar al código cliente de las implementaciones concretas. El cliente depende de la capacidad declarada —por ejemplo, “puede calcular su total”— y no de la clase específica. Esto permite agregar nuevas implementaciones sin cambiar el código que usa el contrato.

**Cuándo usarla y cuándo no.** Se usa cuando varios tipos, incluso sin relación de herencia, deben poder tratarse de forma uniforme. No es la mejor opción cuando lo que se necesita es compartir estado o implementación común en una jerarquía “es un”; en ese caso puede convenir una clase abstracta, o una combinación de interfaz y clase abstracta.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m1-t3-interfaz && cd /tmp/java-m1-t3-interfaz
```

```java
interface Pagable {
    double total();
}

class FacturaSimple implements Pagable {
    private final double monto;
    FacturaSimple(double monto) { this.monto = monto; }
    @Override public double total() { return monto * 1.21; }
}

public class DemoInterfaz {
    static void cobrar(Pagable p) { System.out.println(p.total()); }
    public static void main(String[] args) {
        cobrar(new FacturaSimple(100));
    }
}
```

El contrato `Pagable` declara `total()`. `FacturaSimple` lo implementa. El método `cobrar` depende del contrato, no de la clase concreta.

**Caso de uso real.** Un servicio de cobranza recibe `Pagable` y registra el total, sin depender de si el origen es factura, recibo o nota de crédito.

**Error común.** Programar contra la clase concreta: `void cobrar(FacturaSimple f)`. El síntoma es que agregar `Recibo` obliga a duplicar o modificar métodos. La corrección es recibir el contrato: `void cobrar(Pagable p)`.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoInterfaz.java
java DemoInterfaz
```

```text
121.0
```

#### Clase abstracta

**Definición formal.** Una clase abstracta es una clase declarada con `abstract` que no puede instanciarse directamente. Puede contener métodos abstractos, sin implementación, y métodos concretos, con implementación. También puede tener campos, constructores y estado.

**Para qué sirve.** Sirve para compartir una base común en una jerarquía “es un” cuando parte del comportamiento es común y parte debe ser definido por las subclases. Evita duplicar estado y lógica común, pero obliga a las subclases concretas a completar los métodos abstractos.

**Cuándo usarla y cuándo no.** Se usa cuando hay relación “es un” y existe estado o implementación común real. No se usa cuando solo se necesita un contrato sin estado común; para eso la interfaz es más flexible. Tampoco conviene si la base crece hasta obligar a las subclases a heredar comportamiento que no necesitan.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m1-t3-abstracta && cd /tmp/java-m1-t3-abstracta
```

```java
abstract class Documento {
    protected final String id;
    Documento(String id) { this.id = id; }
    abstract double total();
    String etiqueta() { return id + ":" + total(); }
}

class Recibo extends Documento {
    private final double monto;
    Recibo(String id, double monto) { super(id); this.monto = monto; }
    @Override double total() { return monto; }
}

public class DemoAbstracta {
    public static void main(String[] args) {
        Documento d = new Recibo("R1", 100);
        System.out.println(d.etiqueta());
        // new Documento("X"); // error de compilación: clase abstracta
    }
}
```

`Documento` comparte `id` y `etiqueta()`, pero deja `total()` a las subclases. No se puede instanciar directamente.

**Caso de uso real.** En facturación, `Documento` puede contener id, fecha y validaciones comunes, mientras `Factura` y `Recibo` definen el cálculo de total.

**Error común.** Convertir la clase abstracta en un contenedor gigante. El síntoma es que subclases heredan campos o métodos irrelevantes. La corrección es mantener en la base solo lo común y estable.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoAbstracta.java
java DemoAbstracta
```

```text
R1:100.0
```

Si se descomenta `new Documento("X")`, `javac` falla: una clase abstracta no es instanciable.

#### Polimorfismo

**Definición formal.** El polimorfismo es la capacidad de tratar objetos de distintos tipos concretos a través de un tipo común y ejecutar, en tiempo de ejecución, la implementación correspondiente al objeto real. En Java, esto ocurre cuando se invoca un método sobreescrito a través de una referencia de superclase o interfaz.

**Para qué sirve.** Reduce el acoplamiento y permite extender el sistema. El código cliente opera sobre el contrato común y no necesita una rama por cada tipo concreto. Agregar una nueva implementación no requiere modificar el cliente, siempre que se respete el contrato.

**Cuándo usarlo y cuándo no.** Se usa en parámetros, colecciones, servicios y pipelines que operan sobre abstracciones. No aporta valor cuando el código termina preguntando por el tipo concreto con `instanceof` en cada paso; eso indica que el comportamiento no quedó en el lugar correcto. Tampoco debe confundirse con herencia: la herencia es un mecanismo; el polimorfismo es el efecto observable.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m1-t3-polimorfismo && cd /tmp/java-m1-t3-polimorfismo
```

```java
interface PagableP { double total(); }
class FacturaP implements PagableP { public double total() { return 121.0; } }
class ReciboP implements PagableP { public double total() { return 100.0; } }

public class DemoPolimorfismo {
    static void imprimir(PagableP p) { System.out.println(p.total()); }
    public static void main(String[] args) {
        PagableP p = new FacturaP();
        imprimir(p);
        imprimir(new ReciboP());
    }
}
```

El método `imprimir` depende de `PagableP`. La implementación ejecutada depende del objeto real.

**Caso de uso real.** Un proceso de cierre diario itera `List<Pagable>` y suma totales sin conocer cada tipo concreto.

**Error común.** Usar `instanceof` para decidir la lógica en el cliente. El síntoma es un bloque creciente de condiciones por tipo. La corrección es mover el comportamiento al método polimórfico del contrato.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoPolimorfismo.java
java DemoPolimorfismo
```

```text
121.0
100.0
```

#### Ejemplo integrado desde cero

Los tres conceptos se combinan en un caso pequeño: `Pagable` es el contrato, `Documento` es la base abstracta con estado común, y `imprimir` usa polimorfismo sobre el tipo común.

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

`Pagable` define el contrato `total()`. `Documento` es abstracta porque aporta `id` y constructor, pero no define el cálculo completo para todo documento; además implementa `Pagable`, obligando a las subclases concretas a implementar `total()`. `Factura` y `Recibo` heredan el estado común y especializan el cálculo. El método `imprimir` recibe `Pagable`, por lo que funciona con cualquier implementación actual o futura.

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

#### Errores frecuentes

Usar una clase abstracta cuando no hay estado ni comportamiento común fuerza herencia innecesaria. Si solo se necesita capacidad, una interfaz es más simple.

Depender de clases concretas en el cliente elimina la extensibilidad del polimorfismo. Si el cliente solo necesita `total()`, el parámetro debe ser `Pagable`.

Respetar la firma pero no el contrato semántico crea bugs silenciosos. El compilador garantiza la forma del método, no el significado.

#### Verificación

La verificación mínima es ejecutar el integrado y confirmar `121.0` y `100.0`. Una prueba adicional es crear `class NotaCredito implements Pagable { public double total() { return 50; } }` y pasarla a `imprimir` sin modificar el método.

### Tema 4: Sobrecarga, sobreescritura y modificadores de acceso · Intermedio · 35 min

Los términos sobrecarga y sobreescritura se parecen, pero describen mecanismos distintos. Confundirlos lleva a errores comunes: creer que se está sobreescribiendo un método cuando en realidad se creó otro, o esperar que Java decida por tipo real lo que en realidad decide por firma en compilación. Los modificadores de acceso completan el cuadro, porque determinan qué miembros pueden verse y, por lo tanto, qué puede invocarse, heredarse o sobreescribirse.

#### Sobrecarga

**Definición formal.** La sobrecarga (overloading) ocurre cuando una misma clase define varios métodos con el mismo nombre pero distinta lista de parámetros. El tipo de retorno no forma parte de la firma para distinguir sobrecargas.

**Para qué sirve.** Permite expresar la misma operación conceptual con distintas formas de entrada, manteniendo una API legible. El llamador usa el mismo nombre cuando la intención es la misma.

**Cuándo usarla y cuándo no.** Se usa cuando el significado conceptual es el mismo, como `sumar(int,int)` y `sumar(double,double)`. No se usa cuando las variantes hacen cosas conceptualmente distintas; en ese caso, nombres distintos evitan ambigüedad. La resolución se hace en compilación, según tipos y cantidad de argumentos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m1-t4-sobrecarga && cd /tmp/java-m1-t4-sobrecarga
```

```java
class Calculadora {
    int sumar(int a, int b) { return a + b; }
    double sumar(double a, double b) { return a + b; }
}

public class DemoSobrecarga {
    public static void main(String[] args) {
        Calculadora c = new Calculadora();
        System.out.println(c.sumar(1, 2));
        System.out.println(c.sumar(1.5, 2.5));
    }
}
```

**Caso de uso real.** Una API de logging puede ofrecer `log(String)` y `log(String, Throwable)`; misma intención, distinta información de entrada.

**Error común.** Cambiar solo el tipo de retorno esperando una sobrecarga válida. El síntoma es error de compilación o diseño confuso. La corrección es cambiar la lista de parámetros.

**Verificación.** Ejecutado en `/tmp/java-m1-t4-pilot` (JDK 27, 2026-05-22):

```bash
javac DemoSobrecarga.java
java DemoSobrecarga
```

```text
3
4.0
```

#### Sobreescritura

**Definición formal.** La sobreescritura (overriding) ocurre cuando una subclase define un método con la misma firma que un método visible y no final de su superclase. La implementación ejecutada se resuelve en tiempo de ejecución según el tipo real del objeto.

**Para qué sirve.** Permite especializar comportamiento manteniendo el contrato del tipo base. El código que usa la superclase o interfaz puede funcionar con distintas implementaciones concretas.

**Cuándo usarla y cuándo no.** Se usa cuando una subclase debe cambiar la implementación de una operación manteniendo su significado. No se usa si se quiere solo agregar una variante por parámetros; eso es sobrecarga. No se puede reducir la visibilidad al sobreescribir, y `@Override` debe usarse para que el compilador verifique la firma.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m1-t4-override && cd /tmp/java-m1-t4-override
```

```java
class Base { String tipo() { return "base"; } }
class Derivada extends Base { @Override String tipo() { return "derivada"; } }

public class DemoSobreescritura {
    public static void main(String[] args) {
        Base b = new Derivada();
        System.out.println(b.tipo());
    }
}
```

**Caso de uso real.** `Documento.total()` puede tener implementaciones distintas en `Factura` y `Recibo`, mientras el servicio de cobro invoca el mismo método sobre el tipo base.

**Error común.** Cambiar la firma sin darse cuenta y creer que se sobreescribió. El síntoma es que se ejecuta el método de la base. La corrección es agregar `@Override`; el compilador avisará si no hay método a sobreescribir.

**Verificación.** Ejecutado en `/tmp/java-m1-t4-pilot` (JDK 27, 2026-05-22):

```bash
javac DemoSobreescritura.java
java DemoSobreescritura
```

```text
derivada
```

#### Modificadores de acceso

**Definición formal.** Los modificadores de acceso controlan la visibilidad de clases, campos, constructores y métodos. Java define `private`, package-private (sin modificador), `protected` y `public`.

**Para qué sirve.** Protegen invariantes, reducen acoplamiento y definen la API pública de un tipo. Permiten exponer solo lo necesario y ocultar detalles internos.

**Cuándo usarlo y cuándo no.** Se usa como parte del diseño de encapsulación: empezar con la visibilidad más restrictiva y ampliar solo con justificación. No conviene hacer todo `public` por comodidad, ni exponer campos mutables. `protected` debe usarse con cuidado porque amplía la superficie visible a subclases y al paquete.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m1-t4-acceso/acceso && cd /tmp/java-m1-t4-acceso
```

`acceso/Caja.java`:

```java
package acceso;
public class Caja {
    private int secreto = 1;
    int interno = 2;        // package-private
    protected int protegido = 3;
    public int abierto = 4;
    public int verSecreto() { return secreto; }
}
```

`acceso/DemoAcceso.java`:

```java
package acceso;
public class DemoAcceso {
    public static void main(String[] args) {
        Caja c = new Caja();
        // c.secreto; // no compila: private
        System.out.println(c.interno);
        System.out.println(c.protegido);
        System.out.println(c.abierto);
        System.out.println(c.verSecreto());
    }
}
```

Desde el mismo paquete se accede a `interno`, `protegido` y `abierto`; `secreto` solo desde dentro de `Caja`.

**Caso de uso real.** Un dominio mantiene `saldo` como `private` y expone `depositar/retirar`, evitando que cualquier código externo deje el objeto inválido.

**Error común.** Usar `protected` creyendo que es accesible solo por subclases. El síntoma es acceso inesperado desde clases del mismo paquete. La corrección es entender que `protected` incluye el paquete y considerar package-private o `private` según el caso.

**Verificación.** Ejecutado en `/tmp/java-m1-t4-pilot` (JDK 27, 2026-05-22):

```bash
javac -d . acceso/Caja.java acceso/DemoAcceso.java
java acceso.DemoAcceso
```

```text
2
3
4
1
```

`secreto` no es accesible directamente; `verSecreto()` muestra su valor mediante un método público controlado.

#### Ejemplo integrado desde cero

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

`Calculadora` muestra sobrecarga: tres firmas distintas, resueltas por el compilador según los argumentos. `Base` y `Derivada` muestran sobreescritura y modificadores de acceso: `tipo()` es `protected` en la base y `public` en la subclase, una ampliación permitida. La variable `b` es de tipo `Base`, pero apunta a `Derivada`; por eso `b.tipo()` se resuelve en ejecución a la implementación de la subclase.

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

Confundir sobrecarga con sobreescritura lleva a esperar el mecanismo equivocado. La sobrecarga se resuelve en compilación por firma; la sobreescritura, en ejecución por tipo real.

Omitir `@Override` permite que un error de firma pase como método nuevo. La corrección es anotar siempre los métodos sobreescritos.

Exponer campos como `public` para evitar escribir métodos rompe encapsulación. La corrección es exponer comportamiento controlado y mantener el estado privado.

#### Verificación

La verificación mínima es ejecutar el integrado y confirmar `3`, `4.0`, `6`, `derivada`. Como prueba adicional, cambiar `tipo()` en `Derivada` a `private` debe producir error de compilación por reducir visibilidad.

### Tema 5: `record` — modelos inmutables sin boilerplate · Intermedio · 35 min

En muchos programas aparecen clases cuyo propósito principal es transportar datos: un punto con coordenadas, una respuesta DTO, una clave compuesta, un resultado de consulta. Antes de los records, ese tipo de clase requería constructor, accesores, `equals`, `hashCode` y `toString`, o dependencias externas. El código era correcto, pero repetitivo y propenso a inconsistencias. Los records reducen ese ruido, pero exigen entender qué garantizan y qué no garantizan.

#### Record

**Definición formal.** Un record es un tipo especial de clase, introducido como característica final en Java 16, diseñado para modelar datos como valores. Declara componentes; el compilador genera constructor canónico, accesores, `equals`, `hashCode` y `toString` basados en esos componentes.

**Para qué sirve.** Reduce boilerplate y hace explícita la intención de “objeto de valor”. Es ideal cuando la identidad del objeto está dada por sus datos.

**Cuándo usarlo y cuándo no.** Se usa para DTOs, valores, respuestas y claves compuestas. No se usa cuando el objeto tiene identidad mutable, ciclo de vida complejo o necesita heredar de otra clase, porque todo record extiende implícitamente `java.lang.Record`. Puede implementar interfaces.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m1-t5-record && cd /tmp/java-m1-t5-record
```

```java
record Punto(int x, int y) {}

public class DemoRecord {
    public static void main(String[] args) {
        Punto p = new Punto(2, 3);
        System.out.println(p.x());
        System.out.println(p);
    }
}
```

**Caso de uso real.** Un endpoint devuelve `record UsuarioDto(String id, String email)`; el contrato de datos es claro y la igualdad por componentes es útil en tests.

**Error común.** Esperar getters estilo JavaBean (`getX()`). El síntoma es error de compilación. La corrección es usar el accesor generado: `x()`.

**Verificación.** Ejecutado en `/tmp/java-m1-t5-pilot` (JDK 27, 2026-05-22):

```bash
javac DemoRecord.java
java DemoRecord
```

```text
2
Punto[x=2, y=3]
```

#### Modelo inmutable y componentes

**Definición formal.** Los componentes de un record son la base de su estado y de los métodos generados. Los campos correspondientes son finales. La inmutabilidad es superficial: el record no puede reasignar sus componentes, pero si un componente referencia un objeto mutable, ese objeto interno puede cambiar.

**Para qué sirve.** Da previsibilidad para objetos de valor: después de construido, el record no cambia sus componentes. Esto simplifica razonamiento, pruebas y uso como clave.

**Cuándo usarlo y cuándo no.** Se usa cuando los componentes son inmutables o se protegen con copia defensiva. No se debe asumir inmutabilidad profunda si hay `List`, `Date` u otros objetos mutables dentro.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m1-t5-inmutable && cd /tmp/java-m1-t5-inmutable
```

```java
import java.util.*;
record Caja(List<String> items) {
    Caja { items = List.copyOf(items); }
}

public class DemoInmutable {
    public static void main(String[] args) {
        List<String> base = new ArrayList<>(List.of("a"));
        Caja c = new Caja(base);
        base.add("b");
        System.out.println(c.items());
    }
}
```

`List.copyOf` evita que cambios externos afecten el estado interno del record.

**Caso de uso real.** Un DTO con lista de permisos debe exponer una copia inmodificable para que consumidores no alteren el estado por accidente.

**Error común.** Guardar una lista mutable tal cual. El síntoma es que el “record inmutable” cambia por fuera. La corrección es copiar defensivamente y exponer colecciones inmutables.

**Verificación.** Ejecutado en `/tmp/java-m1-t5-pilot` (JDK 27, 2026-05-22):

```bash
javac DemoInmutable.java
java DemoInmutable
```

```text
[a]
```

La lista original se modificó, pero el record conservó `[a]`.

#### Constructor compacto y validación

**Definición formal.** El constructor canónico recibe todos los componentes. El constructor compacto es una forma concisa de declarar ese constructor para validar o normalizar datos; no repite la lista de parámetros y Java asigna los componentes al final.

**Para qué sirve.** Protege invariantes del record sin escribir boilerplate. Permite rechazar estados inválidos antes de que el objeto exista.

**Cuándo usarlo y cuándo no.** Se usa para validaciones y normalizaciones simples. No conviene colocar lógica pesada, I/O o efectos secundarios en constructores.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m1-t5-compacto && cd /tmp/java-m1-t5-compacto
```

```java
record PuntoC(int x, int y) {
    public PuntoC {
        if (x < 0 || y < 0) throw new IllegalArgumentException("Coordenada inválida");
    }
}

public class DemoCompacto {
    public static void main(String[] args) {
        try { new PuntoC(-1, 0); }
        catch (IllegalArgumentException e) { System.out.println(e.getMessage()); }
    }
}
```

**Caso de uso real.** Un `record Email(String value)` puede normalizar a minúsculas y rechazar formatos inválidos en su constructor compacto.

**Error común.** Aceptar datos inválidos para “validar después”. El síntoma es objetos de valor inválidos circulando por el sistema. La corrección es validar en la construcción.

**Verificación.** Ejecutado en `/tmp/java-m1-t5-pilot` (JDK 27, 2026-05-22):

```bash
javac DemoCompacto.java
java DemoCompacto
```

```text
Coordenada inválida
```

#### Comportamiento adicional

**Definición formal.** Un record puede declarar métodos de instancia, métodos estáticos, constructores alternativos y constantes. También puede implementar interfaces. No puede extender otra clase ni declarar campos de instancia mutables adicionales.

**Para qué sirve.** Permite agregar comportamiento coherente con el valor, como cálculos derivados o fábricas, sin perder la naturaleza compacta del record.

**Cuándo usarlo y cuándo no.** Se usa para lógica simple relacionada con el valor. No se usa para convertir el record en una entidad con mutación, identidad compleja o dependencias.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m1-t5-comportamiento && cd /tmp/java-m1-t5-comportamiento
```

```java
record PuntoM(int x, int y) {
    public int suma() { return x + y; }
}

public class DemoComportamiento {
    public static void main(String[] args) {
        System.out.println(new PuntoM(2, 3).suma());
    }
}
```

**Caso de uso real.** Un `record Money(BigDecimal amount, String currency)` puede exponer `add` devolviendo otro `Money`, preservando inmutabilidad.

**Error común.** Agregar métodos que simulan setters o mutan estado externo como parte central del diseño. El síntoma es perder la claridad del modelo de valor. La corrección es devolver nuevos valores o usar una clase normal si hay mutación real.

**Verificación.** Ejecutado en `/tmp/java-m1-t5-pilot` (JDK 27, 2026-05-22):

```bash
javac DemoComportamiento.java
java DemoComportamiento
```

```text
5
```

#### Ejemplo integrado desde cero

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

El record declara componentes `x` e `y`, generando accesores, `equals`, `hashCode` y `toString`. El constructor compacto valida el invariante de no negatividad antes de aceptar el estado. El método `suma()` agrega comportamiento derivado sin mutar el valor.

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

Usar record para entidades mutables o con identidad compleja genera fricción. Si el objeto debe cambiar con el tiempo, una clase normal suele ser mejor.

Asumir inmutabilidad profunda cuando hay componentes mutables es peligroso. Se debe copiar defensivamente.

Poner lógica pesada en el constructor compacto oscurece la creación del valor. El constructor debe centrarse en invariantes.

#### Verificación

La verificación mínima es ejecutar el integrado y confirmar accesores, cálculo, `toString` y rechazo de coordenada inválida.

### Tema 6: Constructores flexibles (Java 25) · Avanzado · 30 min

Los constructores deben dejar el objeto en un estado válido. En versiones clásicas de Java, una subclase debía llamar a `super(...)` o `this(...)` como primera sentencia del constructor. Esa regla protegía el orden de inicialización, pero dificultaba validar o normalizar argumentos antes de delegar. Java 25 introduce constructores flexibles para permitir esa lógica temprana con reglas de seguridad.

#### Regla clásica de `super(...)` / `this(...)`

**Definición formal.** Antes de los constructores flexibles, la primera sentencia de un constructor debía ser una invocación explícita o implícita a `super(...)` o `this(...)`. El compilador inserta `super()` si la superclase tiene constructor sin argumentos.

**Para qué sirve.** Garantiza un orden de inicialización predecible: la parte heredada se inicializa antes de que la subclase use el estado del objeto.

**Cuándo usarla y cuándo no.** Es el modelo mental base que sigue vigente. No es conveniente cuando necesitas validar/normalizar parámetros antes de pasarlos a `super(...)`; en Java clásico requería métodos estáticos auxiliares o duplicación.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m1-t6-clasica && cd /tmp/java-m1-t6-clasica
```

```java
class Base {
    final String nombre;
    Base(String nombre) { this.nombre = nombre; }
}

class Sub extends Base {
    final int puntos;
    Sub(String nombre, int puntos) {
        super(validar(nombre)); // en Java clásico se usa auxiliar estático
        this.puntos = puntos;
    }
    static String validar(String n) { return n.trim(); }
}

public class DemoClasica {
    public static void main(String[] args) {
        System.out.println(new Sub(" Ada ", 10).nombre);
    }
}
```

**Caso de uso real.** Jerarquías donde la superclase exige parámetros ya normalizados; antes de Java 25 la normalización se movía a métodos estáticos.

**Error común.** Olvidar que la superclase sin constructor vacío exige `super(...)` explícito. El síntoma es error de compilación. La corrección es invocar el constructor base adecuado.

**Verificación.** Ejecutado en `/tmp/java-m1-t6-pilot` con `javac --release 25` (JDK 27, 2026-05-22):

```bash
javac --release 25 DemoClasica.java
java DemoClasica
```

```text
Ada
```

#### Constructores flexibles

**Definición formal.** En Java 25, un constructor puede ejecutar sentencias antes de `super(...)` o `this(...)` en una fase inicial controlada, siempre que respete las reglas de inicialización segura: no usar el objeto en construcción de forma indebida antes de delegar.

**Para qué sirve.** Permite validar, normalizar o calcular argumentos en el lugar natural antes de construir la parte base.

**Cuándo usarlo y cuándo no.** Se usa cuando la validación afecta directamente los argumentos de `super(...)`. No se usa para lógica pesada, I/O, acceso a red o efectos secundarios. El constructor sigue siendo inicialización.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m1-t6-flexible && cd /tmp/java-m1-t6-flexible
```

```java
class BaseF {
    final String nombre;
    BaseF(String nombre) { this.nombre = nombre; }
}

class SubF extends BaseF {
    final int puntos;
    SubF(String nombre, int puntos) {
        if (puntos < 0) throw new IllegalArgumentException("Puntos inválidos");
        super(nombre.trim());
        this.puntos = puntos;
    }
}

public class DemoFlexible {
    public static void main(String[] args) {
        System.out.println(new SubF(" Ada ", 10).nombre);
        try { new SubF("Ada", -1); }
        catch (IllegalArgumentException e) { System.out.println(e.getMessage()); }
    }
}
```

**Caso de uso real.** Una subclase `CuentaPremium` valida puntos o límites antes de delegar al constructor de `Cuenta`, manteniendo la regla cerca del dato.

**Error común.** Tratar la flexibilidad como permiso para hacer cualquier cosa antes de `super(...)`. El síntoma es constructores difíciles de razonar o errores por inicialización insegura. La corrección es limitar la fase previa a validación/preparación de argumentos.

**Verificación.** Ejecutado en `/tmp/java-m1-t6-pilot` (JDK 27, 2026-05-22):

```bash
javac --release 25 DemoFlexible.java
java DemoFlexible
```

```text
Ada
Puntos inválidos
```

#### Validación temprana e invariantes

**Definición formal.** La validación temprana es la comprobación de precondiciones e invariantes antes de completar la construcción del objeto. En constructores flexibles, puede ocurrir antes de `super(...)` cuando se trata de preparar argumentos válidos.

**Para qué sirve.** Falla rápido y evita objetos inválidos o parcialmente válidos. Hace visible la regla de negocio en el punto de construcción.

**Cuándo usarla y cuándo no.** Se usa para rangos, nulls, formatos y precondiciones locales del objeto. No reemplaza validaciones de negocio de capa de servicio o de persistencia; el constructor debe proteger invariantes del objeto.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m1-t6-validacion && cd /tmp/java-m1-t6-validacion
```

```java
class BaseV { final String nombre; BaseV(String nombre) { this.nombre = nombre; } }
class SubV extends BaseV {
    SubV(String nombre, int puntos) {
        if (puntos < 0) throw new IllegalArgumentException("Puntos inválidos");
        super(nombre.trim());
    }
}
public class DemoValidacion {
    public static void main(String[] args) {
        try { new SubV("Ada", -1); }
        catch (IllegalArgumentException e) { System.out.println(e.getMessage()); }
    }
}
```

**Caso de uso real.** Antes de crear una entidad de dominio, se rechaza un valor fuera de rango, evitando propagar datos inválidos a capas superiores.

**Error común.** Duplicar validaciones inconsistentes entre subclase y superclase. El síntoma es comportamiento distinto según el constructor usado. La corrección es definir claramente qué invariante protege cada nivel.

**Verificación.** La salida `Puntos inválidos` del ejemplo flexible confirma el rechazo temprano. El caso válido devuelve `Ada`, confirmando la normalización antes de delegar.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m1-t6 && cd /tmp/java-m1-t6
```

Creamos `ConstructoresFlexibles.java`:

```java
class Cuenta {
    protected final String titular;

    Cuenta(String titular) {
        if (titular == null || titular.isBlank()) {
            throw new IllegalArgumentException("Titular inválido");
        }
        this.titular = titular;
    }
}

class CuentaPremium extends Cuenta {
    private final int puntos;

    CuentaPremium(String titular, int puntos) {
        if (puntos < 0) {
            throw new IllegalArgumentException("Puntos inválidos");
        }
        super(titular.trim());
        this.puntos = puntos;
    }

    String resumen() {
        return titular + ":" + puntos;
    }
}

public class ConstructoresFlexibles {
    public static void main(String[] args) {
        System.out.println(new CuentaPremium(" Ada ", 10).resumen());
        try {
            new CuentaPremium("Ada", -1);
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
        }
    }
}
```

#### Recorrido del código

`Cuenta` protege el invariante de titular válido. `CuentaPremium` valida `puntos` antes de `super(...)`, algo natural con constructores flexibles. Luego normaliza `titular` con `trim()` al delegar. El objeto solo queda construido si ambas validaciones pasan.

#### Ejecución y salida real

```bash
javac --release 25 ConstructoresFlexibles.java
java ConstructoresFlexibles
```

Salida real observada (JDK 27, 2026-05-22):

```text
Ada:10
Puntos inválidos
```

#### Errores frecuentes

Poner lógica pesada antes de `super(...)` vuelve opaco el constructor. La fase previa debe ser breve y defensiva.

Asumir que Java 25 elimina la necesidad de `super(...)` es incorrecto; la delegación sigue siendo necesaria, solo cambia cuándo puede ocurrir.

Dejar la validación solo en la subclase puede olvidar invariantes de la superclase. Cada nivel debe proteger sus propias reglas.

#### Verificación

La verificación mínima es compilar con `--release 25`, ejecutar y confirmar `Ada:10` y `Puntos inválidos`. Como prueba adicional, pasar titular en blanco debe fallar por la validación de `Cuenta`.
