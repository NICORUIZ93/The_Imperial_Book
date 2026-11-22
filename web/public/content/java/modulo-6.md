# Módulo 6: I/O, NIO.2 y serialización


## Aprende construyendo


### Tema 1: NIO.2 — Path y Files · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por nio.2 — path y files con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender nio.2 — path y files te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en nio.2 — path y files como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que nio.2 — path y files resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| NIO.2 — Path y Files se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar NIO.2 — Path y Files | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses nio.2 — path y files por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: nio.2 — path y files funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- NIO.2 — Path y Files existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve nio.2 — path y files en tu contexto?
2. ¿Cómo sabrías que nio.2 — path y files no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar nio.2 — path y files?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class Archivos {
    public static void main(String[] args) throws IOException {
        Path comprobante = Path.of("datos", "RT-1.txt");
        Files.createDirectories(comprobante.getParent());
        Files.writeString(comprobante, "RT-1;ENTREGADO");
        System.out.println(Files.readString(comprobante));
    }
}
```

```bash
javac -d out src/Archivos.java
java -cp out Archivos
```

```java
import java.nio.file.Path;

public class ComprobanteSeguro {
    static Path resolver(Path base, String nombre) {
        Path raiz = base.toAbsolutePath().normalize();
        Path destino = raiz.resolve(nombre).normalize();
        if (!destino.startsWith(raiz)) {
            throw new IllegalArgumentException("Ruta fuera de comprobantes");
        }
        return destino;
    }

    public static void main(String[] args) {
        System.out.println(resolver(Path.of("comprobantes"), args[0]));
    }
}
```

```bash
javac -d out src/ComprobanteSeguro.java
java -cp out ComprobanteSeguro RT-1.txt
```

```java
try (var archivos = Files.list(Path.of("datos"))) {
    archivos.map(Path::getFileName).forEach(System.out::println);
}
```

```bash
javac -d out src/Listar.java
java -cp out Listar
```

</details>

### Tema 2: Serialización con Jackson · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por serialización con jackson con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender serialización con jackson te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en serialización con jackson como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que serialización con jackson resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Serialización con Jackson se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Serialización con Jackson | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses serialización con jackson por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: serialización con jackson funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Serialización con Jackson existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve serialización con jackson en tu contexto?
2. ¿Cómo sabrías que serialización con jackson no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar serialización con jackson?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>academia</groupId><artifactId>io-json</artifactId><version>1.0</version>
  <properties><maven.compiler.release>25</maven.compiler.release><project.build.sourceEncoding>UTF-8</project.build.sourceEncoding></properties>
  <dependencies><dependency><groupId>com.fasterxml.jackson.core</groupId><artifactId>jackson-databind</artifactId><version>2.22.4</version></dependency></dependencies>
  <build><plugins>
    <plugin><groupId>org.apache.maven.plugins</groupId><artifactId>maven-compiler-plugin</artifactId><version>3.16.0</version></plugin>
    <plugin><groupId>org.codehaus.mojo</groupId><artifactId>exec-maven-plugin</artifactId><version>3.6.4</version></plugin>
  </plugins></build>
</project>
```

```java
import com.fasterxml.jackson.databind.ObjectMapper;

public class EntregaJson {
    record Envio(String guia, String estado) {}

    public static void main(String[] args) throws Exception {
        var mapper = new ObjectMapper();
        String json = mapper.writeValueAsString(new Envio("RT-1", "EN_RUTA"));
        System.out.println(json);
        Envio recibido = mapper.readValue(json, Envio.class);
        System.out.println(recibido.guia() + " " + recibido.estado());
    }
}
```

```bash
mvn -q compile exec:java -Dexec.mainClass=EntregaJson
```

```java
try {
    mapper.readValue("{\"guia\":", Envio.class);
} catch (com.fasterxml.jackson.core.JsonProcessingException invalido) {
    System.out.println("JSON inválido");
}
```

```bash
mvn -q compile exec:java -Dexec.mainClass=EntregaJson
```

```java
mapper.configure(
    com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES,
    false);
```

</details>

### Tema 3: Archivos grandes y recursos del classpath · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por archivos grandes y recursos del classpath con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender archivos grandes y recursos del classpath te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en archivos grandes y recursos del classpath como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que archivos grandes y recursos del classpath resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Archivos grandes y recursos del classpath se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Archivos grandes y recursos del classpath | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses archivos grandes y recursos del classpath por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: archivos grandes y recursos del classpath funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Archivos grandes y recursos del classpath existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve archivos grandes y recursos del classpath en tu contexto?
2. ¿Cómo sabrías que archivos grandes y recursos del classpath no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar archivos grandes y recursos del classpath?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
import java.io.BufferedReader;
import java.nio.file.Files;
import java.nio.file.Path;

public class ContarLineas {
    public static void main(String[] args) throws Exception {
        long total = 0;
        try (BufferedReader lector = Files.newBufferedReader(Path.of(args[0]))) {
            while (lector.readLine() != null) total++;
        }
        System.out.println(total);
    }
}
```

```bash
javac -d out src/ContarLineas.java
java -cp out ContarLineas reporte.txt
```

```java
import java.io.InputStream;
import java.util.Properties;

public class ConfigClasspath {
    public static void main(String[] args) throws Exception {
        try (InputStream recurso =
                 ConfigClasspath.class.getResourceAsStream("/config.properties")) {
            if (recurso == null) throw new IllegalStateException("Falta config.properties");
            var propiedades = new Properties();
            propiedades.load(recurso);
            System.out.println(propiedades.getProperty("modo"));
        }
    }
}
```

```bash
mvn -q package
```

```java
import java.nio.file.Files;
import java.nio.file.Path;

public class ContarTodo {
    public static void main(String[] args) throws Exception {
        System.out.println(Files.readAllLines(Path.of(args[0])).size());
    }
}
```

```bash
javac -d out src/ContarTodo.java
java -cp out ContarTodo reporte.txt
```

</details>
