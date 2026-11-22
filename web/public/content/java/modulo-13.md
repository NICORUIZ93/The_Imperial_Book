# Módulo 13: Proyecto integrador

Este módulo cierra la base de Java reuniendo lo aprendido: modelado con objetos/records, manejo de errores, concurrencia, tests y build reproducible. El objetivo no es “usar todo”, sino integrar piezas con límites claros y evidencia de que funcionan.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Diseñar una arquitectura por capas con responsabilidades claras |
| 2 | Configurar un build reproducible con wrapper y verificación |
| 3 | Integrar concurrencia, modelado de dominio y testing |

## Aprende construyendo

### Tema 1: Arquitectura por capas del proyecto integrador · Intermedio · 40 min

**Caso guía**

Vas a construir un mini procesador de guías. Si pones lectura de consola, reglas de negocio y persistencia en la misma clase, el primer cambio rompe todo. Necesitas separar responsabilidades.

**Fundamento técnico y modelo mental**

**Definición formal.** Una *arquitectura por capas* es una partición del sistema en niveles con responsabilidades definidas y dependencias controladas. Típicamente: dominio/modelo (reglas y tipos), aplicación/servicio (casos de uso), infraestructura (I/O, DB, APIs) e interfaz/entrada (CLI, HTTP).

**Contrato / invariantes / reglas.** Las dependencias deben apuntar hacia el núcleo de negocio o hacia abstracciones; el dominio no debería depender de detalles de infraestructura. Cada capa expone un contrato (tipos, interfaces, métodos) y oculta detalles internos. La regla de dependencia se verifica por revisión y por estructura de paquetes/módulos. Una capa no es un “paquete por estética”: debe tener una razón de cambio propia.

**Modelo mental.** Es una cocina: la receta (dominio) no depende de la marca del horno (infraestructura); el mesero (interfaz) no cocina.

**Implementación desde cero**

```java
public record Guia(String numero) {
    public Guia {
        if (numero == null || numero.isBlank()) {
            throw new IllegalArgumentException("numero vacio");
        }
    }
}
```

```java
import java.util.ArrayList;
import java.util.List;

public class GuiaRepositoryMemoria {
    private final List<Guia> guias = new ArrayList<>();
    public void guardar(Guia guia) { guias.add(guia); }
    public List<Guia> todas() { return List.copyOf(guias); }
}
```

```java
public class CrearGuia {
    private final GuiaRepositoryMemoria repo;
    public CrearGuia(GuiaRepositoryMemoria repo) { this.repo = repo; }
    public Guia ejecutar(String numero) {
        Guia guia = new Guia(numero);
        repo.guardar(guia);
        return guia;
    }
}
```

```java
public class DemoCapas {
    public static void main(String[] args) {
        GuiaRepositoryMemoria repo = new GuiaRepositoryMemoria();
        CrearGuia caso = new CrearGuia(repo);
        caso.ejecutar("G-1");
        caso.ejecutar("G-2");
        System.out.println(repo.todas().size());
    }
}
```

**Desglose del código**

- `Guia` es el modelo de dominio; valida su invariante en el constructor compacto del record.
- `GuiaRepositoryMemoria` es infraestructura en memoria.
- `CrearGuia` es el caso de uso de aplicación: orquesta validación y persistencia.
- `DemoCapas` actúa como interfaz/entrada simple.

**Ejecución y salida real**

```bash
javac Guia.java GuiaRepositoryMemoria.java CrearGuia.java DemoCapas.java
java DemoCapas
```

```text
2
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Regla de negocio en la UI | Capas mezcladas | Mueve la regla al dominio/caso de uso |
| Dominio importa clases de infraestructura | Dependencia invertida al revés | Introduce interfaz en el borde |
| Capas con una sola clase por ritual | Sobreestructura | Empieza simple, separa por razón de cambio |

**Verificación rápida**

Agrega otra entrada (CLI o test) que use el mismo `CrearGuia`; no deberías duplicar la validación.

### Tema 2: Build reproducible y cierre del track · Intermedio · 40 min

**Caso guía**

Tu proyecto funciona en tu máquina, pero falla en la de otro porque usa otra versión de Maven/Gradle o JDK. Necesitas que “clonar y ejecutar” sea determinista.

**Fundamento técnico y modelo mental**

**Definición formal.** Un *build reproducible* es un proceso de construcción que, dadas las mismas entradas (fuentes, dependencias, configuración, toolchain), produce resultados equivalentes de forma fiable. El *wrapper* fija la versión de la herramienta de build.

**Contrato / invariantes / reglas.** El repositorio debe declarar versión de JDK/toolchain, dependencias con versiones fijas, y wrapper (`mvnw`/`gradlew`). `clean verify`/`build` debe ejecutar tests. Los artefactos generados no se versionan salvo necesidad explícita. La reproducibilidad se degrada con dependencias flotantes (`LATEST`, snapshots), plugins sin versión, o dependencias del entorno local no declaradas.

**Modelo mental.** El build es la receta industrial: si cada cocinero usa horno distinto y ingredientes “más o menos”, el producto cambia.

**Implementación desde cero**

Comandos típicos:

```bash
# Maven wrapper
mvn wrapper:wrapper
./mvnw --version
./mvnw clean verify

# Gradle wrapper
gradle wrapper
./gradlew --version
./gradlew clean build
```

Checklist mínima:

```text
[ ] wrapper versionado
[ ] versión de Java fijada (toolchain/release)
[ ] dependencias con versiones explícitas
[ ] tests ejecutan en CI/build local
[ ] README indica comando único de build
```

**Desglose del código**

- El wrapper evita “en mi máquina tengo otro Maven”.
- `clean verify/build` compila, testea y valida el artefacto.
- Fijar release/toolchain reduce sorpresas entre JDKs.
- La salida esperada es un build verde reproducible.

**Ejecución y salida real**

Salida esperada (Maven):

```text
[INFO] BUILD SUCCESS
```

Salida esperada (Gradle):

```text
BUILD SUCCESSFUL
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Falla en otra máquina | Falta wrapper o versión Java | Versiona wrapper y fija toolchain |
| Build no determinista | Dependencias flotantes | Fija versiones y repositorios |
| Tests no corren | Configuración incompleta | Usa ciclo completo `verify/build` |

**Verificación rápida**

Ejecuta el comando de build en una máquina limpia con el JDK requerido; debe pasar sin pasos manuales ocultos.

### Tema 3: Integrando concurrencia, modelado y testing · Avanzado · 45 min

**Caso guía**

El procesador de guías debe procesar varias entradas en paralelo, modelar resultados de forma clara y tener tests que verifiquen la lógica sin depender de I/O real.

**Fundamento técnico y modelo mental**

**Definición formal.** La *integración* en este contexto es la composición de subsistemas (dominio, concurrencia, tests) bajo contratos explícitos. El dominio se modela con tipos inmutables (records/sealed) cuando corresponde; la concurrencia se gestiona con ejecutores y futures; los tests verifican comportamiento observable.

**Contrato / invariantes / reglas.** El procesamiento concurrente no debe compartir estado mutable sin sincronización. Cada tarea debe devolver resultado o error explícito. Los tests unitarios deben ser deterministas: controlan entradas, no dependen de red/tiempo real salvo abstracción. `Future.get()` o mecanismos equivalentes definen punto de sincronización. La correctitud funcional es prioritaria sobre el paralelismo.

**Modelo mental.** Es una línea de producción: cada estación procesa su pieza (tarea), el modelo define la forma de la pieza (record), y el control de calidad (test) verifica que cada pieza cumple el contrato.

**Implementación desde cero**

```java
import java.util.concurrent.*;
import java.util.*;

public class ProcesarGuias {
    record Resultado(String guia, boolean ok) {}

    static Resultado procesar(String guia) {
        if (guia == null || guia.isBlank()) return new Resultado(String.valueOf(guia), false);
        return new Resultado(guia, true);
    }

    public static void main(String[] args) throws Exception {
        List<String> guias = List.of("G-1", "", "G-3");
        try (ExecutorService executor = Executors.newFixedThreadPool(2)) {
            List<Future<Resultado>> futuros = new ArrayList<>();
            for (String guia : guias) {
                futuros.add(executor.submit(() -> procesar(guia)));
            }
            for (Future<Resultado> futuro : futuros) {
                Resultado r = futuro.get();
                System.out.println(r.guia() + "=" + r.ok());
            }
        }
    }
}
```

**Desglose del código**

- `Resultado` es un record inmutable: modela la salida claramente.
- `procesar` contiene la regla pura, fácil de testear.
- `ExecutorService` controla concurrencia; `submit` devuelve `Future`.
- El try-with-resources cierra el pool.
- Preservar el orden de salida se logra recorriendo los futuros en orden de envío.

**Ejecución y salida real**

```bash
javac ProcesarGuias.java
java ProcesarGuias
```

```text
G-1=true
=false
G-3=true
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Tests no deterministas | Dependencia de tiempo/orden concurrente | Controla entradas y sincroniza resultados |
| Estado compartido corrupto | Mutación concurrente | Usa inmutabilidad o sincronización |
| Build verde local, rojo en CI | Entorno no reproducible | Wrapper, toolchain y versiones fijadas |

**Verificación rápida**

```bash
javac ProcesarGuias.java && java ProcesarGuias
```

Agrega un test unitario sobre `procesar` (JUnit) que verifique casos válidos e inválidos sin levantar hilos.

## Cierre del módulo

Has cerrado el ciclo base de Java: modelado, arquitectura por capas, build reproducible e integración con concurrencia y testing. Desde aquí, los siguientes módulos aplican este criterio a diseño de sistemas, Spring Boot, persistencia, seguridad y operación en producción.
