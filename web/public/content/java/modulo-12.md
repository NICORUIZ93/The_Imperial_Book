# Módulo 12: Buenas prácticas y patrones de diseño

Los patrones de diseño son soluciones nombradas a problemas recurrentes de diseño. Su valor está en comunicar intención, reducir acoplamiento y hacer explícitos los trade-offs. Este módulo cubre patrones creacionales y estructurales con criterio: cuándo usarlos y cuándo una solución simple es mejor.

**Entorno de referencia verificado (2026-05-22):** JDK 27.

## Aprende construyendo

### Tema 1: Builder — configuración paso a paso y validación · Básico · 35 min

`Guia` tiene obligatorios y opcionales. Un constructor telescópico es ilegible y propenso a errores.

#### Builder

**Definición formal.** Patrón creacional que separa la construcción compleja de un objeto de su representación final, normalmente con un `build()` que devuelve el producto.

**Para qué sirve.** Mejora legibilidad y permite validar invariantes antes de crear el objeto.

**Cuándo usarlo y cuándo no.** Úsalo con muchos parámetros/opcionales. No lo uses para objetos triviales de 1-2 campos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m12-t1-builder && cd /tmp/java-m12-t1-builder
```

```java
class User {
    final String name; final int age;
    private User(Builder b){ this.name=b.name; this.age=b.age; }
    static class Builder {
        private String name; private int age;
        Builder name(String n){ this.name=n; return this; }
        Builder age(int a){ this.age=a; return this; }
        User build(){ if(name==null) throw new IllegalStateException("name"); return new User(this); }
    }
}
public class DemoBuilder { public static void main(String[] args){ System.out.println(new User.Builder().name("Ada").age(36).build().name); } }
```

**Caso de uso real.** Request DTOs, objetos de configuración, entidades con opcionales.

**Error común.** `build()` que permite objeto inválido. Corrección: validar invariantes en `build()`.

**Verificación (JDK 27, 2026-05-22).** Salida: `Ada`.

#### Configuración paso a paso y validación

**Definición formal.** API fluida encadena llamadas para configurar campos; la validación asegura invariantes obligatorios al construir.

**Para qué sirve.** Call site claro y objeto final válido.

**Cuándo usarlo.** Cuando haya reglas de obligatoriedad/rangos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m12-t1-valid && cd /tmp/java-m12-t1-valid
```

```java
class Cfg {
    final int port;
    private Cfg(int port){ this.port=port; }
    static class Builder {
        int port;
        Builder port(int p){ if(p<=0) throw new IllegalArgumentException("port"); this.port=p; return this; }
        Cfg build(){ if(port==0) throw new IllegalStateException("port requerido"); return new Cfg(port); }
    }
}
public class DemoValid { public static void main(String[] args){ System.out.println(new Cfg.Builder().port(8080).build().port); } }
```

**Caso de uso real.** Configuración de cliente HTTP.

**Error común.** Validar tarde en otro servicio. Corrección: validar en construcción.

**Verificación (JDK 27, 2026-05-22).** Salida: `8080`.

#### Inmutabilidad del producto

**Definición formal.** El objeto construido no expone mutación tras `build()`.

**Para qué sirve.** Seguridad, simplicidad y facilidad para concurrencia.

**Cuándo usarlo.** Value objects/DTOs/configuración.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m12-t1-inm && cd /tmp/java-m12-t1-inm
```

```java
final class Punto {
    final int x,y;
    Punto(int x,int y){ this.x=x; this.y=y; }
}
public class DemoInm { public static void main(String[] args){ System.out.println(new Punto(1,2).x); } }
```

**Caso de uso real.** Objetos de valor en dominio.

**Error común.** Agregar setters innecesarios. Corrección: campos `final` y sin setters.

**Verificación (JDK 27, 2026-05-22).** Salida: `1`.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m12-t1 && cd /tmp/java-m12-t1
```

```java
public class Guia {
    private final String id, origen, destino, destinatario;
    private final double pesoKg; private final boolean fragil;
    private Guia(Builder b){ id=b.id; origen=b.origen; destino=b.destino; destinatario=b.destinatario; pesoKg=b.pesoKg; fragil=b.fragil; }
    public static class Builder {
        private final String id, origen, destino, destinatario;
        private double pesoKg; private boolean fragil;
        public Builder(String id,String origen,String destino,String destinatario){ if(id==null||id.isBlank()) throw new IllegalArgumentException("id"); this.id=id; this.origen=origen; this.destino=destino; this.destinatario=destinatario; }
        public Builder pesoKg(double p){ if(p<=0) throw new IllegalArgumentException("peso"); this.pesoKg=p; return this; }
        public Builder fragil(boolean f){ this.fragil=f; return this; }
        public Guia build(){ if(pesoKg<=0) throw new IllegalStateException("peso requerido"); return new Guia(this); }
    }
    public String resumen(){ return id+" "+origen+"->"+destino+" "+pesoKg+"kg fragil="+fragil; }
}
```

```java
public class DemoBuilder { public static void main(String[] args){ System.out.println(new Guia.Builder("G-1","Lima","Cusco","Ada").pesoKg(2.5).fragil(true).build().resumen()); } }
```

**Verificación (JDK 27, 2026-05-22).**

```text
G-1 Lima->Cusco 2.5kg fragil=true
```


### Tema 2: Factory Method y Strategy · Intermedio · 40 min

Necesitas crear notificaciones por canal y variar el cálculo de flete por tipo de envío. Quieres extensibilidad sin llenar el código de `if/switch`.

#### Factory Method

**Definición formal.** Patrón creacional que delega la creación de objetos a un método/fábrica, permitiendo variar el producto concreto.

**Para qué sirve.** Centraliza creación y desacopla el cliente del concreto.

**Cuándo usarlo y cuándo no.** Úsalo cuando el tipo concreto varía por configuración/input. No lo uses si un `new` simple basta.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m12-t2-factory && cd /tmp/java-m12-t2-factory
```

```java
interface Canal { String tipo(); }
class Email implements Canal { public String tipo(){ return "EMAIL"; } }
class Sms implements Canal { public String tipo(){ return "SMS"; } }
class CanalFactory { static Canal crear(String t){ return switch(t){ case "EMAIL" -> new Email(); case "SMS" -> new Sms(); default -> throw new IllegalArgumentException(t); }; } }
public class DemoFactory { public static void main(String[] args){ System.out.println(CanalFactory.crear("EMAIL").tipo()); } }
```

**Caso de uso real.** Crear estrategia de pago/notificación por tipo.

**Error común.** Factory gigante con lógica de negocio. Corrección: factory solo crea/selecciona.

**Verificación (JDK 27, 2026-05-22).** Salida: `EMAIL`.

#### Strategy

**Definición formal.** Patrón de comportamiento que encapsula algoritmos intercambiables detrás de una interfaz común.

**Para qué sirve.** Variar comportamiento en runtime sin condicionales dispersos.

**Cuándo usarlo y cuándo no.** Úsalo cuando haya varias políticas intercambiables. No si solo hay un algoritmo estable.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m12-t2-strategy && cd /tmp/java-m12-t2-strategy
```

```java
interface Flete { double calcular(double peso); }
class Aereo implements Flete { public double calcular(double p){ return p*10; } }
class Terrestre implements Flete { public double calcular(double p){ return p*3; } }
class Calculadora { private Flete f; Calculadora(Flete f){this.f=f;} double total(double p){ return f.calcular(p); } }
public class DemoStrategy { public static void main(String[] args){ System.out.println(new Calculadora(new Aereo()).total(2)); } }
```

**Caso de uso real.** Flete, impuestos, pricing, validaciones.

**Error común.** Estrategias con estado compartido mutable inesperado. Corrección: estrategias stateless o estado controlado.

**Verificación (JDK 27, 2026-05-22).** Salida: `20.0`.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m12-t2 && cd /tmp/java-m12-t2
```

```java
interface Notificador { void enviar(String msg); }
class Email implements Notificador { public void enviar(String msg){ System.out.println("EMAIL:"+msg); } }
class Sms implements Notificador { public void enviar(String msg){ System.out.println("SMS:"+msg); } }
class NotificadorFactory { static Notificador crear(String tipo){ return switch(tipo){ case "EMAIL" -> new Email(); case "SMS" -> new Sms(); default -> throw new IllegalArgumentException(tipo); }; } }
public class DemoFactoryStrategy { public static void main(String[] args){ NotificadorFactory.crear("SMS").enviar("hola"); } }
```

**Verificación (JDK 27, 2026-05-22).** Salida: `SMS:hola`.

### Tema 3: Abstract Factory y familias de productos compatibles · Intermedio · 35 min

Necesitas crear familias de objetos compatibles (botones/inputs de un mismo tema) sin mezclar variantes.

#### Abstract Factory

**Definición formal.** Patrón creacional que provee una interfaz para crear familias de objetos relacionados sin especificar clases concretas.

**Para qué sirve.** Garantiza compatibilidad entre productos de la misma familia.

**Cuándo usarlo y cuándo no.** Úsalo cuando haya familias coherentes. No si solo hay un producto independiente.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m12-t3-af && cd /tmp/java-m12-t3-af
```

```java
interface Boton { String render(); }
interface UI { Boton boton(); }
class DarkBoton implements Boton { public String render(){ return "dark"; } }
class DarkUI implements UI { public Boton boton(){ return new DarkBoton(); } }
public class DemoAF { public static void main(String[] args){ UI ui = new DarkUI(); System.out.println(ui.boton().render()); } }
```

**Caso de uso real.** Temas UI, proveedores de infraestructura por entorno.

**Error común.** Mezclar productos de familias distintas. Corrección: crear toda la familia desde la misma fábrica.

**Verificación (JDK 27, 2026-05-22).** Salida: `dark`.

#### Familias de productos compatibles

**Definición formal.** Conjunto de productos diseñados para usarse juntos; la fábrica asegura coherencia.

**Para qué sirve.** Evita combinaciones inválidas.

**Cuándo usarlo.** Drivers/proveedores/temas.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m12-t3-family && cd /tmp/java-m12-t3-family
```

```java
interface Btn { String kind(); } interface Input { String kind(); }
interface Kit { Btn btn(); Input input(); }
class WebBtn implements Btn { public String kind(){ return "web-btn"; } }
class WebInput implements Input { public String kind(){ return "web-input"; } }
class WebKit implements Kit { public Btn btn(){ return new WebBtn(); } public Input input(){ return new WebInput(); } }
public class DemoFamily { public static void main(String[] args){ Kit k=new WebKit(); System.out.println(k.btn().kind()+","+k.input().kind()); } }
```

**Caso de uso real.** Adaptadores cloud por proveedor.

**Error común.** Fábrica que permite mezclar. Corrección: encapsular la familia.

**Verificación (JDK 27, 2026-05-22).** Salida: `web-btn,web-input`.

### Tema 4: SOLID y cuándo NO aplicar un patrón · Intermedio · 40 min

Los patrones ayudan, pero aplicarlos sin necesidad crea sobreingeniería. SOLID da criterios para evaluar diseño.

#### SOLID

**Definición formal.** Conjunto de principios: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.

**Para qué sirve.** Guiar diseño hacia bajo acoplamiento y alta cohesión.

**Cuándo usarlo.** Siempre como criterio, no como dogma.

**Ejemplo mínimo enfocado (ejecutable, SRP/DI simple).**

```bash
mkdir -p /tmp/java-m12-t4-solid && cd /tmp/java-m12-t4-solid
```

```java
interface Repo { void save(String s); }
class ConsoleRepo implements Repo { public void save(String s){ System.out.println("save:"+s); } }
class Service { private final Repo repo; Service(Repo repo){ this.repo=repo; } void crear(String s){ repo.save(s); } }
public class DemoSolid { public static void main(String[] args){ new Service(new ConsoleRepo()).crear("A"); } }
```

**Caso de uso real.** Servicio que depende de abstracción, no de implementación concreta.

**Error común.** Aplicar SRP creando cientos de clases sin valor. Corrección: cohesión y cambio real.

**Verificación (JDK 27, 2026-05-22).** Salida: `save:A`.

#### Cuándo NO aplicar un patrón

**Definición formal.** Decisión de no introducir abstracción/patrón cuando el costo supera el beneficio actual.

**Para qué sirve.** Evita sobreingeniería y complejidad accidental.

**Cuándo usarlo.** Cuando el problema es simple, estable y local.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m12-t4-no && cd /tmp/java-m12-t4-no
```

```java
public class DemoSimple { static int suma(int a,int b){ return a+b; } public static void main(String[] args){ System.out.println(suma(1,2)); } }
```

**Caso de uso real.** Una función pura no necesita Strategy/Factory.

**Error común.** “Por si acaso” abstracciones. Síntoma: código difícil de leer. Corrección: YAGNI, refactorizar cuando aparezca la variación real.

**Verificación (JDK 27, 2026-05-22).** Salida: `3`.

#### Ejemplo integrado desde cero

Usa `DemoSolid`: `Service` depende de `Repo` (DIP), `ConsoleRepo` implementa detalle (OCP/SRP razonable).

**Verificación.** Salida `save:A`.


### Tema 5: Prototype: copiar un objeto sin compartir sus datos · Intermedio · 35 min

Necesitas duplicar una plantilla de configuración sin que cambios en la copia afecten al original.

#### Prototype

**Definición formal.** Patrón creacional que crea nuevos objetos copiando una instancia prototipo.

**Para qué sirve.** Duplicar objetos configurados cuando la creación desde cero es costosa o repetitiva.

**Cuándo usarlo y cuándo no.** Úsalo para plantillas/configuraciones. Cuidado con copias superficiales sobre estado mutable compartido.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m12-t5-proto && cd /tmp/java-m12-t5-proto
```

```java
class Plantilla implements Cloneable {
    String nombre; java.util.List<String> tags = new java.util.ArrayList<>();
    Plantilla(String n){ nombre=n; }
    public Plantilla copia(){ Plantilla p=new Plantilla(nombre); p.tags=new java.util.ArrayList<>(tags); return p; }
}
public class DemoProto {
    public static void main(String[] args){ Plantilla a=new Plantilla("A"); a.tags.add("x"); Plantilla b=a.copia(); b.tags.add("y"); System.out.println(a.tags.size()+" "+b.tags.size()); }
}
```

**Caso de uso real.** Plantillas de documentos, configuración base.

**Error común.** Copia superficial con listas mutables compartidas. Síntoma: modificar copia afecta original. Corrección: deep copy de estado mutable necesario.

**Verificación (JDK 27, 2026-05-22).** Salida: `1 2`.

#### Copia superficial vs profunda

**Definición formal.** Superficial copia referencias internas; profunda copia también los objetos mutables internos.

**Para qué sirve.** Define si la copia es independiente.

**Cuándo usarlo.** Profunda cuando hay mutabilidad interna compartida.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m12-t5-copy && cd /tmp/java-m12-t5-copy
```

```java
import java.util.*;
public class DemoCopy {
    public static void main(String[] args) {
        List<String> a = new ArrayList<>(List.of("x"));
        List<String> shallow = a; // no copia real
        List<String> deep = new ArrayList<>(a);
        deep.add("y");
        System.out.println(a.size()+" "+shallow.size()+" "+deep.size());
    }
}
```

**Caso de uso real.** Clonar DTO con lista editable.

**Error común.** Usar `clone()` sin entender profundidad. Corrección: método de copia explícito.

**Verificación (JDK 27, 2026-05-22).** Salida: `1 1 2`.

### Tema 6: Patrones estructurales para conectar piezas existentes · Intermedio · 40 min

Integras APIs incompatibles, agregas comportamiento sin herencia explosiva y simplificas subsistemas complejos.

#### Adapter

**Definición formal.** Convierte la interfaz de una clase en otra que el cliente espera.

**Para qué sirve.** Integrar código legado/terceros sin modificar cliente.

**Cuándo usarlo.** Interfaces incompatibles.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m12-t6-adapter && cd /tmp/java-m12-t6-adapter
```

```java
class Legacy { String old(){ return "legacy"; } }
interface Target { String get(); }
class Adapter implements Target { private final Legacy l; Adapter(Legacy l){this.l=l;} public String get(){ return l.old(); } }
public class DemoAdapter { public static void main(String[] args){ System.out.println(new Adapter(new Legacy()).get()); } }
```

**Caso de uso real.** Adaptar SDK externo a interfaz interna.

**Error común.** Poner lógica de negocio en adapter. Corrección: adapter solo traduce.

**Verificación (JDK 27, 2026-05-22).** Salida: `legacy`.

#### Decorator

**Definición formal.** Envuelve un objeto para agregar responsabilidades dinámicamente, manteniendo la misma interfaz.

**Para qué sirve.** Componer comportamiento sin herencia múltiple/explosiva.

**Cuándo usarlo.** Variantes ortogonales (logging, cache, compresión).

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m12-t6-decorator && cd /tmp/java-m12-t6-decorator
```

```java
interface Notifier { String send(String m); }
class Base implements Notifier { public String send(String m){ return m; } }
class Upper implements Notifier { private final Notifier n; Upper(Notifier n){this.n=n;} public String send(String m){ return n.send(m).toUpperCase(); } }
public class DemoDecorator { public static void main(String[] args){ System.out.println(new Upper(new Base()).send("hola")); } }
```

**Caso de uso real.** `BufferedInputStream` decorando `InputStream`.

**Error común.** Cadena de decoradores difícil de depurar. Corrección: documentar orden y mantener simple.

**Verificación (JDK 27, 2026-05-22).** Salida: `HOLA`.

#### Facade

**Definición formal.** Provee una interfaz simple a un subsistema complejo.

**Para qué sirve.** Reducir acoplamiento del cliente con detalles internos.

**Cuándo usarlo.** Subsistema con muchos pasos/objetos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m12-t6-facade && cd /tmp/java-m12-t6-facade
```

```java
class A { String a(){ return "A"; } } class B { String b(){ return "B"; } }
class Facade { private final A a=new A(); private final B b=new B(); String op(){ return a.a()+b.b(); } }
public class DemoFacade { public static void main(String[] args){ System.out.println(new Facade().op()); } }
```

**Caso de uso real.** Fachada de checkout sobre pagos, inventario, notificaciones.

**Error común.** Facade que se vuelve “dios objeto”. Corrección: mantenerla delgada.

**Verificación (JDK 27, 2026-05-22).** Salida: `AB`.

## Cierre del módulo

Los patrones son vocabulario de diseño, no checklist obligatorio. Builder, Factory, Strategy, Abstract Factory, Prototype, Adapter, Decorator y Facade resuelven problemas concretos; SOLID ayuda a decidir cuándo la abstracción mejora el sistema y cuándo solo agrega ruido.
