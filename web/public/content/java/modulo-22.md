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

**Caso guía**

Devuelves una lista interna desde un objeto de dominio. El llamador la modifica y corrompe el estado interno. O haces `clone` superficial y dos objetos quedan compartiendo la misma lista mutable.

**Fundamento técnico y modelo mental**

**Definición formal.** Una *copia superficial* copia referencias de campos; los objetos referenciados se comparten. Una *copia profunda* copia recursivamente el grafo de objetos según una política. Una *copia defensiva* copia datos mutables al entrar o salir de un límite para preservar invariantes. `Cloneable`/`clone()` es el mecanismo histórico de Java, con limitaciones de diseño conocidas.

**Contrato / invariantes / reglas.** Si un campo mutable se comparte, la mutación desde un lado afecta al otro. Los getters de colecciones internas deben devolver vistas no modificables o copias defensivas. `clone()` por defecto hace copia superficial; `Cloneable` es una interfaz marcador sin método `clone` público, y su uso suele ser más problemático que constructores de copia/fábricas. La inmutabilidad elimina gran parte del problema.

**Modelo mental.** Copia superficial es fotocopiar la lista de llaves: ambas copias abren las mismas puertas. Copia profunda es duplicar también las habitaciones.

**Implementación desde cero**

```java
import java.util.*;

final class Linea {
    private final String producto;
    private final int cantidad;
    Linea(String producto, int cantidad) { this.producto = producto; this.cantidad = cantidad; }
    String producto() { return producto; }
    int cantidad() { return cantidad; }
    @Override public String toString() { return producto + "x" + cantidad; }
}

final class Pedido {
    private final String id;
    private final List<Linea> lineas;

    Pedido(String id, List<Linea> lineas) {
        this.id = id;
        this.lineas = new ArrayList<>(lineas); // copia defensiva de entrada
    }

    public String id() { return id; }
    public List<Linea> lineas() { return List.copyOf(lineas); } // copia/vista defensiva de salida

    public Pedido conLinea(Linea linea) {
        List<Linea> nuevas = new ArrayList<>(lineas);
        nuevas.add(linea);
        return new Pedido(id, nuevas);
    }
}

public class DemoCopia {
    public static void main(String[] args) {
        List<Linea> base = new ArrayList<>();
        base.add(new Linea("A", 1));
        Pedido p = new Pedido("P-1", base);
        base.add(new Linea("B", 2)); // no afecta al pedido
        System.out.println(p.lineas().size());
        Pedido p2 = p.conLinea(new Linea("C", 3));
        System.out.println(p.lineas().size());
        System.out.println(p2.lineas().size());
    }
}
```

**Desglose del código**

- El constructor copia la lista de entrada.
- `lineas()` devuelve `List.copyOf`, evitando mutación externa.
- `Linea` es inmutable; simplifica la copia profunda.
- `conLinea` crea un nuevo `Pedido` (estilo inmutable).

**Ejecución y salida real**

```bash
javac DemoCopia.java
java DemoCopia
```

```text
1
1
2
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Estado interno mutado desde afuera | Getter devuelve colección mutable interna | Devuelve copia o vista inmodificable |
| Copia “independiente” cambia con original | Copia superficial de objetos mutables | Copia profunda o haz objetos inmutables |
| `clone()` complejo/frágil | Diseño de `Cloneable` | Prefiere constructor de copia/factory |

**Verificación rápida**

Intenta `p.lineas().add(...)`; debe lanzar `UnsupportedOperationException`.

### Tema 2: Enums de dominio: estado, código y comportamiento · Intermedio · 45 min

**Caso guía**

Modelas estados de pedido como strings o enteros. Aparece “ENVIADOX”, alguien reordena constantes y un `ordinal()` guardado en BD cambia de significado.

**Fundamento técnico y modelo mental**

**Definición formal.** Un `enum` en Java es un tipo de referencia que define un conjunto cerrado de constantes. Cada constante es una instancia única de ese enum. Los enums pueden tener campos, constructores, métodos y comportamiento por constante.

**Contrato / invariantes / reglas.** `ordinal()` es la posición de declaración; es frágil para persistencia o protocolos. Usa un código estable (`String`/`int` de dominio) si necesitas persistir. `name()` es estable mientras no renombres la constante, pero es un identificador de código. `valueOf` lanza `IllegalArgumentException` si no existe. Los enums son singletons por constante dentro del ClassLoader.

**Modelo mental.** Un enum es un catálogo cerrado: no “cualquier string”, solo estas piezas válidas, cada una con identidad y comportamiento.

**Implementación desde cero**

```java
public class DemoEnum {
    enum EstadoPedido {
        CREADO("CRE", false),
        ENVIADO("ENV", true),
        ENTREGADO("ENT", true);

        private final String codigo;
        private final boolean notificar;
        EstadoPedido(String codigo, boolean notificar) {
            this.codigo = codigo; this.notificar = notificar;
        }
        public String codigo() { return codigo; }
        public boolean notificar() { return notificar; }

        static EstadoPedido desdeCodigo(String codigo) {
            for (EstadoPedido e : values()) if (e.codigo.equals(codigo)) return e;
            throw new IllegalArgumentException("codigo desconocido: " + codigo);
        }
    }

    public static void main(String[] args) {
        EstadoPedido e = EstadoPedido.ENVIADO;
        System.out.println(e.codigo());
        System.out.println(e.notificar());
        System.out.println(EstadoPedido.desdeCodigo("ENT"));
    }
}
```

**Desglose del código**

- El enum define un conjunto cerrado de estados.
- `codigo` es estable para persistencia/protocolo.
- `notificar` muestra comportamiento/datos asociados.
- `desdeCodigo` evita depender de `ordinal()`.

**Ejecución y salida real**

```bash
javac DemoEnum.java
java DemoEnum
```

```text
ENV
true
ENTREGADO
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Datos corruptos tras reordenar enum | Persististe `ordinal()` | Persiste código estable |
| `IllegalArgumentException` en `valueOf` | String inválido | Valida y mapea con método controlado |
| Enum gigante con lógica mezclada | Responsabilidades excesivas | Divide por dominio o usa estrategia |

**Verificación rápida**

Reordena constantes en un experimento mental: `ordinal()` cambia, `codigo()` no.

### Tema 3: Clases anidadas, this$0 y la referencia que retiene · Avanzado · 45 min

**Caso guía**

Creas una clase interna para un iterador/handler. Años después descubres que instancias internas mantienen vivo al objeto exterior, impidiendo GC. El problema es `this$0`.

**Fundamento técnico y modelo mental**

**Definición formal.** Java tiene cuatro tipos de clases anidadas: *static nested class*, *inner class* (no static), *local class* y *anonymous class*. Una inner class no estática mantiene una referencia implícita a la instancia externa (`this$0`). Una static nested class no la mantiene.

**Contrato / invariantes / reglas.** Usa inner class solo cuando la instancia interna necesita acceso al estado de la instancia externa. Si no lo necesita, usa `static nested class` para evitar retención accidental. Las clases locales/anónimas capturan variables efectivamente finales. `javap -private` muestra el campo sintético `this$0`. En callbacks/listeners de larga vida, una inner class puede generar fugas de memoria.

**Modelo mental.** Una inner class es un llavero atado con cadena a la mochila exterior; una static nested class es un llavero separado que solo vive en el mismo compartimento lógico.

**Implementación desde cero**

```java
public class Externa {
    private final String id = "EXT-1";

    class Interna {
        String ver() { return id; } // captura Externa.this
    }

    static class AnidadaEstatica {
        String tipo() { return "anidada"; }
    }

    public static void main(String[] args) {
        Externa e = new Externa();
        Interna i = e.new Interna();
        System.out.println(i.ver());
        System.out.println(new AnidadaEstatica().tipo());
    }
}
```

Inspección:

```bash
javac Externa.java
javap -private 'Externa$Interna'
```

**Desglose del código**

- `Interna` accede a `id` de la instancia externa: requiere `Externa.this`.
- `AnidadaEstatica` no captura instancia externa.
- `javap -private` revela el campo sintético `final Externa this$0;` en la inner class.
- Prefiere `static nested class` por defecto; usa inner solo si necesitas el vínculo.

**Ejecución y salida real**

```bash
javac Externa.java
java Externa
```

```text
EXT-1
anidada
```

`javap -private 'Externa$Interna'` debe mostrar `final Externa this$0;`.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Fuga de memoria/objeto no GC | Inner class retiene `this$0` | Usa `static nested class` o desacopla |
| No puedes instanciar inner class | Falta instancia externa | Usa `externa.new Interna()` o hazla static |
| Captura inesperada | Clase anónima/local captura estado | Minimiza capturas y controla ciclo de vida |

**Verificación rápida**

```bash
javac Externa.java && javap -private 'Externa$Interna' | grep this
```

Debe aparecer `this$0`.

## Cierre del módulo

Los bugs de objetos suelen ser de semántica, no de sintaxis: copias que comparten estado, estados modelados como strings/ordinales, y clases internas que retienen más de lo esperado. Con estas bases, cierras el track Java con criterio de diseño y compatibilidad.
