# Módulo 4: Streams y programación funcional


## Aprende construyendo


### Tema 1: Stream API — map, filter, reduce, collect · Básico · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por stream api — map, filter, reduce, collect con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender stream api — map, filter, reduce, collect te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en stream api — map, filter, reduce, collect como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que stream api — map, filter, reduce, collect resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Stream API — map, filter, reduce, collect se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Stream API — map, filter, reduce, collect | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses stream api — map, filter, reduce, collect por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: stream api — map, filter, reduce, collect funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Stream API — map, filter, reduce, collect existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve stream api — map, filter, reduce, collect en tu contexto?
2. ¿Cómo sabrías que stream api — map, filter, reduce, collect no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar stream api — map, filter, reduce, collect?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
javac -d out src/Reporte.java
java -cp out Reporte
```

```java
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class Reporte {
    record Envio(String guia, boolean activo) {}

    public static void main(String[] args) {
        var envios = List.of(new Envio("RT-1", true), new Envio("RT-2", false));
        var activas = envios.stream()
            .filter(Envio::activo)
            .map(Envio::guia)
            .toList();
        System.out.println(activas);
        var editables = envios.stream()
            .filter(Envio::activo)
            .map(Envio::guia)
            .collect(Collectors.toCollection(ArrayList::new));
        editables.add("RT-3");
        System.out.println(editables);
    }
}
```

```java
import java.util.List;

public class Reporte {
    record Envio(String guia, long centavos) {}

    public static void main(String[] args) {
        var envios = List.of(new Envio("RT-1", 250), new Envio("RT-2", 300));
        long total = envios.stream()
            .map(Envio::centavos)
            .reduce(0L, Long::sum);
        long totalPrimitivo = envios.stream()
            .mapToLong(Envio::centavos)
            .sum();
        System.out.println("totalCentavos=" + total);
        System.out.println("coinciden=" + (total == totalPrimitivo));
    }
}
```

```java
import java.util.List;
import java.util.stream.Stream;

public class UnaVez {
    public static void main(String[] args) {
        Stream<String> guias = List.of("RT-1", "RT-2").stream();
        System.out.println(guias.count());
        System.out.println(guias.toList());
    }
}
```

</details>

### Tema 2: Optional — evitar null explícitamente · Básico · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por optional — evitar null explícitamente con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender optional — evitar null explícitamente te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en optional — evitar null explícitamente como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que optional — evitar null explícitamente resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Optional — evitar null explícitamente se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Optional — evitar null explícitamente | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses optional — evitar null explícitamente por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: optional — evitar null explícitamente funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Optional — evitar null explícitamente existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve optional — evitar null explícitamente en tu contexto?
2. ¿Cómo sabrías que optional — evitar null explícitamente no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar optional — evitar null explícitamente?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
javac -d out src/Buscar.java
java -cp out Buscar RT-9
```

```java
import java.util.List;
import java.util.Optional;

public class Buscar {
    public static void main(String[] args) {
        Optional<String> resultado = List.of("RT-1", "RT-2").stream()
            .filter(guia -> guia.equals(args[0]))
            .findFirst();
        System.out.println(resultado);
    }
}
```

```java
import java.util.List;

public class Buscar {
    public static void main(String[] args) {
        String destino = List.of("RT-1", "RT-2").stream()
            .filter(guia -> guia.equals(args[0]))
            .findFirst()
            .map(guia -> "Encontrada: " + guia)
            .orElse("Guía no encontrada");
        System.out.println(destino);
    }
}
```

```bash
javac -d out src/Buscar.java
java -cp out Buscar RT-9
```

```java
import java.util.Optional;

public class OptionalSeguro {
    static Optional<String> normalizar(String guia) {
        return Optional.ofNullable(guia).map(String::trim);
    }

    public static void main(String[] args) {
        System.out.println(normalizar(null));
        System.out.println(normalizar(" RT-8 "));
    }
}
```

</details>

### Tema 3: Stream Gatherers (Java 24) · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por stream gatherers (java 24) con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender stream gatherers (java 24) te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en stream gatherers (java 24) como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que stream gatherers (java 24) resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Stream Gatherers (Java 24) se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Stream Gatherers (Java 24) | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses stream gatherers (java 24) por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: stream gatherers (java 24) funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Stream Gatherers (Java 24) existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve stream gatherers (java 24) en tu contexto?
2. ¿Cómo sabrías que stream gatherers (java 24) no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar stream gatherers (java 24)?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
import java.util.List;
import java.util.stream.Gatherers;

public class Rachas {
    public static void main(String[] args) {
        List<Boolean> atrasadas = List.of(true, true, true, false, true);
        var ventanas = atrasadas.stream()
            .gather(Gatherers.windowSliding(3))
            .filter(ventana -> ventana.stream().allMatch(Boolean::booleanValue))
            .toList();
        System.out.println(ventanas);
    }
}
```

```java
var bloques = atrasadas.stream()
    .gather(Gatherers.windowFixed(2))
    .toList();
System.out.println(bloques);
```

```java
import java.util.List;
import java.util.stream.Gatherers;

public class Rachas {
    static List<List<Boolean>> detectar(List<Boolean> valores) {
        return valores.stream()
            .gather(Gatherers.windowSliding(3))
            .filter(ventana -> ventana.size() == 3
                && ventana.stream().allMatch(Boolean::booleanValue))
            .toList();
    }

    public static void main(String[] args) {
        List<Boolean> consecutivas = List.of(true, true, true, false, true);
        List<Boolean> separadas = List.of(true, false, true, false, true);
        List<Boolean> insuficientes = List.of(true, true);
        System.out.println("individuales=" + separadas.stream()
            .filter(Boolean::booleanValue).count());
        System.out.println("separadas=" + detectar(separadas));
        System.out.println("consecutivas=" + detectar(consecutivas));
        System.out.println("insuficientes=" + detectar(insuficientes));
    }
}
```

```bash
javac -d out src/Rachas.java
java -cp out Rachas
```

</details>

### Tema 4: Streams paralelos y referencias a métodos · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por streams paralelos y referencias a métodos con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender streams paralelos y referencias a métodos te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en streams paralelos y referencias a métodos como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que streams paralelos y referencias a métodos resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Streams paralelos y referencias a métodos se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Streams paralelos y referencias a métodos | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses streams paralelos y referencias a métodos por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: streams paralelos y referencias a métodos funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Streams paralelos y referencias a métodos existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve streams paralelos y referencias a métodos en tu contexto?
2. ¿Cómo sabrías que streams paralelos y referencias a métodos no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar streams paralelos y referencias a métodos?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
javac -d out src/Comparar.java
java -cp out Comparar
```

```java
import java.util.List;

public class Referencias {
    public static void main(String[] args) {
        List<String> guias = List.of("rt-1", "rt-2");
        guias.stream().map(String::toUpperCase).forEach(System.out::println);
    }
}
```

```java
import java.util.stream.LongStream;

public class Comparar {
    public static void main(String[] args) {
        long secuencial = LongStream.rangeClosed(1, 1_000_000).sum();
        long paralelo = LongStream.rangeClosed(1, 1_000_000).parallel().sum();
        System.out.println(secuencial);
        System.out.println(paralelo);
    }
}
```

```java
import java.util.List;

public class Orden {
    public static void main(String[] args) {
        List.of("RT-1", "RT-2", "RT-3").parallelStream()
            .map(String::toUpperCase)
            .forEachOrdered(System.out::println);
    }
}
```

</details>
