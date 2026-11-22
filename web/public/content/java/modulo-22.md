# Módulo 22: El objeto por dentro: copia, enums y tipos anidados

Este módulo cierra el track con detalles de diseño de objetos que evitan bugs sutiles: copiar sin compartir estado accidentalmente, modelar estados con enums ricos y entender el costo oculto de clases internas.

**Entorno de referencia verificado (2026-05-22):** JDK 27.

## Aprende construyendo

### Tema 1: Copia defensiva, copia superficial y clone · Intermedio · 40 min

Expones una lista interna y el llamador la modifica, rompiendo invariantes.

#### Copia defensiva

**Definición formal.** Técnica de copiar objetos mutables al entrar o salir de una API para proteger invariantes internos.

**Para qué sirve.** Evita aliasing accidental.

**Cuándo usarla.** Cuando el campo interno es mutable (List, Date, arrays, objetos mutables).

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j22-t1 && cd /tmp/j22-t1
cat > DemoDef.java << 'JAVA'
import java.util.*;
class Pedido {
  private final List<String> items;
  Pedido(List<String> items){ this.items = new ArrayList<>(items); }
  public List<String> items(){ return List.copyOf(items); }
}
public class DemoDef { public static void main(String[] args){ List<String> base=new ArrayList<>(List.of("A")); Pedido p=new Pedido(base); base.add("B"); System.out.println(p.items()); try { p.items().add("X"); } catch(Exception e){ System.out.println("inmutable"); } } }
JAVA
javac DemoDef.java && java DemoDef
```

**Caso de uso real.** Entidad que no debe exponer su lista mutable.

**Error común.** Retornar la colección interna. Corrección: copia defensiva o vista inmutable.

**Verificación (2026-05-22).** Salida: `[A]`, `inmutable`.

#### Copia superficial vs profunda

**Definición formal.** Superficial copia el primer nivel; profunda copia también objetos mutables internos para aislar estado.

**Para qué sirve.** Elegir el nivel de aislamiento correcto.

**Cuándo usarla.** Superficial si internos inmutables; profunda si hay mutables anidados.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j22-t1
cat > DemoDeep.java << 'JAVA'
import java.util.*;
public class DemoDeep {
  public static void main(String[] args) {
    List<String> inner = new ArrayList<>(List.of("x"));
    List<List<String>> a = new ArrayList<>(); a.add(inner);
    List<List<String>> shallow = new ArrayList<>(a);
    List<List<String>> deep = new ArrayList<>(); deep.add(new ArrayList<>(a.get(0)));
    inner.add("y");
    System.out.println(shallow.get(0).size()+" "+deep.get(0).size());
  }
}
JAVA
javac DemoDeep.java && java DemoDeep
```

**Caso de uso real.** Clonar plantilla con listas anidadas.

**Error común.** Creer que `new ArrayList<>(lista)` es deep copy. Corrección: copiar elementos mutables.

**Verificación (2026-05-22).** Salida: `2 1`.

#### `clone`

**Definición formal.** Mecanismo histórico de Java (`Cloneable`, `Object.clone`) con contrato frágil y copia superficial por defecto.

**Para qué sirve.** Compatibilidad legacy; en código moderno suele evitarse.

**Cuándo usarlo.** Casi nunca en diseño nuevo; prefiere copy constructor/factory.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j22-t1
cat > DemoClone.java << 'JAVA'
class A implements Cloneable { int x=1; public A copia(){ try { return (A) super.clone(); } catch(CloneNotSupportedException e){ throw new RuntimeException(e); } } }
public class DemoClone { public static void main(String[] args){ A a=new A(); A b=a.copia(); b.x=2; System.out.println(a.x+" "+b.x); } }
JAVA
javac DemoClone.java && java DemoClone
```

**Caso de uso real.** Código legacy que ya depende de Cloneable.

**Error común.** Asumir deep copy automática. Corrección: implementar copia explícita.

**Verificación (2026-05-22).** Salida: `1 2`.

### Tema 2: Enums de dominio: estado, código y comportamiento · Intermedio · 45 min

Modelar estados de guía con reglas asociadas.

#### `enum`

**Definición formal.** Tipo Java que representa un conjunto cerrado de constantes con identidad propia.

**Para qué sirve.** Modelar estados/categorías cerradas con seguridad de tipos.

**Cuándo usarlo.** Conjunto conocido en compile time. No para valores abiertos arbitrarios del usuario.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j22-t2 && cd /tmp/j22-t2
cat > DemoEnum.java << 'JAVA'
enum Estado { CREADA, ENVIADA }
public class DemoEnum { public static void main(String[] args){ System.out.println(Estado.CREADA.name()); } }
JAVA
javac DemoEnum.java && java DemoEnum
```

**Caso de uso real.** Estado de pedido.

**Error común.** Usar strings mágicos. Corrección: enum.

**Verificación (2026-05-22).** Salida: `CREADA`.

#### Campos, métodos y strategy con enum

**Definición formal.** Un enum puede tener campos, constructor, métodos y comportamiento por constante (strategy).

**Para qué sirve.** Asociar datos/reglas al estado.

**Cuándo usarlo.** Cuando cada constante tiene comportamiento estable.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j22-t2
cat > DemoEnumRich.java << 'JAVA'
enum EstadoGuia {
  CREADA("C") { public boolean puedeEnviar(){ return true; } },
  ENVIADA("E") { public boolean puedeEnviar(){ return false; } };
  final String codigo;
  EstadoGuia(String c){ codigo=c; }
  public abstract boolean puedeEnviar();
}
public class DemoEnumRich { public static void main(String[] args){ System.out.println(EstadoGuia.CREADA.puedeEnviar()); System.out.println(EstadoGuia.ENVIADA.codigo); } }
JAVA
javac DemoEnumRich.java && java DemoEnumRich
```

**Caso de uso real.** Reglas de transición por estado.

**Error común.** Enum gigante con demasiada lógica. Corrección: extraer comportamiento si crece.

**Verificación (2026-05-22).** Salida: `true`, `E`.

#### `valueOf`, `values` y ordinal

**Definición formal.** `valueOf` convierte nombre a constante, `values` lista constantes, `ordinal` devuelve posición de declaración.

**Para qué sirve.** Parsing e iteración.

**Cuándo usarlo.** `valueOf` con validación; evita persistir `ordinal`.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j22-t2
cat > DemoValueOf.java << 'JAVA'
enum E { A, B }
public class DemoValueOf { public static void main(String[] args){ try { E.valueOf("X"); } catch(Exception e){ System.out.println("bad"); } System.out.println(E.values().length); } }
JAVA
javac DemoValueOf.java && java DemoValueOf
```

**Caso de uso real.** Parsear estado desde input.

**Error común.** Persistir `ordinal`. Síntoma: dato corrupto si cambia el orden. Corrección: persistir nombre/código estable.

**Verificación (2026-05-22).** Salida: `bad`, `2`.

### Tema 3: Clases anidadas, this$0 y la referencia que retiene · Avanzado · 45 min

Una inner class captura outer y puede retener memoria.

#### Clases anidadas estáticas vs inner class

**Definición formal.** Una static nested class no captura instancia outer; una inner class no estática sí la captura (`this$0`).

**Para qué sirve.** Elegir estructura sin retención accidental.

**Cuándo usarlo.** Preferir static nested cuando no necesitas outer.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j22-t3 && cd /tmp/j22-t3
cat > DemoNested.java << 'JAVA'
class Outer {
  private final byte[] big = new byte[1024*1024];
  class Inner { int size(){ return big.length; } }
  static class Nested { int uno(){ return 1; } }
}
public class DemoNested { public static void main(String[] args){ Outer o=new Outer(); System.out.println(o.new Inner().size()); System.out.println(new Outer.Nested().uno()); } }
JAVA
javac DemoNested.java && java DemoNested
```

**Caso de uso real.** Builder static nested, listener inner (con cuidado).

**Error común.** Inner class en callback de larga vida. Síntoma: fuga de memoria por `this$0`. Corrección: static nested + referencia débil o limpiar listener.

**Verificación (2026-05-22).** Salida: `1048576`, `1`.

#### Clases locales y anónimas

**Definición formal.** Clases definidas dentro de un método (local) o como expresión sin nombre (anónima); capturan variables efectivamente finales.

**Para qué sirve.** Implementaciones pequeñas y locales.

**Cuándo usarlo.** Cuando la clase es pequeña y no merece archivo propio. Prefiere lambda si es una interfaz funcional.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j22-t3
cat > DemoAnon.java << 'JAVA'
public class DemoAnon { public static void main(String[] args){ Runnable r = new Runnable(){ public void run(){ System.out.println("hi"); } }; r.run(); } }
JAVA
javac DemoAnon.java && java DemoAnon
```

**Caso de uso real.** Callback puntual en API legacy.

**Error común.** Anidar demasiado. Corrección: extraer clase o usar lambda.

**Verificación (2026-05-22).** Salida: `hi`.

## Cierre del módulo

Los bugs de objetos suelen ser semánticos: copias que comparten estado, enums mal modelados y clases internas que retienen más de lo esperado. Con estas bases cierras el track Java con criterio de diseño y compatibilidad.
