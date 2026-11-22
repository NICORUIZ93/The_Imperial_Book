# Módulo 7: Sealed classes y pattern matching

**Prerrequisito:** `record` se enseña en [M1 T5](/curso/java/1); este módulo lo combina con jerarquías `sealed` y patrones.


## Aprende construyendo


### Tema 1: sealed — jerarquías cerradas y exhaustividad · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por sealed — jerarquías cerradas y exhaustividad con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender sealed — jerarquías cerradas y exhaustividad te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en sealed — jerarquías cerradas y exhaustividad como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que sealed — jerarquías cerradas y exhaustividad resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| sealed — jerarquías cerradas y exhaustividad se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar sealed — jerarquías cerradas y exhaustividad | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses sealed — jerarquías cerradas y exhaustividad por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: sealed — jerarquías cerradas y exhaustividad funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- sealed — jerarquías cerradas y exhaustividad existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve sealed — jerarquías cerradas y exhaustividad en tu contexto?
2. ¿Cómo sabrías que sealed — jerarquías cerradas y exhaustividad no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar sealed — jerarquías cerradas y exhaustividad?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
sealed interface EstadoEntrega permits Creada, EnRuta, Entregada {}
record Creada() implements EstadoEntrega {}
record EnRuta(String zona) implements EstadoEntrega {}
record Entregada(String receptor) implements EstadoEntrega {}

public class EstadoEntregaDemo {
    public static void main(String[] args) {
        EstadoEntrega estado = new EnRuta("Norte");
        System.out.println(estado);
    }
}
```

```bash
javac -d out src/EstadoEntrega.java
java -cp out EstadoEntregaDemo
```

```bash
javac -d out src/EstadoEntrega.java
java -cp out EstadoEntregaDemo
```

```bash
javac -d out src/EstadoEntrega.java
```

</details>

### Tema 2: Pattern matching exhaustivo y para instanceof · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por pattern matching exhaustivo y para instanceof con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender pattern matching exhaustivo y para instanceof te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en pattern matching exhaustivo y para instanceof como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que pattern matching exhaustivo y para instanceof resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Pattern matching exhaustivo y para instanceof se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Pattern matching exhaustivo y para instanceof | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses pattern matching exhaustivo y para instanceof por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: pattern matching exhaustivo y para instanceof funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Pattern matching exhaustivo y para instanceof existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve pattern matching exhaustivo y para instanceof en tu contexto?
2. ¿Cómo sabrías que pattern matching exhaustivo y para instanceof no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar pattern matching exhaustivo y para instanceof?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
static boolean sePuedeReprogramar(EstadoEntrega e) {
    return switch (e) {
        case Creada c -> true;
        case EnRuta r -> true;
        case Entregada x -> false;
    };
}
public static void main(String[] args) {
    System.out.println(sePuedeReprogramar(new EnRuta("Norte")));
}
```

```bash
javac -d out src/EstadoEntrega.java src/Reprogramar.java
java -cp out Reprogramar
```

```bash
javac -d out src/EstadoEntrega.java src/Reprogramar.java
java -cp out Reprogramar
```

```bash
javac -d out src/EstadoEntrega.java src/Reprogramar.java
java -cp out Reprogramar
```

</details>

### Tema 3: Unnamed variables y patterns (_, Java 22) · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por unnamed variables y patterns (_, java 22) con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender unnamed variables y patterns (_, java 22) te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en unnamed variables y patterns (_, java 22) como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que unnamed variables y patterns (_, java 22) resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Unnamed variables y patterns (_, Java 22) se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Unnamed variables y patterns (_, Java 22) | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses unnamed variables y patterns (_, java 22) por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: unnamed variables y patterns (_, java 22) funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Unnamed variables y patterns (_, Java 22) existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve unnamed variables y patterns (_, java 22) en tu contexto?
2. ¿Cómo sabrías que unnamed variables y patterns (_, java 22) no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar unnamed variables y patterns (_, java 22)?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
record Dimensiones(int x, int y, int z) {}
record Paquete(Dimensiones dimensiones, String destino) {}
public class ResumenPaquete {
    static String resumen(Object valor) {
        return switch (valor) {
            case Paquete(Dimensiones _, String destino) -> "Destino: " + destino;
            default -> "No es un paquete";
        };
    }
    public static void main(String[] args) {
        System.out.println(resumen(new Paquete(new Dimensiones(1, 2, 3), "Norte")));
    }
}
```

```bash
javac -d out src/ResumenPaquete.java
java -cp out ResumenPaquete
```

```bash
javac -d out src/Convertir.java
java -cp out Convertir abc
```

```bash
javac -d out src/Consulta.java
java -cp out Consulta
```

</details>
