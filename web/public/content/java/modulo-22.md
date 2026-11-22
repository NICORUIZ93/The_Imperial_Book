# Módulo 22: El objeto por dentro: copia, enums y tipos anidados

Este módulo cierra el track con detalles de diseño de objetos que evitan bugs sutiles: copiar sin compartir estado accidentalmente, modelar estados con enums ricos y entender el costo oculto de clases internas.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Distinguir copia superficial, profunda y defensiva |
| 2 | Modelar estados/dominios con enums y evitar ordinales frágiles |
| 3 | Elegir entre clases anidadas, internas, locales y anónimas |

## Aprende construyendo

### Tema 1: Copia defensiva, copia superficial y clone · Intermedio · 40 min

**Caso guía**: expones lista interna de un objeto y el llamador la modifica, rompiendo invariantes.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Copia defensiva | Copiar objetos mutables al entrar/salir de una API. | Proteger invariantes. | Copiar en constructor/getter cuando hay mutables. | Exponer `List` interna. |
| Copia superficial | Copia solo el primer nivel; internos mutables se comparten. | Barata. | Usar solo si internos inmutables. | Alias accidental. |
| Copia profunda | Copia recursiva de mutables. | Aislamiento real. | Definir hasta dónde copiar. | Olvidar grafo/ciclos. |
| `clone` | Mecanismo histórico de Java; frágil (`Cloneable`, shallow por defecto). | Raro en código moderno. | Preferir copy constructor/factory. | Confiar en `clone()` sin implementar bien. |

**Implementación desde cero** (`mkdir -p ~/academia-java/modulo-22 && cd ~/academia-java/modulo-22`)
```java
import java.util.*;
class Pedido {
  private final List<String> items;
  Pedido(List<String> items){ this.items = new ArrayList<>(items); } // defensiva entrada
  public List<String> items(){ return List.copyOf(items); } // defensiva salida
  public void add(String i){ items.add(i); }
}
public class DemoCopia {
  public static void main(String[] args) {
    List<String> base = new ArrayList<>(List.of("A"));
    Pedido p = new Pedido(base); base.add("B"); // no afecta
    System.out.println(p.items());
    try { p.items().add("X"); } catch(Exception e){ System.out.println("inmutable"); }
  }
}
```
**Ejecución real**: `[A]`, `inmutable`.

### Tema 2: Enums de dominio: estado, código y comportamiento · Intermedio · 45 min

**Caso guía**: estados de guía con reglas asociadas.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `enum` | Tipo con conjunto cerrado de constantes. | Modelar estados/categorías. | Usar cuando el conjunto es cerrado. | Usar strings mágicos. |
| Campos/métodos en enum | Enum puede tener estado y comportamiento. | Asociar código/regla a estado. | Mantener inmutables. | Mutar estado global en enum. |
| `valueOf`/`values` | Conversión y enumeración. | Parsing/iteración. | Manejar `IllegalArgumentException`. | `valueOf` sin validar input. |
| Patrón strategy con enum | Cada constante implementa comportamiento. | Eliminar switch repetidos. | Cuando comportamiento varía por constante. | Enum gigante con demasiada lógica. |

**Implementación desde cero**
```java
enum EstadoGuia {
  CREADA("C") { public boolean puedeEnviar(){ return true; } },
  ENVIADA("E") { public boolean puedeEnviar(){ return false; } };
  final String codigo;
  EstadoGuia(String codigo){ this.codigo=codigo; }
  public abstract boolean puedeEnviar();
}
public class DemoEnum {
  public static void main(String[] args) {
    System.out.println(EstadoGuia.CREADA.puedeEnviar());
    System.out.println(EstadoGuia.valueOf("ENVIADA").codigo);
  }
}
```
**Ejecución real**: `true`, `E`.

### Tema 3: Clases anidadas, this$0 y la referencia que retiene · Avanzado · 45 min

**Caso guía**: inner class captura referencia al outer y provoca retención de memoria inesperada.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Clase anidada estática | `static nested class`, no captura outer. | Agrupar tipos sin retener outer. | Preferir cuando no necesita instancia outer. | Usar inner sin necesidad. |
| Inner class (no estática) | Captura `this$0` (referencia al outer). | Acceder naturalmente a estado outer. | Cuidado con ciclo de vida. | Fuga por callback/listener. |
| `this$0` | Campo sintético al outer. | Implementación interna. | Entender retención en profiling. | No ver por qué outer no se GC. |
| Clases locales/anónimas | Definidas en método/expresión; capturan variables efectivamente final. | Callbacks pequeños. | Mantener pequeñas. | Código ilegible/anidado profundo. |

**Implementación desde cero**
```java
class Outer {
  private final byte[] big = new byte[1024*1024];
  class Inner { int size(){ return big.length; } } // captura this$0
  static class Nested { int uno(){ return 1; } }   // no captura
}
public class DemoNested {
  public static void main(String[] args) {
    Outer o = new Outer();
    Outer.Inner i = o.new Inner();
    Outer.Nested n = new Outer.Nested();
    System.out.println(i.size());
    System.out.println(n.uno());
  }
}
```
**Ejecución real**: `1048576`, `1`. **Verificación**: en heap dump verías `this$0` en inner; nested no lo tiene.


## Cierre del módulo

Los bugs de objetos suelen ser de semántica, no de sintaxis: copias que comparten estado, estados modelados como strings/ordinales, y clases internas que retienen más de lo esperado. Con estas bases, cierras el track Java con criterio de diseño y compatibilidad.
