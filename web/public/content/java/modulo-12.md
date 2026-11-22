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

Necesitas crear un objeto `Envio` con campos obligatorios (`guia`) y opcionales (`prioritario`, `seguro`). Un constructor con muchos parámetros es difícil de leer y fácil de llamar mal.

**Fundamento técnico y modelo mental**

**Definición formal.** *Builder* es un patrón creacional que separa la construcción de un objeto complejo de su representación final, permitiendo crear instancias paso a paso. El builder acumula configuración y valida invariantes en `build()`.

**Contrato / invariantes / reglas.** El objeto construido debe quedar en estado válido al salir de `build()`; las validaciones de invariantes obligatorios se centralizan ahí. El builder puede ser mutable durante la construcción, pero el producto final debe exponer solo el estado coherente. Encadenamiento fluido (`return this`) es una decisión de API, no parte esencial del patrón. No usar Builder cuando un constructor o factory simple es suficiente.

**Modelo mental.** Es como un formulario: lo llenas por partes, pero solo se envía cuando pasa validación.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-12 && cd ~/academia-java/modulo-12
```

Crea `Envio.java`:
```java
public class Envio {
    private final String guia;
    private final boolean prioritario;
    private final boolean seguro;

    private Envio(Builder b) {
        this.guia = b.guia;
        this.prioritario = b.prioritario;
        this.seguro = b.seguro;
    }

    public String getGuia() { return guia; }
    public boolean isPrioritario() { return prioritario; }
    public boolean isSeguro() { return seguro; }

    public static final class Builder {
        private final String guia;
        private boolean prioritario;
        private boolean seguro;

        public Builder(String guia) {
            if (guia == null || guia.isBlank()) throw new IllegalArgumentException("guia obligatoria");
            this.guia = guia;
        }

        public Builder prioritario(boolean valor) { this.prioritario = valor; return this; }
        public Builder seguro(boolean valor) { this.seguro = valor; return this; }

        public Envio build() { return new Envio(this); }
    }
}
```

```java
public class DemoBuilder {
    public static void main(String[] args) {
        Envio envio = new Envio.Builder("G-1").prioritario(true).seguro(false).build();
        System.out.println(envio.getGuia());
        System.out.println(envio.isPrioritario());
        System.out.println(envio.isSeguro());
    }
}
```

**Desglose del código**

- El constructor de `Envio` es privado: la creación pasa por `Builder`.
- `Builder` valida lo obligatorio temprano (`guia`).
- `build()` es el punto donde se materializa el objeto con estado final coherente.
- La API fluida mejora legibilidad cuando hay varios opcionales.

**Ejecución y salida real**

```bash
javac Envio.java DemoBuilder.java
java DemoBuilder
```

```text
G-1
true
false
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Objeto inválido creado | Validación tardía o ausente | Valida en constructor/builder/build |
| Builder enorme y confuso | Demasiados parámetros opcionales | Revisa el diseño del objeto; quizá sea demasiado grande |
| Usas Builder para 2 campos | Sobreingeniería | Usa constructor o factory simple |

**Verificación rápida**

Intenta `new Envio.Builder("")`: debe lanzar `IllegalArgumentException`.

### Tema 2: Factory Method y Strategy · Intermedio · 40 min

**Caso guía**

Debes calcular tarifas según el tipo de envío. Mañana puede aparecer un nuevo tipo. No quieres llenar el código de `if/switch` repartidos por todo el sistema.

**Fundamento técnico y modelo mental**

**Definición formal.** *Factory Method* delega la creación de objetos a un método/fábrica que encapsula la decisión de instanciación. *Strategy* encapsula una familia de algoritmos intercambiables detrás de una interfaz común, permitiendo variar el comportamiento en runtime o por configuración.

**Contrato / invariantes / reglas.** El cliente depende de la abstracción (`Tarifa`), no de implementaciones concretas. La fábrica centraliza la decisión de creación; Strategy centraliza la variación de comportamiento. Si el conjunto de variantes es cerrado y pequeño, un `switch` puede ser suficiente; la abstracción se justifica cuando reduce duplicación o facilita extensión real. Ambas apuntan a Open/Closed en el punto de variación, no a eliminar toda condición.

**Modelo mental.** Factory es el mostrador que te entrega la herramienta correcta; Strategy es la herramienta intercambiable que cumple el mismo contrato.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-12 && cd ~/academia-java/modulo-12
```

Crea `Tarifa.java`:
```java
interface Tarifa {
    int calcular(int gramos);
}

class Estandar implements Tarifa {
    public int calcular(int gramos) { return 100 + gramos; }
}

class Prioritaria implements Tarifa {
    public int calcular(int gramos) { return 200 + gramos * 2; }
}

class TarifaFactory {
    static Tarifa crear(String tipo) {
        return switch (tipo) {
            case "estandar" -> new Estandar();
            case "prioritaria" -> new Prioritaria();
            default -> throw new IllegalArgumentException("tipo desconocido: " + tipo);
        };
    }
}

public class DemoTarifas {
    static int cotizar(Tarifa tarifa, int gramos) { return tarifa.calcular(gramos); }

    public static void main(String[] args) {
        System.out.println(cotizar(TarifaFactory.crear("estandar"), 10));
        System.out.println(cotizar(TarifaFactory.crear("prioritaria"), 10));
    }
}
```

**Desglose del código**

- `Tarifa` define el contrato común.
- Cada estrategia implementa una regla distinta.
- `TarifaFactory` encapsula la creación; el cliente recibe la abstracción.
- `cotizar` no conoce clases concretas: depende de la interfaz.

**Ejecución y salida real**

```bash
javac Tarifa.java Estandar.java Prioritaria.java TarifaFactory.java DemoTarifas.java
java DemoTarifas
```

```text
110
220
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `switch` duplicado en varios lugares | Creación no centralizada | Centraliza en factory |
| Cliente conoce clases concretas | Acoplamiento innecesario | Programa contra la interfaz |
| Abstracción para un solo caso estable | YAGNI | Usa implementación simple |

**Verificación rápida**

Agrega `Express` implementando `Tarifa` y actualiza solo la factory; `cotizar` no debe cambiar.

### Tema 3: Abstract Factory y familias de productos compatibles · Intermedio · 35 min

**Caso guía**

Tu sistema debe generar avisos por canal. Cada canal tiene familia de productos compatibles: `Mensaje` y `Plantilla`. No quieres mezclar una plantilla de email con un mensaje SMS por accidente.

**Fundamento técnico y modelo mental**

**Definición formal.** *Abstract Factory* es un patrón creacional que provee una interfaz para crear familias de objetos relacionados o dependientes sin especificar sus clases concretas.

**Contrato / invariantes / reglas.** La fábrica abstracta garantiza consistencia de familia: los productos creados por una misma fábrica concreta deben ser compatibles entre sí. Agregar una nueva familia suele ser fácil (otra fábrica concreta); agregar un nuevo tipo de producto a la familia exige cambiar la interfaz abstracta y sus implementaciones. Se usa cuando la compatibilidad entre productos es un invariante de negocio.

**Modelo mental.** Es un kit: si eliges el kit “local”, todas las piezas del kit son locales y encajan entre sí.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-12 && cd ~/academia-java/modulo-12
```

Crea `Mensaje.java`:
```java
interface Mensaje { String render(String guia); }
interface Plantilla { String nombre(); }

interface FabricaAvisos {
    Mensaje crearMensaje();
    Plantilla crearPlantilla();
}

class Sms implements Mensaje { public String render(String guia) { return "SMS guia=" + guia; } }
class PlantillaLocal implements Plantilla { public String nombre() { return "local"; } }

class FabricaLocal implements FabricaAvisos {
    public Mensaje crearMensaje() { return new Sms(); }
    public Plantilla crearPlantilla() { return new PlantillaLocal(); }
}

public class DemoAbstractFactory {
    public static void main(String[] args) {
        FabricaAvisos fabrica = new FabricaLocal();
        System.out.println(fabrica.crearMensaje().render("G-1"));
        System.out.println(fabrica.crearPlantilla().nombre());
    }
}
```

**Desglose del código**

- `FabricaAvisos` define la familia de productos.
- `FabricaLocal` crea productos compatibles.
- El cliente depende de interfaces, no de clases concretas.
- El invariante es la compatibilidad dentro de la familia.

**Ejecución y salida real**

```bash
javac Mensaje.java Plantilla.java FabricaAvisos.java Sms.java PlantillaLocal.java FabricaLocal.java DemoAbstractFactory.java
java DemoAbstractFactory
```

```text
SMS guia=G-1
local
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Productos incompatibles mezclados | Creación dispersa | Crea por familia mediante factory abstracta |
| Muchas fábricas para poca variación | Sobreingeniería | Usa factory simple/strategy |
| Cambiar familia es doloroso | Cliente acoplado a concretos | Inyecta la fábrica abstracta |

**Verificación rápida**

Agrega `FabricaEmail` con `Email` y `PlantillaEmail`; el cliente debe funcionar solo cambiando la fábrica inyectada.

### Tema 4: SOLID y cuándo NO aplicar un patrón · Intermedio · 40 min

**Caso guía**

Un servicio de envíos guarda datos, valida y notifica todo en una sola clase. Funciona, pero cada cambio lo rompe. Quieres mejorar el diseño sin convertir el proyecto en un museo de patrones.

**Fundamento técnico y modelo mental**

**Definición formal.** SOLID es un conjunto de cinco principios de diseño orientado a objetos: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation y Dependency Inversion. Son heurísticas para gestionar acoplamiento, cohesión y extensibilidad.

**Contrato / invariantes / reglas.** SRP: una clase/módulo debe tener una razón clara de cambio. OCP: extender comportamiento sin modificar código estable en el punto de variación. LSP: subtipos deben respetar el contrato del supertipo. ISP: interfaces pequeñas y cohesivas. DIP: módulos de alto nivel dependen de abstracciones, no de detalles concretos. Los principios no son reglas absolutas; aplicarlos sin presión real genera complejidad accidental.

**Modelo mental.** SOLID es como ergonomía: te ayuda a trabajar mejor, pero agregar mecanismos innecesarios también causa fatiga.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-12 && cd ~/academia-java/modulo-12
```

Crea `RepositorioEnvios.java`:
```java
interface RepositorioEnvios { void guardar(String guia); }

class RepositorioMemoria implements RepositorioEnvios {
    public void guardar(String guia) { System.out.println("guardado=" + guia); }
}

class ServicioEnvios {
    private final RepositorioEnvios repositorio;
    ServicioEnvios(RepositorioEnvios repositorio) { this.repositorio = repositorio; }
    void registrar(String guia) {
        if (guia == null || guia.isBlank()) throw new IllegalArgumentException("guia obligatoria");
        repositorio.guardar(guia);
    }
}

public class DemoSolid {
    public static void main(String[] args) {
        ServicioEnvios servicio = new ServicioEnvios(new RepositorioMemoria());
        servicio.registrar("G-1");
    }
}
```

**Desglose del código**

- `RepositorioEnvios` es una abstracción (DIP).
- `ServicioEnvios` orquesta la regla de negocio y delega persistencia (SRP razonable).
- Puedes cambiar la implementación del repositorio sin modificar el servicio.
- No se introdujo un patrón extra innecesario: solo una interfaz donde hay variación real.

**Ejecución y salida real**

```bash
javac RepositorioEnvios.java RepositorioMemoria.java ServicioEnvios.java DemoSolid.java
java DemoSolid
```

```text
guardado=G-1
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Muchas interfaces con una sola implementación sin motivo | DIP aplicado por dogma | Introduce abstracción cuando haya variación o necesidad real |
| Clase “Dios” | SRP ignorado | Separa responsabilidades por razón de cambio |
| Herencia que rompe expectativas | LSP violado | Prefiere composición o rediseña contrato |

**Verificación rápida**

Sustituye `RepositorioMemoria` por otra implementación que imprima a otro destino; `ServicioEnvios` no debe cambiar.

### Tema 5: Prototype: copiar un objeto sin compartir sus datos · Intermedio · 35 min

**Caso guía**

Tienes una plantilla de paquete con etiquetas. Quieres crear una copia para modificarla sin alterar la plantilla original. Una copia superficial puede compartir listas internas y causar bugs.

**Fundamento técnico y modelo mental**

**Definición formal.** *Prototype* es un patrón creacional que crea nuevos objetos copiando una instancia prototípica. La copia puede ser *superficial* (shallow) o *profunda* (deep), según si copia referencias o también los objetos referenciados.

**Contrato / invariantes / reglas.** El contrato clave es la independencia del estado mutable: modificar la copia no debe afectar al original, ni viceversa, cuando el dominio lo requiere. Para objetos inmutables, la copia profunda es innecesaria. En Java, `clone()` es problemático por su diseño; se prefiere constructor de copia, factory de copia o métodos explícitos. La profundidad de copia debe ser deliberada.

**Modelo mental.** Fotocopiar un formulario es copia superficial si ambos apuntan a la misma nota adhesiva pegada; copia profunda es duplicar también la nota.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-12 && cd ~/academia-java/modulo-12
```

Crea `Paquete.java`:
```java
import java.util.ArrayList;
import java.util.List;

public class Paquete {
    private final String guia;
    private final List<String> etiquetas;

    public Paquete(String guia, List<String> etiquetas) {
        this.guia = guia;
        this.etiquetas = new ArrayList<>(etiquetas);
    }

    public Paquete(Paquete original) { // copia profunda de estado mutable necesario
        this.guia = original.guia;
        this.etiquetas = new ArrayList<>(original.etiquetas);
    }

    public void agregarEtiqueta(String etiqueta) { etiquetas.add(etiqueta); }
    public String getGuia() { return guia; }
    public List<String> getEtiquetas() { return List.copyOf(etiquetas); }
}

class DemoPrototype {
    public static void main(String[] args) {
        Paquete original = new Paquete("G-1", new ArrayList<>(List.of("fragil")));
        Paquete copia = new Paquete(original);
        copia.agregarEtiqueta("prioritario");

        System.out.println(original.getEtiquetas());
        System.out.println(copia.getEtiquetas());
    }
}
```

**Desglose del código**

- El constructor de copia crea una nueva lista para `etiquetas`.
- `List.copyOf` evita exponer la lista interna mutable.
- Modificar `copia` no afecta `original`.
- La copia profunda se aplica donde hay mutabilidad relevante.

**Ejecución y salida real**

```bash
javac Paquete.java DemoPrototype.java
java DemoPrototype
```

```text
[fragil]
[fragil, prioritario]
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Modificar copia modifica original | Shallow copy de campo mutable | Copia profundamente el estado mutable |
| Copia profunda innecesaria en todo | Sobre-costo | Copia solo lo mutable/compartible |
| Usar `clone()` sin entenderlo | Contrato frágil | Prefiere constructor/factory de copia |

**Verificación rápida**

Agrega una etiqueta a la copia y confirma que el original mantiene su lista original.

### Tema 6: Patrones estructurales para conectar piezas existentes · Intermedio · 40 min

**Caso guía**

Tienes un proveedor viejo con una API incompatible, quieres agregar logging sin modificar la clase original y necesitas una interfaz simple para un subsistema complejo. Son tres problemas estructurales distintos.

**Fundamento técnico y modelo mental**

**Definición formal.** Los patrones estructurales organizan composición entre objetos/clases. *Adapter* convierte una interfaz en otra esperada por el cliente. *Decorator* agrega responsabilidades dinámicamente envolviendo un objeto con la misma interfaz. *Facade* ofrece una interfaz simplificada sobre un subsistema complejo.

**Contrato / invariantes / reglas.** Adapter preserva la expectativa del cliente traduciendo llamadas. Decorator debe mantener el contrato de la interfaz decorada; el orden de decoradores puede importar. Facade no prohíbe acceso al subsistema, pero ofrece el camino simple. Ninguno debe ocultar errores o cambiar semántica sin documentarlo. Se usan para gestionar compatibilidad, composición y complejidad, no para añadir capas por defecto.

**Modelo mental.** Adapter es un adaptador de enchufe; Decorator es envolver un regalo con otra capa; Facade es la ventanilla única de un trámite complejo.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-12 && cd ~/academia-java/modulo-12
```

Crea `Notificador.java`:
```java
interface Notificador { void enviar(String guia); }

class ProveedorViejo {
    void enviarTexto(String texto) { System.out.println("viejo:" + texto); }
}

class AdaptadorProveedor implements Notificador { // Adapter
    private final ProveedorViejo proveedor = new ProveedorViejo();
    public void enviar(String guia) { proveedor.enviarTexto("GUIA:" + guia); }
}

class NotificadorLogging implements Notificador { // Decorator
    private final Notificador interno;
    NotificadorLogging(Notificador interno) { this.interno = interno; }
    public void enviar(String guia) {
        System.out.println("log:antes");
        interno.enviar(guia);
        System.out.println("log:despues");
    }
}

public class DemoEstructural {
    public static void main(String[] args) {
        Notificador n = new NotificadorLogging(new AdaptadorProveedor());
        n.enviar("G-1");
    }
}
```

**Desglose del código**

- `AdaptadorProveedor` traduce la interfaz esperada a la API vieja.
- `NotificadorLogging` envuelve cualquier `Notificador` y agrega comportamiento.
- El cliente solo ve `Notificador`.
- Componer adaptador + decorador evita modificar código existente.

**Ejecución y salida real**

```bash
javac Notificador.java ProveedorViejo.java AdaptadorProveedor.java NotificadorLogging.java DemoEstructural.java
java DemoEstructural
```

```text
log:antes
viejo:GUIA:G-1
log:despues
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Decorador cambia el contrato | Añadió comportamiento incompatible | Mantén la semántica de la interfaz |
| Facade se vuelve “Dios” | Metiste demasiada lógica | Mantén la facade delgada |
| Capas innecesarias | Patrón por moda | Usa la solución más simple que funcione |

**Verificación rápida**

Quita el decorador y confirma que la funcionalidad base sigue funcionando; agrega otro decorador y verifica el orden.

## Cierre del módulo

Los patrones son vocabulario de diseño: Builder, Factory, Strategy, Abstract Factory, Prototype, Adapter, Decorator y Facade resuelven problemas concretos. El criterio profesional es saber cuándo no usarlos. En el siguiente módulo aplicarás este criterio a diseño de sistemas.
