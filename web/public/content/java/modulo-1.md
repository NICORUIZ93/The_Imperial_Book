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

**Ejemplo mínimo enfocado.**

```java
interface Pagable {
    double total();
}

class FacturaSimple implements Pagable {
    private final double monto;
    FacturaSimple(double monto) { this.monto = monto; }
    @Override public double total() { return monto * 1.21; }
}
```

El contrato `Pagable` declara `total()`. `FacturaSimple` se compromete a implementarlo. Quien recibe un `Pagable` no necesita saber que es una factura.

**Caso de uso real.** Un servicio de cobranza recibe `Pagable` y registra el total, sin depender de si el origen es factura, recibo o nota de crédito. Un nuevo tipo pagable se integra implementando la interfaz.

**Error común.** Programar contra la clase concreta: `void cobrar(FacturaSimple f)`. El síntoma es que agregar `Recibo` obliga a duplicar o modificar métodos. La corrección es recibir el contrato: `void cobrar(Pagable p)`.

**Verificación.** El ejemplo mínimo se compiló y ejecutó en `/tmp/java-m1-t3-pilot` (JDK 27, 2026-05-22):

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

**Ejemplo mínimo enfocado.**

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
```

`Documento` comparte `id` y `etiqueta()`, pero deja `total()` como responsabilidad de la subclase. `new Documento(...)` no compila porque la clase es abstracta.

**Caso de uso real.** En facturación, `Documento` puede contener id, fecha y validaciones comunes, mientras `Factura` y `Recibo` definen el cálculo de total. La base evita duplicación sin permitir instanciar un documento incompleto.

**Error común.** Convertir la clase abstracta en un contenedor gigante. El síntoma es que subclases heredan campos o métodos irrelevantes. La corrección es mantener en la base solo lo común y estable; si solo se necesita capacidad, preferir interfaz.

**Verificación.** El ejemplo mínimo se compiló y ejecutó en `/tmp/java-m1-t3-pilot` (JDK 27, 2026-05-22):

```bash
javac DemoAbstracta.java
java DemoAbstracta
```

```text
R1:100.0
```

La línea `new Documento("X")` genera error de compilación si se descomenta, lo que confirma que la clase abstracta no es instanciable.

#### Polimorfismo

**Definición formal.** El polimorfismo es la capacidad de tratar objetos de distintos tipos concretos a través de un tipo común y ejecutar, en tiempo de ejecución, la implementación correspondiente al objeto real. En Java, esto ocurre cuando se invoca un método sobreescrito a través de una referencia de superclase o interfaz.

**Para qué sirve.** Reduce el acoplamiento y permite extender el sistema. El código cliente opera sobre el contrato común y no necesita una rama por cada tipo concreto. Agregar una nueva implementación no requiere modificar el cliente, siempre que se respete el contrato.

**Cuándo usarlo y cuándo no.** Se usa en parámetros, colecciones, servicios y pipelines que operan sobre abstracciones. No aporta valor cuando el código termina preguntando por el tipo concreto con `instanceof` en cada paso; eso indica que el comportamiento no quedó en el lugar correcto. Tampoco debe confundirse con herencia: la herencia es un mecanismo; el polimorfismo es el efecto observable.

**Ejemplo mínimo enfocado.**

```java
interface PagableP { double total(); }
class FacturaP implements PagableP { public double total() { return 121.0; } }
class ReciboP implements PagableP { public double total() { return 100.0; } }

static void imprimir(PagableP p) { System.out.println(p.total()); }
```

El método `imprimir` no conoce `FacturaP` ni `ReciboP`. Ejecuta `total()` del objeto real recibido.

**Caso de uso real.** Un proceso de cierre diario itera `List<Pagable>` y suma totales. Puede mezclar facturas, recibos y nuevos tipos sin cambiar el algoritmo de cierre.

**Error común.** Usar `instanceof` para decidir la lógica en el cliente. El síntoma es un bloque creciente de condiciones por tipo. La corrección es mover el comportamiento al método polimórfico del contrato.

**Verificación.** El ejemplo mínimo se compiló y ejecutó en `/tmp/java-m1-t3-pilot` (JDK 27, 2026-05-22):

```bash
javac DemoPolimorfismo.java
java DemoPolimorfismo
```

```text
121.0
100.0
```

La misma llamada `imprimir(p)` produce resultados distintos según el objeto real.

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

Los términos sobrecarga y sobreescritura se parecen, pero describen mecanismos distintos. Confundirlos lleva a errores comunes: creer que se está sobreescribiendo un método cuando en realidad se creó otro, o no entender por qué Java elige una implementación en tiempo de compilación y otra en tiempo de ejecución. Los modificadores de acceso completan el cuadro, porque determinan qué miembros pueden verse y, por lo tanto, qué se puede invocar, heredar o sobreescribir.

#### Sobrecarga

La **sobrecarga** (overloading) ocurre cuando una misma clase define varios métodos con el mismo nombre pero distinta lista de parámetros. Su propósito es ofrecer la misma operación conceptual con distintas formas de entrada. Se usa cuando el significado es el mismo, como `sumar(int,int)` y `sumar(double,double)`. No debe usarse para nombrar operaciones conceptualmente distintas solo por comodidad.

La resolución de sobrecarga ocurre en tiempo de compilación: el compilador elige el método según los tipos y cantidad de argumentos. El tipo de retorno por sí solo no basta para sobrecargar. El error común es esperar despacho dinámico; la sobrecarga no depende del tipo real del objeto en ejecución. La verificación es compilar y observar qué variante acepta cada llamada.

#### Sobreescritura

La **sobreescritura** (overriding) ocurre cuando una subclase define un método con la misma firma que un método visible de la superclase. Su propósito es especializar comportamiento respetando el contrato del tipo base. Se usa en jerarquías donde el mismo mensaje debe producir comportamiento específico según el objeto real.

La resolución ocurre en tiempo de ejecución (despacho dinámico). La anotación `@Override` obliga al compilador a verificar la firma. No se puede reducir la visibilidad al sobreescribir; un método `protected` puede ser `protected` o `public` en la subclase, pero no `private`. Un método `private` no se sobreescribe porque no es visible para la subclase. El error común es cambiar la firma y creer que se sobreescribió. La verificación es invocar el método a través de una referencia del tipo base.

#### Modificadores de acceso

Los **modificadores de acceso** controlan la visibilidad de clases, campos, constructores y métodos. `private` limita el acceso a la propia clase; package-private (sin modificador) al mismo paquete; `protected` al mismo paquete y a subclases; `public` a cualquier lugar. Su propósito es proteger invariantes, reducir acoplamiento y definir la superficie pública de un tipo.

Se usan para aplicar encapsulación y diseñar APIs claras. No conviene exponer todo como `public` por comodidad, ni hacer todo `private` cuando hay extensiones legítimas. La regla práctica es comenzar con la visibilidad más restrictiva y ampliarla con justificación. El error común es confundir `protected` con “casi privado” o con “público para subclases en cualquier contexto sin condiciones”. La verificación es intentar acceder al miembro desde otra clase/paquete y observar el error de compilación o el acceso permitido.

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

#### Record

Un **record** es un tipo especial de clase, introducido como característica final en Java 16, diseñado para modelar datos como valores. Al declarar `public record Punto(int x, int y)`, Java genera un constructor canónico, accesores `x()` e `y()`, y implementaciones de `equals`, `hashCode` y `toString` basadas en los componentes. Su propósito es reducir boilerplate y hacer explícita la intención de “objeto de datos”.

Se usa para DTOs, valores, respuestas, claves compuestas y resultados inmutables. No se usa cuando el objeto tiene identidad mutable, ciclo de vida complejo o necesita heredar de otra clase, porque todo record extiende implícitamente `java.lang.Record`. El error común es usarlo como entidad JPA mutable. La verificación es observar los accesores generados, el `toString` y la igualdad basada en componentes.

#### Modelo inmutable y componentes

Los **componentes** de un record son la base de su estado y de los métodos generados. La inmutabilidad que ofrece es superficial: los campos de componente son finales, pero si un componente referencia un objeto mutable, su contenido interno puede cambiar. Por eso, al usar listas o colecciones mutables, conviene copiar defensivamente o exponer versiones inmutables.

Se usa cuando la identidad del valor está dada por sus datos. No debe asumirse inmutabilidad profunda automática. El error común es pasar un `List` mutable y creer que el record quedó totalmente protegido. La verificación es comparar dos records iguales con `equals` y comprobar que cambios en una estructura mutable interna pueden romper la expectativa si no se protegió.

#### Constructor compacto y validación

El **constructor canónico** recibe todos los componentes. El **constructor compacto** permite validar o normalizar datos sin repetir la lista de parámetros ni las asignaciones finales; Java asigna los componentes al final del constructor compacto. Sirve para proteger invariantes de forma concisa.

Se usa cuando el record debe rechazar estados inválidos. No conviene colocar lógica pesada o efectos secundarios. El error común es olvidar que la validación debe lanzar excepción antes de aceptar el estado. La verificación es crear un record inválido y confirmar la excepción.

#### Comportamiento adicional

Un record puede declarar **métodos de instancia, métodos estáticos, constructores alternativos y constantes**, y puede implementar interfaces. No puede extender otra clase. Se usa para agregar comportamiento coherente con el valor, como `suma()` en un `Punto`. El error común es llenarlo de lógica ajena a su naturaleza de valor. La verificación es invocar el método adicional y confirmar que no altera el estado.

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

Los constructores tienen una responsabilidad delicada: deben dejar el objeto en un estado válido. En versiones clásicas de Java, una subclase debía llamar a `super(...)` o `this(...)` como primera sentencia del constructor. Esa regla impedía validar o normalizar argumentos antes de invocar al constructor de la superclase. Java 25 introduce constructores flexibles, que permiten ejecutar cierta lógica antes de la llamada a `super(...)`, siempre que el objeto todavía no haya sido inicializado de forma insegura.

#### Regla clásica de `super(...)`/`this(...)`

La **regla clásica** exigía que la primera sentencia del constructor fuera `super(...)` o `this(...)`. Su propósito era garantizar un orden de inicialización seguro: primero se inicializa la parte base o se delega en otro constructor. Se usa en todas las versiones anteriores al soporte flexible; entenderla sigue siendo necesario porque explica el modelo de inicialización.

No era conveniente para validaciones previas a `super(...)`, porque obligaba a usar métodos estáticos auxiliares o duplicar lógica. El error común es olvidar que la superclase debe inicializarse y esperar que la subclase pueda saltarse esa responsabilidad. La verificación en Java moderno es comparar un constructor clásico con uno flexible y observar que ambos inicializan correctamente.

#### Constructores flexibles

Los **constructores flexibles** permiten ejecutar sentencias antes de `super(...)` o `this(...)` en una fase inicial controlada. Su propósito es permitir validar o preparar argumentos en el lugar natural antes de inicializar la superclase. Se usan cuando la validación afecta directamente a los argumentos que se pasarán a `super(...)`.

No deben usarse para meter lógica pesada, I/O o efectos secundarios en el constructor. La restricción principal es la seguridad de inicialización: no se debe usar el objeto en construcción de forma indebida antes de que la inicialización esté permitida. El error común es tratar esta característica como permiso para “hacer cualquier cosa” antes de `super(...)`. La verificación es compilar con JDK compatible y confirmar que la validación ocurre antes de delegar.

#### Validación temprana e invariantes

La **validación temprana** en constructor protege invariantes antes de completar la inicialización. Sirve para fallar rápido y evitar estados parcialmente construidos o inválidos. Se usa para argumentos obligatorios, rangos, formatos y precondiciones locales. No sustituye validaciones de negocio más amplias en servicios o dominios; el constructor debe centrarse en invariantes del objeto.

El error común es duplicar validaciones inconsistentes entre superclase y subclase. La verificación es probar casos válidos e inválidos y confirmar el mensaje/estado esperado. El ejemplo de abajo muestra que se valida `puntos` antes de `super(...)` y que la superclase sigue validando `titular`.

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
