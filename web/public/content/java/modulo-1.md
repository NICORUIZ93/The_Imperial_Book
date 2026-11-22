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

Necesitas representar una cuenta bancaria. No basta con `double saldo`: debes saber de quién es, permitir depósitos/retiros y evitar estados inválidos. Necesitas agrupar datos y comportamiento, controlar la creación y proteger el estado interno.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error/riesgo común |
|---|---|---|---|---|
| **Clases** | Tipo de referencia que define campos, constructores y métodos que describen a sus instancias. | Modelar entidades/conceptos del dominio. | Cuando hay datos + comportamiento relacionados. | Clases “Dios” con demasiadas responsabilidades. |
| **Objetos** | Instancia de una clase creada con `new`, con identidad, estado y comportamiento. | Representar valores concretos en ejecución. | Cada vez que necesitas una entidad concreta. | Confundir objeto con clase; compartir estado mutable sin control. |
| **Constructores** | Rutina especial de inicialización invocada durante la creación (`new`). Mismo nombre que la clase, sin tipo de retorno. | Establecer estado inicial válido e invariantes. | Al crear objetos que requieren datos obligatorios/validación. | Constructor que deja objeto inválido o hace trabajo excesivo. |
| **Encapsulación** | Ocultar representación interna (`private`) y exponer operaciones controladas. | Proteger invariantes y reducir acoplamiento. | Casi siempre para estado mutable. | Campos `public` que permiten estados inválidos. |

**Contrato / invariantes / reglas.** `private` limita acceso al cuerpo de la clase. `final` en campo obliga asignación definitiva durante construcción. Si no declaras constructor y no hay otros, Java genera constructor por defecto; si declaras uno, no se genera. `this` referencia la instancia actual; `this.campo` desambigua campo vs parámetro. Excepciones: `IllegalArgumentException` para argumento inválido; `IllegalStateException` para estado inválido.

**Modelo mental.** Clase = plano; objeto = casa construida; constructor = proceso de entrega con inspección inicial; encapsulación = cerraduras y puertas autorizadas.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-1 && cd ~/academia-java/modulo-1
```

Crea `CuentaBancaria.java`:

```java
public class CuentaBancaria { // clase
    private final String numero;   // encapsulación: estado oculto
    private String titular;
    private double saldo;

    public CuentaBancaria(String numero, String titular, double saldoInicial) { // constructor
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
        if (monto <= 0) throw new IllegalArgumentException("Monto inválido");
        saldo += monto;
    }

    public void retirar(double monto) {
        if (monto <= 0) throw new IllegalArgumentException("Monto inválido");
        if (monto > saldo) throw new IllegalStateException("Saldo insuficiente");
        saldo -= monto;
    }
}
```

Crea `DemoCuenta.java`:

```java
public class DemoCuenta {
    public static void main(String[] args) {
        CuentaBancaria cuenta = new CuentaBancaria("001-123", "Ada", 1000.0); // objeto
        cuenta.depositar(250.0);
        cuenta.retirar(100.0);
        System.out.println(cuenta.getNumero());
        System.out.println(cuenta.getTitular());
        System.out.println(cuenta.getSaldo());
    }
}
```

**Desglose del código**

- **Clase**: `CuentaBancaria` define estructura y comportamiento.
- **Objeto**: `new CuentaBancaria(...)` crea una instancia concreta.
- **Constructor**: valida invariantes antes de dejar el objeto utilizable.
- **Encapsulación**: `saldo` es `private`; solo `depositar/retirar` lo modifican con reglas.

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
| `cuenta.saldo = -999` compila | Campo público | Hazlo `private` y expón operaciones |
| Objeto inválido creado | Constructor sin validación | Valida y falla temprano |
| `NullPointerException` en `isBlank()` | No validaste `null` | Comprueba `null` antes de usar |
| Confusión clase/objeto | Modelo mental borroso | Clase = plano; objeto = instancia `new` |

**Verificación rápida**

```bash
javac CuentaBancaria.java DemoCuenta.java && java DemoCuenta
```

Prueba retirar más del saldo: debe lanzar `IllegalStateException`.


### Tema 2: Herencia y sobreescritura · Básico · 40 min

**Caso guía**

Un sistema de notificaciones envía por email, SMS y push. Todas comparten destinatario/mensaje, pero cada canal se envía distinto. Quieres reutilizar lo común y especializar lo que cambia sin duplicar código.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error/riesgo común |
|---|---|---|---|---|
| **Herencia (`extends`)** | Relación donde una subclase hereda miembros accesibles de una superclase y puede especializarla. | Reutilizar estado/comportamiento común en una jerarquía “es-un”. | Cuando hay relación clara y estable de subtipo. | Usarla solo por reutilizar código; jerarquías rígidas. |
| **Sobrescritura (`@Override`)** | Redefinición en subclase de un método de instancia heredado con firma compatible. | Cambiar comportamiento manteniendo el contrato. | Cuando la subclase necesita una implementación específica. | Cambiar firma accidentalmente y no sobrescribir. |
| **Polimorfismo de subtipo** | Una referencia de tipo base puede apuntar a un objeto de subclase; la llamada se resuelve en runtime (dynamic dispatch). | Escribir código contra abstracciones/base. | Colecciones/servicios que manejan múltiples variantes. | Asumir que se ejecuta el método del tipo de referencia. |
| **`super`** | Referencia al constructor/miembros de la superclase. | Inicializar parte base y reutilizar comportamiento base. | Constructores y overrides que extienden lógica base. | Olvidar `super(...)` cuando la base no tiene constructor vacío. |

**Contrato / invariantes / reglas.** La primera instrucción del constructor de subclase debe ser `super(...)` o `this(...)`; si se omite y la base tiene constructor sin args, el compilador inserta `super()`. `@Override` hace que el compilador verifique la sobrescritura. No se puede reducir visibilidad ni ampliar checked exceptions incompatibles. Diseño: la subclase debe respetar el contrato de la base (Liskov).

**Modelo mental.** Superclase = contrato general; subclase = especialización. `super` es “primero arma la parte base de la casa”. Polimorfismo: llamas al timbre “enviar” y cada notificación responde con su mecanismo.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-1 && cd ~/academia-java/modulo-1
```

Crea `Notification.java`:

```java
public class Notification {
    protected final String destinatario;
    protected final String mensaje;

    public Notification(String destinatario, String mensaje) {
        this.destinatario = destinatario;
        this.mensaje = mensaje;
    }

    public void enviar() {
        System.out.println("Notificación genérica a " + destinatario);
    }
}
```

Crea `EmailNotification.java`:

```java
public class EmailNotification extends Notification {
    private final String asunto;

    public EmailNotification(String destinatario, String mensaje, String asunto) {
        super(destinatario, mensaje); // inicializa parte base
        this.asunto = asunto;
    }

    @Override
    public void enviar() { // sobrescritura
        System.out.println("EMAIL a " + destinatario + " | asunto=" + asunto + " | " + mensaje);
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
        System.out.println("SMS a " + destinatario + " | " + mensaje);
    }
}
```

Crea `DemoNotificaciones.java`:

```java
public class DemoNotificaciones {
    public static void main(String[] args) {
        Notification n1 = new EmailNotification("ada@example.com", "Pedido enviado", "Estado"); // polimorfismo
        Notification n2 = new SmsNotification("+34123456789", "Pedido enviado");
        n1.enviar();
        n2.enviar();
    }
}
```

**Desglose del código**

- **Herencia**: `EmailNotification extends Notification`.
- **`super`**: llama constructor base antes de usar la parte propia.
- **Sobrescritura**: `@Override enviar()` cambia comportamiento manteniendo firma.
- **Polimorfismo**: `Notification n1` apunta a `EmailNotification`; en runtime se ejecuta el `enviar()` del objeto real.

**Ejecución y salida real**

```bash
javac Notification.java EmailNotification.java SmsNotification.java DemoNotificaciones.java
java DemoNotificaciones
```

```text
EMAIL a ada@example.com | asunto=Estado | Pedido enviado
SMS a +34123456789 | Pedido enviado
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Error de constructor en subclase | Falta `super(...)` y la base no tiene constructor vacío | Llama `super(...)` explícitamente |
| Se ejecuta método base | Firma distinta, no hay override real | Agrega `@Override` y corrige firma |
| Jerarquía frágil | Herencia por conveniencia | Usa composición si no es “es-un” |
| Subclase rompe expectativas | Violó contrato de base | Respeta pre/postcondiciones (Liskov) |

**Verificación rápida**

```bash
javac *.java && java DemoNotificaciones
```

Agrega `PushNotification`: no debes cambiar `DemoNotificaciones` salvo instanciarla.


### Tema 3: Interfaces, clases abstractas y polimorfismo · Intermedio · 45 min

**Caso guía**

Un checkout debe cobrar con tarjeta, transferencia o billetera. Quieres que el flujo dependa de “algo que puede cobrar”, no de implementaciones concretas. También hay validación común que no quieres duplicar.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error/riesgo común |
|---|---|---|---|---|
| **Interfaces** | Tipo que declara un contrato (métodos abstractos/default/static, constantes). | Programar contra capacidades/contratos. | Cuando varias clases comparten comportamiento esperado sin relación de implementación. | Interfaces gordas; exponer detalles innecesarios. |
| **Clases abstractas** | Clase no instanciable que puede tener estado, implementación parcial y métodos abstractos. | Compartir base común + forzar puntos de extensión. | Cuando hay código/estado común entre subclases relacionadas. | Usarla cuando solo se necesita contrato (mejor interfaz). |
| **Polimorfismo** | Tratar objetos concretos a través de un supertipo; la implementación ejecutada depende del objeto real. | Desacoplar cliente de implementaciones. | Estrategias, plugins, pagos, repositorios. | `instanceof` en cadena por mal diseño. |
| **`implements` / `extends`** | `implements` implementa interfaz; `extends` hereda clase (solo una). | Componer contrato y reutilizar base. | Clase concreta implementa contrato y/o extiende base abstracta. | Confundir herencia múltiple de clases (no existe en Java). |

**Contrato / invariantes / reglas.** Una clase puede implementar múltiples interfaces, pero extender solo una clase. Una clase concreta debe implementar métodos abstractos heredados. Métodos de interfaz son `public` en el contrato clásico; `default` provee implementación heredable y los conflictos deben resolverse en la clase. Clase abstracta no se puede instanciar con `new`.

**Modelo mental.** Interfaz = enchufe estándar; clase abstracta = chasis semiarmado; clase concreta = dispositivo completo; polimorfismo = el checkout solo conoce el enchufe.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-1 && cd ~/academia-java/modulo-1
```

Crea `PaymentMethod.java` (interfaz):

```java
public interface PaymentMethod {
    void pay(double amount);
}
```

Crea `BasePayment.java` (clase abstracta):

```java
public abstract class BasePayment implements PaymentMethod {
    private final String owner;

    protected BasePayment(String owner) {
        this.owner = owner;
    }

    protected String getOwner() { return owner; }

    protected void validateAmount(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Monto inválido");
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
        PaymentMethod method = new CardPayment("Ada"); // polimorfismo
        method.pay(49.99);
        method = new WalletPayment("Linus");
        method.pay(15.00);
    }
}
```

**Desglose del código**

- **Interfaz**: `PaymentMethod` define el contrato `pay`.
- **Clase abstracta**: `BasePayment` comparte estado/validación; no se instancia.
- **Polimorfismo**: `Checkout` usa `PaymentMethod`, no clases concretas.
- **Extensión**: agregar `BankTransferPayment` no requiere cambiar el cliente.

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
| `BasePayment is abstract; cannot be instantiated` | Intentaste `new BasePayment(...)` | Instancia una subclase concreta |
| Clase concreta no compila | No implementó método abstracto | Implementa `pay` o haz la clase abstracta |
| Demasiada lógica en interfaz/clase base | Contrato mal definido | Interfaz pequeña; base solo para lo común real |
| Cliente lleno de `if instanceof` | Falta polimorfismo | Llama al método del contrato |

**Verificación rápida**

```bash
javac *.java && java Checkout
```

Crea `BankTransferPayment extends BasePayment` y úsalo en `Checkout` sin modificar `PaymentMethod`.


### Tema 4: Sobrecarga, sobreescritura y modificadores de acceso · Intermedio · 35 min

**Caso guía**

Quieres una calculadora con `sum` para enteros, decimales y tres valores. Además, tienes `Animal/Dog` donde `Dog` cambia el sonido. Y necesitas controlar qué campos/métodos son visibles fuera de la clase. Son tres conceptos distintos que suelen confundirse.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error/riesgo común |
|---|---|---|---|---|
| **Sobrecarga (overloading)** | Varios métodos con mismo nombre pero distinta lista de parámetros en el mismo ámbito. | Ofrecer variantes cómodas de una operación. | Misma intención, distintos tipos/cantidades de entrada. | Creer que cambiar solo el retorno sobrecarga. |
| **Sobrescritura (overriding)** | Subclase redefine método heredado con firma compatible. | Especializar comportamiento manteniendo contrato. | Herencia/polimorfismo. | Olvidar `@Override` y cambiar firma accidentalmente. |
| **Modificadores de acceso** | `private`, package-private, `protected`, `public` controlan visibilidad. | Encapsular y definir API pública. | Siempre: principio de mínimo privilegio. | Hacer todo `public` y perder control de invariantes. |
| **Resolución compile-time vs runtime** | Sobrecarga se resuelve en compilación por firma; sobrescritura en runtime por tipo real. | Predecir qué método se ejecuta. | Al diseñar APIs y jerarquías. | Esperar despacho dinámico en sobrecarga. |

**Contrato / invariantes / reglas.** Sobrecarga: no basta cambiar retorno. Sobrescritura: no reducir visibilidad, respetar firma/contrato, no ampliar checked exceptions incompatibles. `private` no se sobrescribe (se oculta/declara otro método). `protected` visible en paquete y subclases. package-private (sin modificador) visible en el mismo paquete.

**Modelo mental.** Sobrecarga = mismo verbo con distintos formularios. Sobrescritura = mismo formulario, distinto actor lo ejecuta. Modificadores de acceso = puertas con distintos niveles de llave.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-1 && cd ~/academia-java/modulo-1
```

Crea `Calculator.java` (sobrecarga):

```java
public class Calculator {
    public int sum(int a, int b) { return a + b; }
    public double sum(double a, double b) { return a + b; }
    public int sum(int a, int b, int c) { return a + b + c; }
}
```

Crea `Animal.java` y `Dog.java` (sobrescritura + acceso):

```java
public class Animal {
    protected String name; // visible a subclases/paquete
    public Animal(String name) { this.name = name; }
    public String speak() { return "..."; }
}
```

```java
public class Dog extends Animal {
    public Dog(String name) { super(name); }

    @Override
    public String speak() { // sobrescritura
        return name + " dice: guau";
    }
}
```

Crea `DemoOver.java`:

```java
public class DemoOver {
    public static void main(String[] args) {
        Calculator calc = new Calculator();
        System.out.println(calc.sum(2, 3));       // int,int
        System.out.println(calc.sum(2.5, 3.5));   // double,double
        System.out.println(calc.sum(1, 2, 3));    // int,int,int

        Animal animal = new Dog("Toby");
        System.out.println(animal.speak());      // runtime: Dog.speak
    }
}
```

**Desglose del código**

- **Sobrecarga**: tres `sum` con distinta firma; el compilador elige según argumentos.
- **Sobrescritura**: `Dog.speak()` reemplaza el comportamiento en runtime.
- **Modificadores**: `name` es `protected` (no público), `speak` es `public` porque es API.
- **Resolución**: `calc.sum(...)` se decide en compilación; `animal.speak()` en ejecución.

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
| “Sobrecargué” cambiando solo retorno | Retorno no forma parte de la firma de sobrecarga | Cambia parámetros |
| `@Override` da error | No estás sobrescribiendo el método base real | Corrige firma o elimina override |
| Campo sensible público | Falta encapsulación | Usa `private` + métodos con validación |
| Esperabas overload dinámico | Sobrecarga es compile-time | Usa override/polimorfismo para comportamiento dinámico |

**Verificación rápida**

```bash
javac *.java && java DemoOver
```

Quita `@Override` y cambia `speak()` a `speak(String extra)`: compilará, pero ya no sobrescribe (otra firma).


### Tema 5: `record` — modelos inmutables sin boilerplate · Intermedio · 35 min

**Caso guía**

Necesitas representar coordenadas `(x,y)` o un DTO simple: datos, igualdad por valor y poca ceremonia. Escribir constructor/getters/equals/hashCode/toString a mano es repetitivo y propenso a errores.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error/riesgo común |
|---|---|---|---|---|
| **`record`** | Tipo especial (Java 16+) que declara componentes de estado; el compilador genera constructor canónico, accesores, `equals`, `hashCode`, `toString`. | Modelar datos inmutables con poco boilerplate. | DTOs, value objects, respuestas, claves compuestas simples. | Usarlo para entidades mutables o con mucha lógica de dominio. |
| **Modelos inmutables** | Objetos cuyo estado observable no cambia tras la construcción. | Seguridad al compartir, razonamiento simple, menos bugs. | Valores, mensajes, configuraciones, datos de transporte. | Poner componentes mutables (`List` mutable) y asumir inmutabilidad profunda. |
| **Boilerplate** | Código repetitivo de mecánica (getters, equals, etc.). | Reducirlo mejora legibilidad y mantenimiento. | Cuando la lógica es “datos + validación simple”. | Generar código manual inconsistente. |
| **Constructor compacto** | Forma `public Record { ... }` para validar/normalizar componentes antes de asignación implícita. | Proteger invariantes del record. | Validar rangos, nulls, normalizar strings. | Intentar asignar manualmente de forma incompatible con la semántica del componente. |

**Contrato / invariantes / reglas.** Record es implícitamente `final` y extiende `java.lang.Record`; no puede extender otra clase, pero sí implementar interfaces. Los componentes generan accesores `x()`, `y()`. `equals/hashCode` consideran todos los componentes. La inmutabilidad es superficial: si un componente es mutable, debes copiar/defenderlo.

**Modelo mental.** Un record es una ficha sellada de datos: el lenguaje imprime la plantilla estándar; tú solo defines los campos y las reglas.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-1 && cd ~/academia-java/modulo-1
```

Crea `Point.java`:

```java
public record Point(int x, int y) {
    public Point { // constructor compacto: validación
        if (x < 0 || y < 0) {
            throw new IllegalArgumentException("Coordenadas no negativas");
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
        Point b = new Point(3, 4); // otro objeto, mismo valor
        Point c = new Point(1, 2);

        System.out.println(a);              // toString generado
        System.out.println(a.x());          // accesor generado
        System.out.println(a.equals(b));    // igualdad por valor
        System.out.println(a.equals(c));
        System.out.println(a.distanceSquaredFromOrigin());
    }
}
```

**Desglose del código**

- **Record**: `record Point(int x, int y)` declara componentes y genera boilerplate.
- **Inmutabilidad**: no hay setters; para “cambiar” creas otra instancia.
- **Constructor compacto**: valida antes de aceptar el estado.
- **Valor**: `equals/hashCode` por componentes, útil para DTOs/value objects.

**Ejecución y salida real**

```bash
javac Point.java DemoRecord.java
java DemoRecord
```

```text
Point[x=3, y=4]
3
true
false
25
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Quieres mutar un campo | Record inmutable | Crea una nueva instancia |
| `equals` falla por campos mutables internos | Inmutabilidad superficial | Copia defensiva/colecciones inmutables |
| Record con demasiada lógica | Mal uso como entidad/servicio | Usa clase normal si el comportamiento domina |
| Intentas heredar de clase | Restricción de records | Implementa interfaces o usa composición |

**Verificación rápida**

```bash
javac Point.java DemoRecord.java && java DemoRecord
```

Prueba `new Point(-1,0)` y verifica que lanza `IllegalArgumentException`.


### Tema 6: Constructores flexibles (Java 25) · Avanzado · 30 min

**Caso guía**

Recibes `rawEmail` con espacios y mayúsculas. Antes de llamar al constructor padre quieres normalizar y validar. En Java antiguo, `super(...)` debía ser la primera sentencia; en Java 25 puedes preparar argumentos antes, con reglas.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error/riesgo común |
|---|---|---|---|---|
| **Constructores flexibles (Java 25)** | Relajan la restricción de que `super(...)`/`this(...)` sea la primera sentencia, permitiendo un prologue limitado antes de la invocación delegada. | Validar/normalizar argumentos antes de delegar al padre/otro constructor. | Subclases que necesitan preparar datos para `super(...)`. | Usar `this` antes de `super(...)` cuando la instancia no está inicializada. |
| **Prologue** | Código antes de `super(...)`/`this(...)` que no depende del estado de instancia inicializado. | Preparar parámetros, validar precondiciones. | Normalización, checks, cálculos locales. | Acceder a campos/métodos de instancia. |
| **Invocación delegada (`super`/`this`)** | Llamada al constructor de la superclase o a otro constructor de la misma clase. | Garantizar inicialización correcta. | Siempre en cadenas de constructores. | No garantizar que se llame exactamente una vez por camino válido. |
| **Epilogue** | Código después de la invocación delegada, donde `this` ya está inicializado. | Asignar campos propios, lógica post-inicialización. | Después de `super(...)`. | Duplicar validación entre prologue y padre sin criterio. |

**Contrato / invariantes / reglas.** Antes de `super(...)`/`this(...)` no se puede usar la instancia de forma inválida (campos de instancia, métodos de instancia, `this`). El prologue debe llevar a una invocación delegada válida exactamente una vez. La característica depende de versión del lenguaje/JDK; si tu JDK es anterior, no compila. Alternativa compatible: factory method/static helper.

**Modelo mental.** Antes: entregas el paquete al padre al entrar. Ahora: puedes revisarlo en el vestíbulo (prologue), entregarlo (`super`), y luego acomodar tu habitación (epilogue) — sin entrar a habitaciones antes de la entrega.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-1 && cd ~/academia-java/modulo-1
```

> **Nota de verificación**: requiere JDK 25+ para la forma flexible. Verifica con `javac -version`. Si usas JDK anterior, aplica la alternativa factory method abajo.

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
        // Prologue: validar/normalizar SIN usar this
        if (rawEmail == null || rawEmail.isBlank()) {
            throw new IllegalArgumentException("Email obligatorio");
        }
        String normalized = rawEmail.trim().toLowerCase();
        super(normalized); // invocación delegada
        // Epilogue: this ya está inicializado
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

Alternativa compatible (JDK antiguo), `AdminUserCompatible.java`:

```java
public class AdminUserCompatible extends UserBase {
    private final String role;
    private AdminUserCompatible(String email) { super(email); this.role = "ADMIN"; }
    public static AdminUserCompatible from(String rawEmail) {
        if (rawEmail == null || rawEmail.isBlank()) throw new IllegalArgumentException("Email obligatorio");
        return new AdminUserCompatible(rawEmail.trim().toLowerCase());
    }
    public String getRole() { return role; }
}
```

**Desglose del código**

- **Prologue**: valida y normaliza `rawEmail` antes de `super(...)`.
- **Delegación**: `super(normalized)` inicializa la parte heredada con dato limpio.
- **Epilogue**: asigna `role` ya con `this` válido.
- **Compatibilidad**: factory method logra el mismo resultado en JDKs antiguos.

**Ejecución y salida real**

JDK 25+:

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
| `call to super must be first statement` | JDK no soporta constructores flexibles | Usa JDK 25+ o factory method |
| Error usando `this` en prologue | Instancia no inicializada | Mueve ese código al epilogue o hazlo con variables locales |
| Validación duplicada | Padre y subclase validan lo mismo | Define claramente el invariante por nivel |

**Verificación rápida**

```bash
javac -version
javac UserBase.java AdminUser.java DemoAdmin.java && java DemoAdmin
```

Si el JDK es <25, compila/ejecuta la alternativa `AdminUserCompatible.from(...)`.


## Cierre del módulo

Ya puedes modelar objetos, proteger su estado, reutilizar comportamiento con herencia, definir contratos con interfaces y usar records para datos. En el siguiente módulo el foco se mueve a colecciones y genéricos: cómo organizar muchos objetos sin perder tipo ni claridad.
