# Módulo 1: Programación orientada a objetos

En el Módulo 0 escribiste programas pequeños con variables, condiciones, bucles, arreglos y métodos. Eso alcanza para empezar, pero cuando el problema crece aparecen preguntas nuevas: ¿dónde vive cada dato?, ¿qué operaciones son válidas sobre él?, ¿cómo evitas que cualquier parte del programa lo modifique sin control? La programación orientada a objetos (POO) responde organizando el código alrededor de objetos con estado y comportamiento.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Modelar una entidad con clase, campos, métodos y objetos |
| 2 | Reutilizar comportamiento con herencia y sobreescritura |
| 3 | Definir contratos con interfaces y clases abstractas |
| 4 | Distinguir sobrecarga, sobreescritura y modificadores de acceso |
| 5 | Usar records para modelos de datos inmutables |
| 6 | Aplicar constructores flexibles de Java moderno con validación temprana |

## Aprende construyendo

### Tema 1: Clases, objetos, constructores y encapsulación · Básico · 40 min

**Caso guía**

Necesitas representar una cuenta bancaria. No basta con una variable `double saldo`: también debes saber de quién es la cuenta, permitir depósitos y retiros, y evitar que el saldo quede en un estado inválido. Este caso obliga a agrupar datos y comportamiento en una misma unidad.

**Fundamento técnico y modelo mental**

**Definición formal.** Una *clase* es un tipo de referencia que define la estructura (campos) y el comportamiento (métodos/constructores) de sus instancias. Un *objeto* es una instancia de una clase, creada en tiempo de ejecución mediante `new`, con identidad, estado y comportamiento. Un *constructor* es una rutina especial de inicialización invocada durante la creación del objeto. La *encapsulación* es el principio de ocultar la representación interna y exponer una interfaz controlada.

**Contrato / invariantes / reglas.** Los campos `private` solo son accesibles dentro del cuerpo de la clase que los declara (según reglas del lenguaje). `final` en un campo implica que debe asignarse exactamente una vez, a más tardar al finalizar la construcción del objeto. Un constructor no tiene tipo de retorno; si no se declara ninguno, el compilador genera un constructor por defecto solo cuando no hay otros constructores. Las excepciones en tiempo de ejecución (`RuntimeException`) señalan violaciones de precondición/estado; `IllegalArgumentException` indica argumento inválido, `IllegalStateException` indica estado inválido para la operación.

**Modelo mental.** La clase es el plano arquitectónico; el objeto es la casa construida. La encapsulación es poner cerraduras a las puertas críticas: no cualquiera entra a mover la estructura, solo operaciones autorizadas.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-1 && cd ~/academia-java/modulo-1
```

Crea `CuentaBancaria.java`:

```java
public class CuentaBancaria {
    private final String numero;
    private String titular;
    private double saldo;

    public CuentaBancaria(String numero, String titular, double saldoInicial) {
        if (numero == null || numero.isBlank()) {
            throw new IllegalArgumentException("El número de cuenta es obligatorio");
        }
        if (titular == null || titular.isBlank()) {
            throw new IllegalArgumentException("El titular es obligatorio");
        }
        if (saldoInicial < 0) {
            throw new IllegalArgumentException("El saldo inicial no puede ser negativo");
        }
        this.numero = numero;
        this.titular = titular;
        this.saldo = saldoInicial;
    }

    public String getNumero() { return numero; }
    public String getTitular() { return titular; }
    public double getSaldo() { return saldo; }

    public void depositar(double monto) {
        if (monto <= 0) {
            throw new IllegalArgumentException("El monto a depositar debe ser mayor a cero");
        }
        saldo += monto;
    }

    public void retirar(double monto) {
        if (monto <= 0) {
            throw new IllegalArgumentException("El monto a retirar debe ser mayor a cero");
        }
        if (monto > saldo) {
            throw new IllegalStateException("Saldo insuficiente");
        }
        saldo -= monto;
    }
}
```

Crea `DemoCuenta.java`:

```java
public class DemoCuenta {
    public static void main(String[] args) {
        CuentaBancaria cuenta = new CuentaBancaria("001-123", "Ada", 1000.0);
        cuenta.depositar(250.0);
        cuenta.retirar(100.0);
        System.out.println(cuenta.getNumero());
        System.out.println(cuenta.getTitular());
        System.out.println(cuenta.getSaldo());
    }
}
```

**Desglose del código**

- `private` impide modificar `saldo` directamente desde fuera. Solo los métodos de la clase lo cambian.
- `final` en `numero` indica que, una vez asignado en el constructor, no cambia.
- `this.numero = numero` distingue el campo del parámetro con el mismo nombre.
- El constructor valida el estado inicial: rechazar un objeto inválido temprano preserva invariantes.
- `depositar` y `retirar` son guardas de comportamiento: aplican reglas antes de modificar el estado.

**Ejecución y salida real**

```bash
javac CuentaBancaria.java DemoCuenta.java
java DemoCuenta
```

```text
001-123
Ada
1150.0
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Cualquier clase pone `cuenta.saldo = -999` | El campo es público | Hazlo `private` y expón operaciones con reglas |
| Objeto creado con datos inválidos | Constructor sin validación | Valida en el constructor y lanza excepción clara |
| `NullPointerException` al llamar `isBlank()` | Parámetro `null` | Comprueba `null` antes de usar el valor |

**Verificación rápida**

```bash
javac CuentaBancaria.java DemoCuenta.java && java DemoCuenta
```

Prueba también un retiro mayor al saldo: debe lanzar `IllegalStateException: Saldo insuficiente`.

### Tema 2: Herencia y sobreescritura · Básico · 40 min

**Caso guía**

Un sistema de notificaciones envía mensajes por distintos canales: email, SMS, push. Todos son notificaciones, pero cada una se envía de forma diferente. Quieres reutilizar lo común y especializar lo que cambia.

**Fundamento técnico y modelo mental**

**Definición formal.** La *herencia* es una relación de subtipado/implementación donde una subclase (`extends`) hereda miembros accesibles de su superclase. La *sobrescritura* (override) es la redefinición en una subclase de un método de instancia heredado con firma compatible. El *polimorfismo de subtipo* permite que una referencia de tipo base invoque la implementación concreta del objeto real en tiempo de ejecución (dynamic dispatch).

**Contrato / invariantes / reglas.** La primera instrucción de un constructor de subclase debe ser `super(...)` o `this(...)`; si se omite, el compilador inserta `super()` implícito. `@Override` solicita verificación en compilación de que el método efectivamente sobrescribe. Un método sobrescrito no puede reducir la visibilidad, no puede declarar excepciones checked más amplias incompatibles y debe respetar el contrato del método base (principio de sustitución de Liskov, a nivel de diseño).

**Modelo mental.** La superclase es el contrato general “notificación”; las subclases son especializaciones que cumplen ese contrato con su propio mecanismo.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-1 && cd ~/academia-java/modulo-1
```

Crea `Notification.java`:

```java
public class Notification {
    private final String destinatario;
    private final String mensaje;

    public Notification(String destinatario, String mensaje) {
        this.destinatario = destinatario;
        this.mensaje = mensaje;
    }

    public String getDestinatario() { return destinatario; }
    public String getMensaje() { return mensaje; }

    public void enviar() {
        System.out.println("Enviando notificación genérica a " + destinatario);
    }
}
```

Crea `EmailNotification.java`:

```java
public class EmailNotification extends Notification {
    private final String asunto;

    public EmailNotification(String destinatario, String mensaje, String asunto) {
        super(destinatario, mensaje);
        this.asunto = asunto;
    }

    @Override
    public void enviar() {
        System.out.println("EMAIL a " + getDestinatario()
                + " | asunto=" + asunto
                + " | mensaje=" + getMensaje());
    }
}
```

Crea `SmsNotification.java`:

```java
public class SmsNotification extends Notification {
    public SmsNotification(String destinatario, String mensaje) {
        super(destinatario, mensaje);
    }

    @Override
    public void enviar() {
        System.out.println("SMS a " + getDestinatario() + " | mensaje=" + getMensaje());
    }
}
```

Crea `DemoNotificaciones.java`:

```java
public class DemoNotificaciones {
    public static void main(String[] args) {
        Notification email = new EmailNotification("ada@example.com", "Tu pedido salió", "Estado");
        Notification sms = new SmsNotification("+34123456789", "Tu pedido salió");
        email.enviar();
        sms.enviar();
    }
}
```

**Desglose del código**

- `extends Notification` indica que `EmailNotification` hereda de `Notification`.
- `super(destinatario, mensaje)` llama al constructor de la superclase. Debe ser la primera instrucción.
- `@Override` hace que el compilador verifique la sobrescritura real.
- Las variables de tipo `Notification` ejecutan `enviar()` según el objeto real: despacho dinámico.

**Ejecución y salida real**

```bash
javac Notification.java EmailNotification.java SmsNotification.java DemoNotificaciones.java
java DemoNotificaciones
```

```text
EMAIL a ada@example.com | asunto=Estado | mensaje=Tu pedido salió
SMS a +34123456789 | mensaje=Tu pedido salió
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `There is no default constructor available in 'Notification'` | La superclase no tiene constructor vacío y no llamaste `super(...)` | Llama al constructor adecuado con `super(...)` |
| Creíste sobrescribir pero se ejecuta el método base | Error de firma o no usaste `@Override` | Agrega `@Override` y verifica nombre/parámetros |
| Jerarquía confusa | Usaste herencia solo para reutilizar código | Prefiere composición si no hay relación “es un” |

**Verificación rápida**

Agrega una clase `PushNotification` con su propio `@Override enviar()`. No debes modificar la lógica del cliente basada en `Notification`.

### Tema 3: Interfaces, clases abstractas y polimorfismo · Intermedio · 45 min

**Caso guía**

Un proceso de cobro puede usar tarjeta, transferencia o billetera. Quieres que el sistema dependa de “algo que puede cobrar”, no de cada implementación concreta. Además, hay comportamientos comunes que no quieres repetir.

**Fundamento técnico y modelo mental**

**Definición formal.** Una *interfaz* es un tipo que declara un contrato de miembros (métodos abstractos, default, static, constantes). Una *clase abstracta* es una clase que no puede instanciarse directamente y puede contener estado, implementación parcial y métodos abstractos. El *polimorfismo* permite programar contra un supertipo (interfaz/clase base) delegando la implementación concreta al objeto real.

**Contrato / invariantes / reglas.** Una clase implementa una interfaz con `implements` y debe proveer implementaciones para sus métodos abstractos (salvo que la clase sea abstracta). Una clase solo puede extender una clase, pero puede implementar múltiples interfaces. Un método `default` en interfaz provee comportamiento heredable; si hay conflicto entre defaults, la clase debe resolverlo. Los miembros de interfaz son `public` por defecto en los casos relevantes del contrato clásico.

**Modelo mental.** La interfaz es el enchufe estándar; la clase abstracta es una base semiarmada; la clase concreta es el aparato listo para funcionar.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-1 && cd ~/academia-java/modulo-1
```

Crea `PaymentMethod.java`:

```java
public interface PaymentMethod {
    void pay(double amount);
}
```

Crea `BasePayment.java`:

```java
public abstract class BasePayment implements PaymentMethod {
    private final String owner;

    protected BasePayment(String owner) {
        this.owner = owner;
    }

    protected String getOwner() { return owner; }

    protected void validateAmount(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a cero");
        }
    }
}
```

Crea `CardPayment.java`:

```java
public class CardPayment extends BasePayment {
    public CardPayment(String owner) { super(owner); }

    @Override
    public void pay(double amount) {
        validateAmount(amount);
        System.out.println("Cobro con tarjeta de " + getOwner() + " por " + amount);
    }
}
```

Crea `WalletPayment.java`:

```java
public class WalletPayment extends BasePayment {
    public WalletPayment(String owner) { super(owner); }

    @Override
    public void pay(double amount) {
        validateAmount(amount);
        System.out.println("Cobro con billetera de " + getOwner() + " por " + amount);
    }
}
```

Crea `Checkout.java`:

```java
public class Checkout {
    public static void main(String[] args) {
        PaymentMethod method = new CardPayment("Ada");
        method.pay(49.99);
        method = new WalletPayment("Linus");
        method.pay(15.00);
    }
}
```

**Desglose del código**

- `PaymentMethod` define el contrato `pay(double amount)`.
- `BasePayment` comparte validación y estado común, pero no implementa el cobro concreto.
- `CardPayment` y `WalletPayment` especializan el comportamiento.
- `Checkout` depende del contrato, no de las clases concretas.

**Ejecución y salida real**

```bash
javac PaymentMethod.java BasePayment.java CardPayment.java WalletPayment.java Checkout.java
java Checkout
```

```text
Cobro con tarjeta de Ada por 49.99
Cobro con billetera de Linus por 15.0
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Intentas instanciar la clase abstracta | Las abstractas no se instancian | Crea una subclase concreta |
| La interfaz crece con métodos no relacionados | El contrato perdió cohesión | Divide en interfaces más pequeñas |
| Usaste clase abstracta donde solo necesitabas contrato | Sobre-diseño | Prefiere interfaz si no hay estado/base común real |

**Verificación rápida**

Crea `BankTransferPayment extends BasePayment` y úsala desde `Checkout`. Si no necesitas modificar la interfaz ni la clase abstracta, el diseño va bien.

### Tema 4: Sobrecarga, sobreescritura y modificadores de acceso · Intermedio · 35 min

**Contexto y para qué sirve**

Java usa varias palabras para controlar visibilidad y varias formas de definir métodos con el mismo nombre. Confundir sobrecarga con sobreescritura, o hacer todo `public`, genera APIs difíciles de usar y errores de diseño.

**Fundamento técnico y modelo mental**

**Definición formal.** La *sobrecarga* (overloading) es la definición de múltiples métodos con el mismo nombre pero distinta lista de parámetros en el mismo ámbito. La *sobrescritura* (overriding) es la redefinición de un método heredado con firma compatible en una subclase. Los *modificadores de acceso* controlan la visibilidad de tipos y miembros.

**Contrato / invariantes / reglas.** La sobrecarga se resuelve en compilación por firma (nombre + parámetros). La sobrescritura se resuelve en ejecución por despacho dinámico. El tipo de retorno no es suficiente para diferenciar sobrecargas. Visibilidades: `private` (clase), package-private (paquete), `protected` (paquete + subclases), `public` (todas). Una sobrescritura no puede ser menos visible que el método sobrescrito.

**Modelo mental.** Sobrecarga es el mismo verbo con distintas entradas (mismo nombre, distinta forma). Sobrescritura es el mismo verbo con el mismo contrato, pero ejecutado por un actor distinto.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-1 && cd ~/academia-java/modulo-1
```

Crea `Calculator.java`:

```java
public class Calculator {
    public int sum(int a, int b) { return a + b; }
    public double sum(double a, double b) { return a + b; }
    public int sum(int a, int b, int c) { return a + b + c; }
}
```

Crea `Animal.java`:

```java
public class Animal {
    protected String name;
    public Animal(String name) { this.name = name; }
    public String speak() { return "..."; }
}
```

Crea `Dog.java`:

```java
public class Dog extends Animal {
    public Dog(String name) { super(name); }
    @Override
    public String speak() { return name + " dice: guau"; }
}
```

Crea `DemoOver.java`:

```java
public class DemoOver {
    public static void main(String[] args) {
        Calculator calc = new Calculator();
        System.out.println(calc.sum(2, 3));
        System.out.println(calc.sum(2.5, 3.5));
        System.out.println(calc.sum(1, 2, 3));

        Animal animal = new Dog("Toby");
        System.out.println(animal.speak());
    }
}
```

**Desglose del código**

- `sum` está sobrecargado tres veces: mismo nombre, distinta lista de parámetros.
- `speak()` en `Dog` sobrescribe el método de `Animal`. La firma es la misma.
- `protected String name` permite acceso a subclases/paquete sin exponerlo públicamente.
- `Animal animal = new Dog(...)` muestra despacho dinámico.

**Ejecución y salida real**

```bash
javac Calculator.java Animal.java Dog.java DemoOver.java
java DemoOver
```

```text
5
6.0
6
Toby dice: guau
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Cambiaste el tipo de retorno y creíste sobrecargar | El tipo de retorno no define sobrecarga por sí solo | Cambia la lista de parámetros |
| `@Override` falla | Firma distinta o método no heredado | Revisa nombre, parámetros y visibilidad |
| Todo es `public` | No pensaste el contrato | Empieza por `private` y abre solo lo necesario |

**Verificación rápida**

```bash
javac Calculator.java Animal.java Dog.java DemoOver.java && java DemoOver
```

Quita `@Override` en `Dog.speak()` y cámbialo por `speak(String extra)`: observarás que ya no sobrescribe, ahora sobrecarga.

### Tema 5: `record` — modelos inmutables sin boilerplate · Intermedio · 35 min

**Caso guía**

Necesitas representar un punto de coordenadas o un DTO simple: dos o tres campos, igualdad por valor, sin comportamiento complejo. Escribir constructor, getters, `equals`, `hashCode` y `toString` a mano es repetitivo y propenso a errores.

**Fundamento técnico y modelo mental**

**Definición formal.** Un `record` (Java 16+) es una clase especial declarada con `record` cuyo estado se define por sus componentes. El compilador genera implícitamente miembros canónicos: campos privados finales, accesores, constructor canónico, `equals`, `hashCode` y `toString` basados en componentes.

**Contrato / invariantes / reglas.** Un record es implícitamente `final` y no puede extender otra clase (pero puede implementar interfaces). Sus componentes son inmutables por diseño de la API generada; si un componente es una referencia mutable, la inmutabilidad superficial no protege el contenido interno. El constructor compacto permite validar/normalizar antes de la asignación implícita de componentes. `equals`/`hashCode` se basan en todos los componentes.

**Modelo mental.** Un record es una ficha de datos sellada: define qué campos tiene y el lenguaje garantiza la mecánica repetitiva de valor.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-1 && cd ~/academia-java/modulo-1
```

Crea `Point.java`:

```java
public record Point(int x, int y) {
    public Point {
        if (x < 0 || y < 0) {
            throw new IllegalArgumentException("Las coordenadas no pueden ser negativas");
        }
    }

    public int distanceSquaredFromOrigin() {
        return x * x + y * y;
    }
}
```

Crea `DemoRecord.java`:

```java
public class DemoRecord {
    public static void main(String[] args) {
        Point a = new Point(3, 4);
        Point b = new Point(3, 4);
        Point c = new Point(1, 2);

        System.out.println(a);
        System.out.println(a.x());
        System.out.println(a.y());
        System.out.println(a.equals(b));
        System.out.println(a.equals(c));
        System.out.println(a.distanceSquaredFromOrigin());
    }
}
```

**Desglose del código**

- `record Point(int x, int y)` declara componentes finales e inmutables.
- El constructor compacto valida antes de asignar los componentes.
- `distanceSquaredFromOrigin()` agrega comportamiento, manteniendo el foco en datos.
- `equals` compara por valor; `a.equals(b)` es `true` aunque sean instancias distintas.

**Ejecución y salida real**

```bash
javac Point.java DemoRecord.java
java DemoRecord
```

```text
Point[x=3, y=4]
3
4
true
false
25
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Quieres cambiar `x` después de crear el record | Los records son inmutables | Crea una nueva instancia con el valor nuevo |
| Intentas extender un record con una clase | Los records no extienden clases | Usa composición o una clase normal |
| Pones demasiada lógica | El record dejó de ser modelo de valor simple | Mueve comportamiento complejo a un servicio/clase |

**Verificación rápida**

```bash
javac Point.java DemoRecord.java && java DemoRecord
```

Crea `Point(-1, 0)` y confirma que la validación del constructor compacto rechaza el valor.

### Tema 6: Constructores flexibles (Java 25) · Avanzado · 30 min

**Contexto y para qué sirve**

En Java clásico, un constructor de subclase debía llamar `super(...)` o `this(...)` como primera instrucción. Eso complicaba validar o normalizar argumentos antes de delegar. Java 25 permite lógica antes de invocar `super(...)`, dentro de reglas claras, para que el estado que pasas al constructor padre ya llegue validado.

> **Nota de versión:** esta característica corresponde a Java 25. Si compilas con un JDK anterior, el ejemplo puede no compilar. Verifica tu versión con `javac -version`.

**Fundamento técnico y modelo mental**

**Definición formal.** Los *constructores flexibles* (Java 25) relajan la restricción histórica de que `super(...)`/`this(...)` sea la primera sentencia, permitiendo un *prologue* limitado antes de la invocación del constructor delegado/superior, seguido de un *epilogue* normal.

**Contrato / invariantes / reglas.** Antes de `super(...)`/`this(...)` el objeto aún no está completamente inicializado: no se debe usar `this` de forma que dependa de la instancia inicializada (acceso a campos de instancia, invocación de métodos de instancia, etc., según reglas del JLS). El prologue debe garantizar que la invocación delegada ocurra exactamente por un camino válido. El objetivo es preparar argumentos y validar precondiciones sin recurrir a fábricas artificiales.

**Modelo mental.** Antes, debías entregar el paquete al padre apenas entrabas por la puerta. Ahora puedes revisar y etiquetar el paquete en el vestíbulo, pero sin usar las habitaciones de la casa porque todavía no te las entregaron.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-1 && cd ~/academia-java/modulo-1
```

Crea `UserBase.java`:

```java
public class UserBase {
    private final String email;
    public UserBase(String email) { this.email = email; }
    public String getEmail() { return email; }
}
```

Crea `AdminUser.java`:

```java
public class AdminUser extends UserBase {
    private final String role;

    public AdminUser(String rawEmail) {
        if (rawEmail == null || rawEmail.isBlank()) {
            throw new IllegalArgumentException("Email obligatorio");
        }
        String normalized = rawEmail.trim().toLowerCase();
        super(normalized);
        this.role = "ADMIN";
    }

    public String getRole() { return role; }
}
```

Crea `DemoAdmin.java`:

```java
public class DemoAdmin {
    public static void main(String[] args) {
        AdminUser admin = new AdminUser("  ADA@EXAMPLE.COM ");
        System.out.println(admin.getEmail());
        System.out.println(admin.getRole());
    }
}
```

**Desglose del código**

- `rawEmail` llega sin normalizar.
- La validación y `trim().toLowerCase()` ocurren antes de `super(normalized)`.
- `super(normalized)` inicializa la parte heredada con un valor ya limpio.
- `this.role = "ADMIN"` se asigna después de delegar al constructor padre.

**Ejecución y salida real**

En JDK 25+:

```bash
javac UserBase.java AdminUser.java DemoAdmin.java
java DemoAdmin
```

```text
ada@example.com
ADMIN
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `call to super must be first statement in constructor` | Estás compilando con un JDK que no soporta esta regla flexible | Usa JDK 25+ o mueve la lógica a un factory method estático |
| Usaste `this` antes de `super(...)` de forma inválida | El objeto aún no está inicializado | Limita el código previo a preparar parámetros |
| Validación duplicada | Validaste en subclase y superclase sin criterio | Define dónde vive cada invariante |

Alternativa compatible con JDK antiguos:

```java
public static AdminUser from(String rawEmail) {
    if (rawEmail == null || rawEmail.isBlank()) {
        throw new IllegalArgumentException("Email obligatorio");
    }
    return new AdminUser(rawEmail.trim().toLowerCase());
}
```

**Verificación rápida**

```bash
javac -version
javac UserBase.java AdminUser.java DemoAdmin.java
java DemoAdmin
```

Si tu JDK no es 25+, usa la alternativa con factory method y confirma que la salida normalizada sea la misma.

## Cierre del módulo

Ya puedes modelar objetos, proteger su estado, reutilizar comportamiento con herencia, definir contratos con interfaces y usar records para datos. En el siguiente módulo el foco se mueve a colecciones y genéricos: cómo organizar muchos objetos sin perder tipo ni claridad.
