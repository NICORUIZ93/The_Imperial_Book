# Módulo 12: Buenas prácticas y patrones de diseño

Los patrones de diseño no son recetas para copiar a ciegas: son soluciones nombradas a problemas recurrentes de diseño. Su valor está en comunicar intención, reducir acoplamiento y hacer explícitos los trade-offs. Este módulo cubre patrones creacionales y estructurales con criterio: cuándo usarlos y cuándo una solución simple es mejor.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Construir objetos complejos con validación usando Builder |
| 2 | Elegir e intercambiar comportamientos con Factory Method y Strategy |
| 3 | Crear familias de objetos compatibles con Abstract Factory |
| 4 | Aplicar SOLID con criterio y detectar sobreingeniería |
| 5 | Clonar objetos sin compartir estado mutable con Prototype |
| 6 | Integrar piezas incompatibles con Adapter, Decorator y Facade |

## Aprende construyendo

### Tema 1: Builder — configuración paso a paso y validación · Básico · 35 min

**Caso guía**

`Guia` tiene 4 campos obligatorios y 4 opcionales. Un constructor telescópico es ilegible y propenso a errores.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Builder** | Patrón creacional que construye objeto paso a paso y devuelve instancia final válida. | Legibilidad y control de construcción. | Muchos parámetros/opcionales. | Builder que permite objetos inválidos. |
| **Configuración paso a paso** | API fluida o métodos encadenados para setear campos. | Claridad en el call site. | Objetos complejos. | Mutar builder después de `build` sin definir contrato. |
| **Validación en construcción** | Verificar invariantes en `build()`. | Evitar estados inválidos. | Reglas de negocio obligatorias. | Validar tarde, en otro servicio. |
| **Inmutabilidad del producto** | Objeto construido no cambia tras `build()`. | Seguridad y simplicidad. | DTOs/value objects. | Exponer setters innecesarios. |

**Contrato / invariantes / reglas.** `build()` debe validar obligatorios y rangos. Builder puede ser mutable; producto preferiblemente inmutable. No reutilices builder con estado accidental salvo que lo resetees.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-12 && cd ~/academia-java/modulo-12
```

`Guia.java`:

```java
public class Guia {
    private final String id, origen, destino, destinatario;
    private final double pesoKg;
    private final boolean fragil, firma;
    private final String notas;
    private Guia(Builder b){ this.id=b.id; this.origen=b.origen; this.destino=b.destino; this.destinatario=b.destinatario; this.pesoKg=b.pesoKg; this.fragil=b.fragil; this.firma=b.firma; this.notas=b.notas; }
    public static class Builder {
        private final String id, origen, destino, destinatario;
        private double pesoKg; private boolean fragil, firma; private String notas = "";
        public Builder(String id,String origen,String destino,String destinatario){
            if(id==null||id.isBlank()) throw new IllegalArgumentException("id");
            this.id=id; this.origen=origen; this.destino=destino; this.destinatario=destinatario;
        }
        public Builder pesoKg(double p){ if(p<=0) throw new IllegalArgumentException("peso"); this.pesoKg=p; return this; }
        public Builder fragil(boolean f){ this.fragil=f; return this; }
        public Builder firma(boolean f){ this.firma=f; return this; }
        public Builder notas(String n){ this.notas=n==null?"":n; return this; }
        public Guia build(){ if(pesoKg<=0) throw new IllegalStateException("peso requerido"); return new Guia(this); }
    }
    public String resumen(){ return id+" "+origen+"->"+destino+" "+pesoKg+"kg fragil="+fragil; }
}
```

`DemoBuilder.java`:

```java
public class DemoBuilder {
    public static void main(String[] args) {
        Guia g = new Guia.Builder("G-1","Lima","Cusco","Ada").pesoKg(2.5).fragil(true).firma(true).build();
        System.out.println(g.resumen());
    }
}
```

**Ejecución y salida real**

```bash
javac Guia.java DemoBuilder.java
java DemoBuilder
```

```text
G-1 Lima->Cusco 2.5kg fragil=true
```

**Errores comunes**: objeto inválido construido, builder reutilizado con estado sucio. **Verificación**: omite `pesoKg` y confirma `IllegalStateException`.


### Tema 2: Factory Method y Strategy · Intermedio · 40 min

**Caso guía**

Calculas costo de envío por tipo (terrestre/aéreo/marítimo). No quieres un `if/switch` creciendo en cada servicio.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Factory Method** | Patrón creacional que delega creación a un método/fábrica. | Centralizar construcción según tipo. | Selección de implementación por input/config. | Factory gigante con lógica de negocio. |
| **Strategy** | Patrón de comportamiento que encapsula algoritmo intercambiable tras una interfaz. | Cambiar comportamiento en runtime/composición. | Variantes de cálculo/validación. | Crear estrategias para variación que no existe. |
| **Polimorfismo** | Cliente llama contrato común. | Eliminar condicionales repetidos. | Múltiples algoritmos. | `instanceof` en cadena. |
| **Open/Closed** | Abierto a extensión, cerrado a modificación. | Agregar tipo sin tocar cliente. | Sistemas con variantes. | Modificar cliente por cada tipo nuevo. |

**Contrato / invariantes / reglas.** Factory devuelve interfaz/abstracción. Strategy no debe romper contrato. Validar input desconocido. Registra estrategias en mapa/fábrica.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-12 && cd ~/academia-java/modulo-12
```

`CostoEnvio.java`:
```java
public interface CostoEnvio { double calcular(double pesoKg); }
```
`Terrestre.java`:
```java
public class Terrestre implements CostoEnvio { public double calcular(double p){ return 10 + p*2; } }
```
`Aereo.java`:
```java
public class Aereo implements CostoEnvio { public double calcular(double p){ return 20 + p*5; } }
```
`CostoEnvioFactory.java`:
```java
public class CostoEnvioFactory {
    public static CostoEnvio porTipo(String tipo){
        return switch(tipo){ case "TERRESTRE" -> new Terrestre(); case "AEREO" -> new Aereo(); default -> throw new IllegalArgumentException("tipo"); };
    }
}
```
`DemoStrategy.java`:
```java
public class DemoStrategy {
    public static void main(String[] args) {
        CostoEnvio estrategia = CostoEnvioFactory.porTipo("AEREO");
        System.out.println(estrategia.calcular(2.0));
    }
}
```

**Ejecución y salida real**

```bash
javac *.java
java DemoStrategy
```

```text
30.0
```

**Errores comunes**: switch duplicado, factory con reglas de negocio, no validar tipo. **Verificación**: agrega `Maritimo` creando clase y caso en factory.


### Tema 3: Abstract Factory y familias de productos compatibles · Intermedio · 35 min

**Caso guía**

Para `INTL` necesitas `SeguroIntl` + `AduanaIntl`; para `NAC`, `SeguroNac` + `AduanaNac`. Mezclarlos es un bug.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Abstract Factory** | Patrón creacional que crea familias de objetos relacionados sin especificar clases concretas. | Garantizar compatibilidad entre productos. | Variantes por región/plataforma/proveedor. | Usarlo cuando solo hay un producto. |
| **Familias de productos compatibles** | Conjunto de objetos diseñados para usarse juntos. | Evitar combinaciones inválidas. | Config por entorno/país/tipo. | Instanciar productos mezclados manualmente. |
| **Fábrica concreta** | Implementación que produce una familia específica. | Encapsular selección coherente. | `IntlFactory`, `NacFactory`. | Lógica condicional dispersa. |
| **Cliente desacoplado** | Código cliente depende de interfaces abstractas. | Cambiar familia sin tocar cliente. | Inyección de factory. | Cliente conoce clases concretas. |

**Contrato / invariantes / reglas.** Una factory concreta produce solo productos compatibles. Cliente no usa `new` concreto. Agregar familia nueva = nueva factory + productos, sin cambiar cliente.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-12-af && cd ~/academia-java/modulo-12-af
```

`Seguro.java`:
```java
public interface Seguro { String tipo(); }
```
`Aduana.java`:
```java
public interface Aduana { String tipo(); }
```
`SeguroIntl.java`:
```java
public class SeguroIntl implements Seguro { public String tipo(){ return "seguro-intl"; } }
```
`AduanaIntl.java`:
```java
public class AduanaIntl implements Aduana { public String tipo(){ return "aduana-intl"; } }
```
`EnvioFactory.java`:
```java
public interface EnvioFactory { Seguro seguro(); Aduana aduana(); }
```
`IntlFactory.java`:
```java
public class IntlFactory implements EnvioFactory { public Seguro seguro(){ return new SeguroIntl(); } public Aduana aduana(){ return new AduanaIntl(); } }
```
`DemoAF.java`:
```java
public class DemoAF {
    static void procesar(EnvioFactory f){ System.out.println(f.seguro().tipo()+"+"+f.aduana().tipo()); }
    public static void main(String[] args){ procesar(new IntlFactory()); }
}
```

**Ejecución y salida real**

```bash
javac *.java
java DemoAF
```

```text
seguro-intl+aduana-intl
```

**Errores comunes**: mezclar familias, factory por producto (eso no es Abstract Factory), explosión de clases sin necesidad. **Verificación**: agrega familia `NAC` completa y confirma que cliente no cambia.


### Tema 4: SOLID y cuándo NO aplicar un patrón · Intermedio · 40 min

**Caso guía**

Una clase valida, calcula, guarda en BD y envía email. Funciona, pero es frágil para cambiar y testear.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **S**ingle Responsibility | Una clase debe tener una razón principal de cambio. | Cohesión y tests simples. | Cuando clase mezcla responsabilidades. | Separar en exceso sin necesidad. |
| **O**pen/Closed | Abierto a extensión, cerrado a modificación. | Extender sin tocar código estable. | Variantes predecibles. | Abstracciones prematuras. |
| **L**iskov Substitution | Subtipos deben respetar contrato del supertipo. | Polimorfismo seguro. | Jerarquías/herencia. | Sobrescribir rompiendo pre/postcondiciones. |
| **I**nterface Segregation | Interfaces pequeñas y específicas. | Evitar dependencias innecesarias. | APIs con clientes distintos. | Interfaces “Dios”. |
| **D**ependency Inversion | Depender de abstracciones, no concreciones. | Desacople y testabilidad. | Dependencias externas. | Inyectar todo sin criterio. |
| **Cuándo NO aplicar patrón** | Evitar patrón cuando no hay variación/beneficio real. | Simplicidad. | Código pequeño y estable. | Sobreingeniería. |

**Contrato / invariantes / reglas.** SOLID son heurísticas, no leyes absolutas. Aplica cuando reduce complejidad real. YAGNI: no abstraigas antes de necesitar. Patrones resuelven problemas recurrentes; si no hay problema, no hay patrón.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-12-solid && cd ~/academia-java/modulo-12-solid
```

`PrecioRepo.java`:
```java
public interface PrecioRepo { double obtener(String id); }
```
`CalculadoraPrecio.java`:
```java
public class CalculadoraPrecio {
    private final PrecioRepo repo;
    public CalculadoraPrecio(PrecioRepo repo){ this.repo=repo; }
    public double conIva(String id){ return repo.obtener(id) * 1.21; }
}
```
`DemoSolid.java`:
```java
public class DemoSolid {
    public static void main(String[] args) {
        PrecioRepo repo = id -> 100.0; // dependencia inyectada
        System.out.println(new CalculadoraPrecio(repo).conIva("A1"));
    }
}
```

**Ejecución y salida real**

```bash
javac *.java
java DemoSolid
```

```text
121.0
```

**Errores comunes**: aplicar todos los patrones siempre, interfaces con 1 implementación sin motivo, herencia que viola Liskov. **Verificación**: sustituye `repo` por otro lambda en test sin cambiar `CalculadoraPrecio`.


### Tema 5: Prototype: copiar un objeto sin compartir sus datos · Intermedio · 35 min

**Caso guía**

Tienes una plantilla de guía y quieres crear nuevas guías copiándola, pero sin compartir listas internas.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Prototype** | Patrón creacional que crea nuevos objetos clonando un prototipo. | Evitar construcción costosa/repetitiva. | Plantillas/config base. | Clon superficial con mutables compartidos. |
| **Copia superficial** | Copia referencias de campos mutables. | Barata pero peligrosa con mutables. | Solo si todo es inmutable. | Modificar copia y afectar original. |
| **Copia profunda** | Copia también objetos internos mutables. | Aislamiento real. | Objetos con listas/mapas/objetos mutables. | Olvidar algún campo anidado. |
| **Compartir datos (riesgo)** | Dos instancias apuntan al mismo objeto mutable interno. | Fuente de bugs. | Nunca para plantillas independientes. | Alias accidental. |

**Contrato / invariantes / reglas.** Define claramente si `clone/copy` es shallow o deep. Para mutables, copia defensiva (`new ArrayList<>(original)`). Inmutables pueden compartirse seguro. `Cloneable` de Java es controvertido; un método `copy()` explícito suele ser más claro.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-12-proto && cd ~/academia-java/modulo-12-proto
```

`Plantilla.java`:

```java
import java.util.*;
public class Plantilla {
    private final String origen; private final List<String> etiquetas;
    public Plantilla(String origen, List<String> etiquetas){ this.origen=origen; this.etiquetas=new ArrayList<>(etiquetas); }
    public Plantilla copy(){ return new Plantilla(origen, new ArrayList<>(etiquetas)); } // copia profunda de lista
    public void addEtiqueta(String e){ etiquetas.add(e); }
    public String toString(){ return origen+etiquetas; }
}
```

`DemoPrototype.java`:

```java
import java.util.*;
public class DemoPrototype {
    public static void main(String[] args) {
        Plantilla base = new Plantilla("Lima", new ArrayList<>(List.of("fragil")));
        Plantilla copia = base.copy();
        copia.addEtiqueta("urgente");
        System.out.println(base);
        System.out.println(copia);
    }
}
```

**Ejecución y salida real**

```bash
javac Plantilla.java DemoPrototype.java
java DemoPrototype
```

```text
Lima[fragil]
Lima[fragil, urgente]
```

**Errores comunes**: shallow copy, exponer lista interna, usar `clone()` sin entenderlo. **Verificación**: cambia a copia superficial y observa que el original se modifica.


### Tema 6: Patrones estructurales para conectar piezas existentes · Intermedio · 40 min

**Caso guía**

Integras una API externa con interfaz incompatible y quieres añadir logging sin modificar la clase original.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Adapter** | Convierte interfaz de una clase en la que el cliente espera. | Integrar código incompatible. | APIs externas/legacy. | Poner lógica de negocio en adapter. |
| **Decorator** | Envuelve objeto para añadir comportamiento manteniendo interfaz. | Extender funcionalidad por composición. | Logging, cache, métricas. | Cadena de decorators difícil de depurar. |
| **Facade** | Interfaz simple sobre subsistema complejo. | Reducir complejidad para cliente. | Librerías/subsistemas con muchos pasos. | Facade que se vuelve “Dios”. |
| **Composición** | Construir comportamiento combinando objetos. | Alternativa flexible a herencia. | Decorator/Adapter/Facade. | Sobre-encapsular. |

**Contrato / invariantes / reglas.** Adapter no cambia comportamiento, traduce interfaz. Decorator debe respetar contrato de la interfaz. Facade no impide acceso a bajo nivel si es necesario, solo simplifica.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-12-struct && cd ~/academia-java/modulo-12-struct
```

`Pago.java`:
```java
public interface Pago { void pagar(double monto); }
```
`PagoExterno.java`:
```java
public class PagoExterno { public void makePayment(double value){ System.out.println("externo:"+value); } }
```
`PagoAdapter.java` (Adapter):
```java
public class PagoAdapter implements Pago {
    private final PagoExterno externo; public PagoAdapter(PagoExterno e){ this.externo=e; }
    public void pagar(double monto){ externo.makePayment(monto); }
}
```
`PagoLogDecorator.java` (Decorator):
```java
public class PagoLogDecorator implements Pago {
    private final Pago inner; public PagoLogDecorator(Pago inner){ this.inner=inner; }
    public void pagar(double monto){ System.out.println("log: pagando "+monto); inner.pagar(monto); }
}
```
`DemoStruct.java`:
```java
public class DemoStruct { public static void main(String[] args){ Pago pago = new PagoLogDecorator(new PagoAdapter(new PagoExterno())); pago.pagar(50.0); } }
```

**Ejecución y salida real**

```bash
javac *.java
java DemoStruct
```

```text
log: pagando 50.0
externo:50.0
```

**Errores comunes**: adaptar y cambiar semántica, decorator que rompe contrato, facade con demasiada lógica. **Verificación**: quita decorator y confirma que solo queda la llamada externa.


## Cierre del módulo

Los patrones son vocabulario de diseño: Builder, Factory, Strategy, Abstract Factory, Prototype, Adapter, Decorator y Facade resuelven problemas concretos. El criterio profesional es saber cuándo no usarlos. En el siguiente módulo aplicarás este criterio a diseño de sistemas.
