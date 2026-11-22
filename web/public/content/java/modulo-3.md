# Módulo 3: Excepciones y manejo de recursos


## Aprende construyendo


### Tema 1: Checked vs unchecked exceptions · Básico · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por checked vs unchecked exceptions con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender checked vs unchecked exceptions te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en checked vs unchecked exceptions como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que checked vs unchecked exceptions resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Checked vs unchecked exceptions se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Checked vs unchecked exceptions | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses checked vs unchecked exceptions por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: checked vs unchecked exceptions funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Checked vs unchecked exceptions existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve checked vs unchecked exceptions en tu contexto?
2. ¿Cómo sabrías que checked vs unchecked exceptions no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar checked vs unchecked exceptions?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class LeerConfig {
    static String leer(Path ruta) throws IOException {
        return Files.readString(ruta);
    }

    public static void main(String[] args) {
        try {
            System.out.println(leer(Path.of("config.properties")));
        } catch (IOException error) {
            System.err.println("No pude leer la configuración: " + error.getMessage());
            System.exit(1);
        }
    }
}
```

```bash
mkdir -p out
javac -d out src/LeerConfig.java
java -cp out LeerConfig
```

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class LeerYPropagar {
    static List<String> leer(Path ruta) throws IOException {
        return Files.readAllLines(ruta);
    }

    static int contarLineas(Path ruta) throws IOException {
        return leer(ruta).size();
    }

    public static void main(String[] args) {
        try {
            System.out.println(contarLineas(Path.of("config.properties")));
        } catch (IOException error) {
            System.err.println("No se pudo contar: " + error.getMessage());
            System.exit(1);
        }
    }
}
```

```text
modo=demo
capacidad=2
```

```bash
javac -d out src/LeerYPropagar.java
java -cp out LeerYPropagar
```

```java
import java.util.List;

public class IndiceSeguro {
    static String obtener(List<String> guias, int indice) {
        if (indice < 0 || indice >= guias.size()) {
            throw new IllegalArgumentException("Índice fuera de rango: " + indice);
        }
        return guias.get(indice);
    }

    public static void main(String[] args) {
        System.out.println(obtener(List.of("RT-1", "RT-2"), 1));
    }
}
```

</details>

### Tema 2: try-with-resources · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por try-with-resources con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender try-with-resources te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en try-with-resources como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que try-with-resources resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| try-with-resources se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar try-with-resources | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses try-with-resources por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: try-with-resources funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- try-with-resources existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve try-with-resources en tu contexto?
2. ¿Cómo sabrías que try-with-resources no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar try-with-resources?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class LeerLineas {
    public static void main(String[] args) throws IOException {
        try (BufferedReader lector = Files.newBufferedReader(Path.of("guias.txt"))) {
            String guia;
            while ((guia = lector.readLine()) != null) {
                System.out.println(guia);
            }
        }
    }
}
```

```text
RF-101
RF-102
```

```bash
javac -d out src/LeerLineas.java
java -cp out LeerLineas
```

```java
public class RecursoDemo {
    static class Aviso implements AutoCloseable {
        public void close() {
            System.out.println("recurso cerrado");
        }
    }

    public static void main(String[] args) {
        try (Aviso aviso = new Aviso()) {
            System.out.println("trabajo");
            throw new IllegalStateException("fallo de prueba");
        } catch (IllegalStateException error) {
            System.out.println("error atendido");
        }
    }
}
```

```bash
javac -d out src/RecursoDemo.java
java -cp out RecursoDemo
```

```java
public class OrdenDeCierre {
    static class Recurso implements AutoCloseable {
        private final String nombre;
        Recurso(String nombre) { this.nombre = nombre; }
        public void close() { System.out.println("cierro " + nombre); }
    }

    public static void main(String[] args) {
        try (Recurso archivo = new Recurso("archivo");
             Recurso lector = new Recurso("lector")) {
            System.out.println("leo");
        }
    }
}
```

</details>

### Tema 3: Excepciones personalizadas y no tragar excepciones · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por excepciones personalizadas y no tragar excepciones con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender excepciones personalizadas y no tragar excepciones te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en excepciones personalizadas y no tragar excepciones como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que excepciones personalizadas y no tragar excepciones resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Excepciones personalizadas y no tragar excepciones se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Excepciones personalizadas y no tragar excepciones | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses excepciones personalizadas y no tragar excepciones por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: excepciones personalizadas y no tragar excepciones funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Excepciones personalizadas y no tragar excepciones existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve excepciones personalizadas y no tragar excepciones en tu contexto?
2. ¿Cómo sabrías que excepciones personalizadas y no tragar excepciones no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar excepciones personalizadas y no tragar excepciones?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
public class Asignador {
    private final int capacidad;
    private int ocupadas;

    Asignador(int capacidad) {
        if (capacidad < 0) throw new IllegalArgumentException("Capacidad negativa");
        this.capacidad = capacidad;
    }

    void asignar(int cantidad) {
        if (cantidad <= 0) throw new IllegalArgumentException("Cantidad no positiva");
        int disponibles = capacidad - ocupadas;
        if (cantidad > disponibles) {
            throw new CapacidadInsuficienteException(cantidad, disponibles);
        }
        ocupadas += cantidad;
    }

    static class CapacidadInsuficienteException extends RuntimeException {
        private final int solicitadas;
        private final int disponibles;

        CapacidadInsuficienteException(int solicitadas, int disponibles) {
            super("Solicitadas " + solicitadas + ", disponibles " + disponibles);
            this.solicitadas = solicitadas;
            this.disponibles = disponibles;
        }

        int solicitadas() { return solicitadas; }
        int disponibles() { return disponibles; }
    }

    public static void main(String[] args) {
        new Asignador(2).asignar(3);
    }
}
```

```bash
javac -d out src/Asignador.java
java -cp out Asignador
```

```java
public static void main(String[] args) {
    try {
        new Asignador(2).asignar(3);
        System.out.println("Asignación completada");
    } catch (CapacidadInsuficienteException error) {
        System.err.println("Asignación rechazada: solicitadas="
            + error.solicitadas() + ", disponibles=" + error.disponibles());
        System.exit(2);
    }
}
```

```java
public static void main(String[] args) {
    try {
        new Asignador(2).asignar(3);
    } catch (CapacidadInsuficienteException error) {
        // vacío a propósito para observar el defecto
    }
    System.out.println("Proceso terminado sin explicar el rechazo");
}
```

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class CausaDemo {
    static class ConfiguracionNoDisponibleException extends RuntimeException {
        ConfiguracionNoDisponibleException(String mensaje, Throwable causa) {
            super(mensaje, causa);
        }
    }

    static String cargar(Path ruta) {
        try {
            return Files.readString(ruta);
        } catch (IOException error) {
            throw new ConfiguracionNoDisponibleException(
                "Configuración no disponible", error);
        }
    }

    public static void main(String[] args) {
        try {
            cargar(Path.of("config-ausente.properties"));
        } catch (ConfiguracionNoDisponibleException error) {
            System.err.println("tipo=" + error.getClass().getSimpleName());
            System.err.println("causa=" + error.getCause().getClass().getSimpleName());
            System.exit(1);
        }
    }
}
```

</details>

### Incremento del proyecto: leer guías y respetar capacidad

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por incremento del proyecto: leer guías y respetar capacidad con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender incremento del proyecto: leer guías y respetar capacidad te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en incremento del proyecto: leer guías y respetar capacidad como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que incremento del proyecto: leer guías y respetar capacidad resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Incremento del proyecto: leer guías y respetar capacidad se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Incremento del proyecto: leer guías y respetar capacidad | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses incremento del proyecto: leer guías y respetar capacidad por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: incremento del proyecto: leer guías y respetar capacidad funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Incremento del proyecto: leer guías y respetar capacidad existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve incremento del proyecto: leer guías y respetar capacidad en tu contexto?
2. ¿Cómo sabrías que incremento del proyecto: leer guías y respetar capacidad no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar incremento del proyecto: leer guías y respetar capacidad?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import modelo.Guia;

public class MotorSeguro {
    static int leerCapacidad(Path ruta) throws IOException {
        for (String linea : Files.readAllLines(ruta)) {
            if (linea.startsWith("capacidad=")) {
                return Integer.parseInt(linea.substring("capacidad=".length()).trim());
            }
        }
        throw new IllegalArgumentException("Falta capacidad");
    }

    static List<Guia> leerGuias(Path ruta) throws IOException {
        Map<String, Guia> unicas = new LinkedHashMap<>();
        try (BufferedReader lector = Files.newBufferedReader(ruta)) {
            String linea;
            while ((linea = lector.readLine()) != null) {
                String codigo = linea.trim();
                if (codigo.isEmpty()) {
                    throw new IllegalArgumentException("Código de guía vacío");
                }
                if (!unicas.containsKey(codigo)) {
                    unicas.put(codigo, new Guia(codigo));
                }
            }
        }
        return new ArrayList<>(unicas.values());
    }

    public static void main(String[] args) {
        try {
            int capacidad = leerCapacidad(Path.of("config.properties"));
            List<Guia> guias = leerGuias(Path.of("guias.txt"));
            Asignador asignador = new Asignador(capacidad);
            asignador.asignar(guias.size());
            System.out.println("asignables=" + guias.size());
        } catch (IOException error) {
            System.err.println("No se pudo leer la entrada: " + error.getMessage());
            System.exit(1);
        } catch (Asignador.CapacidadInsuficienteException error) {
            System.err.println("Capacidad insuficiente: solicitadas="
                + error.solicitadas() + ", disponibles=" + error.disponibles());
            System.exit(2);
        } catch (NumberFormatException error) {
            System.err.println("Capacidad no numérica");
            System.exit(3);
        } catch (IllegalArgumentException error) {
            System.err.println("Entrada inválida: " + error.getMessage());
            System.exit(3);
        }
    }
}
```

```bash
javac -d out src/modelo/Guia.java src/Asignador.java src/MotorSeguro.java
java -cp out MotorSeguro
echo $?
```

</details>
